frappe.ui.form.on('Sales Order', {
	before_load: function (frm) {
		frm.employee = null;
		frm.custom_sales_limit = 0;
		frm._is_updating_discount = false;
		frm._last_valid_discount = 0;
		frm._deleting_row = false; // Flag to track delete operation
	},

	onload: async function (frm) {
		try {
			const { message: employees } = await frappe.call({
				method: 'frappe.client.get_list',
				args: {
					doctype: 'Employee',
					filters: {
						user_id: frappe.session.user,
						status: 'Active',
					},
					fields: ['custom_sales_limit'],
				},
			});

			frm.employee = employees[0] || null;
			frm.custom_sales_limit = frm.employee?.custom_sales_limit || 0;
		} catch (error) {
			console.error('خطأ في تحميل بيانات الموظف:', error);
			frm.employee = null;
			frm.custom_sales_limit = 0;
		}
	},

	refresh: function (frm) {
		frm.doc.items.forEach((row) => {
			if (typeof row._original_custom_discount === 'undefined') {
				row._original_custom_discount = row.custom_discount;
			}
		});

		// Add event for deletion to handle row deletion
		frm.get_field('items').grid.wrapper.on('row-removed', function () {
			if (!frm._deleting_row) {
				frm._deleting_row = true;
				setTimeout(() => {
					const total_discount = frm.doc.custom_discount_amount_emp || 0;
					distribute_discount(frm, total_discount);
					frm._deleting_row = false;
				}, 100);
			}
		});
	},

	custom_discount_amount_emp: function (frm) {
		if (frm._is_updating_discount || frm._deleting_row) return;

		let total_discount = frm.doc.custom_discount_amount_emp || 0;

		// If empty or zero -> reset all discounts in table to zero
		if (!total_discount || total_discount === 0) {
			// If custom table exists, skip native table updates
			if (frm.fields_dict.custom_items_table) {
				// In custom table, updates happen directly on fields
				// No need for refresh_field as custom table syncs only on save
				return;
			}

			frm.doc.items.forEach((row) => {
				frappe.model.set_value(row.doctype, row.name, 'custom_discount', 0);
				row._original_custom_discount = 0;
			});
			frm.refresh_field('items');
			return;
		}

		if (!frm.employee) {
			showEmployeeError();
			rollback_discount(frm);
			return;
		}

		if (total_discount > frm.custom_sales_limit) {
			showLimitError(frm.custom_sales_limit);
			rollback_discount(frm);
			return;
		}

		frm._last_valid_discount = total_discount;

		// Distribute discount across rows
		distribute_discount(frm, total_discount);
	},

	// Add event to validate after row removal
	after_item_remove: function (frm) {
		const total_discount = frm.doc.custom_discount_amount_emp || 0;
		distribute_discount(frm, total_discount);
	},
});

frappe.ui.form.on('Sales Order Item', {
	item_code: function (frm, cdt, cdn) {
		let total_discount = frm.doc.custom_discount_amount_emp || 0;

		if (!total_discount || total_discount === 0) {
			// If zero -> no distribution, reset to zero
			frappe.model.set_value(cdt, cdn, 'custom_discount', 0);
			return;
		}

		if (total_discount > 0) {
			distribute_discount(frm, total_discount);
		}
	},

	custom_discount: function (frm, cdt, cdn) {
		const row = locals[cdt][cdn];
		validate_row_discount(frm, row, cdt, cdn);
		validate_total_discount(frm);
	},

	// Add event when row is deleted
	items_remove: function (frm, cdt, cdn) {
		const total_discount = frm.doc.custom_discount_amount_emp || 0;
		distribute_discount(frm, total_discount);
	},
});

// ----------------------------------------
// Updated helper functions
// ----------------------------------------

function distribute_discount(frm, total_discount) {
	const item_count = frm.doc.items.length;

	if (item_count === 0 && total_discount > 0) {
		// If no items but discount exists, reset discount to zero
		frm._is_updating_discount = true;
		frm.set_value('custom_discount_amount_emp', 0);
		setTimeout(() => (frm._is_updating_discount = false), 100);
		return;
	}

	if (item_count > 0) {
		const discount_per_row = total_discount / item_count;
		frm.doc.items.forEach((row) => {
			apply_discount_to_row(frm, row, discount_per_row);
		});
	}

	// If custom table exists, don't use refresh_field as updates happen directly
	if (!frm.fields_dict.custom_items_table) {
		frm.refresh_field('items');
	}
	validate_total_discount(frm);
}

function apply_discount_to_row(frm, row, discount_value) {
	if (!frm.employee) {
		showEmployeeError();
		frappe.model.set_value(row.doctype, row.name, 'custom_discount', 0);
		return;
	}

	if (discount_value > frm.custom_sales_limit) {
		showLimitError(frm.custom_sales_limit);
		frappe.model.set_value(row.doctype, row.name, 'custom_discount', 0);
		return;
	}

	frappe.model.set_value(row.doctype, row.name, 'custom_discount', discount_value);
	row._original_custom_discount = discount_value;
}

function validate_row_discount(frm, row, cdt, cdn) {
	if (!frm.employee) {
		showEmployeeError();
		frappe.model.set_value(cdt, cdn, 'custom_discount', 0);
		return false;
	}

	if (row.custom_discount > frm.custom_sales_limit) {
		showLimitError(frm.custom_sales_limit);
		frappe.model.set_value(cdt, cdn, 'custom_discount', 0);
		return false;
	}

	row._original_custom_discount = row.custom_discount;
	return true;
}

function validate_total_discount(frm) {
	let max_allowed = frm.doc.custom_discount_amount_emp || 0;

	if (!max_allowed || max_allowed === 0) {
		max_allowed = frm.custom_sales_limit || 0;
	}

	let total_row_discount = frm.doc.items.reduce(
		(sum, row) => sum + (row.custom_discount || 0),
		0,
	);
	total_row_discount = Math.round(total_row_discount * 100) / 100; // Avoid floating point errors

	if (total_row_discount > max_allowed) {
		showTotalError(max_allowed);
		distribute_discount(frm, max_allowed);
	}
}

function rollback_discount(frm) {
	frm._is_updating_discount = true;
	frm.set_value('custom_discount_amount_emp', frm._last_valid_discount || 0);
	setTimeout(() => (frm._is_updating_discount = false), 100);
}

// ----------------------------------------
// Error messages
// ----------------------------------------

function showEmployeeError() {
	frappe.msgprint({
		title: 'خطأ',
		message: 'لا يمكنك تعديل الخصم - غير مرتبط بموظف نشط',
		indicator: 'red',
	});
}

function showLimitError(limit) {
	frappe.msgprint({
		title: 'خطأ',
		message: `قيمة الخصم تتجاوز الحد المسموح (${limit} ريال)`,
		indicator: 'red',
	});
}

function showTotalError(max_allowed) {
	frappe.msgprint({
		title: 'خطأ',
		message: `إجمالي الخصم الموزع لا يمكن أن يتجاوز (${max_allowed})`,
		indicator: 'red',
	});
}
