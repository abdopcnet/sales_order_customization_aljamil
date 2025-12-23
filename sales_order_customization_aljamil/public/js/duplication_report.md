# تقرير التكرارات في sales_order.js

## ✅ التكرارات الموجودة

### 1. دالة `update_discount` مكررة (مشكلة حقيقية)

**الموقع الأول:** السطر 779 (من File 8: discount.js)

```javascript
function update_discount(frm, cdt, cdn) {
	// Calculate discount percentage from price
	let base_discount = 0;
	if (row.price_list_rate && row.custom_discount_percentage) {
		base_discount = (row.price_list_rate * row.custom_discount_percentage) / 100;
	}
	// Sum discounts only and write result
	let total_discount = (row.custom_discount || 0) + (row.custom_discount2 || 0) + base_discount;
	frappe.model.set_value(cdt, cdn, 'discount_amount', total_discount);
}
```

**الموقع الثاني:** السطر 4929 (من File 32: tolal_items_discount.js)

```javascript
function update_discount(frm, cdt, cdn) {
	// First discount (custom_discount ÷ qty)
	let val1 = 0;
	if (row.custom_discount && row.qty) {
		val1 = flt(row.custom_discount) / flt(row.qty);
	}
	// Second discount (price_list_rate * percentage / 100)
	let val2 = 0;
	if (row.price_list_rate && row.custom_discount_percentage) {
		val2 = (flt(row.price_list_rate) * flt(row.custom_discount_percentage)) / 100;
	}
	// Third discount (custom_discount2 ÷ qty)
	let val3 = 0;
	if (row.custom_discount2 && row.qty) {
		val3 = flt(row.custom_discount2) / flt(row.qty);
	}
	// Sum of all three discounts
	let total_discount = val1 + val2 + val3;
	frappe.model.set_value(cdt, cdn, 'discount_amount', total_discount);
}
```

**المشكلة:** الدالة الثانية ستحل محل الأولى، مما قد يسبب مشاكل في الحسابات.

**الحل المقترح:**

-   إعادة تسمية إحدى الدالتين (مثلاً `update_discount_simple` و `update_discount_detailed`)
-   أو دمج الدالتين في دالة واحدة شاملة

---

### 2. أحداث `refresh` متعددة (طبيعي في Frappe)

**عدد الأحداث:** 7 أحداث `refresh` مختلفة

هذا **طبيعي** في Frappe Framework - يمكن أن يكون لديك عدة event handlers لنفس الحدث، وسيتم تنفيذها جميعاً بالترتيب.

**الأحداث الموجودة:**

-   السطر 527: File 3 (available_percentage.js)
-   السطر 1193: File 8 (discount.js)
-   السطر 1300: File 8 (discount.js) - داخل handler آخر
-   السطر 2928: File 15 (order_type.js)
-   السطر 2948: File 16 (outstanding.js)
-   السطر 4231: File 29 (sms2.js)
-   السطر 4998: File 31 (stock_table_so.js)

---

### 3. أحداث `validate` متعددة (طبيعي في Frappe)

**عدد الأحداث:** 6 أحداث `validate` مختلفة

هذا أيضاً **طبيعي** في Frappe Framework.

**الأحداث الموجودة:**

-   السطر 5: File 1 (add_row.js)
-   السطر 39: File 2 (approval_amount_limit.js)
-   السطر 3582: File 24 (sales_order_3.js)
-   السطر 3828: File 26 (sales_order_script.js)
-   السطر 4904: File 32 (tolal_items_discount.js)
-   السطر 5057: File 35 (total_price_list_rate.js)

---

### 4. أحداث `onload` متعددة (طبيعي في Frappe)

**عدد الأحداث:** 13 حدث `onload` مختلف

هذا أيضاً **طبيعي** في Frappe Framework.

---

## 📊 الملخص

### تكرارات حقيقية (تم إصلاحها):

1. ✅ **دالة `update_discount` مكررة** - تم إصلاحها
    - تم إعادة تسمية الدالة الأولى إلى `update_discount_simple` (السطر 780)
    - تم إعادة تسمية الدالة الثانية إلى `update_discount_detailed` (السطر 4853)
    - تم تحديث جميع الاستدعاءات

### تكرارات طبيعية (لا تحتاج إصلاح):

-   ✅ أحداث `refresh` متعددة - طبيعي
-   ✅ أحداث `validate` متعددة - طبيعي
-   ✅ أحداث `onload` متعددة - طبيعي

---

## 🔧 التوصيات

1. ✅ **إصلاح دالة `update_discount` المكررة:** - تم الإصلاح

    - تم إعادة تسمية الدالة الأولى إلى `update_discount_simple` (من discount.js)
    - تم إعادة تسمية الدالة الثانية إلى `update_discount_detailed` (من tolal_items_discount.js)
    - تم تحديث جميع الاستدعاءات

2. ✅ **التحقق من نسبة الخصم قبل الحفظ:** - تم الإضافة
    - تم إضافة `before_save` للتحقق من نسبة الخصم قبل الحفظ
    - الرسالة: "عفوا إجمالي نسبة الخصم المسموحه هي {\*}%"
    - يمنع الحفظ إذا تجاوزت نسبة الخصم المسموح

---

**تاريخ التقرير:** تم إنشاؤه بعد دمج جميع الملفات
**تاريخ الإصلاح:** تم إصلاح جميع المشاكل
