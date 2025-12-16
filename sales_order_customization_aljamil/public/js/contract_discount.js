frappe.ui.form.on('Sales Order', {
    custom_insurance_company: function(frm) {
        // Check if insurance company exists
        if (frm.doc.custom_insurance_company) {
            frappe.db.get_doc('Insurance Company', frm.doc.custom_insurance_company)
                .then(doc => {
                    frm.set_value('custom_contract_discount', doc.custom_contract_discount);
                    // Make field read-only if there is a percentage
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
            // Make field editable if insurance company is not specified
            frm.set_df_property('custom_insurance_company', 'read_only', false);
        }
    },

    custom_contract_discount: function(frm) {
        // If percentage is cleared, make field editable
        if (!frm.doc.custom_contract_discount) {
            frm.set_df_property('custom_insurance_company', 'read_only', false);
        }
    }
});

