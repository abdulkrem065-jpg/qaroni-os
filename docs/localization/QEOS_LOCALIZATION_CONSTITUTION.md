# QEOS Localization Constitution

## Authorization: QEOS-AUTH-0086A

## Core Principles
1. **No Hardcoded Text:** All user-facing strings must originate from localized resources.
2. **Language Independence:** The platform architecture must not assume any specific language at compile time or runtime.
3. **Arabic First, English Secondary:** Primary implementation supports Arabic (RTL) natively and defaults to it, with English (LTR) as a fully supported secondary language.
4. **Infinite Extensibility:** Adding a new language requires zero code modifications—only adding a new JSON resource directory.
5. **Contextual Translation:** Translations are scoped by domain (e.g., `dashboard`, `inventory`) to avoid collision and reduce loading payload size.

## Rules of Engagement
- **Components:** Never use inline string literals for UI. Use the `<LocalizedText>` component or `useTranslation` hook.
- **Formatting:** Dates, currencies, and numbers must be formatted via the Localization Engine to respect the active locale.
- **AI Integration:** The AI Command Center must strictly adhere to the current application language for all prompts and responses.
