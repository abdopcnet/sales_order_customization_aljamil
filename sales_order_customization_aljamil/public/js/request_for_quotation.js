frappe.ui.form.on('Sales Order', {
    on_submit: function(frm) {
        if (!frm.doc.branch) {
            frappe.throw("⚠️ يجب تحديد الفرع في أمر البيع.");
        }

        frappe.db.get_list("Supplier", {
            filters: { custom_branch: frm.doc.branch },
            fields: ["name", "supplier_primary_contact"] // نجلب الـ Contact الأساسي
        }).then(suppliers => {
            if (!suppliers || suppliers.length === 0) {
                frappe.throw(`❌ لا يوجد موردون مرتبطون بالفرع: ${frm.doc.branch}`);
            }

            suppliers.forEach(supplier => {
                if (!supplier.name) return;

                let rfq = {
                    doctype: "Request for Quotation",
                    supplier: supplier.name,
                    transaction_date: frappe.datetime.get_today(),
                    schedule_date: frappe.datetime.add_days(frappe.datetime.get_today(), 7),
                    company: frm.doc.company,
                    title: `طلب عرض سعر - ${supplier.name}`,
                    message_for_supplier: "نرجو تزويدنا بعرض السعر في أقرب وقت",
                    suppliers: [{ supplier: supplier.name }],
                    items: []
                };

                (frm.doc.items || []).forEach(item => {
                    if (item.item_code && item.qty) {
                        rfq.items.push({
                            item_code: item.item_code,
                            qty: item.qty,
                            warehouse: item.warehouse,
                            uom: item.uom || "Nos",
                            conversion_factor: 1
                        });
                    }
                });

                if (rfq.items.length === 0) {
                    frappe.msgprint(`⚠️ لم يتم إنشاء طلب عرض سعر للمورد ${supplier.name} لعدم وجود أصناف.`);
                    return;
                }

                // إنشاء RFQ
                frappe.call({
                    method: "frappe.client.insert",
                    args: { doc: rfq },
                    callback: function(res) {
                        if (res.message) {
                            let rfq_link = `${window.location.origin}/app/request-for-quotation/${res.message.name}`;
                            frappe.msgprint({
                                title: "✅ تم إنشاء طلب عرض سعر",
                                message: `المورد: <b>${supplier.name}</b><br>رابط: <a href="${rfq_link}" target="_blank">${res.message.name}</a>`,
                                indicator: "green"
                            });

                            // جلب رقم الهاتف من Contact المرتبط بالمورد
                            if (supplier.supplier_primary_contact) {
                                frappe.db.get_doc("Contact", supplier.supplier_primary_contact)
                                    .then(contact_doc => {
                                        let phone_number = null;

                                        // البحث في جدول phone_nos عن أول رقم متاح
                                        if (contact_doc.phone_nos && contact_doc.phone_nos.length > 0) {
                                            phone_number = contact_doc.phone_nos[0].phone;
                                        }

                                        if (phone_number) {
                                            let sms_message = `📌 تم إنشاء طلب عرض سعر جديد (${res.message.name})\n` +
                                                              `الرابط: ${rfq_link}`;
                                            frappe.call({
                                                method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
                                                args: {
                                                    receiver_list: [phone_number],
                                                    msg: sms_message
                                                },
                                                callback: function() {
                                                    frappe.msgprint(`📨 تم إرسال رابط RFQ إلى المورد ${supplier.name} (${phone_number})`);
                                                },
                                                error: function(err) {
                                                    frappe.msgprint(`❌ فشل إرسال الرسالة إلى المورد ${supplier.name}.`);
                                                    console.error(err);
                                                }
                                            });
                                        } else {
                                            frappe.msgprint(`⚠️ لا يوجد رقم هاتف في Contact: ${supplier.supplier_primary_contact} للمورد ${supplier.name}.`);
                                        }
                                    });
                            } else {
                                frappe.msgprint(`⚠️ لا يوجد Contact أساسي للمورد ${supplier.name}.`);
                            }
                        }
                    },
                    error: function(err) {
                        frappe.msgprint({
                            title: "❌ فشل إنشاء طلب عرض سعر",
                            message: `المورد: ${supplier.name}<br><pre>${JSON.stringify(err, null, 2)}</pre>`,
                            indicator: "red"
                        });
                    }
                });
            });
        });
    }
});

