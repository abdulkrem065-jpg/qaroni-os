# QEOS Theme Engine

## Authorization: QEOS-AUTH-0087

## Design Tokens
The QEOS Theme Engine is built on top of Tailwind CSS. It defines semantic color variables and spacing scales that adapt to Light and Dark modes.

### Colors
- **Primary:** Represents the QEOS brand (Indigo/Cyan).
- **Backgrounds:** 
  - Light: Slate-50 / White
  - Dark: Slate-900 / Slate-800
- **Text:** High contrast slates.
- **Status:** Emerald (Success), Amber (Warning), Rose (Error), Sky (Info).

### Typography
- Primary Sans-serif font stack.

### CSS Variables Strategy
Implemented via `index.css` defining `--color-primary`, `--color-background`, etc., injected into the Tailwind configuration.
