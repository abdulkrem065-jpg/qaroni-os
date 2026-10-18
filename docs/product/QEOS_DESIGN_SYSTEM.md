# QEOS Design System Constitution

## Authorization: QEOS-AUTH-0085

## 1. Typography
- **Primary Font:** `Inter` or system sans-serif for LTR. `Tajawal` or `Cairo` for RTL (Arabic).
- **Hierarchy:** 
  - H1: 24px/32px (Page Titles)
  - H2: 20px/28px (Section Headers)
  - H3: 16px/24px (Card Titles)
  - Body: 14px/20px (Standard Text)
  - Small: 12px/16px (Labels, Metadata)

## 2. Spacing & Grid System
- **Base Unit:** 4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
- **Grid:** 12-column responsive fluid grid.
- **Gutter:** 16px on mobile, 24px on tablet/desktop.
- **Container Max-Width:** 1440px for standard views, fluid width for POS/dashboards.

## 3. Color Palette
- **Brand/Primary:** Indigo/Cyan spectrum (Trust, Technology).
- **Neutral:** Slate/Gray (900 for dark mode bg, 50 for light mode bg).
- **Status Colors:**
  - Success: Emerald Green
  - Warning: Amber/Yellow
  - Error: Rose/Red
  - Info: Sky Blue

## 4. Components
- **Buttons:** 
  - Primary (Solid fill), Secondary (Outline), Tertiary (Ghost/Text). 
  - Touch targets minimum 44px on mobile.
- **Inputs:** 
  - Clear borders, visible focus states (ring), inline validation icons.
- **Cards:** 
  - Subtle borders (1px) or soft shadows. Border radius 8px (standard) to 12px (soft).
- **Dialogs/Modals:** 
  - Centered on desktop, bottom-sheet on mobile. Dimmed backdrop.
- **Tables:** 
  - Zebra striping optional, sticky headers, dense/comfortable toggle.
- **Charts:** 
  - Clean, minimalist axes. Interactive tooltips.
- **Badges/Tags:** 
  - Used for status (e.g., 'Paid', 'Pending'). Soft background with strong text color.
- **Icons:** 
  - Lucide React (clean, consistent stroke weight).

## 5. Environment & Accessibility
- **RTL Rules:** Logical CSS properties (`margin-inline-start`, `padding-inline-end`) must be used. Layouts mirror horizontally.
- **Dark Mode:** First-class citizen. Pure black avoided, preferring deep slate/blue for eye comfort. High contrast text.
- **Responsive Rules:** Mobile-first approach. Complex tables degrade to card-lists on mobile.
- **Accessibility:** Minimum 4.5:1 contrast ratio. Aria-labels on icon-only buttons. Focus traps in modals.
