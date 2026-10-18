# QEOS Widget Constitution

## Authorization: QEOS-AUTH-0088

## Definition
An Enterprise Widget in QEOS is a strict, isolated component designed for maximum reusability and context awareness.

## Required Properties
- **Identity:** Unique ID, version, category, metadata.
- **Data Layer:** Uses specific Application Services/Repositories, handles caching, refresh, and offline modes.
- **Display Layer:** Title, value, subtitle, trend, delta, icon, status color, sparkline, timestamp.
- **States:** Must handle Loading, Success, Empty, Offline, Warning, Critical, and Error states.
- **Actions:** Click, Expand, Drill Down, Refresh, Export, Share, AI Explain.
- **Permissions:** Tied to specific Org, Branch, Role, Permission, or Feature Flag.
- **AI Integration:** Exposes metadata for the AI Assistant.
