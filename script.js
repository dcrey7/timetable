// Global variables
let rowCounter = 1;
let currentDate = new Date();
let selectedDate = new Date(); // The day selected in calendar
let loggedDays = [];
let savedTimetables = {}; // Store timetables by date: {"2025-09-27": [timetable_data]}
let startHour = 6;
let timeFormat = 12;
let userLocation = "New York, NY";

// Category system
const presetCategories = [
    { value: "sleeping", label: "😴 Sleeping", color: "#4A90E2" },
    { value: "eating", label: "🍽️ Eating", color: "#F5A623" },
    { value: "working", label: "💼 Working", color: "#D0021B" },
    { value: "chilling", label: "😎 Chilling", color: "#7ED321" },
    { value: "exercise", label: "🏃 Exercise", color: "#BD10E0" },
    { value: "learning", label: "📚 Learning", color: "#50E3C2" }
];
let customCategories = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setupEventListeners();
    generateCalendars();
    loadCustomCategories();
    loadData();
    loadTimetableForDate(); // Load timetable for current date
    setInterval(updateDateTime, 1000);
});

// Setup event listeners
function setupEventListeners() {
    // Year navigation
    document.getElementById('prevYear').addEventListener('click', () => changeYear(-1));
    document.getElementById('nextYear').addEventListener('click', () => changeYear(1));

    // Month navigation
    document.getElementById('monthUp').addEventListener('click', () => changeMonth(-1));
    document.getElementById('monthDown').addEventListener('click', () => changeMonth(1));

    // Year selector
    document.getElementById('yearSelect').addEventListener('change', function() {
        currentDate.setFullYear(parseInt(this.value));
        generateCalendars();
        hideYearSelector();
    });

    // Time controls
    document.getElementById('startTimeSelect').addEventListener('change', function() {
        startHour = parseInt(this.value);
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';
        createDefaultTimetable();
        updateRowButtons();
        saveData();
    });

    document.getElementById('timeFormatSelect').addEventListener('change', function() {
        timeFormat = parseInt(this.value);
        redistributeTime();
        updateDateTime();
        saveData();
    });

    // Log day button
    document.getElementById('logDayBtn').addEventListener('click', logDay);

    // Excel export/import buttons
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('importExcelBtn').addEventListener('click', () => {
        document.getElementById('excelFileInput').click();
    });
    document.getElementById('excelFileInput').addEventListener('change', importFromExcel);

    // Duration inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('duration')) {
            redistributeTime();
        }
    });
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    let timeString;
    if (timeFormat === 12) {
        timeString = now.toLocaleTimeString('en-US', { hour12: true });
    } else {
        timeString = now.toTimeString().slice(0, 8);
    }

    document.getElementById('currentDateTime').textContent =
        ` Today is ${dayName} ${day} ${monthName} ${year} ${timeString} - ${userLocation}`;
}

// Year navigation functions
function changeYear(direction) {
    currentDate.setFullYear(currentDate.getFullYear() + direction);
    generateCalendars();
    updateDateDisplay();
    saveData();
}

// Month navigation functions
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendars();
    updateDateDisplay();
    saveData();
}

// Month selector functions
function toggleMonthSelector() {
    const selector = document.getElementById('monthSelector');
    if (selector.style.display === 'none') {
        showMonthSelector();
    } else {
        hideMonthSelector();
    }
}

function showMonthSelector() {
    // Close year selector if open
    hideYearSelector();

    const selector = document.getElementById('monthSelector');
    const grid = document.getElementById('monthGrid');
    const monthElement = document.getElementById('currentMonthDisplay');

    grid.innerHTML = '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    months.forEach((month, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-option';
        monthDiv.textContent = month.substring(0, 3);

        if (index === currentDate.getMonth()) {
            monthDiv.classList.add('current');
        }

        monthDiv.addEventListener('click', () => {
            currentDate.setMonth(index);
            generateCalendars();
            updateDateDisplay();
            hideMonthSelector();
            saveData();
        });

        grid.appendChild(monthDiv);
    });

    // Position popup centered on the month element
    const rect = monthElement.getBoundingClientRect();
    const containerRect = monthElement.closest('.left-panel').getBoundingClientRect();

    selector.style.position = 'absolute';
    selector.style.left = (rect.left - containerRect.left - 20) + 'px'; // Center it
    selector.style.top = (rect.bottom - containerRect.top + 5) + 'px';
    selector.style.display = 'block';
}

function hideMonthSelector() {
    document.getElementById('monthSelector').style.display = 'none';
}

