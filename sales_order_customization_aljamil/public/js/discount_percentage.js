frappe.ui.form.on('Sales Order Item', {
    custom_discount: update_discount,
    custom_discount2: update_discount,
    custom_discount_percentage: update_discount,
    price_list_rate: update_discount
});

function update_discount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    // حساب نسبة الخصم من السعر
    let base_discount = 0;
    if (row.price_list_rate && row.custom_discount_percentage) {
        base_discount = (row.price_list_rate * row.custom_discount_percentage) / 100;
    }

    // جمع الخصومات فقط وكتابة الناتج
    let total_discount = (row.custom_discount || 0) + (row.custom_discount2 || 0) + base_discount;

    // كتابة الناتج في الحقل، كأن المستخدم كتبه يدويًا
    frappe.model.set_value(cdt, cdn, "discount_amount", total_discount);
}

