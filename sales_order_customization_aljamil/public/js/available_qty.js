// =======================
// Sales Order - Use projected_qty instead of custom_available_qty
// projected_qty = actual_qty + ordered_qty + indented_qty + planned_qty - reserved_qty - ...
// =======================

frappe.ui.form.on('Sales Order Item', {
	item_code(frm, cdt, cdn) {
		// If custom table exists, skip native table updates
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}
		update_available_qty_strict(frm, cdt, cdn);
	},
	warehouse(frm, cdt, cdn) {
		// If custom table exists, skip native table updates
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}
		update_available_qty_strict(frm, cdt, cdn);
	},
	qty(frm, cdt, cdn) {
		// If custom table exists, skip native table updates
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}
		update_available_qty_strict(frm, cdt, cdn);
	},
});

frappe.ui.form.on('Sales Order', {
	refresh(frm) {
		// If custom table exists, skip native table updates
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}

		if (frm.doc.docstatus === 0) {
			(frm.doc.items || []).forEach((d) => {
				update_available_qty_strict(frm, d.doctype, d.name);
			});
		}
	},
	onload_post_render(frm) {
		// Subscribe to real-time warehouse stock updates
		// If custom table exists, skip native table updates
		if (frm.fields_dict.custom_items_table) {
			return; // Custom table handles updates
		}

		frappe.realtime.on('bin_update', (data) => {
			(frm.doc.items || []).forEach((d) => {
				if (d.item_code === data.item_code && d.warehouse === data.warehouse) {
					// Use projected_qty from Bin directly
					const projected_qty = data.projected_qty || 0;
					frappe.model.set_value(d.doctype, d.name, 'projected_qty', projected_qty);
					refresh_field('items');
				}
			});
		});
	},
});

// =======================
// Function to update projected_qty from Bin
// projected_qty includes: actual_qty + ordered_qty + indented_qty + planned_qty - reserved_qty - ...
// =======================
function update_available_qty_strict(frm, cdt, cdn) {
	// If custom table exists, skip native table updates
	if (frm.fields_dict.custom_items_table) {
		return; // Custom table handles updates
	}

	let row = locals[cdt][cdn];

	if (row.item_code && row.warehouse) {
		frappe.db
			.get_value(
				'Bin',
				{
					item_code: row.item_code,
					warehouse: row.warehouse,
				},
				['projected_qty'],
			)
			.then((r) => {
				if (r.message) {
					const projected_qty = r.message.projected_qty || 0;
					frappe.model.set_value(cdt, cdn, 'projected_qty', projected_qty);
					refresh_field('items');
				} else {
					frappe.model.set_value(cdt, cdn, 'projected_qty', 0);
					refresh_field('items');
				}
			});
	} else {
		frappe.model.set_value(cdt, cdn, 'projected_qty', 0);
		refresh_field('items');
	}
}
