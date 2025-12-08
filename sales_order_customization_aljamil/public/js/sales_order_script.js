frappe.ui.form.on('Sales Order', {
    validate: async function(frm) {
        if (frm.doc.order_type !== "Insurance") return;

        try {
            if (frm.doc.custom_insurance_company) {
                let doc = await frappe.db.get_doc("Insurance Company", frm.doc.custom_insurance_company);
                if (doc.custom__apvd_amt2 == 1) {
                    await recalculate_insurance_amounts_v1(frm);
                    return;
                }
            }

            if (frm.doc.custom_insurance_company) {
                let doc = await frappe.db.get_doc("Insurance Company", frm.doc.custom_insurance_company);
                if (doc.custom__apvd_amt == 1) {
                    await recalculate_insurance_amounts_v2(frm);
                    return;
                }
            }
        } catch (error) {
            console.error("Error in insurance calculation:", error);
            await recalculate_insurance_amounts_v2(frm);
        }

        if (frm.doc.custom_insurance_percentage === 0) {
            frm.set_value("custom_customer_amount", 0);
            frm.set_value("custom_company_amount", 0);
            frm.set_value("discount_amount", 0);
        }
    },

    custom_insurance_percentage: function(frm) {
        if (frm.doc.order_type !== "Insurance") return;

        if (frm.doc.custom_insurance_percentage === 0) {
            frm.set_value("custom_customer_amount", 0);
            frm.set_value("custom_company_amount", 0);
            frm.set_value("discount_amount", 0);
        }
    },

    custom_maximum_limit: function(frm) {
        if (frm.doc.order_type !== "Insurance") return;

        if (frm.doc.custom_insurance_percentage === 0) {
            frm.set_value("custom_customer_amount", 0);
            frm.set_value("custom_company_amount", 0);
            frm.set_value("discount_amount", 0);
        }
    },

    custom_approval_amount: function(frm) {
        if (frm.doc.order_type !== "Insurance") return;

        if (frm.doc.custom_insurance_percentage === 0) {
            frm.set_value("custom_customer_amount", 0);
            frm.set_value("custom_company_amount", 0);
            frm.set_value("discount_amount", 0);
        }
    },

    before_save: async function(frm) {
        if (frm.doc.order_type !== "Insurance") return;

        try {
            frm.set_value("discount_amount", 0);

            if (frm.doc.custom_insurance_company) {
                let doc = await frappe.db.get_doc("Insurance Company", frm.doc.custom_insurance_company);
                if (doc.custom__apvd_amt2 == 1) {
                    await recalculate_insurance_amounts_v1(frm);
                    return;
                }
            }

            if (frm.doc.custom_insurance_company) {
                let doc = await frappe.db.get_doc("Insurance Company", frm.doc.custom_insurance_company);
                if (doc.custom__apvd_amt == 1) {
                    await recalculate_insurance_amounts_v2(frm);
                    return;
                }
            }
        } catch (error) {
            console.error("Error in before_save:", error);
            await recalculate_insurance_amounts_v2(frm);
        }
    }
});

