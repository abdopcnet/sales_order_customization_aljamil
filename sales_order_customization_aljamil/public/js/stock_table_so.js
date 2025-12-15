// =======================
// Sales Order Form Event Handlers
// Handles initialization, refresh, and save events for strict color coding
// =======================
frappe.ui.form.on('Sales Order', {
	onload_post_render(frm) {
		if (frm.doc.docstatus === 0) {
			init_strict_colors(frm);
		}
	},
	refresh(frm) {
		if (frm.doc.docstatus === 0) {
			frappe.after_ajax(() => {
				setTimeout(() => {
					init_strict_colors(frm);
				}, 100);
			});
		}
	},
	before_save(frm) {
		if (frm.doc.docstatus === 0) {
			apply_strict_colors(frm);
		}
	},
});

// =======================
// Initialize strict colors and bind grid events
// =======================
function init_strict_colors(frm) {
	apply_strict_colors(frm);

	// Bind grid row render event on form wrapper (Frappe framework standard)
	if (frm.fields_dict['items'] && !frm._strict_grid_hooked) {
		frm._strict_grid_hooked = true;

		// Use frm.wrapper for grid-row-render event (Frappe framework standard)
		$(frm.wrapper).on('grid-row-render', function (e, grid_row) {
			// Only process rows from items grid
			if (
				grid_row &&
				grid_row.grid &&
				grid_row.grid.df &&
				grid_row.grid.df.fieldname === 'items'
			) {
				if (frm.doc.docstatus === 0) {
					color_single_row(grid_row);
				}
			}
		});
	}
}

// =======================
// Apply strict colors to all grid rows
// Iterates through all existing rows and applies color coding
// =======================
function apply_strict_colors(frm) {
	if (frm.doc.docstatus !== 0) return;
	inject_strict_css();

	if (frm.fields_dict['items']) {
		frm.fields_dict['items'].grid.wrapper.find('.grid-row').each(function () {
			let grid_row = $(this).data('grid_row');
			if (grid_row) color_single_row(grid_row);
		});
	}
}

// =======================
// Apply color coding rules to a single grid row
// Green: sufficient stock in warehouse, Yellow: sufficient in company but not warehouse, Red: insufficient
// =======================
function color_single_row(grid_row) {
	if (!grid_row || !grid_row.doc) return;

	const row = grid_row.doc;
	const $actual = $(grid_row.row).find('[data-fieldname="projected_qty"]');

	if (!row.item_code || !row.warehouse) return;
	if (!cur_frm || !cur_frm.doc || !cur_frm.doc.items) return;

	const total_required_qty = cur_frm.doc.items
		.filter((r) => r.item_code === row.item_code)
		.reduce((sum, r) => sum + (r.qty || 0), 0);

	const available_in_wh = row.projected_qty || 0;

	frappe.call({
		method: 'frappe.client.get_list',
		args: { doctype: 'Bin', filters: { item_code: row.item_code }, fields: ['projected_qty'] },
		callback: function (r) {
			const bins = r.message || [];
			const total_available = bins.reduce((sum, b) => sum + (b.projected_qty || 0), 0);

			$actual.removeClass('strict-red strict-green strict-yellow');
			let tooltip = `إجمالي المطلوب: ${total_required_qty}\nمتاح بالمخزن: ${available_in_wh}\nإجمالي بالشركة: ${total_available}`;

			if (total_required_qty <= available_in_wh) $actual.addClass('strict-green');
			else if (total_required_qty > available_in_wh && total_available >= total_required_qty)
				$actual.addClass('strict-yellow');
			else {
				$actual.addClass('strict-red');
				tooltip = 'الصنف غير متوفر بالشركة';
			}

			$actual.attr('title', tooltip);
			$actual.css('cursor', 'pointer');

			$actual.off('click.stockDialog').on('click.stockDialog', function () {
				if (grid_row._dialog_opened) return;
				grid_row._dialog_opened = true;
				open_stock_dialog(cur_frm, grid_row);
				frappe.after_ajax(() => {
					setTimeout(() => (grid_row._dialog_opened = false), 500);
				});
			});
		},
	});
}

