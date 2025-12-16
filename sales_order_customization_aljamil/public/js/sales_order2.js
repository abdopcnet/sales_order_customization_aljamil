frappe.ui.form.on('Sales Order', {
    before_submit: function(frm) {
        if (frm.doc.customer && frm.doc.custom_size && frm.doc.custom_size.length > 0) {
            return frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Customer",
                    name: frm.doc.customer
                }
            }).then(response => {
                if (response.message) {
                    let customer_doc = response.message;
                    let existing_rows = customer_doc.custom_size_t || [];
                    let updated_rows = [...existing_rows];
                    let conflict_found = false;

                    for (let so_row of frm.doc.custom_size) {
                        // Ignore conflict if row date equals search date
                        let is_from_search = frm.doc.custom_date && (so_row.date === frm.doc.custom_date);

                        if (!is_from_search) {
                            let conflict = existing_rows.some(row =>
                                row.date === so_row.date && row.so !== frm.doc.name
                            );

                            if (conflict) {
                                frappe.msgprint({
                                    title: __('⚠️ تنبيه'),
                                    message: __(' 📝 ') + so_row.date + __(' هذا الكشف موجود مسبقاً '),
                                    indicator: 'red'
                                });
                                frappe.validated = false;
                                conflict_found = true;
                                break; // Stop iteration
                            }
                        }

                        let row_data = {
                            date: so_row.date,
                            sphr: so_row.sphr,
                            cylr: so_row.cylr,
                            axisr: so_row.axisr,
                            addr: so_row.addr,
                            pdr: so_row.pdr,
                            sphl: so_row.sphl,
                            cyll: so_row.cyll,
                            axisl: so_row.axisl,
                            addl: so_row.addl,
                            pdl: so_row.pdl,
                            so: frm.doc.name
                        };

                        let existing_index = updated_rows.findIndex(r => r.so === frm.doc.name && r.date === so_row.date);

                        if (existing_index !== -1) {
                            updated_rows[existing_index] = { ...updated_rows[existing_index], ...row_data };
                        } else {
                            updated_rows.push(row_data);
                        }
                    }

                    // If no conflict, save to customer record
                    if (!conflict_found) {
                        return frappe.call({
                            method: "frappe.client.set_value",
                            args: {
                                doctype: "Customer",
                                name: frm.doc.customer,
                                fieldname: {
                                    "custom_size_t": updated_rows
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});

