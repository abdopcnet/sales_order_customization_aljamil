
frappe.ui.form.on('Sales Order', {
    async after_save(frm) {
        if (!frm.doc.custom_quotation) return;

        try {
            // الحصول على أحدث نسخة من المستند
            await frm.refresh();
            
            const quotation = await frappe.db.get_doc('Quotation', frm.doc.custom_quotation);
            
            if (quotation.custom_material_request_status === "تم إصدار طلب المواد") return;

            const target_warehouse = quotation.custom_default_source_warehouse;
            if (!target_warehouse) {
                frappe.msgprint("⚠️ يجب تحديد المستودع الرئيسي في Quotation.");
                return;
            }

            // الحصول على الكميات المتاحة
            const bin_data = await frappe.db.get_list("Bin", {
                filters: {
                    warehouse: target_warehouse,
                    item_code: ["in", (quotation.items || []).map(i => i.item_code)]
                },
                fields: ["item_code", "actual_qty", "reserved_qty"]
            });

            const available_map = {};
            (bin_data || []).forEach(b => {
                const actual = b.actual_qty || 0;
                const reserved = b.reserved_qty || 0;
                available_map[b.item_code] = actual - reserved;
            });

            // حساب إجمالي الكمية المطلوبة
            const total_required = {};
            (quotation.items || []).forEach(item => {
                if (item.warehouse && item.warehouse !== target_warehouse) {
                    total_required[item.item_code] = (total_required[item.item_code] || 0) + item.qty;
                }
            });

            // حساب العجز المتبقي
            const shortage_map = {};
            Object.keys(total_required).forEach(item_code => {
                const available = available_map[item_code] || 0;
                shortage_map[item_code] = Math.max(total_required[item_code] - available, 0);
            });

            // توزيع العجز على المخازن
            const warehouse_groups = {};
            (quotation.items || []).forEach(item => {
                if (item.warehouse && item.warehouse !== target_warehouse) {
                    let shortage_left = shortage_map[item.item_code] || 0;
                    if (shortage_left > 0) {
                        const use_qty = Math.min(item.qty, shortage_left);
                        if (use_qty > 0) {
                            if (!warehouse_groups[item.warehouse]) warehouse_groups[item.warehouse] = [];
                            warehouse_groups[item.warehouse].push({
                                item_code: item.item_code,
                                qty: use_qty,
                                uom: item.uom
                            });
                            shortage_map[item.item_code] -= use_qty;
                        }
                    }
                }
            });

            const warehouses = Object.keys(warehouse_groups);
            if (warehouses.length === 0) {
                frappe.msgprint("✅ لا توجد أصناف تحتاج نقل (الكميات متوفرة في المستودع الرئيسي).");
                return;
            }

            // إنشاء سندات التحويل
            for (const from_warehouse of warehouses) {
                const warehouse_info = await frappe.db.get_value("Warehouse", from_warehouse, "default_in_transit_warehouse");
                
                if (!warehouse_info || !warehouse_info.message || !warehouse_info.message.default_in_transit_warehouse) {
                    frappe.throw(`❌ المستودع ${from_warehouse} ليس لديه Transit Warehouse معرف.`);
                }

                const transit_warehouse = warehouse_info.message.default_in_transit_warehouse;
                const items = warehouse_groups[from_warehouse];

                // إنشاء سند التحويل
                const se_doc = await frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Stock Entry",
                            stock_entry_type: "Material Transfer",
                            company: frm.doc.company,
                            sales_order: frm.doc.name,
                            custom_sales_order: frm.doc.name,
                            items: items.map(item => ({
                                item_code: item.item_code,
                                qty: item.qty,
                                uom: item.uom,
                                s_warehouse: from_warehouse,
                                t_warehouse: transit_warehouse
                            })),
                            from_warehouse: from_warehouse,
                            to_warehouse: transit_warehouse,
                            add_to_transit: 1,
                            custom_final_target_warehouse: target_warehouse
                        }
                    }
                });

                // إرسال سند التحويل
                const submitted_se = await frappe.call({
                    method: "frappe.client.submit",
                    args: { doc: se_doc.message }
                });

                const se_name = submitted_se.message.name;

                // تحديث Sales Order Items
                for (const row of frm.doc.items || []) {
                    const matched_item = items.find(i => i.item_code === row.item_code);
                    if (matched_item) {
                        await frappe.db.set_value('Sales Order Item', row.name, 'custom_stock_entry', se_name);
                    }
                }

                // تحديث حالة عرض السعر
                await frappe.call({
                    method: "frappe.client.set_value",
                    args: {
                        doctype: "Quotation",
                        name: quotation.name,
                        fieldname: { custom_material_request_status: "تم إصدار طلب المواد" }
                    }
                });

                frappe.msgprint({
                    title: __('تم إنشاء سند تحويل مخزون'),
                    indicator: 'green',
                    message: __('✅ تم إنشاء سند تحويل جديد: <a href="/app/stock-entry/{0}" target="_blank">{0}</a>', [se_name])
                });
            }
            
            // تحديث النموذج للحصول على أحدث التغييرات
            await frm.refresh();
            
        } catch (error) {
            console.error('Error in after_save:', error);
            frappe.msgprint({
                title: __('خطأ'),
                indicator: 'red',
                message: __('حدث خطأ أثناء معالجة طلب المواد: {0}', [error.message])
            });
        }
    }
});

