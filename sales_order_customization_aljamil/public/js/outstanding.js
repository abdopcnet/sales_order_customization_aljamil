frappe.ui.form.on('Sales Order', {
	onload: function (frm) {
		update_custom_outstanding(frm);
	},
	refresh: function (frm) {
		// Only update in refresh if document is already dirty or is new
		// This prevents marking clean documents as dirty
		if (frm.is_dirty() || frm.doc.__islocal) {
			update_custom_outstanding(frm);
		}
	},
	validate: function (frm) {
		update_custom_outstanding(frm);
	},
	after_save: function (frm) {
		// Update field immediately after save without needing refresh button
		if (!frm._outstanding_updated) {
			update_custom_outstanding(frm);
			frm._outstanding_updated = true;

			// Store the change directly in database
			frappe.db
				.set_value('Sales Order', frm.doc.name, {
					custom_outstanding_amount: frm.doc.custom_outstanding_amount,
				})
				.then(() => {
					frm.reload_doc(); // Refresh form after save
					frm._outstanding_updated = false;
				});
		}
	},
	advance_paid: function (frm) {
		update_custom_outstanding(frm);
	},
});

frappe.ui.form.on('Sales Order Item', {
	qty: recalculate_total,
	rate: recalculate_total,
	discount_amount: recalculate_total,
	price_list_rate: recalculate_total,
	custom_discount: recalculate_total,
	custom_discount2: recalculate_total,
	custom_discount_percentage: recalculate_total,
});

function recalculate_total(frm, cdt, cdn) {
	setTimeout(() => {
		update_custom_outstanding(frm);
	}, 100);
}

function update_custom_outstanding(frm) {
	frappe.model.round_floats_in(frm.doc, ['grand_total', 'advance_paid']);
	let total = (frm.doc.grand_total || 0) - (frm.doc.advance_paid || 0);

	// Round to nearest riyal (no decimals)
	total = Math.round(total);

	// Only update if value has changed to prevent marking document as dirty
	let current_value = parseInt(frm.doc.custom_outstanding_amount || 0);
	if (current_value !== total) {
		// Use frappe.model.set_value to avoid triggering dirty state unnecessarily
		// Only if document is already dirty or new
		if (frm.is_dirty() || frm.doc.__islocal) {
			frm.set_value('custom_outstanding_amount', total);
		} else {
			// For clean documents, update silently without marking as dirty
			frm.doc.custom_outstanding_amount = total;
		}
	}
}
