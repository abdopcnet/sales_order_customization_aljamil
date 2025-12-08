     // ===============================
// Custom Items Table for Sales Order
// - HTML field: custom_items_table
// - Sync → child table: items (Sales Order Item)
// - Item Link search (code / name)
// - Multi Add dialog
// - Columns gear (show / hide)
// - HTML Template embedded in JavaScript
// ===============================

// Columns configuration
const CUSTOM_ITEMS_COLUMNS = [
    { fieldname: "idx",                        label: "#",                      required: 1 },
    { fieldname: "item_code",                  label: "Item Code",             required: 1 },
    { fieldname: "item_name",                  label: "Item Name",             required: 1 },
    { fieldname: "uom",                        label: "UOM",                   required: 0 },
    { fieldname: "qty",                        label: "Quantity",             required: 1 },
    { fieldname: "price_list_rate",            label: "Price List Rate",        required: 0 },
    { fieldname: "custom_discount_percentage", label: "Discount %",            required: 0 },
    { fieldname: "custom_discount",            label: "Discount",              required: 0 },
    { fieldname: "custom_discount2",           label: "Discount 2",            required: 0 },
    { fieldname: "amount",                     label: "Amount",                required: 0 },
    { fieldname: "additional_notes",          label: "Additional Notes",      required: 0 },
    { fieldname: "warehouse",                  label: "Warehouse",             required: 0 }
];

// HTML Template for Custom Items Table (embedded in JavaScript)
const CUSTOM_ITEMS_TABLE_HTML = `
<div style="width:100%;border:1px solid #d1d8dd;border-radius:4px;background-color:#fff;">
    <!-- Header Row -->
    <div style="display:flex;align-items:center;background-color:#fafbfc;border-bottom:1px solid #d1d8dd;height:32px;padding:0 12px;border-top-left-radius:4px;border-top-right-radius:4px;color:#6c7680;font-size:12px;font-weight:normal;">
        <div style="padding:6px 0px;width:2%;text-align:center;font-weight:500;height:32px;display:flex;align-items:center;justify-content:center;" data-col="idx">#</div>
        <div style="padding:6px 8px;width:10%;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;" data-col="item_code">Item Code</div>
        <div style="padding:6px 8px;width:15%;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;" data-col="item_name">Item Name</div>
        <div style="padding:6px 8px;width:8%;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;" data-col="uom">UOM</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="qty">Qty</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="price_list_rate">Price List Rate</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount_percentage">Discount %</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount">Discount</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount2">Discount 2</div>
        <div style="padding:6px 8px;width:8%;text-align:right;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;justify-content:flex-end;" data-col="amount">Amount</div>
        <div style="padding:6px 8px;width:10%;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;" data-col="additional_notes">Additional Notes</div>
        <div style="padding:6px 8px;width:10%;font-weight:500;border-right:1px solid #d1d8dd;height:32px;display:flex;align-items:center;" data-col="warehouse">Warehouse</div>
        <div style="padding:6px 8px;width:5%;text-align:center;height:32px;display:flex;align-items:center;justify-content:center;" data-col="actions"></div>
    </div>
    <!-- Body (rows will be injected here) -->
    <div style="border-top:0;">
        <div class="custom-items-body"></div>
    </div>
    <!-- Footer Totals -->
    <div style="padding:6px 8px;background-color:#fafbfc;border-top:1px solid #d1d8dd;border-bottom-left-radius:4px;border-bottom-right-radius:4px;">
        <div style="display:flex;align-items:center;font-size:12px;color:#6c7680;">
            <strong style="color:#36414c;">Total Qty: </strong> <span class="total-qty" style="margin-left:4px;color:#36414c;">0.00</span>
            <span style="margin:0 12px;color:#d1d8dd;">|</span>
            <strong style="color:#36414c;">Total Amount: </strong> <span class="total-amount" style="margin-left:4px;color:#36414c;">0.00</span>
        </div>
    </div>
    <!-- Toolbar -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <div>
            <button type="button" class="add-custom-row" style="padding:4px 12px;background-color:#5e64ff;color:white;border:1px solid #5e64ff;border-radius:3px;cursor:pointer;font-size:12px;" onmouseover="this.style.backgroundColor='#4a50e6';this.style.borderColor='#4a50e6';" onmouseout="this.style.backgroundColor='#5e64ff';this.style.borderColor='#5e64ff';">
                <span style="margin-right:4px;">+</span> Add Row
            </button>
            <button type="button" class="multi-add-items" style="padding:4px 12px;background-color:#f0f0f0;color:#333;border:1px solid #d1d8dd;border-radius:3px;cursor:pointer;font-size:12px;margin-left:6px;" onmouseover="this.style.backgroundColor='#e0e0e0';this.style.borderColor='#b0b0b0';" onmouseout="this.style.backgroundColor='#f0f0f0';this.style.borderColor='#d1d8dd';">
                <span style="margin-right:4px;">☰</span> Multi Add
            </button>
        </div>
        <button type="button" class="columns-config-btn" title="Select Fields" style="padding:4px 12px;background-color:#f0f0f0;color:#333;border:1px solid #d1d8dd;border-radius:3px;cursor:pointer;font-size:12px;" onmouseover="this.style.backgroundColor='#e0e0e0';this.style.borderColor='#b0b0b0';" onmouseout="this.style.backgroundColor='#f0f0f0';this.style.borderColor='#d1d8dd';">
            ⚙
        </button>
    </div>
</div>`;

