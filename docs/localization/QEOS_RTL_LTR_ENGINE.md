# QEOS RTL/LTR Direction Engine

## Authorization: QEOS-AUTH-0086A

## Overview
QEOS handles bidirectional text (Bidi) at the framework level, relying on native HTML attributes (`dir="rtl"`) and CSS logical properties.

## Rules
1. **Logical Properties Only:** 
   - Use `ms-` (margin-start) instead of `ml-` (margin-left).
   - Use `pe-` (padding-end) instead of `pr-` (padding-right).
   - Use `border-s` instead of `border-l`.
2. **Icons:** Directional icons (arrows, chevrons) must be flipped automatically using Tailwind's `rtl:` and `ltr:` modifiers if the icon library does not support it natively.
3. **Animations:** Slide-in drawers and animations must originate from the correct side based on the active direction.

## Integration
The `LocalizationProvider` automatically synchronizes the document's `dir` attribute whenever the language changes, triggering native browser repaints and CSS logical property recalculations instantly.
