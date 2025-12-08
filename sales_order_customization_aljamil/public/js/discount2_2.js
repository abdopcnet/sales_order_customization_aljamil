frappe.ui.form.on('Sales Order', {
    before_submit(frm) {
        let errors = [];

        frm.doc.items.forEach(row => {
            if ((row.custom_discount_code || "") !== (row.custom__discount_code_approved || "")) {
                errors.push(`🚫 الصف ${row.idx}: كود الخصم غير موجود.`);
            }
        });

        if (errors.length > 0) {
            frappe.throw({
                title: "اكتب كود الخصم",
                message: errors.join("<br>"),
            });
        }
    }
});

