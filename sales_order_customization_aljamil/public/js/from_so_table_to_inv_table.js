frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        if (frm.doc.docstatus === 1) {
            const watch = setInterval(() => {
                const route = frappe.get_route();

                if (route[0] === "Form" && route[1] === "Sales Invoice") {
                    clearInterval(watch);

                    frappe.model.with_doc("Sales Invoice", route[2], () => {
                        const si = frappe.model.get_doc("Sales Invoice", route[2]);

                        // --------- Items Table ---------
                        if (si.items && si.items.length && frm.doc.items && frm.doc.items.length) {
                            si.items.forEach((item, idx) => {
                                const so_item = frm.doc.items[idx];
                                if (so_item) {
                                    // Discount fields
                                    frappe.model.set_value(item.doctype, item.name, "custom_discount", so_item.custom_discount || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_discount2", so_item.custom_discount2 || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_discount_percentage", so_item.custom_discount_percentage || "");

                                    // Lens and size fields
                                    frappe.model.set_value(item.doctype, item.name, "custom_lensmaterial", so_item.custom_lensmaterial || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_lenscolor", so_item.custom_lenscolor || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_lenscolorclip", so_item.custom_lenscolorclip || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_lensfeature", so_item.custom_lensfeature || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_polarized", so_item.custom_polarized || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_mirror", so_item.custom_mirror || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_templelengthsize", so_item.custom_templelengthsize || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_lenswidthsize", so_item.custom_lenswidthsize || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_lensheightsize", so_item.custom_lensheightsize || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_bridgewidthsize", so_item.custom_bridgewidthsize || "");
                                    frappe.model.set_value(item.doctype, item.name, "custom_shapesize", so_item.custom_shapesize || "");
                                }
                            });
                        }

                        // --------- Custom Insurance Data Table ---------
                        if (si.custom_insurance_data && si.custom_insurance_data.length && frm.doc.custom_insurance_data && frm.doc.custom_insurance_data.length) {
                            si.custom_insurance_data.forEach((ins_item, idx) => {
                                const so_ins = frm.doc.custom_insurance_data[idx];
                                if (so_ins) {
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "patients_insurance_company_name", so_ins.patients_insurance_company_name || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "policy_number", so_ins.policy_number || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "patient_name", so_ins.patient_name || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "id_number", so_ins.id_number || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "category", so_ins.category || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "expiry_date", so_ins.expiry_date || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "category_name", so_ins.category_name || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "category_type", so_ins.category_type || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "membership_number", so_ins.membership_number || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "nationality", so_ins.nationality || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "age", so_ins.age || "");
                                    frappe.model.set_value(ins_item.doctype, ins_item.name, "file_number", so_ins.file_number || "");
                                }
                            });
                        }

                    });
                } else {
                    clearInterval(watch);
                }
            }, 200);
        }
    }
});

