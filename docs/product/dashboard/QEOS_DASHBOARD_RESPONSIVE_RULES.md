# QEOS Dashboard Responsive Rules

## Authorization: QEOS-AUTH-0086

## 1. Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 2. Widget Reflowing
- **Desktop:** 12-column grid. KPI cards take 3 columns each (4 across). Charts take 6-8 columns. Lists take 4-6 columns.
- **Tablet:** KPI cards take 4 columns each (3 across) or 6 columns (2 across). Charts take 12 columns.
- **Mobile:** All widgets take 12 columns (stack vertically). Complex tables switch to card-based list views.

## 3. Navigation Behavior
- **Desktop:** Persistent sidebar (expanded by default, can be collapsed to icon-only).
- **Tablet:** Sidebar collapsed to icon-only by default.
- **Mobile:** Sidebar hidden, accessed via Hamburger menu. Quick actions move to a Bottom Navigation Bar.

## 4. Scroll Behavior
- **Workspace:** Main canvas scrolls vertically.
- **Widgets:** Internal scrolling for lists (e.g., Recent Activities) should be avoided on mobile (prefer 'View All' links) but is acceptable on desktop with a fixed height.
- **AI Drawer:** Fixed position, independent scroll from the main workspace.