// =======================
// Inject CSS styles for strict color coding
// Adds styles for red, green, and yellow background colors
// =======================
function inject_strict_css() {
	if (!document.getElementById('strict-item-color-style')) {
		const style = document.createElement('style');
		style.id = 'strict-item-color-style';
		style.innerHTML = `
            .strict-red, .strict-red input { background-color: #FF3333 !important; color: #000 !important; }
            .strict-green, .strict-green input { background-color: #00C000 !important; color: #000 !important; }
            .strict-yellow, .strict-yellow input { background-color: #FFFF66 !important; color: #000 !important; }
        `;
		document.head.appendChild(style);
	}
}

// =======================
// Open stock dialog showing warehouse balances
// Displays available stock in all warehouses for the selected item
// =======================
function open_stock_dialog(frm, grid_row) {
	if (frm.doc.docstatus !== 0) return;

	const row = grid_row.doc;
	if (!row.item_code) {
		frappe.msgprint(__('الرجاء اختيار الصنف أولاً'));
		return;
	}

	frappe.call({
		method: 'frappe.client.get_list',
		args: {
			doctype: 'Bin',
			filters: { item_code: row.item_code },
			fields: ['warehouse', 'projected_qty'],
			order_by: 'warehouse',
		},
		callback: function (r) {
			const list = (r.message || []).filter(
				(d) => !d.warehouse.toLowerCase().includes('transit'),
			);
			if (!list.length) {
				frappe.msgprint(
					__('لا يوجد رصيد مسجل لهذا الصنف في أي مخزن (باستثناء مخازن الترانزيت)'),
				);
				return;
			}

			let total = 0;
			let rows_html = list
				.map((d) => {
					const wh = frappe.utils.escape_html(d.warehouse || '');
					const projected_qty = d.projected_qty || 0;
					total += projected_qty;
					const qty_style = projected_qty <= 0 ? ' style="color:red;"' : '';

					let stock_entry_cell = '-';
					if (row.custom_stock_entry && row.custom_stock_entry.trim() !== '') {
						frappe.call({
							method: 'frappe.client.get',
							args: { doctype: 'Stock Entry', name: row.custom_stock_entry },
							async: false,
							callback: function (se) {
								const source_wh = se.message.from_warehouse || '';
								if (source_wh === wh) {
									stock_entry_cell = `<a href="/app/stock-entry/${row.custom_stock_entry}">${row.custom_stock_entry}</a>`;
								}
							},
						});
					}

					const action_btn = `<button class="btn btn-xs btn-primary create-stock-entry" data-warehouse="${wh}">قيد مخزني</button>`;

					return `<tr data-warehouse="${wh}">
                            <td>${wh}</td>
                            <td${qty_style}>${projected_qty}</td>
                            <td class="stock-entry-no">${stock_entry_cell}</td>
                            <td>${action_btn}</td>
                        </tr>`;
				})
				.join('');

			const html = `
                <table class="table table-bordered custom-stock-table">
                    <thead><tr><th>المخزن</th><th>الكمية المتاحة</th><th>رقم قيد المخزون</th><th>إجراء</th></tr></thead>
                    <tbody>${rows_html}</tbody>
                    <tfoot><tr><th>الإجمالي المتاح</th><th>${total}</th><th colspan="2"></th></tr></tfoot>
                </table>
            `;

			const d = new frappe.ui.Dialog({
				title: 'أرصدة المخازن للصنف: ' + row.item_code,
				fields: [{ fieldtype: 'HTML', fieldname: 'stock_html' }],
				primary_action_label: 'إغلاق',
				primary_action() {
					d.hide();
				},
				size: 'large',
			});

			d.fields_dict.stock_html.$wrapper.html(html);

			$(`<style>
                .custom-stock-table thead { background-color: #f0f0f0; color: #000; font-weight: bold; }
                .custom-stock-table tfoot { background-color: #f0f0f0; color: #000; font-weight: bold; }
                .custom-stock-table td, .custom-stock-table th { padding: 6px 8px; vertical-align: middle; }
                .create-stock-entry { margin-left: 8px; }
            </style>`).appendTo(d.$wrapper);

			// Button to create Stock Entry with quotation link validation
			d.$wrapper.find('.create-stock-entry').on('click', function (e) {
				e.stopPropagation();
				const wh = $(this).attr('data-warehouse');
				const row_current = frappe.get_doc(row.doctype, row.name);

				// Check if order is linked to quotation and stock entry not created yet
				if (row_current.prevdoc_docname && !row_current.custom_stock_entry) {
					frappe.msgprint(
						__('لا يمكن إنشاء قيد المخزون لأن أمر البيع مرتبط بعرض سعر: {0}', [
							row_current.prevdoc_docname,
						]),
					);
					return;
				}

				// If stock entry already exists
				if (
					row_current.custom_stock_entry &&
					row_current.custom_stock_entry.trim() !== ''
				) {
					frappe.msgprint(
						__('هناك قيد مخزني مسجل مسبقًا لهذا الصنف: {0}', [
							row_current.custom_stock_entry,
						]),
					);
					return;
				}

				const bin_data = list.find((d) => d.warehouse === wh);
				const projected_qty = bin_data?.projected_qty || 0;

				if (projected_qty <= 0) frappe.msgprint(__('الرصيد غير كافي لإنشاء قيد مخزني'));
				else create_stock_entry(frm, row_current, wh, d);
			});

			d.show();
		},
	});
}