// الكود الأساسي (يعتمد على custom__apvd_amt2 == 1)
async function recalculate_insurance_amounts_v1(frm) {
    let insurance_company_name = frm.doc.custom_insurance_company;
    if (!insurance_company_name) return;

    let doc = await frappe.db.get_doc("Insurance Company", insurance_company_name);
    if (doc.custom__apvd_amt2 != 1) return;

    let percentage = frm.doc.custom_insurance_percentage || 0;
    let approval_amount = frm.doc.custom_approval_amount || 0;
    let maximum_limit = frm.doc.custom_maximum_limit || 0;
    let custom_contract_discount = frm.doc.custom_contract_discount || 0;

    if (percentage === 0) {
        frm.set_value("custom_customer_amount", 0);
        frm.set_value("custom_company_amount", 0);
        frm.set_value("discount_amount", 0);
        return;
    }

    let calculated_discount = ((approval_amount) - (approval_amount * custom_contract_discount / 100)) * (percentage / 100);
    let discount = maximum_limit > 0 ? Math.min(calculated_discount, maximum_limit) : calculated_discount;

    let adjusted_amount = approval_amount;
    let insurance_amount = adjusted_amount - (approval_amount * (custom_contract_discount / 100));
    let final_insurance_amount = insurance_amount - discount;

    let insurance_difference = frm.doc.total - approval_amount;
    let total_customer_amount = discount + insurance_difference;

    let insurance_account_amount = frm.doc.taxes?.find(row => row.account_head === "1302 - شركات التأمين - AO")?.tax_amount || 0;
    let negative_insurance_amount = insurance_account_amount * -1;
    let total_after_insurance = negative_insurance_amount + frm.doc.custom_customer_amount;
    let total_difference = frm.doc.total - total_after_insurance;

    frm.set_value("discount_amount", 0);
    frm.set_value("discount_amount", total_difference);

    if (final_insurance_amount > 0) {
        let negative_final_insurance_amount = final_insurance_amount * -1;
        let insurance_amount_row = frm.doc.taxes?.find(row => row.description === "Insurance Amount");
        if (!insurance_amount_row) {
            frm.add_child("taxes", {
                charge_type: "Actual",
                account_head: "1302 - شركات التأمين - AO",
                description: "Insurance Amount",
                tax_amount: negative_final_insurance_amount
            });
        } else {
            insurance_amount_row.tax_amount = negative_final_insurance_amount;
            insurance_amount_row.account_head = "1302 - شركات التأمين - AO";
        }
    }

    frm.refresh_field("taxes");
    let total_taxes_and_charges = frm.doc.taxes.reduce((total, row) => total + (row.tax_amount || 0), 0);

    frm.set_value("total_taxes_and_charges", total_taxes_and_charges);
    frm.set_value("total", total_taxes_and_charges);
    frm.set_value("custom_company_amount", insurance_account_amount * -1);
    frm.set_value("custom_customer_amount", total_customer_amount);
}

// الكود البديل (يعتمد على custom__apvd_amt == 1)
async function recalculate_insurance_amounts_v2(frm) {
    let insurance_company_name = frm.doc.custom_insurance_company;
    if (!insurance_company_name) return;

    let doc = await frappe.db.get_doc("Insurance Company", insurance_company_name);
    if (doc.custom__apvd_amt != 1) return;

    let percentage = frm.doc.custom_insurance_percentage || 0;
    let approval_amount = frm.doc.custom_approval_amount || 0;
    let maximum_limit = frm.doc.custom_maximum_limit || 0;
    let custom_contract_discount = frm.doc.custom_contract_discount || 0;

    if (percentage === 0) {
        frm.set_value("custom_customer_amount", 0);
        frm.set_value("custom_company_amount", 0);
        frm.set_value("discount_amount", 0);
        return;
    }

    let calculated_discount = (approval_amount) * (percentage / 100);
    let discount = maximum_limit > 0 ? Math.min(calculated_discount, maximum_limit) : calculated_discount;

    let adjusted_amount = approval_amount - discount;
    let insurance_amount = adjusted_amount - (adjusted_amount * (custom_contract_discount / 100));
    let final_insurance_amount = insurance_amount;

    let insurance_difference = frm.doc.total - approval_amount;
    let total_customer_amount = discount + insurance_difference;

    let insurance_account_amount = frm.doc.taxes?.find(row => row.account_head === "1302 - شركات التأمين - AO")?.tax_amount || 0;
    let negative_insurance_amount = insurance_account_amount * -1;
    let total_after_insurance = negative_insurance_amount + frm.doc.custom_customer_amount;
    let total_difference = frm.doc.total - total_after_insurance;

    frm.set_value("discount_amount", 0);
    frm.set_value("discount_amount", total_difference);

    if (final_insurance_amount > 0) {
        let negative_final_insurance_amount = final_insurance_amount * -1;
        let insurance_amount_row = frm.doc.taxes?.find(row => row.description === "Insurance Amount");
        if (!insurance_amount_row) {
            frm.add_child("taxes", {
                charge_type: "Actual",
                account_head: "1302 - شركات التأمين - AO",
                description: "Insurance Amount",
                tax_amount: negative_final_insurance_amount
            });
        } else {
            insurance_amount_row.tax_amount = negative_final_insurance_amount;
            insurance_amount_row.account_head = "1302 - شركات التأمين - AO";
        }
    }

    frm.refresh_field("taxes");
    let total_taxes_and_charges = frm.doc.taxes.reduce((total, row) => total + (row.tax_amount || 0), 0);

    frm.set_value("total_taxes_and_charges", total_taxes_and_charges);
    frm.set_value("total", total_taxes_and_charges);
    frm.set_value("custom_company_amount", insurance_account_amount * -1);
    frm.set_value("custom_customer_amount", total_customer_amount);
}

