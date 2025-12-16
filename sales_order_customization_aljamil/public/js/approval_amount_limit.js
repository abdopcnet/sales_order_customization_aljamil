frappe.ui.form.on('Sales Order', {
    validate: function(frm) {
        let total = 0;

        // Sum custom_approval_amount values in items table
        frm.doc.items.forEach(function(row) {
            total += row.custom_approval_amount || 0;
        });

        // Compare total with main field
        if (total > (frm.doc.custom_approval_amount || 0)) {
            frappe.throw(__('إجمالي مبلغ الموافقة في البنود يتجاوز المبلغ المحدد في أمر البيع.'));
        }
    }
});