// Main events
frappe.ui.form.on("Sales Order", {
    refresh(frm) {
        if (!frm.fields_dict.custom_items_table) return;
        setup_custom_items_table(frm);
        // لا نحمّل البيانات من الجدول الأصلي - الجدول المخصص هو المصدر الوحيد
        // فقط نتأكد من أن الجدول المخصص موجود وجاهز
        ensure_custom_items_observer(frm);
        
        // Customize items child table appearance
        customize_items_table_appearance(frm);
    },
    before_save(frm) {
        // فقط المزامنة من الجدول المخصص إلى الجدول الأصلي قبل الحفظ
        sync_custom_items_to_child_table(frm, false);
        // بعد المزامنة، نحدث refresh_field مرة واحدة فقط
        setTimeout(() => {
            if (!frm._custom_items_loading) {
                frm._custom_items_loading = true;
                frm.refresh_field("items");
                setTimeout(() => {
                    frm._custom_items_loading = false;
                }, 200);
            }
        }, 50);
    }
    // تم إزالة items_add - الجدول المخصص هو المصدر الوحيد
});

// Customize items child table appearance
function customize_items_table_appearance(frm) {
    if (!frm.fields_dict.items) return;
    
    const items_grid = frm.fields_dict.items.grid;
    if (!items_grid) return;
    
    // Apply custom styles to items table
    const items_wrapper = frm.fields_dict.items.$wrapper;
    
    // Add custom CSS to items table
    if (!items_wrapper.data("custom-styled")) {
        items_wrapper.data("custom-styled", true);
        
        // Add inline styles to match custom table appearance
        items_wrapper.find(".form-grid").css({
            "border": "1px solid #d1d8dd",
            "border-radius": "4px"
        });
        
        items_wrapper.find(".grid-heading-row").css({
            "background-color": "#fafbfc",
            "height": "32px",
            "color": "#6c7680",
            "font-size": "12px"
        });
        
        items_wrapper.find(".grid-body .data-row").css({
            "font-size": "12px",
            "color": "#6c7680",
            "min-height": "38px"
        });
        
        // Style grid rows on hover
        items_wrapper.on("mouseenter", ".grid-body .data-row", function() {
            $(this).css("background-color", "#fafbfc");
        });
        
        items_wrapper.on("mouseleave", ".grid-body .data-row", function() {
            $(this).css("background-color", "transparent");
        });
    }
    
    // Customize each row when rendered
    $(frm.wrapper).off("grid-row-render.items-custom").on("grid-row-render.items-custom", function(e, grid_row) {
        if (grid_row.grid.df.fieldname !== "items") return;
        
        const row = grid_row.wrapper;
        const doc = grid_row.doc;
        
        // Apply custom styling to row cells
        row.find(".grid-static-col").css({
            "padding": "6px 8px",
            "height": "38px"
        });
        
        // Style specific columns
        if (doc) {
            // Style amount column if it exists
            const amount_col = row.find('[data-fieldname="amount"]');
            if (amount_col.length) {
                amount_col.css({
                    "text-align": "right",
                    "font-weight": "500",
                    "color": "#36414c"
                });
            }
            
            // Style qty column
            const qty_col = row.find('[data-fieldname="qty"]');
            if (qty_col.length) {
                qty_col.css({
                    "text-align": "right"
                });
            }
            
            // Style rate/price_list_rate column
            const rate_col = row.find('[data-fieldname="rate"], [data-fieldname="price_list_rate"]');
            if (rate_col.length) {
                rate_col.css({
                    "text-align": "right"
                });
            }
        }
    });
}

