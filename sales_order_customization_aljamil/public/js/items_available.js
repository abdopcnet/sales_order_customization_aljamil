// Prevent submit only if quantities are not fully available
frappe.ui.form.on('Sales Order', {
    before_submit(frm) {
        if (frm.doc.custom_items_available !== 100) {
            frappe.throw(__('⚠️ لا يمكن تسجيل أمر البيع لأن بعض الأصناف غير متوفرة بالكامل في المخزون.'));
        }
    }
});