// =======================
// Create Stock Entry with one-time deduction per item
// Creates a material transfer entry and marks the item as deducted
// =======================
function create_stock_entry(frm, row, from_warehouse, dialog) {
	const qty = row.qty || 0;
	if (!qty || qty <= 0) {
		frappe.msgprint(__('لا يوجد كمية صالحة لإصدار قيد مخزني'));
		return;
	}

	// Check if quantity was deducted for any other row of the same item
	const item_already_deducted = frm.doc.items.some(
		(i) => i.item_code === row.item_code && i.custom_stock_entry_deducted,
	);

	const qty_to_transfer = item_already_deducted ? row.qty : row.qty - (row.projected_qty || 0);

	frappe.call({
		method: 'frappe.client.get_value',
		args: {
			doctype: 'Warehouse',
			filters: { name: from_warehouse },
			fieldname: 'default_in_transit_warehouse',
		},
		callback: function (r) {
			const to_warehouse = r.message?.default_in_transit_warehouse;
			if (!to_warehouse) {
				frappe.msgprint(__('المخزن المصدر لا يحتوي على مخزن وجهة افتراضي'));
				return;
			}

			frappe.call({
				method: 'frappe.client.insert',
				args: {
					doc: {
						doctype: 'Stock Entry',
						stock_entry_type: 'Material Transfer',
						from_warehouse: from_warehouse,
						to_warehouse: to_warehouse,
						custom_sales_order: frm.doc.name,
						custom_final_target_warehouse: row.warehouse,
						add_to_transit: 1,
						items: [
							{
								item_code: row.item_code,
								qty: qty_to_transfer,
								s_warehouse: from_warehouse,
								t_warehouse: to_warehouse,
							},
						],
					},
				},
				callback: function (res) {
					if (res.message) {
						frappe.call({
							method: 'frappe.client.submit',
							args: { doc: res.message },
							callback: function (submit_res) {
								const entry_no = submit_res.message.name;
								frappe.model.set_value(
									row.doctype,
									row.name,
									'custom_stock_entry',
									entry_no,
								);

								// Mark row that deduction was made if this is the first time
								if (!item_already_deducted) {
									frappe.model.set_value(
										row.doctype,
										row.name,
										'custom_stock_entry_deducted',
										1,
									);
								}

								// If custom table exists, don't use refresh_field as updates happen directly
								if (!frm.fields_dict.custom_items_table) {
									frm.refresh_field('items');
								}
								frappe.msgprint(__('تم إنشاء قيد مخزني مسجل: {0}', [entry_no]));

								if (dialog)
									dialog.$wrapper
										.find(
											`tr[data-warehouse="${from_warehouse}"] .stock-entry-no`,
										)
										.html(
											`<a href="/app/stock-entry/${entry_no}">${entry_no}</a>`,
										);
							},
						});
					}
				},
			});
		},
	});
}

// =======================
// Sales Order Item field change handlers
// Triggers color refresh when item fields are changed
// =======================
frappe.ui.form.on('Sales Order Item', {
	item_code: function (frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) setTimeout(() => apply_strict_colors(frm), 200);
	},
	warehouse: function (frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) setTimeout(() => apply_strict_colors(frm), 200);
	},
	projected_qty: function (frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) apply_strict_colors(frm);
	},
	qty: function (frm, cdt, cdn) {
		if (frm.doc.docstatus === 0) setTimeout(() => apply_strict_colors(frm), 200);
	},
});
