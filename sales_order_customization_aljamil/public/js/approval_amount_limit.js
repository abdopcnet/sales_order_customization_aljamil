frappe.ui.form.on('Sales Order', {
    validate: function(frm) {
        let total = 0;

        // جمع قيم custom_approval_amount في جدول البنود
        frm.doc.items.forEach(function(row) {
            total += row.custom_approval_amount || 0;
        });

        // مقارنة الإجمالي مع الحقل الرئيسي
        if (total > (frm.doc.custom_approval_amount || 0)) {
            frappe.throw(__('إجمالي مبلغ الموافقة في البنود يتجاوز المبلغ المحدد في أمر البيع.'));
        }
    }
});

