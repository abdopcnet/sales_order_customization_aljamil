// Client Script — Doctype: "Sales Order"
frappe.ui.form.on('Sales Order', {
	setup(frm) {
		// Unified function to force payment due dates
		frm._force_payment_due_dates = function () {
			if (!frm.doc.payment_schedule || !frm.doc.transaction_date) return;

			const tx = frappe.datetime.str_to_obj(frm.doc.transaction_date);
			let changed = false;

			(frm.doc.payment_schedule || []).forEach((row) => {
				// Force date to always be Sales Order date
				if (
					!row.due_date ||
					frappe.datetime.str_to_obj(row.due_date) < tx ||
					row.due_date !== frm.doc.transaction_date
				) {
					row.due_date = frm.doc.transaction_date;
					changed = true;
				}
			});

			if (changed) frm.refresh_field('payment_schedule');
		};
	},

	onload(frm) {
		// When opening Sales Order (even after converting from Quotation)
		frm._force_payment_due_dates();
	},

	refresh(frm) {
		// Only update in refresh if document is already dirty or is new
		// This prevents marking clean documents as dirty
		if (frm.is_dirty() || frm.doc.__islocal) {
			frm._force_payment_due_dates();
		}
	},

	transaction_date(frm) {
		// If user changed Sales Order date, reset payment schedule
		frm._force_payment_due_dates();
	},

	validate(frm) {
		// Most important: right before save — prevents "Due date cannot be before posting date" message
		frm._force_payment_due_dates();
	},

	before_submit(frm) {
		// Final confirmation before submit
		frm._force_payment_due_dates();
	},
});
