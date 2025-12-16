frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        // Update selling price list from order_type on refresh only if value is different
        // This prevents marking document as dirty unnecessarily
        if (frm.doc.order_type && frm.doc.selling_price_list !== frm.doc.order_type) {
            frm.set_value('selling_price_list', frm.doc.order_type);
        }
    },

    order_type: function(frm) {
        // Update selling price list whenever order_type changes
        if (frm.doc.order_type) {
            frm.set_value('selling_price_list', frm.doc.order_type);
        }
    }
});

