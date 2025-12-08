// تحديث إجمالي الخصم في Sales Order

frappe.ui.form.on('Sales Order Item', {
    discount_amount: function(frm, cdt, cdn) {
        update_total_deduction(frm);
    },
    qty: function(frm, cdt, cdn) {
        update_total_deduction(frm);
    }
});

frappe.ui.form.on('Sales Order', {
    onload: function(frm) {
        update_total_deduction(frm); // تحديث عند تحميل الفورم
    },
    refresh: function(frm) {
        update_total_deduction(frm); // تحديث عند التحديث
    }
});

function update_total_deduction(frm) {
    let total_deduction = 0;

    (frm.doc.items || []).forEach(item => {
        let discount = (item.discount_amount || 0) * (item.qty || 0);
        total_deduction += discount;
    });

    // تحديث القيمة داخل الفورم
    frm.set_value('custom_total_deduction', total_deduction);
}
