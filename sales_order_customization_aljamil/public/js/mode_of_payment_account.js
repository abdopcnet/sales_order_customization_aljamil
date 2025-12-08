// Client Script — Doctype: "Sales Order"
frappe.ui.form.on('Sales Order', {
    custom_payment_on_form_rendered(frm) {
        // فلترة أوضاع الدفع لتظهر فقط المفعلة
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
                // نحمل سجل Mode of Payment نفسه (بدون الوصول إلى Mode of Payment Account مباشرة)
                const mop = await frappe.db.get_doc('Mode of Payment', row.mode_of_payment);

                if (mop && mop.accounts && mop.accounts.length > 0) {
                    // نحاول إيجاد الحساب الافتراضي لنفس الشركة
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

