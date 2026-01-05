# Calories & Fitness Table Update

**Date & Time:** January 5, 2026 - 2:45 PM

---

## Summary

Updated the Calories and Fitness tabs with new table columns and full-width layouts as requested.

---

## Changes Made

### 1. Calories Tab Renamed
- Changed tab name from "Calorie Tracking" to "Calories"

### 2. Calories Table - Column Restructuring

**Removed Columns:**
- Time column (was tracking when food was consumed)
- Protein column (g)

**Added Columns:**
- **Type** - Dropdown with options: Food, Ingredient, Drink, Snack
- **Class** - Dropdown with options: Protein, Carbs, Fat, Fiber, Mixed

**New Table Structure:**
| Column | Purpose |
|--------|---------|
| Food Item | Name of food/ingredient |
| Type | Food, Ingredient, Drink, or Snack |
| Class | Protein, Carbs, Fat, Fiber, or Mixed |
| Calories | Calorie count |
| Comment | Additional notes |
| Actions | +/- buttons for row management |

### 3. Fitness Tab - Added Calories Burnt Column

**New Table Structure:**
| Column | Purpose |
|--------|---------|
| Exercise | Exercise name |
| Sets | Number of sets |
| Reps | Number of reps |
| Weight (kg) | Weight lifted |
| Body Weight | User's body weight |
| **Calories Burnt** | Calories burned per exercise (NEW) |
| Comment | Notes |
| Actions | +/- buttons |

**Footer Updates:**
- Average Body Weight (existing)
- **Total Calories Burnt** (new) - Sum of all calories burnt

### 4. Tables Made Full Width
- Removed `max-width` constraints from `.calories-container` (was 500px)
- Removed `max-width` constraints from `.fitness-container` (was 900px)
- Both now use `width: 100%` to fill available space

### 5. Select Dropdown Styling
- Added consistent styling for `<select>` elements in compact tables
- Same styling as input fields (background, border, focus states)

---

## Files Modified

| File | Changes |
|------|---------|
| `index.html` | Tab rename, updated table headers |
| `styles.css` | Full-width containers, select element styling |
| `script.js` | Updated addCalorieRow, deleteCalorieRow, saveCalories, loadCalories, updateCalorieStats, addFitnessRow, saveFitness, loadFitness, updateFitnessStats |

---

## Data Structure Changes

### Old Calories Format:
```javascript
calories: [
    { time: "8:00 AM", item: "Oatmeal", calories: 300, protein: 10, comment: "" }
]
```

### New Calories Format:
```javascript
calories: [
    { item: "Oatmeal", type: "food", foodClass: "carbs", calories: 300, comment: "" }
]
```

### Old Fitness Format:
```javascript
fitness: [
    { exercise: "Bench Press", sets: 3, reps: 10, weight: 60, bodyWeight: 75.2, comment: "" }
]
```

### New Fitness Format:
```javascript
fitness: [
    { exercise: "Bench Press", sets: 3, reps: 10, weight: 60, bodyWeight: 75.2, caloriesBurnt: 150, comment: "" }
]
```

---

## JavaScript Functions Updated

| Function | Changes |
|----------|---------|
| `addCalorieRow()` | Now creates Type and Class dropdowns instead of Time and Protein inputs |
| `deleteCalorieRow()` | Simplified - no longer handles time field |
| `saveCalories()` | Saves type, foodClass instead of time, protein |
| `loadCalories()` | Loads dropdowns with correct selected values |
| `updateCalorieStats()` | Only calculates total calories (removed protein total) |
| `addFitnessRow()` | Added calories-burnt input field |
| `saveFitness()` | Includes caloriesBurnt field |
| `loadFitness()` | Loads caloriesBurnt value |
| `updateFitnessStats()` | Calculates and displays total calories burnt |

---

## Testing Checklist

- [ ] Calories table adds/removes rows correctly
- [ ] Type dropdown saves and loads correctly
- [ ] Class dropdown saves and loads correctly
- [ ] Calories total updates in real-time
- [ ] Fitness table adds/removes rows correctly
- [ ] Calories Burnt column saves and loads
- [ ] Total Calories Burnt displays correctly in footer
- [ ] Both tables display full width
- [ ] Data persists across page refresh
- [ ] Data loads correctly when changing dates
