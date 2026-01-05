# Dark Mode Styling Fixes & Autofill Row Update

**Date & Time:** January 5, 2026 - 4:15 PM

---

## Summary

Fixed comprehensive dark mode text visibility issues and removed the blue/white highlight styling from the timetable's Sleep (autofill) row.

---

## Issues Fixed

### 1. Dark Mode Text Visibility

Many text elements were still showing black/grey text on dark backgrounds. Added proper light text colors for:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Start time cell | `#1d1d1f` | `#e5e5e5` |
| Time control labels | `#4b4b4b` | `#e5e5e5` |
| Category select dropdown | white bg | `#2a2a2a` bg, `#e5e5e5` text |
| Year month card days | `#4b4b4b` | `#e5e5e5` |
| Month selector options | inherit | `#e5e5e5` |
| Table footer totals | inherit | `#e5e5e5` |
| Form labels | `#4b4b4b` | `#e5e5e5` |
| Form inputs | white bg | `#2a2a2a` bg, `#e5e5e5` text |
| Calorie form background | `#f5f5f7` | `#2a2a2a` |

### 2. 3D Button Shadows

The 3D button effect was not visible in dark mode because grey shadows on black background don't provide contrast. Changed shadow colors from `#1a1a1a` to `#000000` for better visibility:

- `.tab-btn` - 3D shadow now uses pure black
- `.btn-nav` - Navigation buttons have black shadows
- `.header-icon-btn` - Dark mode & settings buttons
- `.btn-secondary` - Secondary action buttons

### 3. Autofill Row Styling Removed

**Before:** The Sleep (autofill) row had:
- Light blue background (`#e3f2fd`)
- Blue text color (`#1976d2`)
- Bold font weight

**After:** The Sleep row now blends with other rows:
- No special background color
- Italic text style only (subtle indicator that it's auto-calculated)
- Inherits category color if category is set

---

## Files Modified

| File | Changes |
|------|---------|
| `styles.css` | Added 100+ lines of dark mode fixes for text, inputs, selects, buttons |
| `styles.css` | Removed autofill row background colors |
| `script.js` | Removed inline blue text styling for autofill row |

---

## CSS Classes Updated for Dark Mode

### Text Elements
```css
body.dark-mode .start-time { color: #e5e5e5; }
body.dark-mode .start-time-selector label { color: #e5e5e5; }
body.dark-mode .time-format-selector label { color: #e5e5e5; }
body.dark-mode .total-row td { color: #e5e5e5; }
body.dark-mode .form-row label { color: #e5e5e5; }
```

### Form Elements
```css
body.dark-mode .category-select { background: #2a2a2a; color: #e5e5e5; }
body.dark-mode .form-row input { background: #2a2a2a; color: #e5e5e5; }
body.dark-mode .calorie-form { background: #2a2a2a; }
```

### 3D Button Shadows
```css
body.dark-mode .tab-btn { box-shadow: 0 4px 0 #000000; }
body.dark-mode .btn-nav { box-shadow: 0 3px 0 #000000; }
body.dark-mode .header-icon-btn { box-shadow: 0 2px 0 #000000; }
body.dark-mode .btn-secondary { box-shadow: 0 4px 0 #000000; }
```

---

## Autofill Row CSS Changes

**Old:**
```css
.autofill-row {
    background-color: #e3f2fd !important;
}
.autofill-row .task {
    color: #1976d2 !important;
    font-weight: 600;
}
```

**New:**
```css
.autofill-row {
    /* No special background */
}
.autofill-row .task {
    font-style: italic;
}
.autofill-row .duration {
    font-style: italic;
}
```

---

## Testing Checklist

- [x] All text readable in dark mode
- [x] Category dropdowns styled correctly
- [x] Form inputs have proper contrast
- [x] 3D button shadows visible
- [x] Autofill row blends with regular rows
- [x] Category colors still apply to autofill row when category selected
- [x] Month names visible in both year and month calendar views
