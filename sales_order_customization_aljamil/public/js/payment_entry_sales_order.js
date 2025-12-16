frappe.ui.form.on('Sales Order', {
	refresh(frm) {
		console.log(
			'KH Quick Pay: refresh on Sales Order',
			frm.doc.name,
			'docstatus:',
			frm.doc.docstatus,
		);

		// Only work after Submit
		if (frm.doc.docstatus !== 1) return;

		frm.add_custom_button(__('💰 تسجيل دفع (Popup)'), function () {
			open_quick_payment_dialog_for_so(frm);
		}).addClass('btn-danger');
	},
});

function open_quick_payment_dialog_for_so(frm) {
	const d = new frappe.ui.Dialog({
		title: __('تسجيل دفع لأمر البيع ') + frm.doc.name,
		fields: [
			{
				fieldname: 'posting_date',
				fieldtype: 'Date',
				label: __('Posting Date'),
				reqd: 1,
				default: frappe.datetime.get_today(),
			},
			{
				fieldname: 'mode_of_payment',
				fieldtype: 'Link',
				label: __('Mode of Payment'),
				options: 'Mode of Payment',
				reqd: 1,
			},
			{
				fieldname: 'paid_amount',
				fieldtype: 'Currency',
				label: __('Paid Amount'),
				reqd: 1,
				default: frm.doc.grand_total || 0,
			},
			{
				fieldname: 'reference_no',
				fieldtype: 'Data',
				label: __('Reference No'),
			},
			{
				fieldname: 'reference_date',
				fieldtype: 'Date',
				label: __('Reference Date'),
				default: frappe.datetime.get_today(),
			},
		],
		primary_action_label: __('إنشاء سند دفع'),
		primary_action(values) {
			if (!values.paid_amount || flt(values.paid_amount) <= 0) {
				frappe.msgprint(__('الرجاء إدخال مبلغ دفع صحيح.'));
				return;
			}

			// Get Mode of Payment type (Bank / Cash / ... )
			frappe.call({
				method: 'frappe.client.get_value',
				args: {
					doctype: 'Mode of Payment',
					filters: { name: values.mode_of_payment },
					fieldname: ['type'],
				},
				callback: function (r) {
					const mop_type = r.message ? r.message.type : null;

					// If Bank and reference or date is missing -> fill them automatically
					if (mop_type === 'Bank') {
						if (!values.reference_date) {
							values.reference_date = frappe.datetime.get_today();
						}
						if (!values.reference_no) {
							// Auto reference number
							values.reference_no = 'AUTO-' + frm.doc.name;
						}
					}

					// Call get_payment_entry without party_amount
					frappe.call({
						method: 'erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry',
						args: {
							dt: frm.doc.doctype, // "Sales Order"
							dn: frm.doc.name,
							mode_of_payment: values.mode_of_payment,
						},
						callback: function (r2) {
							if (!r2.message) {
								frappe.msgprint(__('تعذر إنشاء سند الدفع.'));
								return;
							}

							let pe = r2.message;

							// Set mode_of_payment from dialog values
							pe.mode_of_payment = values.mode_of_payment;

							// Copy branch from Sales Order to Payment Entry
							if (frm.doc.branch) {
								pe.branch = frm.doc.branch;
							}

							// General data
							pe.posting_date = values.posting_date;
							pe.reference_no = values.reference_no;
							pe.reference_date = values.reference_date;

							// Set payment amount without exceeding outstanding
							let pay_amount = flt(values.paid_amount);

							if (pe.references && pe.references.length) {
								let ref = pe.references[0];
								let outstanding =
									flt(ref.outstanding_amount) || flt(ref.total_amount) || 0;

								if (outstanding && pay_amount > outstanding) {
									pay_amount = outstanding;
								}

								ref.allocated_amount = pay_amount;
							}

							pe.paid_amount = pay_amount;
							pe.received_amount = pay_amount;

							// Insert Payment Entry
							frappe.call({
								method: 'frappe.client.insert',
								args: { doc: pe },
								callback: function (res) {
									if (res.message) {
										let pe_doc = res.message;

										// Save Payment Entry
										frappe.call({
											method: 'frappe.client.save',
											args: { doc: pe_doc },
											callback: function (save_res) {
												if (save_res.message) {
													pe_doc = save_res.message;

													// Submit Payment Entry
													frappe.call({
														method: 'frappe.client.submit',
														args: { doc: pe_doc },
														callback: function (submit_res) {
															if (submit_res.message) {
																frappe.msgprint(
																	__(
																		'تم إنشاء وتقديم سند الدفع: {0}',
																		[submit_res.message.name],
																	),
																);
																// Reload Sales Order after Payment Entry is saved and submitted
																frm.reload_doc();
															} else {
																frappe.msgprint(
																	__(
																		'حدث خطأ أثناء تقديم سند الدفع.',
																	),
																);
															}
														},
													});
												} else {
													frappe.msgprint(
														__('حدث خطأ أثناء حفظ سند الدفع.'),
													);
												}
											},
										});
									} else {
										frappe.msgprint(__('حدث خطأ أثناء إنشاء سند الدفع.'));
									}
								},
							});
						},
					});
				},
			});

			d.hide();
		},
	});

	d.show();
}
