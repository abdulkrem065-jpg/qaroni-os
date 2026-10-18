# QEOS Component Library

## Authorization: QEOS-AUTH-0087

## Core Primitives
The component library establishes the building blocks for the QEOS interface. These components are strictly presentation-focused, devoid of domain-specific business logic.

- **Buttons & Inputs:** Form elements designed with the new Tailwind theme tokens.
- **Cards (ContentCard):** Standardized containers for widgets and data presentation.
- **Typography (SectionTitle):** Standardized headers.
- **Interactive Elements (ThemeSwitcher, LanguageSwitcher):** Shell controls for user preferences.
- **Navigation (NavGroup, NavItem):** Sidebar menu elements with active state handling and nesting capability.

## Principles
- **Theme-aware:** All components respect dark/light mode tokens.
- **RTL-aware:** Uses Tailwind's `rtl:` variants and logical properties (`ps-`, `pe-`, `ms-`, `me-`).
- **Accessible:** Includes proper `aria-` attributes and focus states.