function ensure_custom_items_observer(frm) {
    const target = frm.wrapper && frm.wrapper[0];
    if (!target) return;
    if (frm._custom_items_observer_attached) return;
    const obs = new MutationObserver(() => {
        const w = frm.fields_dict.custom_items_table && frm.fields_dict.custom_items_table.$wrapper;
        if (!w || !w.length) return;
        if (!w.find('.custom-items-body').length) {
            // فقط نعيد إعداد الجدول بدون تحميل البيانات
            setup_custom_items_table(frm);
        }
    });
    obs.observe(target, { childList: true, subtree: true });
    frm._custom_items_observer_attached = true;
}

// Setup events once
function setup_custom_items_table(frm) {
    const wrapper = frm.fields_dict.custom_items_table.$wrapper;
    if (wrapper.data("initialized")) return;
    const hasBody = wrapper && wrapper.length ? wrapper.find('.custom-items-body').length : 0;
    if (!hasBody) {
        // Use the HTML template constant
        if (wrapper && wrapper.length) wrapper.html(CUSTOM_ITEMS_TABLE_HTML);
    }
    wrapper.data("initialized", true);

    if (!frm._custom_items_events_attached) {
        // Add Row
    $(frm.wrapper).on("click", ".add-custom-row", function () {
        // أنشئ صف في جدول النظام أولاً ليكون الميرور دائمًا مطابق
        if (frm._custom_items_loading) {
            console.log("[Add Row] Skipping - already loading");
            return;
        }
        const child = frm.add_child("items");
        child.qty = 1;
        if (frm.doc.set_warehouse) child.warehouse = frm.doc.set_warehouse;
        child.delivery_date = frm.doc.delivery_date || frm.doc.transaction_date || frappe.datetime.nowdate();
        // Don't refresh field - it will trigger events that reload the table
        // Instead, directly add a blank row to the custom table
        const wrapper = frm.fields_dict.custom_items_table.$wrapper;
        add_custom_row(frm, wrapper);
        update_totals(wrapper);
    });

        // Remove Row
        $(frm.wrapper).on("click", ".remove-row", function () {
            const wrapper = frm.fields_dict.custom_items_table.$wrapper;
            $(this).closest('[data-row="true"]').remove();
            refresh_row_numbers(wrapper);
            update_totals(wrapper);
            // Don't sync immediately - only on before_save to avoid infinite loop
        });

        // Qty / Rate / Discount change
        $(frm.wrapper).on("input", ".qty, .price_list_rate, .custom_discount_percentage, .custom_discount, .custom_discount2", function () {
            const wrapper = frm.fields_dict.custom_items_table.$wrapper;
            const row = $(this).closest('[data-row="true"]');
            calculate_row(row);
            update_totals(wrapper);
            // Don't sync on every input change - only on before_save to avoid infinite loop
        });

        // Multi Add
        $(frm.wrapper).on("click", ".multi-add-items", function () {
            const wrapper = frm.fields_dict.custom_items_table.$wrapper;
            open_multi_add_dialog(frm, wrapper);
        });

        // Gear icon (columns)
        $(frm.wrapper).on("click", ".columns-config-btn", function () {
            const wrapper = frm.fields_dict.custom_items_table.$wrapper;
            open_columns_dialog(wrapper);
        });
        frm._custom_items_events_attached = true;
    }
}

// Load existing Sales Order items → into custom table (on refresh)
function load_items_into_custom_table(frm) {
    const wrapper = frm.fields_dict.custom_items_table.$wrapper;
    const body = wrapper.find(".custom-items-body");
    if (frm._custom_items_loading) {
        return;
    }
    frm._custom_items_loading = true;
    if (!body.length) {
        // Use the HTML template constant
        wrapper.html(CUSTOM_ITEMS_TABLE_HTML);
    }
    const body2 = wrapper.find(".custom-items-body");
    
    // Always rebuild from items to avoid stale/detached DOM
    const existing_rows = body2.find("[data-row='true']").length;
    console.log("[Load Items] Existing rows in custom table", existing_rows);
    body2.empty();
    console.log("[Load Items] Body cleared");

    const items = frm.doc.items || [];
    console.log("[Load Items] Items from doc", items.length);

    if (items.length) {
        items.forEach(it => {
            const discount_pct = it.custom_discount_percentage != null ? it.custom_discount_percentage : (it.discount_percentage != null ? it.discount_percentage : 0);
            const discount_amt = it.custom_discount != null ? it.custom_discount : (it.discount_amount != null ? it.discount_amount : 0);
            const discount2 = it.custom_discount2 != null ? it.custom_discount2 : (it.discount2 != null ? it.discount2 : 0);
            add_custom_row(frm, wrapper, {
                item_code: it.item_code || "",
                item_name: it.item_name || "",
                uom: it.uom || it.stock_uom || "",
                qty: it.qty || 0,
                price_list_rate: it.price_list_rate != null ? it.price_list_rate : (it.rate != null ? it.rate : 0),
                custom_discount_percentage: discount_pct,
                custom_discount: discount_amt,
                custom_discount2: discount2,
                amount: it.amount || 0,
                additional_notes: it.additional_notes || "",
                warehouse: it.warehouse || frm.doc.set_warehouse || ""
            });
        });
    }
    // حافظ على صف إدخال واحد فقط: لو لا يوجد صف بدون item_code في items، أضف صف فارغ
    const has_blank_item = (frm.doc.items || []).some(it => !it.item_code);
    if (!has_blank_item) {
        add_custom_row(frm, wrapper);
    }

    update_totals(wrapper);
    frm._custom_items_loading = false;
}

