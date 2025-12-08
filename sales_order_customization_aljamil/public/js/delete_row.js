frappe.ui.form.on('Sales Order Item', {
    before_items_remove: function(frm, cdt, cdn) {
        // إذا كان هناك جدول مخصص، لا نتعامل مع الحذف من الجدول الأصلي
        if (frm.fields_dict.custom_items_table) {
            return; // الجدول المخصص يتعامل مع الحذف
        }
        
        let row = frappe.get_doc(cdt, cdn);

        if (row.custom_stock_entry) {
            frappe.confirm(
              `⚠️ تم إصدار سند تحويل لهذا الصنف - رقم السند <b>${row.custom_stock_entry}</b><br><br>
                هل أنت متأكد أنك تريد حذف هذا الصنف؟`,
                function() {
                    // ✅ المستخدم وافق → نحذف الصف يدويًا
                    frm.doc.items = frm.doc.items.filter(r => r.name !== row.name);
                    frm.refresh_field("items");
                },
                function() {
                    // ❌ المستخدم ألغى → لا نفعل شيء، الصف يظل كما هو
                    frappe.show_alert("تم إلغاء الحذف");
                }
            );

            // ❌ نوقف الحذف التلقائي الافتراضي
            throw "تم إيقاف الحذف حتى تأكيد المستخدم";
        }
    },

    // عند إضافة صنف جديد → ينسخ قيمة set_warehouse
    items_add: function(frm, cdt, cdn) {
        // إذا كان هناك جدول مخصص، لا نتعامل مع الإضافة من الجدول الأصلي
        if (frm.fields_dict.custom_items_table) {
            return; // الجدول المخصص يتعامل مع الإضافة
        }
        
        let row = frappe.get_doc(cdt, cdn);

        if (frm.doc.set_warehouse) {
            frappe.model.set_value(cdt, cdn, "warehouse", frm.doc.set_warehouse);
        }
    }
});

frappe.ui.form.on('Sales Order', {
    // عند تغيير set_warehouse → يحدّث كل الأصناف الموجودة
    set_warehouse: function(frm) {
        // إذا كان هناك جدول مخصص، لا نتعامل مع التحديث من الجدول الأصلي
        if (frm.fields_dict.custom_items_table) {
            return; // الجدول المخصص يتعامل مع التحديثات
        }
        
        (frm.doc.items || []).forEach(row => {
            frappe.model.set_value(row.doctype, row.name, "warehouse", frm.doc.set_warehouse);
        });
    }
});

