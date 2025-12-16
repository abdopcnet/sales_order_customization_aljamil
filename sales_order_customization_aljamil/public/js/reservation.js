frappe.ui.form.on('Sales Order Item', {
    item_code: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (!row.item_code) return;

        frappe.db.get_value('Item', row.item_code, 'is_sub_contracted_item')
            .then(r => {
                let is_sub = r.message.is_sub_contracted_item;

                // Enable reservation only if item is not subcontracted
                frappe.model.set_value(cdt, cdn, 'reserve_stock', !is_sub);
            });
    }
});