// Add Row
function add_custom_row(frm, wrapper, data = {}) {
    console.log("[Add Row] Called", { data, wrapper_exists: wrapper.length });
    const idx = wrapper.find(".custom-items-body [data-row='true']").length + 1;
    console.log("[Add Row] Current row count", idx);

    const row = $(`
        <div data-row="true" style="display:flex;align-items:center;border-bottom:1px solid #d1d8dd;padding:0 12px;min-height:38px;color:#6c7680;font-size:12px;transition:background-color 0.2s;" onmouseover="this.style.backgroundColor='#fafbfc';" onmouseout="this.style.backgroundColor='transparent';">
            <div style="padding:6px 0px;width:2%;text-align:center;height:38px;display:flex;align-items:center;justify-content:center;color:#36414c;" data-col="idx">${idx}</div>
            <div style="padding:6px 8px;width:10%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;" data-col="item_code"></div>
            <div style="padding:6px 8px;width:15%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;" data-col="item_name">
                <input type="text" class="item-name" placeholder="Item Name" readonly style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;background-color:transparent;" value="${data.item_name || ''}">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;" data-col="uom">
                <input type="text" class="uom" placeholder="UOM" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;background-color:transparent;" value="${data.uom || ''}">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="qty">
                <input type="number" class="qty" value="${data.qty || 1}" step="0.001" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:transparent;">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="price_list_rate">
                <input type="number" class="price_list_rate" value="${data.price_list_rate || 0}" step="0.01" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:transparent;">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount_percentage">
                <input type="number" class="custom_discount_percentage" value="${data.custom_discount_percentage || 0}" step="0.01" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:transparent;">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount">
                <input type="number" class="custom_discount" value="${data.custom_discount || 0}" step="0.01" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:transparent;">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="custom_discount2">
                <input type="number" class="custom_discount2" value="${data.custom_discount2 || 0}" step="0.01" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:transparent;">
            </div>
            <div style="padding:6px 8px;width:8%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;justify-content:flex-end;" data-col="amount">
                <input type="number" class="amount" readonly style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;text-align:right;background-color:#fafbfc;color:#36414c;">
            </div>
            <div style="padding:6px 8px;width:10%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;" data-col="additional_notes">
                <input type="text" class="additional_notes" placeholder="Notes" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;background-color:transparent;" value="${data.additional_notes || ''}">
            </div>
            <div style="padding:6px 8px;width:10%;border-right:1px solid #d1d8dd;height:38px;display:flex;align-items:center;" data-col="warehouse">
                <input type="text" class="warehouse" placeholder="Warehouse" style="width:100%;padding:4px 6px;height:28px;font-size:12px;box-sizing:border-box;border:1px solid #d1d8dd;border-radius:3px;background-color:transparent;" value="${data.warehouse || frm.doc.set_warehouse || ''}">
            </div>
            <div style="padding:6px 8px;width:5%;text-align:center;height:38px;display:flex;align-items:center;justify-content:center;" data-col="actions">
                <button type="button" class="remove-row" style="padding:2px 8px;background-color:#ff5858;color:white;border:1px solid #ff5858;border-radius:3px;cursor:pointer;font-size:12px;" onmouseover="this.style.backgroundColor='#e04848';this.style.borderColor='#e04848';" onmouseout="this.style.backgroundColor='#ff5858';this.style.borderColor='#ff5858';">✕</button>
            </div>
        </div>
    `);

    wrapper.find(".custom-items-body").append(row);
    console.log("[Add Row] Row appended to DOM", { row_exists: row.length, item_code: data.item_code });

    // Create item link control
    setup_item_link_control(frm, row, data.item_code);

    calculate_row(row);
    console.log("[Add Row] Row added successfully", { idx, item_code: data.item_code });
}

