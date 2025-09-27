# Timetable App

A simple productivity app for planning and tracking your daily schedule.

## Features

- **24-hour timetable** from 6:00 AM to 6:00 AM next day
- **4 columns**: Start Time, Duration (minutes), Task, Category
- **Smart time redistribution**: When you change any duration, time automatically redistributes among all rows
- **Add/Delete rows**: Insert or remove tasks anywhere in the schedule
- **Mini calendar**: Navigate months and years, click on calendar title for year view
- **Day logging**: Mark completed days in the calendar with a checkmark
- **Auto-save**: All data persists in browser local storage

## How to Use

1. **Open the app**: Open `index.html` in your web browser
2. **Fill your schedule**:
   - Enter tasks in the Task column
   - Set duration in minutes
   - Optionally add categories
3. **Manage rows**:
   - Click `+` to add a row after current one
   - Click `-` to delete a row
   - Use "Add Row" to add at the end
4. **Time adjustment**: When you change any duration, all start times automatically adjust
5. **Calendar navigation**:
   - Use `<` `>` arrows to navigate months
   - Click month/year title to access year view
   - Select specific years from dropdown
6. **Log your day**: Click "Log Day" when finished to mark the day as completed in the calendar

## Running the App

### Option 1: Direct File Access
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then visit http://localhost:8000
```

## Browser Compatibility

Works in all modern browsers. Requires JavaScript enabled.

## Data Storage

All data is stored locally in your browser's localStorage. No external server required.