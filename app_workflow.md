# Workflow

## Discount Approval Workflow

```
Sales Order (before_save)
    ↓
Check items with custom_discount2 > 0 and not approved
    ↓
Find Sales Managers with Branch permission
    ↓
Create Notification Log for each manager
    ↓
Managers receive notification
    ↓
Manager approves discount (custom_discount2_approved = true)
```

## Discount Validation Workflow

```
User enters discount percentage
    ↓
Get Sales Person from Sales Order
    ↓
Get Employee from Sales Person
    ↓
Get discount limit from Employee
    ↓
Compare with Item Price discount limit
    ↓
Calculate allowed_limit = max(item_limit, employee_limit)
    ↓
Validate entered discount <= allowed_limit
    ↓
Show error if exceeded
```
