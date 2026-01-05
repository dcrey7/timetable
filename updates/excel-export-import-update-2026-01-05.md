# Excel Export/Import Update & UI Improvements

**Date & Time:** January 5, 2026 - 3:45 PM

---

## Summary

Updated Excel export/import to handle the new table formats for Calories and Fitness, fixed table column widths, and added seconds to datetime display.

---

## Changes Made

### 1. Excel Export Updates

**Sheet: Calories (renamed from Calories_Weight)**
| Old Format | New Format |
|------------|------------|
| Date, Calories, Weight, Comment | Date, Food Item, Type, Class, Calories, Comment |
| Single row per day | Multiple rows per day (one per food item) |

**Sheet: Fitness**
| Old Columns | New Columns |
|-------------|-------------|
| Date, Exercise, Sets, Reps, Weight, Comment | Date, Exercise, Sets, Reps, Weight, **Body Weight**, **Calories Burnt**, Comment |

### 2. Excel Import Updates

- **Calories**: Now imports new format (multiple food items per day)
- **Calories_Weight**: Falls back to old format for backward compatibility
- **Fitness**: Auto-detects old (6 columns) vs new (8 columns) format

### 3. Table Column Width Fixes

| Column | Old Width | New Width |
|--------|-----------|-----------|
| Duration | 60px | 80px |
| Task | auto | min 200px |
| Category | 130px | 160px |

### 4. DateTime Display Updates

- Added seconds to time display
- Separated date and time with comma

**Format:** `Monday 5 January 2026, 3:45:23 PM`

---

## Excel File Structure

### Sheet 1: Timetable
```
Date | Start Time | End Time | Duration (hrs) | Task | Category | Comment | Is Buffer | Row Type | Position
```

### Sheet 2: Diary
```
Date | Entry
```

### Sheet 3: Calories
```
Date | Food Item | Type | Class | Calories | Comment
```
- **Type**: Food, Ingredient, Drink, Snack
- **Class**: Protein, Carbs, Fat, Fiber, Mixed

### Sheet 4: Fitness
```
Date | Exercise | Sets | Reps | Weight (kg) | Body Weight (kg) | Calories Burnt | Comment
```

---

## Files Modified

| File | Changes |
|------|---------|
| `script.js` | Updated `exportToExcel()` and `importFromExcel()` functions |
| `script.js` | Updated `updateDateTime()` to show seconds |
| `styles.css` | Updated column widths for Duration, Task, Category |

---

## Backward Compatibility

- **Import**: Can read both old and new Excel formats
- **Export**: Always exports in new format
- **Old Calories_Weight sheet**: Converted to new Calories array format on import

---

## How It Works

1. **Log Day**: Saves current day's data (Timetable, Diary, Calories, Fitness)
2. **Export Excel**: Creates single `.xlsx` file with 4 sheets containing all logged days
3. **Import Excel**: Reads the file and restores all data, marking days as logged
4. **Calendar**: Green circles show logged days

---

## Testing Checklist

- [ ] Export creates file with 4 sheets
- [ ] Calories sheet has multiple rows per day
- [ ] Fitness sheet includes Body Weight and Calories Burnt
- [ ] Import restores all data correctly
- [ ] Import works with old format Excel files
- [ ] Logged days appear green on calendar after import
- [ ] Table columns display properly (no overlap)
- [ ] Datetime shows seconds and comma separator
