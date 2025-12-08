// =======================
// ✅ Sales Order
// =======================
frappe.ui.form.on('Sales Order', {
    onload(frm) {
        frm._discount_msg_shown = frm._no_item_code_msg = false;
        frm._original_custom__discount_percentage = frm.doc.custom__discount_percentage || 0;
        (frm.doc.items || []).forEach(r => r._original_custom_discount_percentage = r.custom_discount_percentage || 0);
    },

    validate(frm) {
        return check_main_discount(frm).then(() => {
            const promises = (frm.doc.items || []).map(r => {
                if (r.item_code && frm.doc.selling_price_list) {
                    return get_item_max_discount(r.item_code, frm.doc.selling_price_list).then(max_disc => {
                        return get_allowed_discount_limit(max_disc).then(allowed => {
                            if ((+r.custom_discount_percentage || 0) > allowed) {
                                r.custom_discount_percentage = r._original_custom_discount_percentage || 0;
                                frappe.throw(__('🚫 نسبة الخصم (custom_discount_percentage) لا يمكن أن تتجاوز الحد ({0}%)', [allowed]));
                            }
                        });
                    });
                }
                return Promise.resolve();
            });
            return Promise.all(promises);
        });
    },

    after_save(frm) {
        frm._original_custom__discount_percentage = frm.doc.custom__discount_percentage || 0;
        (frm.doc.items || []).forEach(r => r._original_custom_discount_percentage = r.custom_discount_percentage || 0);
    },

    custom__discount_percentage(frm) {
        sync_main_discount(frm);
    }
});

frappe.ui.form.on('Sales Order Item', {
    custom_discount_percentage(frm, cdt, cdn) {
        validate_discount_field(frm, cdt, cdn);
    },
    item_code(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        // عند اختيار كود الصنف، ننسخ القيمة من الحقل الرئيسي إذا موجودة وكان ظاهر
        if (!frm.get_field("custom__discount_percentage").df.hidden && frm.doc.custom__discount_percentage > 0) {
            frappe.model.set_value(cdt, cdn, 'custom_discount_percentage', frm.doc.custom__discount_percentage);
            row._original_custom_discount_percentage = frm.doc.custom__discount_percentage;
        }
    }
});

// =======================
// 🔧 الدوال المساعدة
// =======================
function sync_main_discount(frm) {
    // ✅ لو الحقل مخفي → نستخدم حد الموظف مباشرة
    if (frm.get_field("custom__discount_percentage").df.hidden) {
        return get_allowed_discount_limit().then(allowed => {
            frm._original_custom__discount_percentage = allowed;
            (frm.doc.items || []).forEach(row => {
                frappe.model.set_value(row.doctype, row.name, 'custom_discount_percentage', allowed);
                row._original_custom_discount_percentage = allowed;
            });
        });
    }

    const entered = +frm.doc.custom__discount_percentage || 0;
    return get_allowed_discount_limit().then(allowed => {
        if (entered > allowed) {
            frappe.msgprint(__('🚫 نسبة الخصم (الرئيسية) لا يمكن أن تتجاوز الحد ({0}%)', [allowed]));
            frm.set_value('custom__discount_percentage', frm._original_custom__discount_percentage || 0);
            return;
        }
        frm._original_custom__discount_percentage = entered;
        (frm.doc.items || []).forEach(row => {
            frappe.model.set_value(row.doctype, row.name, 'custom_discount_percentage', entered);
            row._original_custom_discount_percentage = entered;
        });
    });
}

function validate_discount_field(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    if (!row.item_code) {
        frappe.model.set_value(cdt, cdn, 'custom_discount_percentage', 0);
        return;
    }
    const entered = +row.custom_discount_percentage || 0;
    frappe.db.get_value('Item Price', { item_code: row.item_code, price_list: frm.doc.selling_price_list }, 'custom_discount_percent')
        .then(r => get_allowed_discount_limit(+r.message?.custom_discount_percent || 0)
            .then(allowed => {
                if (entered > allowed) {
                    frappe.model.set_value(cdt, cdn, 'custom_discount_percentage', row._original_custom_discount_percentage || 0);
                    frappe.msgprint(__('🚫 نسبة الخصم لا يمكن أن تتجاوز الحد ({0}%)', [allowed]));
                } else {
                    row._original_custom_discount_percentage = entered;
                }
            }));
}

function get_item_max_discount(item_code, price_list) {
    return frappe.db.get_value('Item Price', { item_code, price_list }, 'custom_discount_percent')
        .then(r => +r.message?.custom_discount_percent || 0);
}

function get_allowed_discount_limit(max_discount = 0) {
    return frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Employee",
            filters: { user_id: frappe.session.user, status: "Active" },
            fields: ["custom_discount_percentage_limit"],
            limit_page_length: 1
        }
    }).then(res => Math.max(max_discount, +res.message?.[0]?.custom_discount_percentage_limit || 0));
}

function check_main_discount(frm) {
    // ✅ لو الحقل مخفي → نستخدم الحد مباشرة
    if (frm.get_field("custom__discount_percentage").df.hidden) {
        return get_allowed_discount_limit().then(allowed => {
            frm._original_custom__discount_percentage = allowed;
        });
    }

    const entered = +frm.doc.custom__discount_percentage || 0;
    return get_allowed_discount_limit().then(allowed => {
        if (entered > allowed) {
            frappe.throw(__('🚫 نسبة الخصم (الرئيسية) لا يمكن أن تتجاوز الحد ({0}%)', [allowed]));
        } else {
            frm._original_custom__discount_percentage = entered;
        }
    });
}

