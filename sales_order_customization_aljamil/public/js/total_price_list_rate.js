frappe.ui.form.on("Sales Order", {
    validate: function(frm) {
        let total = 0;
        (frm.doc.items || []).forEach(row => {
            row.custom_total_price_list = (row.price_list_rate || 0) * (row.qty || 0);
            total += row.custom_total_price_list;
        });
        frm.set_value("custom_total_table", total);
    }
});

frappe.ui.form.on("Sales Order Item", {
    price_list_rate: function(frm, cdt, cdn) {
        recalc_row_and_total(frm, cdt, cdn);
    },
    qty: function(frm, cdt, cdn) {
        recalc_row_and_total(frm, cdt, cdn);
    }
});

function recalc_row_and_total(frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    row.custom_total_price_list = (row.price_list_rate || 0) * (row.qty || 0);

    let total = 0;
    (frm.doc.items || []).forEach(r => {
        total += (r.custom_total_price_list || 0);
    });
    frm.set_value("custom_total_table", total);
    frm.refresh_field("custom_total_table");
}