// Year selector functions
function toggleYearSelector() {
    const selector = document.getElementById('yearSelectorPopup');
    if (selector.style.display === 'none') {
        showYearSelector();
    } else {
        hideYearSelector();
    }
}

function showYearSelector() {
    // Close month selector if open
    hideMonthSelector();

    const selector = document.getElementById('yearSelectorPopup');
    const select = document.getElementById('yearSelect');
    const yearElement = document.getElementById('currentYear');

    select.innerHTML = '';
    const currentYear = currentDate.getFullYear();

    for (let year = 1900; year <= 2100; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        select.appendChild(option);
    }

    // Position popup centered on the year element
    const rect = yearElement.getBoundingClientRect();
    const containerRect = yearElement.closest('.left-panel').getBoundingClientRect();

    selector.style.position = 'absolute';
    selector.style.left = (rect.left - containerRect.left - 50) + 'px'; // Center it
    selector.style.top = (rect.bottom - containerRect.top + 5) + 'px';
    selector.style.display = 'block';
}

function hideYearSelector() {
    document.getElementById('yearSelectorPopup').style.display = 'none';
}

// Update date display
function updateDateDisplay() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const currentYear = currentDate.getFullYear();
    const currentMonth = months[currentDate.getMonth()];

    // Update year navigation
    const yearSpans = document.querySelectorAll('.year-nav span');
    yearSpans[0].textContent = currentYear - 1;
    yearSpans[1].textContent = currentYear;
    yearSpans[2].textContent = currentYear + 1;

    // Update month display
    document.getElementById('currentMonthDisplay').textContent = `${currentMonth} ${currentYear}`;
}

// Generate all calendars
function generateCalendars() {
    updateDateDisplay();
    generateMonthCalendar('prev', -1);
    generateMonthCalendar('current', 0);
    generateMonthCalendar('next', 1);
}

function generateMonthCalendar(type, monthOffset) {
    const targetDate = new Date(currentDate);
    targetDate.setMonth(targetDate.getMonth() + monthOffset);

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    // Skip title update since we removed month titles

    // Generate calendar
    let calendarElement;
    if (type === 'current') {
        calendarElement = document.querySelector('#currentCalendar');
    } else {
        calendarElement = document.querySelector(`#${type}Calendar`);
    }
    calendarElement.innerHTML = '';

    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendarElement.appendChild(dayHeader);
    });

    // Generate days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, year, month - 1, true);
        calendarElement.appendChild(dayElement);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = (today.getFullYear() === year &&
                        today.getMonth() === month &&
                        today.getDate() === day);
        const dayElement = createDayElement(day, year, month, false, isToday);
        calendarElement.appendChild(dayElement);
    }

    // Next month days
    const totalCells = calendarElement.children.length - 7;
    const remainingCells = 35 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, year, month + 1, true);
        calendarElement.appendChild(dayElement);
    }
}

function createDayElement(day, year, month, isOtherMonth, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    if (isToday) {
        dayElement.classList.add('today');
    }

    // Check if selected
    if (selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === day) {
        dayElement.classList.add('selected');
    }

    // Check if logged
    const dateStr = formatDateForStorage(year, month, day);
    if (loggedDays.includes(dateStr)) {
        dayElement.classList.add('logged');
    }

    // Add click handler
    dayElement.addEventListener('click', () => {
        selectedDate = new Date(year, month, day);
        generateCalendars(); // Refresh to show selection
        loadTimetableForDate(); // Load existing or create new
    });

    return dayElement;
}

// Load timetable for selected date or create new 3-row template
function loadTimetableForDate() {
    // Update the date display to show selected date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const monthName = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();

    // Update the working date display
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    if (selectedDateDisplay) {
        selectedDateDisplay.textContent = `${dayName} ${day} ${monthName} ${year}`;
    }

    // Get date string for storage
    const dateStr = formatDateForStorage(year, months.indexOf(monthName), day);

    // Check if this date has saved timetable data
    if (savedTimetables[dateStr]) {
        // Load existing timetable
        loadTimetableData(savedTimetables[dateStr]);
    } else {
        // Create fresh 3-row template
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';
        createDefaultTimetable();
    }

    console.log(`Loaded timetable for: ${dayName} ${day} ${monthName} ${year}`);
}

// Timetable functions
function addRow(afterRowId) {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');
    const targetRow = tbody.querySelector(`tr[data-row-id="${afterRowId}"]`);

    const newRow = createTableRow(rowCounter++);

    if (targetRow.nextElementSibling) {
        tbody.insertBefore(newRow, targetRow.nextElementSibling);
    } else {
        tbody.appendChild(newRow);
    }

    redistributeTime();
    updateRowButtons();
    saveData();
}