// Item Code Link control (search by code/name)
function setup_item_link_control(frm, row, default_item_code) {
    console.log("[Setup Item Control] Called", { default_item_code, row_exists: row.length });
    const parent = row.find('[data-col="item_code"]').empty()[0];
    console.log("[Setup Item Control] Parent element", { parent_exists: !!parent });

    // Flag to track if we're setting default value (to prevent triggering change event)
    let is_setting_default = false;

    const control = frappe.ui.form.make_control({
        parent: parent,
        df: {
            fieldtype: "Link",
            fieldname: "item_code",
            options: "Item",
            placeholder: "Item Code",
            change: function () {
                // Skip change event if we're setting default value or loading items
                if (is_setting_default || frm._custom_items_loading) {
                    console.log("[Item Control] Change event skipped - setting default or loading", { 
                        is_setting_default, 
                        loading: frm._custom_items_loading 
                    });
                    return;
                }

                const item_code = control.get_value();
                console.log("[Item Control] Change event", { item_code });
                if (!item_code) {
                    console.log("[Item Control] No item_code, clearing fields");
                    row.find(".item-name").val("");
                    row.find(".uom").val("");
                    // Don't sync automatically - only on save
                    return;
                }

                console.log("[Item Control] Fetching item details", { item_code });
                const warehouse = row.find(".warehouse").val() || frm.doc.set_warehouse || "";
                
                frappe.call({
                    method: "erpnext.stock.get_item_details.get_item_details",
                    args: {
                        doc: frm.doc,
                        args: {
                            item_code: item_code,
                            warehouse: warehouse,
                            customer: frm.doc.customer || "",
                            currency: frm.doc.currency || "",
                            conversion_rate: frm.doc.conversion_rate || 1,
                            price_list: frm.doc.selling_price_list || "",
                            price_list_currency: frm.doc.price_list_currency || "",
                            plc_conversion_rate: frm.doc.plc_conversion_rate || 1,
                            company: frm.doc.company || "",
                            doctype: frm.doc.doctype || "Sales Order",
                            name: frm.doc.name || "",
                            ignore_pricing_rule: frm.doc.ignore_pricing_rule || 0,
                            qty: parseFloat(row.find(".qty").val()) || 1
                        }
                    },
                    callback(r) {
                        console.log("[Item Control] Item details received", { item_code, item_data: r.message });
                        if (!r.message) {
                            console.log("[Item Control] No item data returned");
                            return;
                        }
                        
                        const item_data = r.message;
                        row.find(".item-name").val(item_data.item_name || "");
                        row.find(".uom").val(item_data.uom || item_data.stock_uom || "");
                        
                        // Set price_list_rate if not set
                        const current_rate = parseFloat(row.find(".price_list_rate").val()) || 0;
                        if (!current_rate && item_data.price_list_rate) {
                            row.find(".price_list_rate").val(item_data.price_list_rate);
                            console.log("[Item Control] Price list rate set", { rate: item_data.price_list_rate });
                        }
                        
                        console.log("[Item Control] Fields updated", { 
                            item_name: item_data.item_name, 
                            uom: item_data.uom || item_data.stock_uom,
                            price_list_rate: item_data.price_list_rate
                        });

                        calculate_row(row);
                        update_totals(frm.fields_dict.custom_items_table.$wrapper);
                        // Don't sync on item change - only on before_save to avoid infinite loop
                    }
                });
            }
        },
        only_input: false,
        render_input: true
    });

    row.data("item_control", control);

    // Apply inline styles
    setTimeout(() => {
        $(parent).find(".link-field").css({ width: "100%", margin: 0 });
        $(parent).find("input").css({ 
            height: "28px", 
            padding: "4px 6px", 
            fontSize: "12px",
            border: "1px solid #d1d8dd",
            borderRadius: "3px",
            boxSizing: "border-box",
            backgroundColor: "transparent"
        });
    }, 50);

    // Set value from existing item and fetch item details
    if (default_item_code) {
        console.log("[Setup Item Control] Setting default item_code", { default_item_code });
        is_setting_default = true;
        setTimeout(() => {
            control.set_value(default_item_code);
            console.log("[Setup Item Control] Value set, fetching details...");
            // Fetch item details immediately
            setTimeout(() => {
                const item_code = control.get_value();
                console.log("[Setup Item Control] Control value after set", { item_code });
                if (item_code) {
                    console.log("[Setup Item Control] Fetching item details for", item_code);
                    const warehouse = row.find(".warehouse").val() || frm.doc.set_warehouse || "";
                    
                    frappe.call({
                        method: "erpnext.stock.get_item_details.get_item_details",
                        args: {
                            doc: frm.doc,
                            args: {
                                item_code: item_code,
                                warehouse: warehouse,
                                customer: frm.doc.customer || "",
                                currency: frm.doc.currency || "",
                                conversion_rate: frm.doc.conversion_rate || 1,
                                price_list: frm.doc.selling_price_list || "",
                                price_list_currency: frm.doc.price_list_currency || "",
                                plc_conversion_rate: frm.doc.plc_conversion_rate || 1,
                                company: frm.doc.company || "",
                                doctype: frm.doc.doctype || "Sales Order",
                                name: frm.doc.name || "",
                                ignore_pricing_rule: frm.doc.ignore_pricing_rule || 0,
                                qty: parseFloat(row.find(".qty").val()) || 1
                            }
                        },
                        callback(r) {
                            console.log("[Setup Item Control] Item details fetched", { item_code, item_data: r.message });
                            if (r.message) {
                                const item_data = r.message;
                                row.find(".item-name").val(item_data.item_name || "");
                                row.find(".uom").val(item_data.uom || item_data.stock_uom || "");
                                console.log("[Setup Item Control] Fields populated", { 
                                    item_name: item_data.item_name, 
                                    uom: item_data.uom || item_data.stock_uom
                                });
                                
                                // Set price_list_rate if not set
                                const current_rate = parseFloat(row.find(".price_list_rate").val()) || 0;
                                if (!current_rate && item_data.price_list_rate) {
                                    row.find(".price_list_rate").val(item_data.price_list_rate);
                                    console.log("[Setup Item Control] Price list rate set", { rate: item_data.price_list_rate });
                                }
                                
                                calculate_row(row);
                                update_totals(frm.fields_dict.custom_items_table.$wrapper);
                                // Don't sync automatically - only on save
                            } else {
                                console.log("[Setup Item Control] No item data returned");
                            }
                            // Reset flag after details are fetched
                            is_setting_default = false;
                        }
                    });
                } else {
                    console.log("[Setup Item Control] No item_code in control");
                    is_setting_default = false;
                }
            }, 200);
        }, 100);
    } else {
        console.log("[Setup Item Control] No default_item_code provided");
    }
}

