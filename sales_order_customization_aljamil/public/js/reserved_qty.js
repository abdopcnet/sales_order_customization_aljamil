frappe.ui.form.on('Sales Order Item', {
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.item_code) {
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Bin",
                    filters: {
                        item_code: row.item_code,
                        warehouse: row.warehouse
                    },
                    fieldname: "reserved_qty"
                },
                callback: function(r) {
                    if (r.message) {
                        frappe.model.set_value(cdt, cdn, "custom_reserved_qty", r.message.reserved_qty || 0);
                    } else {
                        frappe.model.set_value(cdt, cdn, "custom_reserved_qty", 0);
                    }
                }
            });
        } else {
            frappe.model.set_value(cdt, cdn, "custom_reserved_qty", 0);
        }
    }
});