function deleteRow(rowId) {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length <= 3) {
        alert('Cannot delete row. Minimum 3 rows required (Start, Sleep, End).');
        return;
    }

    const rowToDelete = tbody.querySelector(`tr[data-row-id="${rowId}"]`);
    if (rowToDelete) {
        const rowIndex = Array.from(rows).indexOf(rowToDelete);
        const task = rowToDelete.querySelector('.task');
        const taskValue = task ? task.value : '';

        // Don't allow deleting core rows (Start, Sleep, End)
        const isStartRow = rowIndex === 0 || taskValue === 'Start';
        const isEndRow = rowIndex === rows.length - 1 || taskValue === 'Day End';
        const isSleepRow = taskValue === 'Sleep' || (rows.length === 3 && rowIndex === 1);

        if (isStartRow) {
            alert('Cannot delete the Start row.');
            return;
        }
        if (isSleepRow) {
            alert('Cannot delete the Sleep row (buffer).');
            return;
        }
        if (isEndRow) {
            alert('Cannot delete the End row.');
            return;
        }

        rowToDelete.remove();
        redistributeTime();
        updateRowButtons();
        saveData();
    }
}

function createTableRow(id) {
    const row = document.createElement('tr');
    row.dataset.rowId = id;

    row.innerHTML = `
        <td class="start-time">${formatTime(startHour * 60)}</td>
        <td><input type="number" class="duration" value="1.0" min="0.01" step="0.01"></td>
        <td><input type="text" class="task" placeholder="Enter task"></td>
        <td class="category-cell">
            <div class="category-container">
                <select class="category-select">
                    <option value="">Select category...</option>
                </select>
                <input type="text" class="category-custom" placeholder="Or type custom..." style="display: none;">
            </div>
        </td>
        <td class="row-actions">
            <button class="add-btn" onclick="addRow(${id})">+</button>
            <button class="delete-btn" onclick="deleteRow(${id})">-</button>
        </td>
    `;

    // Add event listeners
    const durationInput = row.querySelector('.duration');
    const taskInput = row.querySelector('.task');
    const categorySelect = row.querySelector('.category-select');
    const categoryCustom = row.querySelector('.category-custom');

    durationInput.addEventListener('input', redistributeTime);
    taskInput.addEventListener('input', saveData);

    // Setup category system
    setupCategorySystem(categorySelect, categoryCustom);

    return row;
}

// Category system functions
function setupCategorySystem(selectElement, customElement) {
    // Populate preset categories
    populateCategories(selectElement);

    // Handle category selection
    selectElement.addEventListener('change', function() {
        if (this.value === 'custom') {
            // Show custom input
            customElement.style.display = 'block';
            selectElement.style.display = 'none';
            customElement.focus();
        } else {
            // Update the styling based on category
            updateCategoryDisplay(this, this.value);
            saveData();
        }
    });

    // Handle custom category input
    customElement.addEventListener('blur', function() {
        if (this.value.trim()) {
            // Add to custom categories if new
            const customValue = this.value.trim().toLowerCase();
            if (!customCategories.some(cat => cat.value === customValue)) {
                customCategories.push({
                    value: customValue,
                    label: this.value.trim(),
                    color: "#666666"
                });
                saveCustomCategories();
            }

            // Select the custom category
            populateCategories(selectElement);
            selectElement.value = customValue;
            updateCategoryDisplay(selectElement, customValue);
        }

        // Hide custom input and show select
        customElement.style.display = 'none';
        selectElement.style.display = 'block';
        saveData();
    });

    customElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
}

function populateCategories(selectElement) {
    // Clear existing options except the first one
    selectElement.innerHTML = '<option value="">Select category...</option>';

    // Add preset categories
    presetCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        option.style.color = category.color;
        selectElement.appendChild(option);
    });

    // Add custom categories
    customCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        option.style.color = category.color;
        selectElement.appendChild(option);
    });

    // Add "Add custom..." option
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '+ Add custom category...';
    customOption.style.fontStyle = 'italic';
    selectElement.appendChild(customOption);
}

function updateCategoryDisplay(selectElement, value) {
    const allCategories = [...presetCategories, ...customCategories];
    const category = allCategories.find(cat => cat.value === value);

    if (category) {
        selectElement.style.backgroundColor = category.color + '20'; // 20% opacity
        selectElement.style.borderColor = category.color;
        selectElement.style.color = category.color;
        selectElement.style.fontWeight = 'bold';
    } else {
        selectElement.style.backgroundColor = '';
        selectElement.style.borderColor = '';
        selectElement.style.color = '';
        selectElement.style.fontWeight = '';
    }
}

