frappe.ui.form.on('Sales Order', {
    before_load: function(frm) {
        frm.employee = null;
        frm.custom_sales_limit = 0;
        frm._shown_employee_error = false; // Reset flag on each load
    },

    onload: async function(frm) {
        try {
            const { message: employees } = await frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Employee",
                    filters: {
                        user_id: frappe.session.user,
                        status: "Active"
                    },
                    fields: ["custom_sales_limit"]
                }
            });

            frm.employee = employees[0] || null;
            frm.custom_sales_limit = frm.employee?.custom_sales_limit || 0;
        } catch (error) {
            console.error("خطأ في تحميل بيانات الموظف:", error);
            frm.employee = null;
            frm.custom_sales_limit = 0;
        }
    },

    refresh: function(frm) {
        frm.doc.items.forEach(row => {
            if (typeof row._original_custom_discount === 'undefined') {
                row._original_custom_discount = row.custom_discount;
            }
        });

        if (!frm.employee) {
            const grid = frm.fields_dict.items?.grid;
            if (grid) {
                const df = grid.get_field('custom_discount');
                if (df && df.df) {
                    df.df.read_only = 1;  // Prevent editing from UI
                    df.refresh();
                } else {
                    console.warn("الحقل custom_discount غير موجود في جدول items");
                }
            } else {
                console.warn("الجدول items غير جاهز بعد");
            }
        }
    }
});

frappe.ui.form.on('Sales Order Item', {
    custom_discount: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        // No active employee: prevent editing and revert value immediately
        if (!frm.employee) {
            if (!frm._shown_employee_error) {
                frm._shown_employee_error = true;
                frappe.msgprint({
                    title: "خطأ",
                    message: "لا يمكنك تعديل الخصم - غير مرتبط بموظف نشط",
                    indicator: "red"
                });
            }

            frappe.model.set_value(cdt, cdn, 'custom_discount', row._original_custom_discount || 0);
            return false;
        }

        // Exceeded allowed limit
        if (row.custom_discount > frm.custom_sales_limit) {
            frappe.msgprint({
                title: "خطأ",
                message: `تجاوز الحد المسموح (${frm.custom_sales_limit} ريال)`,
                indicator: "red"
            });

            frappe.model.set_value(cdt, cdn, 'custom_discount', row._original_custom_discount || 0);
            return false;
        }

        // Update original value when edit is valid
        row._original_custom_discount = row.custom_discount;
    },

    items_add: function(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        row._original_custom_discount = row.custom_discount || 0;
    }
});
