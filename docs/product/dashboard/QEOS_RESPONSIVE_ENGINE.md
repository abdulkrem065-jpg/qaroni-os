# QEOS Responsive Engine

## Authorization: QEOS-AUTH-0087

## Adaptive Layout
The shell and component library implement a mobile-first responsive strategy.

### Breakpoints
- **Mobile (< 768px):** Sidebar is hidden and accessible via a hamburger menu. The workspace spans 100% width.
- **Tablet (768px - 1024px):** Sidebar may be collapsed to an icon-only mode to preserve horizontal space.
- **Desktop (> 1024px):** Sidebar is fully expanded by default.

### Grid System
A fluid 12-column grid is established for widget placement inside the Workspace.
Gaps and paddings scale proportionally based on the viewport width (using Tailwind's `md:` and `lg:` prefixes).
