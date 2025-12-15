frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        // Update selling price list from order_type on refresh
        frm.doc.selling_price_list = frm.doc.order_type;
        frm.refresh_field('selling_price_list');
    },

    order_type: function(frm) {
        // Update selling price list whenever order_type changes
        frm.set_value('selling_price_list', frm.doc.order_type);
    }
});

