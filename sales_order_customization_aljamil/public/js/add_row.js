frappe.ui.form.on('Sales Order', {
    validate: function(frm) {
        // تحقق من جدول التأمين
        if (frm.doc.custom__insurance_data && frm.doc.custom__insurance_data.length > 1) {
            frappe.throw(__('لا يمكن إضافة أكثر من صف واحد في جدول التأمين.'));
        }
        // تحقق من جدول المقاسات
        if (frm.doc.custom_size && frm.doc.custom_size.length > 1) {
            frappe.throw(__('لا يمكن إضافة أكثر من صف واحد في جدول المقاسات.'));
        }
    },

    custom__insurance_data_add: function(frm) {
        if (frm.doc.custom__insurance_data.length > 1) {
            // حذف الصف الزائد فوراً
            frm.doc.custom__insurance_data.splice(1);
            frm.refresh_field('custom__insurance_data');
            frappe.msgprint(__('مسموح فقط بسطر واحد في جدول التأمين.'));
        }
    },

    custom_size_add: function(frm) {
        if (frm.doc.custom_size.length > 1) {
            // حذف الصف الزائد فوراً
            frm.doc.custom_size.splice(1);
            frm.refresh_field('custom_size');
            frappe.msgprint(__('مسموح فقط بسطر واحد في جدول المقاسات.'));
        }
    }
});

