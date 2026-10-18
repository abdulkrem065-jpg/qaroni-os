# QEOS Existing UI Audit

## Authorization: QEOS-AUTH-0085

## 1. Executive Dashboard (src/admin/Dashboard.tsx)
- **Status:** **Redesign / Split**
- **Rationale:** The current dashboard file is monolithic, acting as a massive controller for multiple domains (inventory, settings, POS fallback). It must be split into domain-specific dashboards and clean up the visual hierarchy to match the new Design System.

## 2. Main Storefront / Consumer View (src/App.tsx & src/components/Cards.tsx)
- **Status:** **Replace**
- **Rationale:** The current storefront is a mix of consumer catalog and B2B ordering. A merchant product requires a dedicated POS terminal UI for internal staff, distinct from a consumer-facing e-commerce view. The merchant B2B POS should be rebuilt prioritizing speed, barcode scanning, and keyboard navigation.

## 3. Authentication Gateway (src/auth/Gateway.tsx)
- **Status:** **Redesign**
- **Rationale:** Currently utilizes a highly stylized, consumer-oriented lock screen. Must be redesigned to an enterprise-grade login portal supporting OAuth, SAML (future), MFA, and clear tenant selection.

## 4. AI Assistant (src/modules/assistant/)
- **Status:** **Keep & Enhance**
- **Rationale:** The floating chat button and chat window are structurally sound. They will be visually aligned with the new Design System and functionally integrated deeper into the new modular architecture.

## 5. Header / Navigation (src/layout/Header.tsx)
- **Status:** **Replace**
- **Rationale:** The current top navigation bar is insufficient for a complex ERP/Merchant product. Will be replaced by a structured sidebar (or collapsible drawer) encompassing the full Module Hierarchy defined in the Information Architecture.

## 6. Shared Components (Cart, Modals, Forms)
- **Status:** **Redesign**
- **Rationale:** Existing components lack strict adherence to an enterprise design system (inconsistent paddings, varied border radii). All UI primitives will be rebuilt using the standardized QEOS Design System rules.
