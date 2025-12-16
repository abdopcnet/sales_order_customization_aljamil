// =======================
// ✅ Sales Order - Real-time auto update + faster save
// =======================
const POLL_INTERVAL_MS = 1000;   // ⏱ Poll frequency (1 second only)
const AUTO_SAVE = true;          // Enable auto save
const SAVE_DEBOUNCE_MS = 200;    // Wait time before save (fraction of a second only)

frappe.ui.form.on('Sales Order', {
    onload(frm) {
        frm.__avail = frm.__avail || {};
        frm.__avail.last_percentage = null;
        frm.__avail.saving = false;
        frm.__avail.save_timer = null;

        if (frm.doc.docstatus === 0) {
            start_availability_poll(frm);
        }
    },

    refresh(frm) {
        frappe.after_ajax(() => {
            if (frm.doc.docstatus === 0) {
                compute_and_apply_availability(frm);
            } else {
                stop_availability_poll(frm);
            }
        });
    },

    items_on_form_render(frm, cdt, cdn) {
        setTimeout(() => {
            if (frm.doc.docstatus === 0) {
                compute_and_apply_availability(frm);
            }
        }, 200);
    },

    before_unload(frm) {
        stop_availability_poll(frm);
    },

    // Safe direct update when field changes
    custom_items_available: function(frm) {
        // Save not allowed after Submit
        if (frm.doc.docstatus !== 0) return;

        frm.set_value('custom_items_available', frm.doc.custom_items_available);

        if (AUTO_SAVE) {
            if (frm.__avail.save_timer) clearTimeout(frm.__avail.save_timer);
            frm.__avail.save_timer = setTimeout(() => {
                if (!frm.doc.__islocal && frm.doc.docstatus === 0 && !frm.__avail.saving) {
                    frm.__avail.saving = true;
                    try {
                        let p = frm.save();
                        if (p && p.then) {
                            p.then(() => { frm.__avail.saving = false; })
                             .catch(() => { frm.__avail.saving = false; fallback_db_update(frm); });
                        } else {
                            setTimeout(() => { frm.__avail.saving = false; }, 500);
                        }
                    } catch (e) {
                        frm.__avail.saving = false;
                        fallback_db_update(frm);
                    }
                }
            }, SAVE_DEBOUNCE_MS);
        }
    }
});

// ======= Polling =======
function start_availability_poll(frm) {
    stop_availability_poll(frm);
    if (frm.doc.docstatus !== 0) return;
    compute_and_apply_availability(frm);
    frm.__avail.interval = setInterval(() => {
        if (frm.doc.docstatus === 0) {
            compute_and_apply_availability(frm);
        } else {
            stop_availability_poll(frm);
        }
    }, POLL_INTERVAL_MS);
}

function stop_availability_poll(frm) {
    if (frm.__avail) {
        if (frm.__avail.interval) clearInterval(frm.__avail.interval);
        if (frm.__avail.save_timer) clearTimeout(frm.__avail.save_timer);
    }
}

// ======= Compute availability =======
function compute_and_apply_availability(frm) {
    try {
        if (!frm.doc.items || frm.doc.items.length === 0) {
            apply_percentage_ui_and_field(frm, 0);
            return;
        }

        let valid_items = frm.doc.items.filter(i => i.item_code && i.warehouse);
        if (valid_items.length === 0) {
            apply_percentage_ui_and_field(frm, 0);
            return;
        }

        let item_codes = [...new Set(valid_items.map(i => i.item_code))];
        let warehouses = [...new Set(valid_items.map(i => i.warehouse))];

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Bin",
                filters: [
                    ["item_code", "in", item_codes],
                    ["warehouse", "in", warehouses]
                ],
                fields: ["item_code", "warehouse", "actual_qty", "reserved_qty"],
                limit_page_length: 1000
            },
            callback: function(r) {
                let rows = r.message || [];
                let qty_map = {};

                rows.forEach(b => {
                    let key = b.item_code + '||' + b.warehouse;
                    let actual = parseFloat(b.actual_qty || 0);
                    let reserved = parseFloat(b.reserved_qty || 0);
                    let available = actual - reserved;
                    qty_map[key] = (qty_map[key] || 0) + available;
                });

                let required_map = {};
                valid_items.forEach(item => {
                    required_map[item.item_code] = (required_map[item.item_code] || 0) + parseFloat(item.qty || 0);
                });

                let available_count = 0;
                item_codes.forEach(code => {
                    let total_available = Object.keys(qty_map)
                        .filter(k => k.startsWith(code + '||'))
                        .reduce((sum, k) => sum + qty_map[k], 0);

                    let total_required = required_map[code] || 0;
                    if (total_available >= total_required) available_count++;
                });

                let total = item_codes.length;
                let percentage = total ? Math.round((available_count / total) * 100) : 0;
                apply_percentage_ui_and_field(frm, percentage);
            }
        });
    } catch (e) {
        console.error('compute_and_apply_availability error', e);
    }
}

// ======= Apply UI + field =======
function apply_percentage_ui_and_field(frm, percentage) {
    frm.page.indicator.find('.availability-text').remove();

    if (percentage === 100) {
        let availability_tag = $('<span>').addClass('availability-text').css({
            'color': 'green',
            'font-weight': 'bold',
            'margin-left': '10px',
            'font-size': '1rem',
            'vertical-align': 'middle'
        }).text('.          .البنود متوفره');
        frm.page.indicator.append(availability_tag);
    }

    let $field = frm.fields_dict['custom_items_available'];
    if ($field) {
        let colorBg = 'red';
        if (percentage > 70) colorBg = 'green';
        else if (percentage > 30) colorBg = 'orange';

        $($field.wrapper).find('input').css({
            'background-color': colorBg,
            'color': '#fff',
            'font-weight': 'bold'
        });
    }

    // ❌ Do not update value after Submit
    if (frm.doc.docstatus !== 0) return;

    let current_val = parseInt(frm.doc.custom_items_available || 0);
    if (current_val === percentage) return;

    try {
        frm.set_value('custom_items_available', percentage);
    } catch (e) {
        frm.doc.custom_items_available = percentage;
        frm.refresh_field && frm.refresh_field('custom_items_available');
    }
}

// ======= Fallback DB update =======
function fallback_db_update(frm) {
    if (frm.doc.docstatus !== 0) return; // ❌ Do not save after Submit
    frappe.call({
        method: 'frappe.client.set_value',
        args: {
            doctype: frm.doc.doctype,
            name: frm.doc.name,
            fieldname: 'custom_items_available',
            value: frm.doc.custom_items_available
        },
        callback: function(r) {
            if (!r.exc) {
                frm.doc.custom_items_available = frm.doc.custom_items_available;
                frm.refresh_field && frm.refresh_field('custom_items_available');
            }
        }
    });
}

