frappe.ui.form.on('Sales Order', {
    refresh: function(frm) {
        frm.add_custom_button("📤 إرسال الخصم الإضافي عبر SMS", async function () {
            let messages = [];
            let branch = frm.doc.branch || "غير محدد";

            // اجمع كل الأصناف ذات الخصم غير المعتمد
            (frm.doc.items || []).forEach(item => {
                if (item.custom_discount2 > 0 && !item.custom_discount2_approved) {
                    let subject = `👓️ خصم ${format_currency(item.custom_discount2, "SAR")} ريال يتطلب الموافقة\n` +
                                  `الصنف: ${item.item_code}\n` +
                                  `كود الخصم: ${item.custom_discount_code || "غير متوفر"}\n` +
                                  `الفرع: ${branch}`;
                    messages.push(subject);
                }
            });

            if (!messages.length) {
                frappe.msgprint("❗ لا توجد خصومات غير معتمدة.");
                return;
            }

            // اجلب قائمة الموظفين النشطين
            frappe.db.get_list('Employee', {
                fields: ['name', 'employee_name'],
                filters: { status: 'Active' },
                limit: 100
            }).then(employees => {
                if (!employees.length) {
                    frappe.msgprint("❗ لا يوجد موظفين نشطين.");
                    return;
                }

                frappe.prompt([
                    {
                        label: 'اختر الموظف',
                        fieldname: 'employee',
                        fieldtype: 'Link',
                        options: 'Employee',
                        reqd: 1
                    }
                ], function(values) {
                    // بعد اختيار الموظف، اجلب رقم الهاتف الخاص به
                    frappe.db.get_value('Employee', values.employee, 'cell_number').then(res => {
                        const phone = res.message.cell_number;
                        if (!phone) {
                            frappe.msgprint("❗ لا يوجد رقم جوال محفوظ لهذا الموظف.");
                            return;
                        }

                        let sales_order_link = `${window.location.origin}/app/sales-order/${encodeURIComponent(frm.doc.name)}`;
                        let full_message = messages.join("\n\n") + `\n\n📌 رابط الطلب:\n${sales_order_link}`;
                        let phone_list = [phone.trim()];

                        frappe.call({
                            method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
                            args: {
                                receiver_list: phone_list,
                                msg: full_message
                            },
                            callback: function(res) {
                                frappe.msgprint("📨 تم إرسال الرسالة بنجاح إلى الموظف.");
                            },
                            error: function(err) {
                                frappe.msgprint("❌ فشل إرسال الرسالة. تحقق من إعدادات SMS.");
                                console.error(err);
                            }
                        });

                    });
                });
            });
        });
    }
});

