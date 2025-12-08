// =======================
// ✅ Sales Order - Strict Real-Time Available Qty
// =======================

frappe.ui.form.on('Sales Order Item', {
    item_code(frm, cdt, cdn) {
        update_available_qty_strict(frm, cdt, cdn);
    },
    warehouse(frm, cdt, cdn) {
        update_available_qty_strict(frm, cdt, cdn);
    },
    qty(frm, cdt, cdn) {
        update_available_qty_strict(frm, cdt, cdn);
    }
});

frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        if (frm.doc.docstatus === 0) {
            (frm.doc.items || []).forEach(d => {
                update_available_qty_strict(frm, d.doctype, d.name);
            });
        }
    },
    onload_post_render(frm) {
        // ✅ اشترك في التحديثات اللحظية لرصيد المخزن
        frappe.realtime.on("bin_update", (data) => {
            (frm.doc.items || []).forEach(d => {
                if (d.item_code === data.item_code && d.warehouse === data.warehouse) {
                    const available_qty = (data.actual_qty || 0) - (data.reserved_qty || 0);
                    frappe.model.set_value(d.doctype, d.name, "custom_available_qty", available_qty);
                    refresh_field("items");
                }
            });
        });
    }
});

// =======================
// 🔎 دالة لحساب الرصيد المتاح
// =======================
function update_available_qty_strict(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    if (row.item_code && row.warehouse) {
        frappe.db.get_value("Bin",
            {
                item_code: row.item_code,
                warehouse: row.warehouse
            },
            ["actual_qty", "reserved_qty"]
        ).then(r => {
            if (r.message) {
                const actual_qty = r.message.actual_qty || 0;
                const reserved_qty = r.message.reserved_qty || 0;
                const available_qty = actual_qty - reserved_qty;

                frappe.model.set_value(cdt, cdn, "custom_available_qty", available_qty);
                refresh_field("items");
            } else {
                frappe.model.set_value(cdt, cdn, "custom_available_qty", 0);
                refresh_field("items");
            }
        });
    } else {
        frappe.model.set_value(cdt, cdn, "custom_available_qty", 0);
        refresh_field("items");
    }
}