// Row calculations & totals
function calculate_row(row) {
    const qty = parseFloat(row.find(".qty").val()) || 0;
    const rate = parseFloat(row.find(".price_list_rate").val()) || 0;
    const discount_percent = parseFloat(row.find(".custom_discount_percentage").val()) || 0;
    const discount = parseFloat(row.find(".custom_discount").val()) || 0;
    const discount2 = parseFloat(row.find(".custom_discount2").val()) || 0;
    
    let amount = qty * rate;
    
    // Apply discounts
    if (discount_percent > 0) {
        amount = amount * (1 - discount_percent / 100);
    }
    amount = amount - discount - discount2;
    
    row.find(".amount").val(Math.max(0, amount).toFixed(2));
}

function update_totals(wrapper) {
    let totalQty = 0;
    let totalAmount = 0;

    wrapper.find(".custom-items-body [data-row='true']").each(function () {
        totalQty += parseFloat($(this).find(".qty").val()) || 0;
        totalAmount += parseFloat($(this).find(".amount").val()) || 0;
    });

    wrapper.find(".total-qty").text(totalQty.toFixed(2));
    wrapper.find(".total-amount").text(totalAmount.toFixed(2));
}

function refresh_row_numbers(wrapper) {
    wrapper.find(".custom-items-body [data-row='true']").each(function (i) {
        $(this).find('[data-col="idx"]').text(i + 1);
    });
}

