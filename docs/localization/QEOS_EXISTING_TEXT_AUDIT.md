# QEOS Existing Text Audit

## Authorization: QEOS-AUTH-0086A

## Findings
The current prototype (Legacy UI) is heavily hardcoded in Arabic.

### 1. Hardcoded UI Strings
- **Header:** "بحث...", "مدير النظام", "الفرع الرئيسي"
- **Sidebar:** "الرئيسية", "المبيعات", "المخزون", "تسجيل الخروج"
- **Dashboard:** "لوحة القيادة التنفيذية", "مرحباً بك، هذا هو التصميم الأساسي الجديد للنظام"

### 2. Hardcoded Formatting
- Currencies and dates are concatenated manually rather than using `Intl.NumberFormat` or `Intl.DateTimeFormat`.
  - Example: `<span>{price} دينار</span>`

### 3. Mixed Concerns
- API error messages are hardcoded in the frontend or passed directly from the backend without translation keys.

## Conclusion
A full migration is necessary to replace all string literals with translation keys across the legacy application and the new Executive Shell.
