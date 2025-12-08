frappe.ui.form.on('Sales Order', {
    validate: function(frm) {
        let errors = [];

        for (let row of frm.doc.custom_payment) {
            // تحقق إذا كانت طريقة الدفع موجودة والمبلغ غير موجود
            if (row.mode_of_payment && (!row.amount || row.amount === 0)) {
                errors.push(__(`السطر #{0}: عند تحديد طريقة الدفع يجب إدخال المبلغ.`, [row.idx]));
            }

            // تحقق إذا كان المبلغ موجود وطريقة الدفع غير موجودة
            if (row.amount && (!row.mode_of_payment || row.mode_of_payment.trim() === '')) {
                errors.push(__(`السطر #{0}: عند إدخال المبلغ يجب تحديد طريقة الدفع.`, [row.idx]));
            }
        }

        if (errors.length > 0) {
            frappe.msgprint(errors.join('<br>'));
            frappe.validated = false;
        }
    },

    on_submit: function(frm) {
        const create_payment_entry = (row) => {
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Mode of Payment",
                    filters: { name: row.mode_of_payment },
                    fieldname: "custom_account"
                },
                callback: function (res) {
                    let account = res.message && res.message.custom_account;

                    if (!account) {
                        frappe.msgprint(__('لا يوجد حساب مخصص في "طريقة الدفع" "{0}". الرجاء التحقق من تعبئة الحقل "custom_account".', [row.mode_of_payment]));
                        return;
                    }

                    let payment_entry = {
                        doctype: 'Payment Entry',
                        payment_type: 'Receive',
                        company: frm.doc.company,

                        mode_of_payment: row.mode_of_payment,
                        paid_amount: row.amount,
                        received_amount: row.amount,

                        paid_to: account,
                        paid_from: frm.doc.debit_to || '',

                        posting_date: frm.doc.transaction_date,
                        party_type: 'Customer',
                        party: frm.doc.customer || '',

                        reference_no: row.reference_no || '',
                        reference_date: frm.doc.transaction_date,

                        references: [{
                            reference_doctype: 'Sales Order',
                            reference_name: frm.doc.name,
                            total_amount: frm.doc.grand_total,
                            outstanding_amount: row.amount,
                            allocated_amount: row.amount
                        }]
                    };

                    frappe.call({
                        method: 'frappe.client.insert',
                        args: { doc: payment_entry },
                        callback: function (r) {
                            if (r.message) {
                                frappe.call({
                                    method: 'frappe.client.submit',
                                    args: { doc: r.message },
                                    callback: function (submit_r) {
                                        if (submit_r.message) {
                                            frappe.msgprint(__('تم إنشاء سند الدفع {0} للمبلغ {1}.',
                                                [submit_r.message.name, format_currency(row.amount, frm.doc.currency)]));
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        };

        frm.doc.custom_payment.forEach(create_payment_entry);
    }
});

