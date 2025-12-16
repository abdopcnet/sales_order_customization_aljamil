// =======================
// ✅ Sales Order
// =======================
frappe.ui.form.on('Sales Order', {
    onload(frm) {
        frm._discount_msg_shown = false;
        frm._no_item_code_msg = false;

        frm.doc.items.forEach(row => {
            if (!row._original_custom_discount_percentage && row.custom_discount_percentage > 0) {
                row._original_custom_discount_percentage = row.custom_discount_percentage;
            }
        });
    },

    async validate(frm) {
        frm._validate_discount_msg_shown = false;

        for (const row of frm.doc.items) {
            if (row.custom_discount_percentage > 0) {
                const original = Number(row._original_custom_discount_percentage) || 0;
                const current = Number(row.custom_discount_percentage) || 0;

                if (!row._original_custom_discount_percentage) {
                    row._original_custom_discount_percentage = current;
                }
            }

            if (row.item_code && frm.doc.selling_price_list) {
                const price = await frappe.db.get_value('Item Price', {
                    item_code: row.item_code,
                    price_list: frm.doc.selling_price_list
                }, 'custom_discount_percent');

                const max_discount = Number(price.message?.custom_discount_percent) || 0;

                const res = await frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Employee",
                        filters: {
                            user_id: frappe.session.user,
                            status: "Active"
                        },
                        fields: ["custom_discount_percentage_limit"],
                        limit_page_length: 1
                    }
                });

                const employee_limit = Number(res.message?.[0]?.custom_discount_percentage_limit) || 0;
                const allowed_limit = Math.max(max_discount, employee_limit);
                const entered = Number(row.custom_discount_percentage) || 0;

                if (entered > allowed_limit) {
                    let rollback_to = Number(row._original_custom_discount_percentage) || 0;

                    // Restore original value
                    row.custom_discount_percentage = rollback_to;

                    // Prevent save
                    throw frappe.throw({
                        title: __('خصم غير مسموح'),
                        message: __('🚫 نسبة الخصم لا يمكن أن تتجاوز الحد ({0}%)', [allowed_limit]),
                        indicator: 'red'
                    });
                }
            }
        }
    },

    after_save(frm) {
        let updated = false;
        frm.doc.items.forEach(row => {
            if (!row._original_custom_discount_percentage && row.custom_discount_percentage > 0) {
                row._original_custom_discount_percentage = row.custom_discount_percentage;
                updated = true;
            }
        });
        if (updated) frm.save();
    }
});


// =======================
// ✅ Sales Order Item
// =======================
frappe.ui.form.on('Sales Order Item', {
    custom_discount_percentage(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        if (!row.item_code) {
            frappe.model.set_value(cdt, cdn, 'custom_discount_percentage', 0);

            if (!frm._no_item_code_msg) {
                frm._no_item_code_msg = true;
                frappe.msgprint(__('🚫 يجب تحديد الصنف أولًا قبل إدخال نسبة الخصم'));
            }

            return;
        }

        if (!frm.doc.selling_price_list) return;

        const entered = Number(row.custom_discount_percentage) || 0;

        frappe.db.get_value('Item Price', {
            item_code: row.item_code,
            price_list: frm.doc.selling_price_list
        }, 'custom_discount_percent').then(r => {
            const max_discount = Number(r.message?.custom_discount_percent) || 0;

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Employee",
                    filters: {
                        user_id: frappe.session.user,
                        status: "Active"
                    },
                    fields: ["custom_discount_percentage_limit"],
                    limit_page_length: 1
                },
                callback(res) {
                    const employee_limit = Number(res.message?.[0]?.custom_discount_percentage_limit) || 0;
                    const allowed_limit = Math.max(max_discount, employee_limit);

                    if (entered > allowed_limit) {
                        const rollback_to = Number(row._original_custom_discount_percentage) || 0;

                        frappe.model.set_value(cdt, cdn, 'custom_discount_percentage', rollback_to);

                        if (!frm._discount_msg_shown) {
                            frm._discount_msg_shown = true;
                            frappe.msgprint({
                                title: __('خصم غير مسموح'),
                                message: __('🚫 نسبة الخصم لا يمكن أن تتجاوز الحد ({0}%)', [allowed_limit]),
                                indicator: 'red'
                            });
                        }
                    } else {
                        // Save original value
                        frappe.model.set_value(cdt, cdn, '_original_custom_discount_percentage', entered);
                        frm._discount_msg_shown = false;
                        frm._no_item_code_msg = false;
                    }
                }
            });
        });
    },

    items_add(frm, cdt, cdn) {
        frappe.model.set_value(cdt, cdn, '_original_custom_discount_percentage', null);
    }
});

