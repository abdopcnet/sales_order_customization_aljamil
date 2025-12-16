// Update total discount in Sales Order

frappe.ui.form.on('Sales Order Item', {
	discount_amount: function (frm, cdt, cdn) {
		update_total_deduction(frm);
	},
	qty: function (frm, cdt, cdn) {
		update_total_deduction(frm);
	},
});

frappe.ui.form.on('Sales Order', {
	onload: function (frm) {
		update_total_deduction(frm);
	},
	refresh: function (frm) {
		// Only update in refresh if document is already dirty or is new
		// This prevents marking clean documents as dirty
		if (frm.is_dirty() || frm.doc.__islocal) {
			update_total_deduction(frm);
		}
	},
});

function update_total_deduction(frm) {
	let total_deduction = 0;

	(frm.doc.items || []).forEach((item) => {
		let discount = (item.discount_amount || 0) * (item.qty || 0);
		total_deduction += discount;
	});

	// Only update if value has changed to prevent marking document as dirty
	let current_value = flt(frm.doc.custom_total_deduction || 0);
	if (Math.abs(current_value - total_deduction) > 0.01) {
		// Use frappe.model.set_value to avoid triggering dirty state unnecessarily
		// Only if document is already dirty or new
		if (frm.is_dirty() || frm.doc.__islocal) {
			frm.set_value('custom_total_deduction', total_deduction);
		} else {
			// For clean documents, update silently without marking as dirty
			frm.doc.custom_total_deduction = total_deduction;
		}
	}
}
