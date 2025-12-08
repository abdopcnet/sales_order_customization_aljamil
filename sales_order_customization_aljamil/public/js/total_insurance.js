frappe.ui.form.on('Sales Order', {
    onload(frm) {
        // جعل الحقول قراءة فقط عند تحميل الفورم
        frm.set_df_property('custom_customer_amount', 'read_only', 1);
        frm.set_df_property('custom_company_amount', 'read_only', 1);
        frm.set_df_property('custom_total_insurance', 'read_only', 1);
    },
    custom_customer_amount(frm) {
        calculate_total_insurance(frm);
    },
    custom_company_amount(frm) {
        calculate_total_insurance(frm);
    }
});

function calculate_total_insurance(frm) {
    const customer_amount = frm.doc.custom_customer_amount || 0;
    const company_amount = frm.doc.custom_company_amount || 0;
    frm.set_value('custom_total_insurance', customer_amount + company_amount);
}

