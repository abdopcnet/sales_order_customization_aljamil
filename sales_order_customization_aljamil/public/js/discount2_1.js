frappe.ui.form.on('Sales Order', {
    onload: function(frm) {
        if (frm.doc.docstatus === 0 && frappe.user.has_role("Sales Manager")) {
            update_discount_button(frm);
        }
    },
    refresh: function(frm) {
        if (frm.doc.docstatus === 0 && frappe.user.has_role("Sales Manager")) {
            setTimeout(() => {
                update_discount_button(frm);
            }, 300);
        }
    },
    items_on_form_render: function(frm) {
        update_discount_button(frm);
    },
    items_on_change: function(frm) {
        update_discount_button(frm);
    },
    after_save: function(frm) {
        setTimeout(() => {
            update_discount_button(frm);
        }, 300);
    }
});

let discount_button = null;

function update_discount_button(frm) {
    if (!frappe.user.has_role("Sales Manager")) {
        if (discount_button) {
            discount_button.remove();
            discount_button = null;
        }
        return;
    }

    const pending_count = count_pending_discounts(frm);

    if (pending_count === 0) {
        if (discount_button) {
            discount_button.remove();
            discount_button = null;
        }
        return;
    }

    if (discount_button) {
        discount_button.remove();
    }

    discount_button = frm.add_custom_button(`👓 خصومات (${pending_count})`, function () {
        show_individual_discount_dialogs(frm);
    });
}

function count_pending_discounts(frm) {
    return (frm.doc.items || []).filter(item => {
        if (item.custom_discount2 <= 0) return false;
        const key = get_local_key(frm.doc.name, item.name);
        const decision = localStorage.getItem(key);
        return decision !== "approved" && decision !== "rejected";
    }).length;
}

function show_individual_discount_dialogs(frm) {
    let rows = (frm.doc.items || []).filter(item => {
        if (item.custom_discount2 <= 0) return false;
        const key = get_local_key(frm.doc.name, item.name);
        const decision = localStorage.getItem(key);
        return decision !== "approved" && decision !== "rejected";
    });

    if (rows.length === 0) {
        frappe.msgprint("✅ لا توجد خصومات بحاجة للموافقة.");
        return;
    }

    function show_next_dialog(index) {
        if (index >= rows.length) {
            frm.save().then(() => {
                frappe.msgprint("✅ تم الانتهاء من مراجعة الخصومات.");
                setTimeout(() => update_discount_button(frm), 300);
            });
            return;
        }

        const row = rows[index];
        const key = get_local_key(frm.doc.name, row.name);

        const branch = frm.doc.branch || frm.doc.custom_branch || 'غير محدد';

        const d = new frappe.ui.Dialog({
            title: `🔔 طلب خصم اضافي`,
            fields: [
                {
                    fieldtype: "HTML",
                    options: `
                        <div style="margin-bottom: 15px;">
                            <b>الصنف:</b> ${row.item_code}<br>
                            <b>الخصم:</b> ${format_currency(row.custom_discount2)}<br>
                            <b>كود الخصم:</b> ${row.custom_discount_code || 'غير متوفر'}<br>
                            <b>الفرع:</b> ${branch}
                        </div>`
                }
            ],
            primary_action_label: "✅ موافق",
            primary_action: function () {
                frappe.model.set_value(row.doctype, row.name, "custom_discount2_approved", 1);
                frappe.model.set_value(row.doctype, row.name, "custom__discount_code_approved", row.custom_discount_code || '');
                localStorage.setItem(key, "approved");
                d.hide();
                update_discount_button(frm);
                show_next_dialog(index + 1);
            },
            secondary_action_label: "❌ غير موافق",
            secondary_action: function () {
                localStorage.setItem(key, "rejected");
                d.hide();
                update_discount_button(frm);
                show_next_dialog(index + 1);
            }
        });

        d.show();
    }

    show_next_dialog(0);
}

function get_local_key(order_name, item_name) {
    return `discount_decision_${order_name}_${item_name}`;
}

