// Client Script — Doctype: "Sales Order"
frappe.ui.form.on('Sales Order', {
    custom_payment_on_form_rendered(frm) {
        // Filter payment modes to show only enabled ones
        frm.fields_dict.custom_payment.grid.get_field('mode_of_payment').get_query = function() {
            return {
                filters: { enabled: 1 }
            };
        };
    }
});

frappe.ui.form.on('Sales Order Payment', {
    mode_of_payment: async function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.mode_of_payment && frm.doc.company) {
            try {
                // Load Mode of Payment record itself (without accessing Mode of Payment Account directly)
                const mop = await frappe.db.get_doc('Mode of Payment', row.mode_of_payment);

                if (mop && mop.accounts && mop.accounts.length > 0) {
                    // Try to find default account for same company
                    const account_row = mop.accounts.find(a => a.company === frm.doc.company);

                    if (account_row && account_row.default_account) {
                        frappe.model.set_value(cdt, cdn, 'account', account_row.default_account);
                    } else {
                        frappe.model.set_value(cdt, cdn, 'account', null);
                        frappe.msgprint(__('لم يتم العثور على الحساب الافتراضي لهذا النوع من الدفع لهذه الشركة.'));
                    }
                } else {
                    frappe.model.set_value(cdt, cdn, 'account', null);
                    frappe.msgprint(__('لم يتم العثور على إعدادات الحسابات في وضع الدفع.'));
                }
            } catch (e) {
                frappe.msgprint(__('حدث خطأ أثناء جلب بيانات وضع الدفع.'));
                console.error(e);
            }
        }
    }
});