// Sync HTML → child table items
function sync_custom_items_to_child_table(frm, skip_refresh = false) {
    // Prevent infinite loop - if we're already syncing, skip
    if (frm._custom_items_syncing) {
        console.log("[Sync] Already syncing, skipping to avoid infinite loop");
        return;
    }
    frm._custom_items_syncing = true;
    
    console.log("[Sync] Starting sync to child table", { skip_refresh });
    const wrapper = frm.fields_dict.custom_items_table.$wrapper;
    if (!wrapper || !wrapper.length) {
        console.log("[Sync] No wrapper found");
        frm._custom_items_syncing = false;
        return;
    }
    
    const body = wrapper.find(".custom-items-body");
    console.log("[Sync] Body element", { body_exists: body.length });
    
    const rows = body.find("[data-row='true']");
    const rows_count = rows.length;
    console.log("[Sync] Rows in custom table", rows_count);

    // إذا لم يكن هناك صفوف، نفرّغ الجدول الأصلي فقط
    if (rows_count === 0) {
        console.log("[Sync] No rows in custom table → clearing child table");
        frappe.model.clear_table(frm.doc, "items");
        console.log("[Sync] Child table cleared");
        // Reset syncing flag
        frm._custom_items_syncing = false;
        // لا نحدث refresh_field هنا لأن هذا قد يسبب استدعاء validate/before_save تلقائياً
        // التحديث سيحدث فقط عند الحفظ في before_save
        return;
    }

    // لا تفرّغ الجدول الأصلي إذا لم يوجد أي صف بصنف محدد
    let has_any_item = false;
    rows.each(function() {
        const rr = $(this);
        let code = null;
        const ctl = rr.data("item_control");
        if (ctl && typeof ctl.get_value === "function") {
            try { code = ctl.get_value(); } catch(e) {}
        }
        if (!code || code === "") {
            const inp = rr.find('[data-col="item_code"] input');
            if (inp.length) code = inp.val();
        }
        if (code && code.trim() !== "") { has_any_item = true; }
    });
    if (!has_any_item) {
        console.log("[Sync] No item_code present in any row → clearing child table");
        frappe.model.clear_table(frm.doc, "items");
        console.log("[Sync] Child table cleared");
        // Reset syncing flag
        frm._custom_items_syncing = false;
        // لا نحدث refresh_field هنا لأن هذا قد يسبب استدعاء validate/before_save تلقائياً
        // التحديث سيحدث فقط عند الحفظ في before_save
        return;
    }

    frappe.model.clear_table(frm.doc, "items");
    console.log("[Sync] Child table cleared");

    let synced_count = 0;
    rows.each(function (index) {
        const row = $(this);
        console.log("[Sync] Processing row", index + 1, { row_element: row.length });
        
        const control = row.data("item_control");
        console.log("[Sync] Row control", { has_control: !!control, control_type: control ? typeof control : 'none' });
        
        if (!control) {
            console.log("[Sync] Row skipped - no control");
            return;
        }

        // Try to get value multiple ways
        let item_code = null;
        try {
            item_code = control.get_value();
            console.log("[Sync] Control get_value()", { item_code, method: 'get_value' });
        } catch(e) {
            console.log("[Sync] Error getting value with get_value()", e);
        }
        
        // If get_value() doesn't work, try getting from input directly
        if (!item_code || item_code === "") {
            const input = row.find('[data-col="item_code"] input');
            if (input.length) {
                item_code = input.val();
                console.log("[Sync] Got value from input", { item_code, method: 'input.val()' });
            }
        }
        
        console.log("[Sync] Final item_code", { item_code, item_code_type: typeof item_code, item_code_length: item_code ? item_code.length : 0 });
        
        if (!item_code || item_code.trim() === "") {
            console.log("[Sync] Row skipped - no item_code or empty", { item_code });
            return;
        }

        const child = frm.add_child("items");
        child.item_code = item_code;
        child.item_name = row.find(".item-name").val();
        child.uom = row.find(".uom").val();
        child.qty = parseFloat(row.find(".qty").val()) || 0;
        child.price_list_rate = parseFloat(row.find(".price_list_rate").val()) || 0;
        child.rate = child.price_list_rate;

        const discount_pct_val = parseFloat(row.find(".custom_discount_percentage").val()) || 0;
        const discount_amt_val = parseFloat(row.find(".custom_discount").val()) || 0;
        const discount2_amt_val = parseFloat(row.find(".custom_discount2").val()) || 0;

        const meta = frappe.get_meta("Sales Order Item");
        const has = (fn) => !!(meta && meta.fields && meta.fields.some(f => f.fieldname === fn));

        if (has("custom_discount_percentage")) {
            child.custom_discount_percentage = discount_pct_val;
        } else if (has("discount_percentage")) {
            child.discount_percentage = discount_pct_val;
        }

        if (has("custom_discount")) {
            child.custom_discount = discount_amt_val;
        } else if (has("discount_amount")) {
            child.discount_amount = discount_amt_val;
        }

        if (has("custom_discount2")) {
            child.custom_discount2 = discount2_amt_val;
        }

        child.amount = parseFloat(row.find(".amount").val()) || 0;
        child.additional_notes = row.find(".additional_notes").val() || "";
        child.warehouse = row.find(".warehouse").val() || frm.doc.set_warehouse || "";
        child.delivery_date = frm.doc.delivery_date || frm.doc.transaction_date || frappe.datetime.nowdate();
        
        console.log("[Sync] Child row added", { 
            item_code, 
            qty: child.qty, 
            warehouse: child.warehouse 
        });
        synced_count++;
    });
    
    console.log("[Sync] Total rows synced", synced_count);

    // فقط عند الحفظ (before_save) نحدث refresh_field
    // لا نحدث refresh_field هنا لتجنب استدعاء validate/before_save تلقائياً
    if (!skip_refresh && synced_count > 0) {
        // فقط نحدث calculate_taxes_and_totals بدون refresh_field
        // refresh_field سيحدث تلقائياً عند الحفظ من Frappe
        if (frm.doc.docstatus === 0 && frm.script_manager) {
            // استخدم setTimeout لتأخير الاستدعاء وتجنب الحلقات
            setTimeout(() => {
                try {
                    frm.trigger("calculate_taxes_and_totals");
                } catch(e) {
                    console.log("[Sync] Error triggering calculate_taxes_and_totals", e);
                }
            }, 100);
        }
    }
    
    // Reset syncing flag
    frm._custom_items_syncing = false;
}

