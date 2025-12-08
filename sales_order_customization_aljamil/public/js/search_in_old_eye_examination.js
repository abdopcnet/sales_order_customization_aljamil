frappe.ui.form.on('Sales Order', {
    custom_date: function(frm) {
        if (frm.doc.custom_date && frm.doc.customer) {
            frm.clear_table("custom_size");

            frappe.model.with_doc("Customer", frm.doc.customer, function() {
                let customer_doc = frappe.get_doc("Customer", frm.doc.customer);

                if (customer_doc && customer_doc.custom_size_t) {
                    let found = false;
                    customer_doc.custom_size_t.forEach(row => {
                        if (row.date == frm.doc.custom_date) {
                            found = true;
                            let child = frm.add_child("custom_size");
                            child.date = row.date;
                            child.sphr = row.sphr;
                            child.cylr = row.cylr;
                            child.axisr = row.axisr;
                            child.addr = row.addr;
                            child.pdr = row.pdr;
                            child.sphl = row.sphl;
                            child.cyll = row.cyll;
                            child.axisl = row.axisl;
                            child.addl = row.addl;
                            child.pdl = row.pdl;
                        }
                    });

                    frm.refresh_field("custom_size");

                    if (found) {
                        // جدول للقراءة فقط
                        frm.fields_dict["custom_size"].grid.df.cannot_add_rows = true;
                        frm.fields_dict["custom_size"].grid.df.cannot_delete_rows = true;
                        frm.fields_dict["custom_size"].grid.df.read_only = true;
                        frm.fields_dict["custom_size"].grid.refresh();
                    }
                }
            });
        } else {
            // عند حذف التاريخ، تفريغ الجدول وجعله قابل للتعديل مع تحديث فوري
            frm.clear_table("custom_size");
            frm.refresh_field("custom_size");

            frm.fields_dict["custom_size"].grid.df.cannot_add_rows = false;
            frm.fields_dict["custom_size"].grid.df.cannot_delete_rows = false;
            frm.fields_dict["custom_size"].grid.df.read_only = false;

            setTimeout(() => {
                frm.fields_dict["custom_size"].grid.refresh();
                frm.dirty();
                frm.refresh();
            }, 100);
        }
    }
});

