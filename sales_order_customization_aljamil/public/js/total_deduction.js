// تحديث إجمالي الخصم في Sales Order

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
		update_total_deduction(frm);
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
		frm.set_value('custom_total_deduction', total_deduction);
	}
}