function saveCustomCategories() {
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
}

function loadCustomCategories() {
    const saved = localStorage.getItem('customCategories');
    if (saved) {
        customCategories = JSON.parse(saved);
    }
}

function updateRowButtons() {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length < 3) return; // Need at least 3 rows

    rows.forEach((row, index) => {
        const addBtn = row.querySelector('.add-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        // Identify row type by position and buffer flag
        const isStartRow = index === 0;
        const isEndRow = index === rows.length - 1;

        // Check for buffer flag in the row data
        const rowId = row.getAttribute('data-row-id');
        const currentDateStr = formatDateForStorage(currentYear, months.indexOf(monthName), selectedDay);
        let isBufferRow = false;

        if (savedTimetables[currentDateStr]) {
            const rowData = savedTimetables[currentDateStr].find(data => data.id == rowId);
            isBufferRow = rowData && rowData.isBuffer;
        }

        if (isStartRow) {
            // First row: + only (no -)
            addBtn.style.display = 'inline';
            deleteBtn.style.display = 'none';
        } else if (isBufferRow) {
            // Buffer row: + only (no -)
            addBtn.style.display = 'inline';
            deleteBtn.style.display = 'none';
        } else if (isEndRow) {
            // Last row: NOTHING (no + or -)
            addBtn.style.display = 'none';
            deleteBtn.style.display = 'none';
        } else {
            // All other rows: both + and -
            addBtn.style.display = 'inline';
            deleteBtn.style.display = 'inline';
        }
    });
}

// Time redistribution algorithm with fixed end row
function redistributeTime() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (rows.length === 0) return;

    const startTime = startHour * 60; // Start time in minutes
    const totalMinutes = 24 * 60; // 24 hours in minutes
    const endRowDurationMinutes = 1; // Last row is always 1 minute

    // Handle case with only 1 row (shouldn't happen, but safety check)
    if (rows.length === 1) {
        const row = rows[0];
        row.querySelector('.duration').value = (totalMinutes / 60).toFixed(2);
        row.querySelector('.start-time').textContent = formatTime(startTime);
        row.querySelector('.task').value = 'Full Day';
        makeRowNonEditable(row, false); // Not the end row
        saveData();
        return;
    }

    // Fix the last row
    const lastRow = rows[rows.length - 1];
    const lastRowDurationHours = endRowDurationMinutes / 60;
    lastRow.querySelector('.duration').value = lastRowDurationHours.toFixed(2);
    lastRow.querySelector('.task').value = 'Day End';
    makeRowNonEditable(lastRow, true); // This is the end row

    // Smart auto-adjustment: Only adjust buffer row (second-to-last)
    const availableMinutes = totalMinutes - endRowDurationMinutes;

    if (rows.length === 2) {
        // Only start row and end row - adjust start row to fill remaining time
        const startRow = rows[0];
        startRow.querySelector('.duration').value = (availableMinutes / 60).toFixed(2);
        makeRowNonEditable(startRow, false);
    } else {
        // Multiple rows: use smart adjustment with buffer row
        const bufferRowIndex = rows.length - 2; // Second-to-last row
        const bufferRow = rows[bufferRowIndex];
        const fixedRows = rows.slice(0, -2); // All rows except buffer and end

        // Calculate total time used by fixed rows
        let fixedTotal = 0;
        fixedRows.forEach(row => {
            const durationHours = parseFloat(row.querySelector('.duration').value) || 0;
            fixedTotal += durationHours * 60; // Convert to minutes
        });

        // Calculate required buffer duration
        const requiredBufferMinutes = availableMinutes - fixedTotal;
        const requiredBufferHours = requiredBufferMinutes / 60;

        // Check if buffer duration is valid (at least 0.1 hours)
        if (requiredBufferHours >= 0.1) {
            // Set buffer row duration
            bufferRow.querySelector('.duration').value = requiredBufferHours.toFixed(2);

            // Mark buffer row visually (add a class for styling)
            bufferRow.classList.add('buffer-row');

            // Ensure other rows are not marked as buffer
            fixedRows.forEach(row => {
                row.classList.remove('buffer-row');
                makeRowNonEditable(row, false);
            });
        } else {
            // Fallback: buffer would be too small, distribute proportionally
            const allAdjustableRows = rows.slice(0, -1);
            let adjustableTotal = 0;
            const adjustableDurations = [];

            allAdjustableRows.forEach(row => {
                const durationHours = parseFloat(row.querySelector('.duration').value) || 0;
                adjustableDurations.push(durationHours);
                adjustableTotal += durationHours * 60;
            });

            if (adjustableTotal <= 0) {
                // Equal distribution
                const equalDurationHours = (availableMinutes / 60) / allAdjustableRows.length;
                allAdjustableRows.forEach(row => {
                    row.querySelector('.duration').value = equalDurationHours.toFixed(2);
                    row.classList.remove('buffer-row');
                });
            } else {
                // Proportional distribution
                const ratio = availableMinutes / adjustableTotal;
                allAdjustableRows.forEach((row, index) => {
                    const newDurationHours = (adjustableDurations[index] * ratio);
                    row.querySelector('.duration').value = newDurationHours.toFixed(2);
                    row.classList.remove('buffer-row');
                });
            }
        }
    }

    // Update start times for all rows
    let currentTimeMinutes = startTime;
    rows.forEach((row, index) => {
        const durationHours = parseFloat(row.querySelector('.duration').value) || 0;
        const durationMinutes = durationHours * 60;

        const startTimeCell = row.querySelector('.start-time');
        startTimeCell.textContent = formatTime(currentTimeMinutes);

        // For the last row, ensure it ends exactly at start time (next day)
        if (index === rows.length - 1) {
            // Last row should start at (startTime - 1 minute)
            const endRowStartTime = (startTime - endRowDurationMinutes + totalMinutes) % totalMinutes;
            startTimeCell.textContent = formatTime(endRowStartTime);
        }

        currentTimeMinutes += durationMinutes;
    });

    // Apply special styling to rows
    updateRowStyling();

    saveData();
}

