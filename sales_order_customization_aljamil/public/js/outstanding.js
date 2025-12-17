frappe.ui.form.on('Sales Order', {
	refresh: function (frm) {
		frm.set_value(
			'custom_outstanding_amount',
			Math.round((frm.doc.grand_total || 0) - (frm.doc.advance_paid || 0)),
		);
	},
	grand_total: function (frm) {
		frm.set_value(
			'custom_outstanding_amount',
			Math.round((frm.doc.grand_total || 0) - (frm.doc.advance_paid || 0)),
		);
	},
	advance_paid: function (frm) {
		frm.set_value(
			'custom_outstanding_amount',
			Math.round((frm.doc.grand_total || 0) - (frm.doc.advance_paid || 0)),
		);
	},
});
