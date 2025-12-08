frappe.ui.form.on('Sales Order Item', {
    warehouse: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.item_code && row.warehouse) {
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Bin",
                    filters: {
                        item_code: row.item_code,
                        warehouse: row.warehouse
                    },
                    fieldname: ["projected_qty"]
                },
                callback: function(r) {
                    frappe.model.set_value(cdt, cdn, "projected_qty", r.message ? r.message.projected_qty : 0);
                }
            });
        }
    }
});

