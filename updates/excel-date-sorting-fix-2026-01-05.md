# Excel Date and Sorting Fix - 2026-01-05

**Date:** January 5, 2026

## Issues Fixed

### 1. Excel Date Serial Number Calculation Bug
**Problem:** When saving to Excel, dates were being saved incorrectly. For example, January 5 was being saved as January 3 (2 days off).

**Root Cause:** The Excel date serial calculation was using local time instead of UTC, causing timezone-related inconsistencies. The original code:
```javascript
const excelDate = new Date(year, month - 1, day);
const excelDateSerial = (excelDate.getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000) + 2;
```

**Fix:** Changed to use UTC dates and the correct Excel epoch (December 30, 1899):
```javascript
const excelDate = Date.UTC(year, month - 1, day);
const excelEpoch = Date.UTC(1899, 11, 30); // Dec 30, 1899
const excelDateSerial = Math.round((excelDate - excelEpoch) / (24 * 60 * 60 * 1000));
```

### 2. Excel Import Date Parsing Fix
**Problem:** The import function also had the same timezone issue when parsing Excel date serial numbers.

**Fix:** Updated `parseExcelDate()` to use UTC consistently:
```javascript
const excelEpoch = Date.UTC(1899, 11, 30); // Dec 30, 1899
const dateMs = excelEpoch + Math.round(value) * 24 * 60 * 60 * 1000;
const date = new Date(dateMs);
return formatDateForStorage(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
```

### 3. Sheet Data Sorting (Oldest to Newest)
**Problem:** Data in Excel sheets was not sorted by date - entries appeared in the order they were logged rather than chronologically.

**Fix:** Added date sorting for all four sheets:
- **Timetable sheet:** Sorted `loggedDays` array before iteration
- **Diary sheet:** Sorted `Object.keys(appState.savedData)` before iteration
- **Calories sheet:** Sorted `Object.keys(appState.savedData)` before iteration
- **Fitness sheet:** Sorted `Object.keys(appState.savedData)` before iteration

All sheets now export data ordered from oldest date to newest date.

## Files Modified
- `script.js` - Lines 2163-2214 (export date calculation), Lines 2251-2299 (sheet sorting), Lines 2341-2357 (import date parsing)

## Technical Notes
- Excel uses a serial date system where day 1 = January 1, 1900
- Excel has a known leap year bug (it incorrectly treats 1900 as a leap year)
- The effective epoch is December 30, 1899 to account for this bug
- Using UTC prevents timezone-related date shifts during conversion
