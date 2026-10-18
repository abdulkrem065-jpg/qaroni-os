# QEOS Translation Guide

## Authorization: QEOS-AUTH-0086A

## File Structure
Translations are JSON files organized by namespace.
Example: `src/localization/languages/ar/common.json`

## Namespaces
- `common`: Global terms (Save, Cancel, Yes, No).
- `dashboard`: Dashboard widgets and executive summaries.
- `inventory`: Product and stock management terms.
- `sales`: POS and sales order terms.
- `accounting`: Financial and accounting terms.

## Format
- **Keys:** `snake_case` (e.g., `welcome_message`, `total_sales`).
- **Interpolation:** Use double curly braces `{{var}}` for dynamic values.
  - Example: `"welcome": "مرحباً {{name}}"`
- **Pluralization:** Use standard suffixes `_zero`, `_one`, `_two`, `_few`, `_many`, `_other`.

## Adding a New Language
1. Create a new folder in `src/localization/languages/` (e.g., `fr/`).
2. Copy the JSON files from `ar/` or `en/` and translate the values.
3. Update the available languages list in the `LocalizationProvider`.
