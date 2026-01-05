# Timetable Simplification Update

**Date & Time:** January 5, 2026 - 3:15 PM

---

## Summary

Major simplification of the timetable system - removed complex buffer/Start/End row logic in favor of a simpler "activities + auto-fill sleep" approach. Also added category background colors with contrasting text.

---

## Changes Made

### 1. Simplified Row Structure

**Old System (Complex):**
- Fixed "Start" row (1 min, couldn't delete)
- Multiple activity rows
- Fixed "Buffer/Sleep" row (auto-calculated)
- Fixed "Day End" row (1 min, couldn't delete)

**New System (Simple):**
- Activity rows (add/delete freely)
- Auto-fill "Sleep" row at bottom (auto-calculates remaining time)

### 2. How It Works Now

| Scenario | Behavior |
|----------|----------|
| Activities < 24 hrs | Remaining time auto-fills as "Sleep" |
| Activities = 24 hrs | Sleep row shows 0 hrs |
| Activities > 24 hrs | Warning shown in footer (red text) |

### 3. Table Footer Added

New footer shows:
- **Total Duration:** Sum of all activity durations
- **Status Message:**
  - Green: "X hrs auto-filled as Sleep" or "Day fully scheduled"
  - Red: "Over by X hrs - please reduce activities"

### 4. Category Background Colors

Categories now show with:
- **Solid background** in category color
- **Contrasting text** (white or black based on luminance)
- Applied to the category dropdown

**Category Colors:**
| Category | Color |
|----------|-------|
| Sleeping | Blue (#4A90E2) |
| Eating | Orange (#F5A623) |
| Working | Red (#D0021B) |
| Chilling | Green (#7ED321) |
| Exercise | Purple (#BD10E0) |
| Learning | Teal (#50E3C2) |

### 5. Auto-fill Row Styling

The auto-fill (Sleep) row now has:
- Light blue background (#e3f2fd)
- Blue text color for task name
- Duration is read-only
- Cannot be deleted

### 6. Duration Column

- Made narrower (60px instead of 80px)
- Centered text alignment

### 7. Row Button Logic

| Row Type | + Button | - Button |
|----------|----------|----------|
| Activity (multiple) | Show | Show |
| Activity (only one) | Show | Hide |
| Auto-fill | Show | Hide |

---

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Added tfoot with total/status display |
| `styles.css` | Narrower duration, autofill-row styling |
| `script.js` | Rewrote row logic, added category backgrounds, footer updates |

---

## Data Structure Changes

### Old Format:
```javascript
{
    id: 0,
    duration: "0.02",
    task: "Start",
    category: "",
    comment: "",
    isBuffer: false  // or true for buffer row
}
```

### New Format:
```javascript
{
    id: 0,
    duration: "8.0",
    task: "Work",
    category: "working",
    comment: "Project meeting",
    isAutoFill: false  // true for auto-fill sleep row
}
```

### Migration

Old data with `isBuffer` is automatically migrated:
- Start and Day End rows are filtered out
- `isBuffer` is converted to `isAutoFill`

---

## New/Updated JavaScript Functions

| Function | Purpose |
|----------|---------|
| `getRowType()` | Simplified - only 'activity' or 'autofill' |
| `getTotalActivityDuration()` | Calculate sum of activity durations |
| `updateTimetableFooter()` | Update total and status message |
| `applyCategoryBackground()` | Apply category color to dropdown |
| `getContrastColor()` | Calculate white/black text for readability |
| `redistributeTime()` | Simplified - just update auto-fill row |
| `updateRowStyling()` | Apply category colors, highlight max activity |
| `loadTimetableData()` | Handles migration from old format |

---

## UI Changes

### Before:
```
| Start Time | Duration | Task     | Category | Comment | Actions |
|------------|----------|----------|----------|---------|---------|
| 6:00 AM    | 0.02     | Start    |          |         | +       |
| 6:01 AM    | 8.00     | Work     | Working  |         | + -     |
| 2:01 PM    | 15.97    | Sleep    | Sleeping |         | +       |
| 5:59 AM    | 0.02     | Day End  |          |         |         |
```

### After:
```
| Start Time | Duration | Task     | Category | Comment | Actions |
|------------|----------|----------|----------|---------|---------|
| 6:00 AM    | 8.0      | Work     | Working  |         | + -     |
| 2:00 PM    | 16.0     | Sleep    | Sleeping |         | +       |
|------------|----------|----------|----------|---------|---------|
| Total      | 24.0 hrs | Day fully scheduled              |         |
```

---

## Testing Checklist

- [ ] New timetable starts with 1 activity + auto-fill Sleep
- [ ] Adding activities reduces Sleep duration automatically
- [ ] Cannot delete the auto-fill Sleep row
- [ ] Footer shows correct total and status
- [ ] Warning appears when total > 24 hrs
- [ ] Category dropdowns show solid background colors
- [ ] Text is readable (white on dark, black on light)
- [ ] Old saved data migrates correctly
- [ ] Data persists across page refresh
