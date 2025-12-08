frappe.ui.form.on('Sales Order', {
    custom_insurance_company: function(frm) {
        // تحقق من وجود شركة التأمين
        if (frm.doc.custom_insurance_company) {
            frappe.db.get_doc('Insurance Company', frm.doc.custom_insurance_company)
                .then(doc => {
                    frm.set_value('custom_contract_discount', doc.custom_contract_discount);
                    // اجعل الحقل "للقراءة فقط" إذا كانت هناك نسبة
                    if (doc.custom_contract_discount) {
                        frm.set_df_property('custom_insurance_company', 'read_only', true);
                    }
                })
                .catch(err => {
                    frappe.msgprint(__('لم يتم العثور على شركة التأمين المحددة'));
                    console.error(err);
                });
        } else {
            frm.set_value('custom_contract_discount', null);
            // اجعل الحقل قابلًا للتعديل إذا لم يتم تحديد شركة التأمين
            frm.set_df_property('custom_insurance_company', 'read_only', false);
        }
    },

    custom_contract_discount: function(frm) {
        // إذا تم مسح النسبة، اجعل الحقل قابلًا للتعديل
        if (!frm.doc.custom_contract_discount) {
            frm.set_df_property('custom_insurance_company', 'read_only', false);
        }
    }
});