// Multi Add dialog
function open_multi_add_dialog(frm, wrapper) {
    console.log("[Multi Add] Opening dialog", { frm: frm.doc.name, wrapper: wrapper.length });
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
            console.log("[Multi Add] Add Selected clicked", { values, warehouse: values.warehouse });
            const $tbody = $(d.get_field("results").$wrapper).find("tbody");
            let added_count = 0;
            
            const rows_to_add = [];
            $tbody.find("tr[data-item-code]").each(function () {
                const $r = $(this);
                const qty = parseFloat($r.find(".multi-qty").val()) || 0;
                const item_code = $r.attr("data-item-code");
                console.log("[Multi Add] Checking row", { item_code, qty });
                
                if (!qty || qty <= 0) {
                    console.log("[Multi Add] Skipping row - qty is 0 or invalid", { item_code, qty });
                    return;
                }

                if (!item_code) {
                    console.log("[Multi Add] Skipping row - no item_code", { item_code });
                    return;
                }

                rows_to_add.push({ item_code, qty, warehouse: values.warehouse || "" });
            });

            console.log("[Multi Add] Rows to add", rows_to_add);

            rows_to_add.forEach((row_data) => {
                console.log("[Multi Add] Adding row", row_data);
                // Add row with item_code, qty, and warehouse
                // Item details will be fetched automatically in setup_item_link_control
                add_custom_row(frm, wrapper, row_data);
                added_count++;
            });

            console.log("[Multi Add] Total rows added", added_count);

            if (added_count > 0) {
                update_totals(wrapper);
                // Don't sync automatically - only on save
                console.log("[Multi Add] Rows added, will sync on save");
            }

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
        search_items_with_stock(txt, wh, $tbody);
    };

    d.show();
}

// Search items + stock
function search_items_with_stock(txt, warehouse, $tbody) {
    console.log("[Search Items] Starting search", { txt, warehouse });
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
            console.log("[Search Items] Search results", { count: results.length, results });
            if (!results.length) {
                console.log("[Search Items] No items found");
                $tbody.append('<tr><td colspan="4" style="padding:8px;text-align:center;color:#999;">No Items Found</td></tr>');
                return;
            }

            const item_codes = results.map(x => x.value);
            console.log("[Search Items] Item codes to check stock", item_codes);

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

// Columns gear dialog
function open_columns_dialog(wrapper) {
    const fields = CUSTOM_ITEMS_COLUMNS.map(col => ({
        fieldname: col.fieldname,
        label: col.label,
        fieldtype: "Check",
        default: is_column_visible(wrapper, col.fieldname) ? 1 : 0,
        read_only: col.required ? 1 : 0
    }));

    const d = new frappe.ui.Dialog({
        title: __("Select Item Fields"),
        fields: fields,
        primary_action_label: __("Apply"),
        primary_action(values) {
            CUSTOM_ITEMS_COLUMNS.forEach(col => {
                const show = col.required ? true : !!values[col.fieldname];
                toggle_column(wrapper, col.fieldname, show);
            });
            d.hide();
        }
    });

    d.show();
}

function toggle_column(wrapper, fieldname, show) {
    wrapper.find('[data-col="' + fieldname + '"]').css("display", show ? "" : "none");
}

function is_column_visible(wrapper, fieldname) {
    const el = wrapper.find('[data-col="' + fieldname + '"]').first();
    if (!el.length) return false;
    return el.is(":visible") && el.css("display") !== "none";
}
// تم إزالة أحداث Sales Order Item
// الجدول المخصص هو المصدر الوحيد، والجدول الأصلي يتم تحديثه فقط عند الحفظ

