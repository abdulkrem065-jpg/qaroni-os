# QEOS i18n Architecture

## Authorization: QEOS-AUTH-0086A

## Structure
- `src/localization/languages/`: Contains language-specific folders (e.g., `ar/`, `en/`).
- `src/localization/languages/[lang]/[namespace].json`: Translation files split by domain context.
- `src/localization/language-engine/`: Core logic for resolving keys, handling pluralization, interpolation, and missing translations.
- `src/localization/providers/`: React Context providers holding the current language state and exposing translation functions.
- `src/localization/components/`: Reusable React components for declarative translation and formatting.

## State Management
- The active language is managed by `LocalizationProvider`.
- It integrates deeply with the HTML document, updating `dir` (RTL/LTR) and `lang` attributes instantly upon change, without requiring a page reload.

## Fallback Strategy
- If a translation key is missing in the current language, the engine will:
  1. Emit a warning in the console (development only).
  2. Fallback to the primary language (Arabic).
  3. If still missing, render the raw translation key as a visual indicator (e.g., `[dashboard:welcome_msg]`).
