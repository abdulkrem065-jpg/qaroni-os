# QEOS Language Migration Plan

## Authorization: QEOS-AUTH-0086A

## Phase 1: Foundation (Current)
- Implement `LocalizationProvider` and Translation Engine.
- Create base JSON dictionaries (`ar`, `en`).
- Build reusable localized components (`LocalizedText`, `LocalizedCurrency`, etc.).

## Phase 2: Executive Shell Migration
- Refactor the newly created Executive Shell (`Sidebar`, `Header`, `ShellPreview`) to consume the `useTranslation` hook.
- Move "بحث...", "الرئيسية", etc. to `common.json`.

## Phase 3: Legacy UI Deprecation / Domain Migration
- As legacy prototype components are rewritten into the new modular architecture, they will be built strictly using the Localization Engine.
- Existing hardcoded text will not be retrofitted; instead, the new domain implementations will enforce the No Hardcoded Text rule from inception.
