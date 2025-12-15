frappe.ui.form.on('Sales Order Item', {
	before_items_remove: function (frm, cdt, cdn) {
		// If custom table exists, skip native table delete handling
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles deletion
		}

		let row = frappe.get_doc(cdt, cdn);

		if (row.custom_stock_entry) {
			frappe.confirm(
				`⚠️ تم إصدار سند تحويل لهذا الصنف - رقم السند <b>${row.custom_stock_entry}</b><br><br>
                هل أنت متأكد أنك تريد حذف هذا الصنف؟`,
				function () {
					// User confirmed -> delete row manually
					frm.doc.items = frm.doc.items.filter((r) => r.name !== row.name);
					frm.refresh_field('items');
				},
				function () {
					// User cancelled -> do nothing, row remains
					frappe.show_alert('تم إلغاء الحذف');
				},
			);

			// Stop automatic default deletion
			throw 'تم إيقاف الحذف حتى تأكيد المستخدم';
		}
	},

	// When adding new item -> copy set_warehouse value
	items_add: function (frm, cdt, cdn) {
		// If custom table exists, skip native table add handling
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles addition
		}

		let row = frappe.get_doc(cdt, cdn);

		if (frm.doc.set_warehouse) {
			frappe.model.set_value(cdt, cdn, 'warehouse', frm.doc.set_warehouse);
		}
	},
});

frappe.ui.form.on('Sales Order', {
	// When set_warehouse changes -> update all existing items
	set_warehouse: function (frm) {
		// If custom table exists, skip native table update handling
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}

		(frm.doc.items || []).forEach((row) => {
			frappe.model.set_value(row.doctype, row.name, 'warehouse', frm.doc.set_warehouse);
		});
	},
});
