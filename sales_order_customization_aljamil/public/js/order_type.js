frappe.ui.form.on('Sales Order', {
    onload: function(frm) {
        if (frm.doc.order_type) {
            frm.set_df_property('order_type', 'read_only', 1);
        } else {
            frm.set_df_property('order_type', 'read_only', 0);
        }
    },
    order_type: function(frm) {
        if (frm.doc.order_type) {
            frm.set_df_property('order_type', 'read_only', 1);
        }
    }
});

