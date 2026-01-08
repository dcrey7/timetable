# Fitness Type Column Update - 2026-01-05

**Date:** January 5, 2026

## Overview

Added a "Type" column to the Fitness table to distinguish between exercises and body measurements (like weigh-ins). The footer now calculates and displays the average body weight from rows with type "Body".

## Changes Made

### 1. HTML - Fitness Table Structure
- Added new `Type` column header between Exercise and Sets
- Updated footer to include `Avg: --` cell for average body weight
- Table now has 9 columns (was 8)

**New Column Order:**
Exercise | Type | Sets | Reps | kg | Duration | Burnt | Comment | Actions

### 2. JavaScript - script.js

**addFitnessRow() function:**
- Added Type dropdown with "Exercise" and "Body" options
- Added event listeners for both input and change events on select

**saveFitness() function:**
- Now saves `type` field to localStorage

**loadFitness() function:**
- Loads `type` field from saved data
- Backward compatible - defaults to "exercise" if no type saved

**updateFitnessStats() function:**
- Calculates average body weight from rows with type "body"
- Displays in footer: "Avg: X.X kg" or "Avg: --" if no body entries

**loadFitnessTemplate() function:**
- Updated to include Type dropdown in row creation
- Properly sets selected type based on template data

### 3. Excel Export Updates
- Fitness sheet header: Date, Exercise, Type, Sets, Reps, kg, Duration (min), Burnt (kcal), Comment
- Type column exports "exercise" or "body"

### 4. Excel Import Updates
- Auto-detects format by checking for "Type" header
- Backward compatible with previous format (defaults to "exercise")
- Supports three formats: newest (with Type), previous (without Type), and old (legacy columns)

### 5. CSS Updates (styles.css)
- Updated fitness table column widths for 9 columns
- Added centered text styling for fitness table
- Type column: 80px width

### 6. Templates (templates.js)
- All fitness templates now include `type` field
- "Weigh-in" entries have `type: 'body'`
- All other exercises have `type: 'exercise'`

## Files Modified
- `index.html` - Table structure, footer with avg weight cell
- `script.js` - All fitness-related functions
- `styles.css` - Column widths for 9-column layout
- `templates.js` - Added type field to all fitness templates

## Usage

1. When adding a fitness entry, select the Type:
   - **Exercise**: For workouts (default)
   - **Body**: For body measurements (weight, body fat, etc.)

2. For "Body" type rows, enter your body weight in the "kg" column

3. The footer will show the average of all "Body" type kg values:
   - `Avg: 80.0 kg` (if you have body entries)
   - `Avg: -- kg` (if no body entries)

## Backward Compatibility
- Old saved data without `type` field defaults to "exercise"
- Excel imports from previous versions work correctly
- No data migration needed
