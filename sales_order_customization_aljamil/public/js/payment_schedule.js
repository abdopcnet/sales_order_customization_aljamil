// Client Script — Doctype: "Sales Order"
frappe.ui.form.on('Sales Order', {
    setup(frm) {
        // دالة موحدة لفرض تواريخ الدفع
        frm._force_payment_due_dates = function () {
            if (!frm.doc.payment_schedule || !frm.doc.transaction_date) return;

            const tx = frappe.datetime.str_to_obj(frm.doc.transaction_date);
            let changed = false;

            (frm.doc.payment_schedule || []).forEach(row => {
                // إجبار التاريخ ليكون تاريخ أمر البيع دائماً
                if (!row.due_date || frappe.datetime.str_to_obj(row.due_date) < tx || row.due_date !== frm.doc.transaction_date) {
                    row.due_date = frm.doc.transaction_date;
                    changed = true;
                }
            });

            if (changed) frm.refresh_field('payment_schedule');
        };
    },

    onload(frm) {
        // عند فتح أمر البيع (حتى بعد التحويل من عرض سعر)
        frm._force_payment_due_dates();
    },

    refresh(frm) {
        // تأكيد إضافي عند كل ريفرش
        frm._force_payment_due_dates();
    },

    transaction_date(frm) {
        // لو المستخدم غيّر تاريخ أمر البيع نعيد ضبط جدول الدفع
        frm._force_payment_due_dates();
    },

    validate(frm) {
        // أهم نقطة: قبل الحفظ مباشرة — يمنع رسالة "لا يمكن أن يكون تاريخ الاستحقاق قبل تاريخ الترحيل"
        frm._force_payment_due_dates();
    },

    before_submit(frm) {
        // تأكيد أخير قبل الإرسال
        frm._force_payment_due_dates();
    }
});

