frappe.ui.form.on('Sales Order', {
    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Customer",
                    name: frm.doc.customer
                },
                callback: function(response) {
                    if (response.message && response.message.custom_insurance_data && response.message.custom_insurance_data.length > 0) {
                        let insurance_rows = response.message.custom_insurance_data;
                        let last_row = insurance_rows[insurance_rows.length - 1];

                        frm.clear_table("custom__insurance_data");

                        let new_row = frm.add_child("custom__insurance_data");
                        const fields_to_copy = [
                            "policy_number", "category", "expiry_date", "category_name",
                            "id_number", "category_type", "membership_number",
                            "nationality", "Age", "file_number"
                        ];
                        for (let key of fields_to_copy) {
                            new_row[key] = last_row[key];
                        }

                        frm.refresh_field("custom__insurance_data");
                    }
                }
            });
        }
    },

    on_submit: function(frm) {
        if (frm.doc.customer && frm.doc.custom__insurance_data && frm.doc.custom__insurance_data.length > 0) {
            let sales_row = frm.doc.custom__insurance_data[0];

            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Customer",
                    name: frm.doc.customer
                },
                callback: function(response) {
                    let customer = response.message;
                    if (customer) {
                        let insurance_rows = customer.custom_insurance_data || [];
                        let last_customer_row = insurance_rows.length > 0 ? insurance_rows[insurance_rows.length - 1] : null;

                        const fields_to_check = [
                            "policy_number", "category", "expiry_date", "category_name",
                            "id_number", "category_type", "membership_number",
                            "nationality", "Age", "file_number"
                        ];

                        let is_different = true;

                        if (last_customer_row) {
                            is_different = false;

                            for (let key of fields_to_check) {
                                // تنظيف القيم قبل المقارنة
                                let val1 = sales_row[key];
                                let val2 = last_customer_row[key];

                                if (val1 === undefined || val1 === null) val1 = "";
                                if (val2 === undefined || val2 === null) val2 = "";

                                // إذا كان النص، نفّذ trim وحالة insensitive
                                if (typeof val1 === "string") val1 = val1.trim().toLowerCase();
                                if (typeof val2 === "string") val2 = val2.trim().toLowerCase();

                                if (val1 !== val2) {
                                    is_different = true;
                                    break;
                                }
                            }
                        }

                        if (is_different) {
                            let new_row = {};
                            for (let key of fields_to_check) {
                                new_row[key] = sales_row[key];
                            }

                            insurance_rows.push(new_row);

                            frappe.call({
                                method: "frappe.client.set_value",
                                args: {
                                    doctype: "Customer",
                                    name: frm.doc.customer,
                                    fieldname: {
                                        custom_insurance_data: insurance_rows
                                    }
                                },
                                callback: function() {
                                  
                                }
                            });
                        } else {
                         
                        }
                    }
                }
            });
        }
    }
});

