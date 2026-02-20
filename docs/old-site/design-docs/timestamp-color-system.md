# Timestamp Color Coding System

## Overview
All lessons and labs in GWTH.ai use a color-coded timestamp system to indicate content freshness. This visual indicator helps users quickly identify how current the content is.

## Color Coding Rules

### 🟢 GREEN - Fresh Content
- **Condition**: Content is current and up-to-date
- **Border Color**: `#22c55e` (green-500)
- **Text Color**: `#16a34a` (green-600)
- **Background**: `transparent`
- **Meaning**: Content is fresh and reliable

### 🟡 ORANGE - Expiring Soon
- **Condition**: Content expires within 3 days
- **Border Color**: `#fb923c` (orange-400)
- **Text Color**: `#ea580c` (orange-600)
- **Background**: `transparent`
- **Meaning**: Content is still valid but will need review/update soon

### 🔴 RED - Expired Content
- **Condition**: Content has passed its "fresh date"
- **Border Color**: `#ef4444` (red-500)
- **Text Color**: `#dc2626` (red-600)
- **Background**: `transparent`
- **Meaning**: Content may be outdated and should be reviewed/updated

## Implementation

### CSS Styles
```css
/* Green - Fresh */
.timestamp-fresh {
  border: 2px solid #22c55e;
  color: #16a34a;
  background: transparent;
}

/* Orange - Expiring Soon */
.timestamp-expiring {
  border: 2px solid #fb923c;
  color: #ea580c;
  background: transparent;
}

/* Red - Expired */
.timestamp-expired {
  border: 2px solid #ef4444;
  color: #dc2626;
  background: transparent;
}
```

### JavaScript Logic
```javascript
function getTimestampStyle(lastUpdate, nextUpdate) {
  const now = new Date();
  const nextUpdateDate = new Date(nextUpdate);
  const daysDiff = Math.ceil((nextUpdateDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 3) {
    return 'timestamp-fresh';
  } else if (daysDiff > 0) {
    return 'timestamp-expiring';
  } else {
    return 'timestamp-expired';
  }
}
```

## Usage in Lessons and Labs

Every lesson and lab should include a timestamp section at the top with:
- Last content refresh date
- Next scheduled update date
- Appropriate color coding based on freshness

Example format:
```
Last content refresh: 05/07/2025 | Next scheduled update: 12/07/2025
```

This system ensures users always know how current their learning material is and builds trust in the "living course" concept.