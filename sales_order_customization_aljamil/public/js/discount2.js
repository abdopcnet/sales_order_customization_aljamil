
frappe.ui.form.on('Sales Order', {
    onload(frm) {
        frm.doc.items.forEach(row => {
            if (!row._original_custom_discount2 && row.custom_discount2 > 0) {
                row._original_custom_discount2 = row.custom_discount2;
            }
        });
    },

    after_save(frm) {
        let updated = false;

        frm.doc.items.forEach(row => {
            if (!row._original_custom_discount2 && row.custom_discount2 > 0) {
                row._original_custom_discount2 = row.custom_discount2;

                if (!row.custom_discount_code) {
                    row.custom_discount_code = generateRandomCode(10);
                }

                updated = true;
            }
        });

        if (updated) frm.save();
    },

    validate(frm) {
        frm.doc.items.forEach(row => {
            if (!row._original_custom_discount2 && row.custom_discount2 > 0) {
                row._original_custom_discount2 = row.custom_discount2;

                if (!row.custom_discount_code) {
                    row.custom_discount_code = generateRandomCode(10);
                }
            }
        });
    },

    refresh(frm) {
        // Do not check code or approval
    },

    before_submit(frm) {
        // Do not check code or approval
    }
});

frappe.ui.form.on('Sales Order Item', {
    custom_discount2(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        const original = Number(row._original_custom_discount2) || 0;
        const current = Number(row.custom_discount2) || 0;

        if (!row._original_custom_discount2 && current > 0) {
            frappe.model.set_value(cdt, cdn, '_original_custom_discount2', current);

            if (!row.custom_discount_code) {
                const code = generateRandomCode(10);
                frappe.model.set_value(cdt, cdn, 'custom_discount_code', code);
            }

            return;
        }

        if (row._original_custom_discount2 && current !== original) {
            frappe.msgprint(__('🚫 لا يمكنك تعديل الخصم بعد إدخاله. تم إرجاع القيمة الأصلية.'));
            frappe.model.set_value(cdt, cdn, 'custom_discount2', row._original_custom_discount2);
        }
    },

    custom_discount_code_approved(frm, cdt, cdn) {
        // Nothing here either
    },

    items_add(frm, cdt, cdn) {
        frappe.model.set_value(cdt, cdn, '_original_custom_discount2', null);
        frappe.model.set_value(cdt, cdn, 'custom_discount_code', null);
        frappe.model.set_value(cdt, cdn, 'custom_discount_code_approved', null);
    }
});

// Generate random code only
function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