// Function to update row styling (Start/End bold, max duration orange)
function updateRowStyling() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (rows.length === 0) return;

    // Find row with maximum duration
    let maxDuration = 0;
    let maxDurationRowIndex = -1;

    rows.forEach((row, index) => {
        const durationInput = row.querySelector('.duration');
        const taskInput = row.querySelector('.task');
        const duration = parseFloat(durationInput.value) || 0;

        // Reset previous styling
        taskInput.style.fontWeight = '';
        taskInput.style.color = '';
        durationInput.style.color = '';
        durationInput.style.fontWeight = '';

        // Check for maximum duration (excluding Day End row)
        if (duration > maxDuration && taskInput.value !== 'Day End') {
            maxDuration = duration;
            maxDurationRowIndex = index;
        }

        // Style Start and End rows
        if (taskInput.value === 'Start' || taskInput.value === 'Day End') {
            taskInput.style.fontWeight = 'bold';
        }
    });

    // Style the row with maximum duration
    if (maxDurationRowIndex >= 0) {
        const maxRow = rows[maxDurationRowIndex];
        const maxDurationInput = maxRow.querySelector('.duration');
        const maxTaskInput = maxRow.querySelector('.task');

        maxDurationInput.style.color = '#ff8c00';
        maxDurationInput.style.fontWeight = 'bold';
        maxTaskInput.style.color = '#ff8c00';
        maxTaskInput.style.fontWeight = 'bold';
    }
}

// Helper function to make row non-editable
function makeRowNonEditable(row, isEndRow) {
    const durationInput = row.querySelector('.duration');
    const taskInput = row.querySelector('.task');
    const categorySelect = row.querySelector('.category-select');

    if (isEndRow) {
        // End row: make non-editable but look normal, only bold task
        durationInput.readOnly = true;
        durationInput.style.backgroundColor = 'transparent';
        durationInput.style.border = 'none';
        durationInput.style.color = 'inherit';
        durationInput.style.pointerEvents = 'none';

        taskInput.readOnly = true;
        taskInput.style.backgroundColor = 'transparent';
        taskInput.style.border = 'none';
        taskInput.style.color = 'inherit';
        taskInput.style.fontWeight = 'bold';
        taskInput.style.pointerEvents = 'none';

        if (categorySelect) {
            categorySelect.disabled = true;
            categorySelect.style.backgroundColor = 'transparent';
            categorySelect.style.border = 'none';
            categorySelect.style.color = 'inherit';
            categorySelect.style.pointerEvents = 'none';
        }
    } else {
        // Regular row: make sure it's editable
        durationInput.readOnly = false;
        durationInput.style.backgroundColor = '';
        durationInput.style.border = '';
        durationInput.style.color = '';
        durationInput.style.pointerEvents = '';

        taskInput.readOnly = false;
        taskInput.style.backgroundColor = '';
        taskInput.style.border = '';
        taskInput.style.color = '';
        taskInput.style.pointerEvents = '';

        if (categorySelect) {
            categorySelect.disabled = false;
            categorySelect.style.backgroundColor = '';
            categorySelect.style.border = '';
            categorySelect.style.color = '';
            categorySelect.style.pointerEvents = '';
        }
    }
}

