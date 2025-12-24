# File Structure

```
sales_order_customization_aljamil/
├── sales_order_customization_aljamil/
│   ├── __init__.py
│   ├── hooks.py                    # App hooks configuration (doc_events)
│   ├── sales_order.py             # Server methods for Sales Order (Frappe ORM)
│   ├── modules.txt
│   ├── patches.txt
│   ├── config/
│   ├── public/
│   │   └── js/
│   │       ├── sales_order.js      # Sales Order client script
│   │       └── sales_invoice.js     # Sales Invoice client script
│   ├── templates/
│   └── www/
├── README.md
├── app_api_tree.md
├── app_file_structure.md
├── app_workflow.md
└── app_plan.md
```

## Key Files

-   **sales_order.py**: Server methods for discount approval workflow (Frappe ORM)
-   **hooks.py**: App configuration and doc_events hooks
-   **sales_order.js**: Main client script for Sales Order customizations
-   **sales_invoice.js**: Client script for Sales Invoice customizations
