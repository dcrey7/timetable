# Apple Calendar Style UI & 3D Buttons Update

**Date & Time:** January 5, 2026

---

## Summary

Major UI overhaul implementing Duolingo-style 3D buttons and Apple Calendar yearly view with click-to-zoom navigation.

---

## Changes Made

### 1. 3D Duolingo-Style Button System

Implemented a comprehensive 3D button system with shadow effects throughout the app:

| Button Class | Purpose | Color | Shadow |
|-------------|---------|-------|--------|
| `.btn-primary` | Main actions (Log Day) | Green (#58cc02) | Dark green bottom |
| `.btn-save` | Save buttons | Green (#58cc02) | Dark green bottom |
| `.btn-secondary` | Secondary actions (Clear Table) | Gray (#e5e5e5) | Dark gray bottom |
| `.btn-danger` | Destructive actions (Clear All) | Red (#ff4b4b) | Dark red bottom |
| `.btn-export` | Export Excel | Blue (#1cb0f6) | Dark blue bottom |
| `.btn-import` | Import Excel | Orange (#ff9600) | Dark orange bottom |
| `.btn-add-row` | Add Exercise | Purple (#ce82ff) | Dark purple bottom |
| `.btn-nav` | Calendar navigation | Gray | 3D effect |
| `.btn-add` / `.add-btn` | Add row in table (+) | Green | 3D effect |
| `.btn-delete` / `.delete-btn` | Delete row (-) | Red | 3D effect |

**Button States:**
- **Default**: Box-shadow creates 3D depth at bottom
- **Hover**: Button raises up (`translateY(-2px)`), shadow increases
- **Active/Pressed**: Button presses down (`translateY(4px)`), shadow disappears

### 2. Apple Calendar Yearly View

Implemented Apple Calendar-style navigation with two views:

**Year View (Default):**
- Shows all 12 months in a 3x4 grid
- Each month is a mini calendar card showing full month days
- Sundays highlighted in red
- Today highlighted in blue
- Logged days highlighted in green
- Click any month to zoom in

**Month View (Zoomed):**
- Shows previous, current, and next month
- "Year View" button to go back
- Month navigation arrows on current month
- Day selection for timetable

### 3. Sunday Highlighting

All Sundays are now highlighted in red:
- Day headers ("S" for Sunday) in red
- Sunday date numbers in red
- Works in both year view mini calendars and month view

### 4. Consistent Solid Arrows

Changed all navigation arrows to solid style:
- Year navigation: `◄` and `►` (solid arrows)
- Month navigation: `◄` and `►` (solid arrows)
- Removed mixed arrow styles (line-art vs solid)

---

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Added year view container, month view container with back button |
| `styles.css` | Complete 3D button system, year/month view CSS, Sunday highlighting |
| `script.js` | Year view generation, zoom navigation, view switching logic |

---

## New JavaScript Functions

| Function | Purpose |
|----------|---------|
| `generateYearView()` | Creates 12-month grid for year view |
| `createMiniMonthCard(year, month, today)` | Creates individual mini calendar card |
| `zoomToMonth(year, month)` | Switches from year view to month view |
| `showYearView()` | Returns to year view from month view |
| `showMonthView()` | Switches to month view |
| `updateCalendarViewDisplay()` | Updates CSS classes for view switching |

---

## New CSS Classes

| Class | Purpose |
|-------|---------|
| `.calendar-year-view` | Container for 12-month grid |
| `.calendar-year-view.hidden` | Hides year view |
| `.year-grid` | CSS Grid for 3x4 month layout |
| `.year-month-card` | Individual mini month card |
| `.mini-month-label` | Month name label |
| `.mini-calendar` | Mini calendar grid inside card |
| `.mini-day` | Day cell in mini calendar |
| `.mini-day.sunday` | Sunday in red |
| `.mini-day.other-month` | Faded other month days |
| `.calendar-month-view` | Container for 3-month view |
| `.calendar-month-view.active` | Shows month view |
| `.back-to-year-btn` | Button to return to year view |

---

## User Experience Flow

1. App loads showing **Year View** (all 12 months in grid)
2. User scrolls through years using year navigation arrows
3. User clicks on a month card to **zoom in**
4. App shows **Month View** with prev/current/next months
5. User navigates months or clicks days to select date
6. User clicks "Year View" button to **zoom out** back to grid

---

## Testing Checklist

- [ ] Year view shows all 12 months correctly
- [ ] Click month card zooms to that month
- [ ] "Year View" button returns to grid view
- [ ] Year navigation updates both views
- [ ] Month navigation works in month view
- [ ] Sundays are red in both views
- [ ] Today is highlighted blue
- [ ] Logged days are green
- [ ] All buttons have 3D press effect
- [ ] Buttons animate on hover and click

---

## Screenshots Reference

The design is inspired by:
- **Duolingo**: 3D buttons with shadow/press effect
- **Apple Calendar**: Yearly grid with click-to-zoom navigation
