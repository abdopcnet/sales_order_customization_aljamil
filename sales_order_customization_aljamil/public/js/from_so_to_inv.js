frappe.ui.form.on('Sales Order', {
    refresh(frm) {
        if (frm.doc.docstatus === 1) {
            const watch = setInterval(() => {
                const route = frappe.get_route();

                if (route[0] === "Form" && route[1] === "Sales Invoice") {
                    clearInterval(watch);

                    frappe.model.set_value("Sales Invoice", route[2], "custom_order_type", frm.doc.order_type);
                }
            }, 200);
        }
    }
});

