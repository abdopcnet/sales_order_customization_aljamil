// اجمالي الخصم في جدول الصنف (Sales Order)

frappe.ui.form.on('Sales Order', {
    validate: function(frm) {
        update_all_discounts(frm);
    }
});

// تحديث عند تغيير أي قيم في جدول الأصناف
frappe.ui.form.on('Sales Order Item', {
    custom_discount: function(frm, cdt, cdn) {
        update_discount(frm, cdt, cdn);
    },
    custom_discount_percentage: function(frm, cdt, cdn) {
        update_discount(frm, cdt, cdn);
    },
    custom_discount2: function(frm, cdt, cdn) {
        update_discount(frm, cdt, cdn);
    },
    price_list_rate: function(frm, cdt, cdn) {
        update_discount(frm, cdt, cdn);
    },
    qty: function(frm, cdt, cdn) {
        update_discount(frm, cdt, cdn);
    }
});

// الدالة المسؤولة عن الحساب
function update_discount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    // الخصم الأول (custom_discount ÷ qty)
    let val1 = 0;
    if (row.custom_discount && row.qty) {
        val1 = flt(row.custom_discount) / flt(row.qty);
    }

    // الخصم الثاني (price_list_rate * النسبة / 100)
    let val2 = 0;
    if (row.price_list_rate && row.custom_discount_percentage) {
        val2 = (flt(row.price_list_rate) * flt(row.custom_discount_percentage)) / 100;
    }

    // الخصم الثالث (custom_discount2 ÷ qty)
    let val3 = 0;
    if (row.custom_discount2 && row.qty) {
        val3 = flt(row.custom_discount2) / flt(row.qty);
    }

    // الجمع بين الخصوم الثلاثة
    let total_discount = val1 + val2 + val3;

    frappe.model.set_value(cdt, cdn, "discount_amount", total_discount);

    frm.dirty();
}

// تحديث جميع الصفوف عند الحفظ فقط
function update_all_discounts(frm) {
    (frm.doc.items || []).forEach(row => {
        let val1 = 0;
        if (row.custom_discount && row.qty) {
            val1 = flt(row.custom_discount) / flt(row.qty);
        }

        let val2 = 0;
        if (row.price_list_rate && row.custom_discount_percentage) {
            val2 = (flt(row.price_list_rate) * flt(row.custom_discount_percentage)) / 100;
        }

        let val3 = 0;
        if (row.custom_discount2 && row.qty) {
            val3 = flt(row.custom_discount2) / flt(row.qty);
        }

        frappe.model.set_value(row.doctype, row.name, "discount_amount", val1 + val2 + val3);
    });
}

