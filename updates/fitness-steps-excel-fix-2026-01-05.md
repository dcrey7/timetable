# Fitness Steps/Distance & Excel Export Fix

**Date & Time:** January 5, 2026 - 5:00 PM

---

## Summary

Added Steps and Distance columns to Fitness tab, and fixed Excel export to properly save all logged days with all activities.

---

## Changes Made

### 1. Fitness Tab - New Columns: Steps & Distance

**New Table Structure:**
| Exercise | Sets | Reps | Weight (kg) | Body Wt (kg) | Steps | Distance (km) | Burnt (kcal) | Comment | Actions |

**Features:**
- Steps: Integer input for daily step count
- Distance: Decimal input for distance in kilometers
- Totals row shows: Avg Body Weight, Total Steps, Total Distance, Total Calories Burnt

**Files Modified:**
- `index.html`: Added Steps and Distance columns + footer totals
- `script.js`: Updated `addFitnessRow()`, `saveFitness()`, `loadFitness()`, `updateFitnessStats()`
- `styles.css`: Updated column widths for 10-column layout

---

### 2. Excel Export Fix - All Logged Days

**Problem:** Export was only showing data from one day, missing other logged days and activities.

**Root Cause:**
- Data structure change: Now saves `{ startHour, rows }` instead of just array
- Export wasn't handling both old format (array) and new format (object)

**Solution:**
- Updated `logDay()` to save timetable with `startHour` for each day
- Updated `exportToExcel()` to detect and handle both formats:
  ```javascript
  if (Array.isArray(savedData)) {
      // Old format
      dayStartHour = startHour;
      timetableRows = savedData;
  } else {
      // New format
      dayStartHour = savedData.startHour || startHour;
      timetableRows = savedData.rows || [];
  }
  ```
- Updated date loading functions to also handle both formats

**How Excel Export Works Now:**

1. **Log Day** → Saves current day's timetable to `savedTimetables[dateStr]` with startHour
2. **Export Excel** → Creates 1 file with 4 sheets containing ALL logged days:

| Sheet | Data |
|-------|------|
| Timetable | All activities from all logged days |
| Diary | All diary entries from all logged days |
| Calories | All food items from all logged days |
| Fitness | All exercises from all logged days (with Steps & Distance) |

---

### 3. New Data Structure

**Timetable Data (per day):**
```javascript
savedTimetables["2026-01-05"] = {
    startHour: 6,  // Day starts at 6:00 AM
    rows: [
        { id: 0, duration: "1.0", task: "Eating", category: "eating", comment: "", isAutoFill: false },
        { id: 1, duration: "1.0", task: "Data Science", category: "learning", comment: "", isAutoFill: false },
        { id: 2, duration: "22.0", task: "Sleep", category: "sleeping", comment: "", isAutoFill: true }
    ]
}
```

**Fitness Data (per day):**
```javascript
appState.savedData["2026-01-05"].fitness = [
    {
        exercise: "Running",
        sets: 0,
        reps: 0,
        weight: 0,
        bodyWeight: 75.5,
        steps: 8500,       // NEW
        distance: 6.2,     // NEW (km)
        caloriesBurnt: 450,
        comment: "Morning jog"
    }
]
```

---

## Excel Sheet Columns

### Sheet 1: Timetable
Date | Start Time | End Time | Duration (hrs) | Task | Category | Comment

### Sheet 2: Diary
Date | Entry

### Sheet 3: Calories
Date | Food Item | Type | Class | Calories (kcal) | Comment

### Sheet 4: Fitness
Date | Exercise | Sets | Reps | Weight (kg) | Body Wt (kg) | Steps | Distance (km) | Burnt (kcal) | Comment

---

## Debugging Added

Console logs added for troubleshooting:
- `Logging day:` - Shows date being logged
- `Logged days:` - Shows array of all logged dates
- `Saved timetables:` - Shows all saved timetable data
- `Exporting logged days:` - Shows which days will be exported
- `Processing date:` - Shows each date being processed with row count

---

## Testing Checklist

- [ ] Log Day 1 with activities
- [ ] Log Day 2 with different activities
- [ ] Export Excel
- [ ] Verify Timetable sheet has activities from BOTH days
- [ ] Verify Diary/Calories/Fitness sheets have data from BOTH days
- [ ] Fitness table shows Steps and Distance columns
- [ ] Fitness totals show Total Steps and Total Distance
- [ ] Switching dates loads correct startHour for that day