// Format time from minutes
function formatTime(minutes) {
    // Round to nearest minute to avoid floating point precision issues
    const roundedMinutes = Math.round(minutes);
    const hours = Math.floor(roundedMinutes / 60) % 24;
    const mins = roundedMinutes % 60;

    if (timeFormat === 12) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    } else {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
}

// Clear timetable
// Clear only the current day's table
function clearCurrentTable() {
    if (confirm('Are you sure you want to clear the current day\'s timetable?')) {
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';

        // Add default 24-hour schedule
        createDefaultTimetable();
        updateRowButtons();
        saveData();
    }
}

// Clear all stored data including all logged days
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL timetable data? This will remove all logged days and cannot be undone.')) {
        // Clear localStorage
        localStorage.removeItem('savedTimetables');
        localStorage.removeItem('loggedDays');

        // Reset in-memory variables
        savedTimetables = {};
        loggedDays = [];

        // Clear current table
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';

        // Add default timetable
        createDefaultTimetable();
        updateRowButtons();

        // Update calendar display to remove green highlighting
        generateCalendars();

        alert('All timetable data has been cleared.');
    }
}

// Create default timetable with exactly 2 rows: start and end
function createDefaultTimetable() {
    const tbody = document.getElementById('timetableBody');

    // Create start row (1 minute)
    const startRow = createTableRow(0);
    startRow.querySelector('.duration').value = (1/60).toFixed(2); // 0.02 hours (1 minute)
    startRow.querySelector('.task').value = 'Start';
    tbody.appendChild(startRow);

    // Create sleep row (23.98 hours) - this is the buffer row
    const sleepRow = createTableRow(1);
    sleepRow.querySelector('.duration').value = (23 + 59/60).toFixed(2); // 23.98 hours
    sleepRow.querySelector('.task').value = 'Sleep';
    // Set sleeping category
    const sleepCategorySelect = sleepRow.querySelector('.category-select');
    if (sleepCategorySelect) {
        sleepCategorySelect.value = 'sleeping';
        updateCategoryDisplay(sleepCategorySelect, 'sleeping');
    }
    tbody.appendChild(sleepRow);

    // Create end row (1 minute)
    const endRow = createTableRow(2);
    endRow.querySelector('.duration').value = (1/60).toFixed(2); // 0.02 hours (1 minute)
    endRow.querySelector('.task').value = 'Day End';
    tbody.appendChild(endRow);

    rowCounter = 3;
    redistributeTime();
    updateRowButtons();
}

// Log day functionality
function logDay() {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('No timetable entries to log');
        return;
    }

    const dateStr = formatDateForStorage(selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate());

    // Save current timetable for this date
    savedTimetables[dateStr] = getTimetableData();

    if (!loggedDays.includes(dateStr)) {
        loggedDays.push(dateStr);
    }

    saveData();
    generateCalendars(); // Refresh to show logged day

    // Auto-export to Excel when logging
    exportToExcel();

    alert('Day logged successfully and exported to Excel!');
}

