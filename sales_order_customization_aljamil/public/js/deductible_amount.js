frappe.ui.form.on('Sales Order', {
    onload(frm) {
        calculate_deductible_amount(frm);
    },
    custom_approval_amount(frm) {
        calculate_deductible_amount(frm);
    },
    custom_insurance_percentage(frm) {
        calculate_deductible_amount(frm);
    },
    custom_maximum_limit(frm) {
        calculate_deductible_amount(frm);
    }
});

function calculate_deductible_amount(frm) {
    let approval = frm.doc.custom_approval_amount || 0;
    let percentage = frm.doc.custom_insurance_percentage || 0;
    let max_limit = frm.doc.custom_maximum_limit || 0;

    let decimal_percentage = percentage / 100;
    let result = approval * decimal_percentage;

    if (max_limit > 0 && max_limit < result) {
        frm.set_value('custom_deductible_amount', max_limit);
    } else {
        frm.set_value('custom_deductible_amount', result);
    }
}

