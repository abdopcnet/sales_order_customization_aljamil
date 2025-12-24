# API Structure

## Server Methods

### sales_order.py

-   **Module**: `sales_order_customization_aljamil.sales_order`
-   **Function**: `send_discount_approval_notifications(doc, method=None)`
-   **Event**: `before_save` on Sales Order (via doc_events in hooks.py)
-   **Purpose**: Send approval notifications for custom_discount2
-   **Logic**:
    -   Find all users with "Sales Manager" role
    -   For each item with `custom_discount2 > 0` and `custom_discount2_approved = false`
    -   Send Notification Log to Sales Managers with Branch permission
    -   Prevent duplicate notifications

## Client Scripts

### sales_order.js

-   **DocType**: Sales Order
-   **Location**: `public/js/sales_order.js`
-   **Features**:
    -   Discount validation based on Employee/Sales Person limits
    -   Real-time discount percentage calculation
    -   Custom discount field handling

### sales_invoice.js

-   **DocType**: Sales Invoice
-   **Location**: `public/js/sales_invoice.js`
