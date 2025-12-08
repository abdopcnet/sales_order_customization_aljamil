// ===============================
// Multi Add Button for Native Items Table
// Adds a Multi Add button below the native items child table
// Independent script - no relation to custom_items_table
// Adds items directly to the native items child table
// ===============================

frappe.ui.form.on("Sales Order", {
    refresh(frm) {
        // Only add button if items field exists
        if (!frm.fields_dict.items) return;
        
        // Get the grid object
        const grid = frm.fields_dict.items.grid;
        if (!grid) return;
        
        // Add Multi Add button below the native items table
        // This button is independent and always shows for native items table
        if (!frm._multi_add_button_added) {
            grid.add_custom_button(__("Multi Add Items"), function() {
                open_multi_add_dialog_for_native_table(frm);
            }, "bottom");
            frm._multi_add_button_added = true;
        }
    }
});

// Multi Add dialog for native items table
function open_multi_add_dialog_for_native_table(frm) {
    console.log("[Multi Add Native] Opening dialog", { frm: frm.doc.name });
    const default_wh = frm.doc.set_warehouse || "";

    const d = new frappe.ui.Dialog({
        title: __("Multi Add Items"),
        size: "large",
        fields: [
            {
                fieldname: "warehouse",
                label: "Warehouse",
                fieldtype: "Link",
                options: "Warehouse",
                default: default_wh,
                reqd: 1
            },
            {
                fieldname: "search",
                label: "Search Item (code / name)",
                fieldtype: "Data"
            },
            {
                fieldname: "results",
                fieldtype: "HTML"
            }
        ],
        primary_action_label: __("Add Selected"),
        primary_action(values) {
            if (!frm.doc.customer) {
                frappe.msgprint({ message: __("Please select Customer first"), indicator: "red" });
                return;
            }
            console.log("[Multi Add Native] Add Selected clicked", { values, warehouse: values.warehouse });
            const $tbody = $(d.get_field("results").$wrapper).find("tbody");
            let added_count = 0;
            
            const rows_to_add = [];
            $tbody.find("tr[data-item-code]").each(function () {
                const $r = $(this);
                const qty = parseFloat($r.find(".multi-qty").val()) || 0;
                const item_code = $r.attr("data-item-code");
                console.log("[Multi Add Native] Checking row", { item_code, qty });
                
                if (!qty || qty <= 0) {
                    console.log("[Multi Add Native] Skipping row - qty is 0 or invalid", { item_code, qty });
                    return;
                }

                if (!item_code) {
                    console.log("[Multi Add Native] Skipping row - no item_code", { item_code });
                    return;
                }

                rows_to_add.push({ item_code, qty, warehouse: values.warehouse || "" });
            });

            console.log("[Multi Add Native] Rows to add", rows_to_add);

            // Add items to native items table
            // Use a promise chain to ensure items are added sequentially
            let promise_chain = Promise.resolve();
            
            rows_to_add.forEach((row_data) => {
                promise_chain = promise_chain.then(() => {
                    console.log("[Multi Add Native] Adding row to native table", row_data);
                    
                    return new Promise((resolve) => {
                        // Add child row to native items table
                        const child = frm.add_child("items");
                        child.qty = row_data.qty;
                        child.warehouse = row_data.warehouse || frm.doc.set_warehouse || "";
                        child.delivery_date = frm.doc.delivery_date || frm.doc.transaction_date || frappe.datetime.nowdate();
                        
                        // Set item_code which will trigger item_code change event to fetch details
                        frappe.model.set_value(child.doctype, child.name, "item_code", row_data.item_code).then(() => {
                            added_count++;
                            resolve();
                        });
                    });
                });
            });

            promise_chain.then(() => {
                console.log("[Multi Add Native] Total rows added", added_count);

                if (added_count > 0) {
                    // Refresh the items field to show the new rows
                    frm.refresh_field("items");
                    frappe.show_alert({
                        message: __("{0} item(s) added", [added_count]),
                        indicator: "green"
                    });
                }
            });

            d.hide();
        }
    });

    const results_html = $(`
        <div style="max-height:400px;overflow:auto;">
            <table style="width:100%;border-collapse:collapse;border:1px solid #d1d8dd;">
                <thead>
                    <tr style="background-color:#f5f5f5;">
                        <th style="padding:8px;border:1px solid #d1d8dd;text-align:left;">Item Code</th>
                        <th style="padding:8px;border:1px solid #d1d8dd;text-align:left;">Item Name</th>
                        <th style="padding:8px;border:1px solid #d1d8dd;text-align:left;">Available Qty</th>
                        <th style="padding:8px;border:1px solid #d1d8dd;text-align:left;width:80px;">Qty</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `);
    d.get_field("results").$wrapper.html(results_html);
    const $tbody = results_html.find("tbody");

    const search_field = d.get_field("search");
    search_field.df.onchange = () => {
        const txt = search_field.get_value();
        const wh = d.get_value("warehouse");
        if (!txt || !wh) return;
        search_items_with_stock_for_native(txt, wh, $tbody);
    };

    d.show();
}

// Search items + stock for native items table
function search_items_with_stock_for_native(txt, warehouse, $tbody) {
    console.log("[Search Items Native] Starting search", { txt, warehouse });
    $tbody.empty();

    frappe.call({
        method: "frappe.desk.search.search_link",
        args: {
            doctype: "Item",
            txt: txt,
            page_length: 20
        },
        callback(r) {
            const results = r.results || r.message || [];
            console.log("[Search Items Native] Search results", { count: results.length, results });
            if (!results.length) {
                console.log("[Search Items Native] No items found");
                $tbody.append('<tr><td colspan="4" style="padding:8px;text-align:center;color:#999;">No Items Found</td></tr>');
                return;
            }

            const item_codes = results.map(x => x.value);
            console.log("[Search Items Native] Item codes to check stock", item_codes);

            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Bin",
                    filters: { warehouse: warehouse, item_code: ["in", item_codes] },
                    fields: ["item_code", "actual_qty", "reserved_qty"],
                    limit_page_length: 100
                },
                callback(b) {
                    const bins = {};
                    (b.message || []).forEach(bin => {
                        bins[bin.item_code] =
                            (bin.actual_qty || 0) - (bin.reserved_qty || 0);
                    });

                    results.forEach(rw => {
                        const available = bins[rw.value] || 0;
                        const tr = $(`
                            <tr data-item-code="${rw.value}" style="border-bottom:1px solid #e0e0e0;" onmouseover="this.style.backgroundColor='#f9f9f9';" onmouseout="this.style.backgroundColor='transparent';">
                                <td style="padding:8px;border:1px solid #d1d8dd;">${rw.value}</td>
                                <td style="padding:8px;border:1px solid #d1d8dd;">${frappe.utils.escape_html(rw.description || rw.value)}</td>
                                <td style="padding:8px;border:1px solid #d1d8dd;">${available.toFixed(2)}</td>
                                <td style="padding:8px;border:1px solid #d1d8dd;"><input type="number" class="multi-qty" step="0.001" value="0" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;"></td>
                            </tr>
                        `);
                        $tbody.append(tr);
                    });
                }
            });
        }
    });
}

