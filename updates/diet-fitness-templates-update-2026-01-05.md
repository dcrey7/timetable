# Diet, Fitness & Templates Update - 2026-01-05

**Date:** January 5, 2026

## Overview

Major update implementing the Load Template feature with day-specific templates for timetable, diet, and fitness tracking. Also includes significant table restructuring for better macro tracking.

## Changes Made

### 1. Tab Rename: Calories -> Diet
- **HTML:** Renamed tab button from "Calories" to "Diet"
- **HTML:** Changed container class from `calories-container` to `diet-container`
- **HTML:** Updated table and element IDs to use `diet` prefix
- **JS:** Updated all functions to use `diet` instead of `calories`
- **JS:** Added backward compatibility for old `calories` data key

### 2. Diet Table - New Column Structure
**Old:** Food Item, Type, Class, Calories, Comment, Actions

**New:** Food Item, Portion (g), Type, Protein, Carbs, Fat, Cal, Comment, Actions

- Added `Portion (g)` column for tracking food weights
- Added `Protein`, `Carbs`, `Fat` columns for macro tracking
- Removed `Class` column (redundant with Type)
- Footer now shows totals for Protein, Carbs, Fat, and Calories

### 3. Fitness Table - Simplified Column Structure
**Old:** Exercise, Sets, Reps, Weight, Body Wt, Steps, Distance, Burnt, Comment, Actions

**New:** Exercise, Sets, Reps, kg, Duration, Burnt, Comment, Actions

- Removed `Body Wt`, `Steps`, `Distance` columns (moved to Weigh-in row concept)
- Renamed `Weight` to `kg` for clarity
- Added `Duration` column for cardio/time-based exercises
- Footer shows totals for Duration and Calories Burnt

### 4. Load Template Feature
- Added new "Load Template" button (purple, 3D style) in common controls
- Modal dialog shows day-specific workout info (e.g., "Monday - Back + Biceps")
- Checkboxes to select which templates to load (Timetable, Diet, Fitness)
- Warning that loading will replace existing data

### 5. New File: templates.js
Created modular template file containing all 7-day templates:

**Timetable Templates:**
- Each day has a structured schedule (6 AM start)
- Morning routine, work blocks, gym time, meals, personal time, sleep
- Day-specific workout types in task names

**Diet Templates (per day based on batch cooking rotation):**
- Monday/Tuesday: Chicken + Dal + Rice
- Wednesday/Thursday: Meatballs + Beef
- Friday: Chicken + Thai noodles
- Saturday: Cheat meal day (extra calories)
- Sunday: Light recovery day
- All include: supplements (whey, creatine), hydration (3L water), fruits/yogurt

**Fitness Templates:**
- Monday: Back + Biceps
- Tuesday: Chest + Triceps
- Wednesday: Cardio + Abs
- Thursday: Legs
- Friday: Shoulders + Arms
- Saturday: Football
- Sunday: Rest day
- Each includes Weigh-in row and Daily Steps tracking

### 6. Excel Export Updates
- Sheet name changed from "Calories" to "Diet"
- Diet sheet columns: Date, Food Item, Portion (g), Type, Protein (g), Carbs (g), Fat (g), Calories, Comment
- Fitness sheet columns: Date, Exercise, Sets, Reps, kg, Duration (min), Burnt (kcal), Comment
- All sheets sorted oldest to newest by date

### 7. Excel Import Updates
- Supports both old "Calories" and new "Diet" sheet names
- Auto-detects column format (old vs new) by checking for "Protein (g)" header
- Backward compatible with old export files
- Maps old format to new format when importing

### 8. CSS Updates
- Added `.btn-template` styles (purple 3D button)
- Added modal styles (`.modal-overlay`, `.modal-content`)
- Added template checkbox styles
- Added `.diet-container` table column widths (9 columns)
- Updated `.fitness-container` table column widths (8 columns)
- Dark mode support for all new elements

## Files Modified
- `index.html` - Tab rename, table column updates, button addition
- `script.js` - Diet/Fitness functions, template loading, Excel export/import
- `styles.css` - New button, modal, and table column styles
- `templates.js` (NEW) - All day-specific templates

## Technical Notes
- Data is saved to localStorage under `diet` key (backward compatible with `calories`)
- Templates use JavaScript's `Date.getDay()` (0=Sunday, 6=Saturday)
- Modal prevents scroll when open, closes on Cancel or successful load
- Excel import handles both old and new format files automatically

## Usage
1. Select a date in the calendar
2. Click "Load Template" button
3. Select which templates to load (Timetable, Diet, Fitness)
4. Click "Load Template" in modal
5. Data is populated for that day based on day of week