// Data persistence
function saveData() {
    const data = {
        savedTimetables: savedTimetables,
        loggedDays: loggedDays,
        rowCounter: rowCounter,
        startHour: startHour,
        timeFormat: timeFormat,
        userLocation: userLocation,
        selectedDate: selectedDate.toISOString(),
        customCategories: customCategories
    };
    localStorage.setItem('timetableData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('timetableData');
    if (savedData) {
        const data = JSON.parse(savedData);

        // Load multi-day data
        savedTimetables = data.savedTimetables || {};
        loggedDays = data.loggedDays || [];
        rowCounter = data.rowCounter || 1;
        startHour = data.startHour || 6;
        timeFormat = data.timeFormat || 12;
        userLocation = data.userLocation || "New York, NY";
        customCategories = data.customCategories || [];

        if (data.selectedDate) {
            selectedDate = new Date(data.selectedDate);
        }

        // Update selectors
        document.getElementById('startTimeSelect').value = startHour;
        document.getElementById('timeFormatSelect').value = timeFormat;

        // Don't automatically load timetable here - loadTimetableForDate will handle it
        updateRowButtons();
    } else {
        // Fresh start - no saved data
        savedTimetables = {};
        loggedDays = [];
        customCategories = [];
        updateRowButtons();
    }
}

function getTimetableData() {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');
    const data = [];

    rows.forEach(row => {
        const categorySelect = row.querySelector('.category-select');
        const categoryValue = categorySelect ? categorySelect.value : '';

        data.push({
            id: row.dataset.rowId,
            duration: row.querySelector('.duration').value,
            task: row.querySelector('.task').value,
            category: categoryValue
        });
    });

    return data;
}

function loadTimetableData(data) {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    data.forEach(rowData => {
        const row = createTableRow(rowData.id);
        row.querySelector('.duration').value = rowData.duration;
        row.querySelector('.task').value = rowData.task;

        // Set category value if it exists
        const categorySelect = row.querySelector('.category-select');
        if (categorySelect && rowData.category) {
            categorySelect.value = rowData.category;
            updateCategoryDisplay(categorySelect, rowData.category);
        }

        tbody.appendChild(row);
    });

    redistributeTime();
}

// Utility function for date formatting
function formatDateForStorage(year, month, day) {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Excel Export/Import Functions
function exportToExcel() {
    if (loggedDays.length === 0) {
        alert('No logged days to export');
        return;
    }

    // Prepare data for Excel
    const excelData = [];

    // Add header row
    excelData.push([
        'Date',
        'Start Time',
        'End Time',
        'Duration (hrs)',
        'Task',
        'Category',
        'Is Buffer'
    ]);

    // Process each logged day
    loggedDays.forEach(dateStr => {
        const timetableData = savedTimetables[dateStr];
        if (!timetableData) return;

        // Process each row for this date
        let currentTimeMinutes = startHour * 60;

        timetableData.forEach((rowData) => {
            const durationHours = parseFloat(rowData.duration) || 0;
            const durationMinutes = durationHours * 60;
            const task = rowData.task || '';

            // Get category label
            let categoryLabel = '';
            if (rowData.category) {
                const allCategories = [...presetCategories, ...customCategories];
                const category = allCategories.find(cat => cat.value === rowData.category);
                categoryLabel = category ? category.label : rowData.category;
            }

            // Calculate end time
            const endTimeMinutes = currentTimeMinutes + durationMinutes;

            // Convert to Excel time format (decimal fraction of a day)
            const startTimeExcel = (currentTimeMinutes % (24 * 60)) / (24 * 60);
            const endTimeExcel = (endTimeMinutes % (24 * 60)) / (24 * 60);

            // Convert date to Excel date format
            const [year, month, day] = dateStr.split('-').map(Number);
            const excelDate = new Date(year, month - 1, day);
            const excelDateSerial = (excelDate.getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000) + 2;

            excelData.push([
                excelDateSerial,
                startTimeExcel,
                endTimeExcel,
                durationHours.toFixed(2),
                task,
                categoryLabel,
                rowData.isBuffer || false
            ]);

            currentTimeMinutes = endTimeMinutes;
        });
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths and formats
    worksheet['!cols'] = [
        { width: 12 }, // Date
        { width: 12 }, // Start Time
        { width: 12 }, // End Time
        { width: 15 }, // Duration
        { width: 30 }, // Task
        { width: 15 }  // Category
    ];

    // Apply Excel formatting to date and time columns
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let row = 1; row <= range.e.r; row++) { // Skip header row
        // Date column (A) - Excel date format
        const dateCell = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (worksheet[dateCell]) {
            worksheet[dateCell].z = 'yyyy-mm-dd';
        }

        // Start Time column (B) - Excel time format
        const startTimeCell = XLSX.utils.encode_cell({ r: row, c: 1 });
        if (worksheet[startTimeCell]) {
            worksheet[startTimeCell].z = 'hh:mm';
        }

        // End Time column (C) - Excel time format
        const endTimeCell = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (worksheet[endTimeCell]) {
            worksheet[endTimeCell].z = 'hh:mm';
        }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

    // Generate filename with current date
    const today = new Date();
    const todayStr = formatDateForStorage(today.getFullYear(), today.getMonth(), today.getDate());
    const filename = `Timetable_All_Days_${todayStr}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);

    alert(`Timetable exported to ${filename}`);
}

function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Parse Excel file
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first worksheet
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            // Convert to array of arrays
            const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (excelData.length < 2) {
                alert('Invalid Excel format: No data rows found');
                return;
            }

            // Helper function to convert Excel date to our format
            function parseExcelDate(value) {
                if (typeof value === 'number') {
                    // Excel date serial number
                    const excelEpoch = new Date(1900, 0, 1);
                    const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
                    return formatDateForStorage(date.getFullYear(), date.getMonth(), date.getDate());
                } else if (typeof value === 'string') {
                    // Try to parse string date
                    if (value.includes('-') && value.length >= 8) {
                        // Format like "2024-09-27"
                        return value;
                    }
                    // Try to parse other date formats
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return formatDateForStorage(date.getFullYear(), date.getMonth(), date.getDate());
                    }
                }
                return null;
            }

            // Group data by date
            const dataByDate = {};
            const importedDates = new Set();

            // Process data rows (skip header)
            const dataRows = excelData.slice(1);

            dataRows.forEach((rowData) => {
                if (rowData.length >= 7) { // Need all columns: Date, Start, End, Duration, Task, Category, Is Buffer
                    const dateStr = parseExcelDate(rowData[0]);
                    if (dateStr) {
                        if (!dataByDate[dateStr]) {
                            dataByDate[dateStr] = [];
                        }

                        // Get category value from label
                        const categoryLabel = rowData[5] || '';
                        let categoryValue = '';
                        if (categoryLabel) {
                            const allCategories = [...presetCategories, ...customCategories];
                            const category = allCategories.find(cat =>
                                cat.label === categoryLabel ||
                                cat.label.toLowerCase().includes(categoryLabel.toLowerCase())
                            );

                            if (category) {
                                categoryValue = category.value;
                            } else {
                                // Add as custom category if new
                                const customValue = categoryLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
                                if (customValue && !customCategories.some(cat => cat.value === customValue)) {
                                    customCategories.push({
                                        value: customValue,
                                        label: categoryLabel,
                                        color: "#666666"
                                    });
                                    saveCustomCategories();
                                }
                                categoryValue = customValue;
                            }
                        }

                        // Get buffer status from Excel
                        const isBuffer = rowData[6] === true || rowData[6] === 'true' || rowData[6] === 'TRUE';

                        dataByDate[dateStr].push({
                            duration: (parseFloat(rowData[3]) || 0).toFixed(2),
                            task: rowData[4] || '',
                            category: categoryValue,
                            isBuffer: isBuffer
                        });

                        importedDates.add(dateStr);
                    }
                }
            });

            // Process ALL dates from Excel and save them
            Object.keys(dataByDate).forEach(dateStr => {
                const importedRows = dataByDate[dateStr];

                // Filter out ONLY Start and Day End rows - keep everything else AS-IS from Excel
                const activityRows = importedRows.filter(row =>
                    row.task !== 'Start' && row.task !== 'Day End'
                );

                // Build timetable structure preserving Excel format exactly
                const properTimetable = [];
                let currentRowId = 0;

                // 1. Always start with "Start" row (1 minute)
                properTimetable.push({
                    id: currentRowId++,
                    duration: (1/60).toFixed(2), // 0.02 hours (1 minute)
                    task: 'Start',
                    category: '',
                    isBuffer: false
                });

                // 2. Add ALL rows from Excel (including buffers) with proper IDs and buffer flags
                activityRows.forEach(row => {
                    properTimetable.push({
                        id: currentRowId++,
                        duration: row.duration,
                        task: row.task,
                        category: row.category,
                        isBuffer: row.isBuffer || false
                    });
                });

                // 3. Always end with "Day End" row (1 minute)
                properTimetable.push({
                    id: currentRowId++,
                    duration: (1/60).toFixed(2), // 0.02 hours (1 minute)
                    task: 'Day End',
                    category: '',
                    isBuffer: false
                });

                // Save the properly structured timetable
                savedTimetables[dateStr] = properTimetable;

                // Add to loggedDays if not already there
                if (!loggedDays.includes(dateStr)) {
                    loggedDays.push(dateStr);
                }
            });

            // Load current selected date's data if it was imported
            const currentDateStr = formatDateForStorage(currentYear, months.indexOf(monthName), selectedDay);
            if (savedTimetables[currentDateStr]) {
                const tbody = document.getElementById('timetableBody');
                tbody.innerHTML = '';
                loadTimetableData(savedTimetables[currentDateStr]);
            }

            alert(`Successfully imported ${Object.keys(dataByDate).length} days of timetable data. Calendar dates have been marked green.`);

            // Save to localStorage
            localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables));
            localStorage.setItem('loggedDays', JSON.stringify(loggedDays));

            // Refresh calendar to show green dates
            generateCalendars();

        } catch (error) {
            console.error('Error importing Excel file:', error);
            alert('Error importing Excel file. Please check the format and try again.');
        }

        // Reset file input
        event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
}