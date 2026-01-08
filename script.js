// =============================================================================
// PRODUCTIVITY APP - Timetable, Diary, Calories, Fitness Tracker
// =============================================================================

// =============================================================================
// CONFIGURATION & CONSTANTS
// =============================================================================
const CONFIG = {
    STORAGE_KEY: 'productivityAppData',
    MIN_DURATION: 0.01,          // 36 seconds minimum
    FIXED_ROW_DURATION: 1/60,    // 1 minute for start/end rows
    DEFAULT_START_HOUR: 6,
    DEFAULT_TIME_FORMAT: 12,
    DEFAULT_LOCATION: "New York, NY"
};


const PRESET_CATEGORIES = [
    { value: "sleeping", label: "Sleeping", color: "#4A90E2" },
    { value: "eating", label: "Eating", color: "#F5A623" },
    { value: "working", label: "Working", color: "#D0021B" },
    { value: "chilling", label: "Chilling", color: "#7ED321" },
    { value: "exercise", label: "Exercise", color: "#BD10E0" },
    { value: "learning", label: "Learning", color: "#50E3C2" },
    { value: "personal", label: "Personal", color: "#9B59B6" }
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// =============================================================================
// GLOBAL STATE
// =============================================================================
let appState = {
    rowCounter: 1,
    currentDate: new Date(),
    selectedDate: new Date(),
    loggedDays: [],
    savedData: {},           // Unified storage: { "2025-01-05": { timetable: [], diary: "", calories: {}, fitness: [] } }
    startHour: CONFIG.DEFAULT_START_HOUR,
    timeFormat: CONFIG.DEFAULT_TIME_FORMAT,
    userLocation: CONFIG.DEFAULT_LOCATION,
    customCategories: [],
    activeTab: 'timetable',
    calendarView: 'year'     // 'year' or 'month' - starts with year view (Apple Calendar style)
};

// Legacy support - keep these for backward compatibility during migration
let savedTimetables = {};
let loggedDays = [];
let customCategories = [];
let rowCounter = 1;
let currentDate = new Date();
let selectedDate = new Date();
let startHour = CONFIG.DEFAULT_START_HOUR;
let timeFormat = CONFIG.DEFAULT_TIME_FORMAT;
let userLocation = CONFIG.DEFAULT_LOCATION;
let userCoords = null; // { lat, lon } for weather API
let currentWeather = null; // { temp, description, icon }

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Format time from minutes to display string
function formatTime(minutes) {
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

// Format date for storage key
function formatDateForStorage(year, month, day) {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Get current date string
function getCurrentDateStr() {
    return formatDateForStorage(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
}

// =============================================================================
// ROW TYPE IDENTIFICATION (Simplified)
// =============================================================================

// New simplified system:
// - Last row is always the auto-fill "Sleep" row (can't be deleted)
// - All other rows are activities (can be added/deleted freely)
// - No more Start/End fixed rows

function getRowType(row, rowIndex, totalRows) {
    // Last row is always the auto-fill sleep row
    if (rowIndex === totalRows - 1) return 'autofill';
    return 'activity';
}

function isAutoFillRow(row, rowIndex, totalRows) {
    return getRowType(row, rowIndex, totalRows) === 'autofill';
}

function isActivityRow(row, rowIndex, totalRows) {
    return getRowType(row, rowIndex, totalRows) === 'activity';
}

function findAutoFillRow(rows) {
    // Last row is always the auto-fill row
    return rows[rows.length - 1];
}

// =============================================================================
// DURATION VALIDATION (Simplified)
// =============================================================================

// Calculate total activity duration (excluding auto-fill row)
function getTotalActivityDuration() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    let total = 0;

    rows.forEach((row, index) => {
        // Skip the last row (auto-fill)
        if (index < rows.length - 1) {
            total += parseFloat(row.querySelector('.duration')?.value) || 0;
        }
    });

    return total;
}

// Update the footer with total and status
function updateTimetableFooter() {
    const total = getTotalActivityDuration();
    const remaining = 24 - total;

    const totalEl = document.getElementById('totalDuration');
    const statusEl = document.getElementById('durationStatus');

    if (totalEl) {
        totalEl.innerHTML = `<strong>${total.toFixed(1)} hrs</strong>`;
    }

    if (statusEl) {
        if (total > 24) {
            statusEl.innerHTML = `<span style="color: #ff4b4b; font-weight: 600;">Over by ${(total - 24).toFixed(1)} hrs - please reduce activities</span>`;
            statusEl.style.color = '#ff4b4b';
        } else if (remaining > 0) {
            statusEl.innerHTML = `<span style="color: #58cc02; font-weight: 600;">${remaining.toFixed(1)} hrs auto-filled as Sleep</span>`;
        } else {
            statusEl.innerHTML = `<span style="color: #58cc02; font-weight: 600;">Day fully scheduled</span>`;
        }
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    loadDarkModePreference();
    updateDateTime();
    setupEventListeners();
    setupTabListeners();
    generateCalendars();
    loadCustomCategories();
    loadData();
    loadTimetableForDate();
    loadAllTabsForDate();
    getUserLocation();
    initializeQuotes();
    updateWorkingDateColor();
    setInterval(updateDateTime, 1000);
});

// =============================================================================
// GEOLOCATION
// =============================================================================

function getUserLocation() {
    // Try to load saved location first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
        userLocation = savedLocation;
        updateLocationDisplay();
    }

    // Try to load saved coordinates for weather
    const savedCoords = localStorage.getItem('userCoords');
    if (savedCoords) {
        userCoords = JSON.parse(savedCoords);
        fetchWeather(userCoords.lat, userCoords.lon);
    }

    // Request geolocation if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Got coordinates, now reverse geocode to get city name
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Save coordinates for weather
                userCoords = { lat, lon };
                localStorage.setItem('userCoords', JSON.stringify(userCoords));

                reverseGeocode(lat, lon);
                fetchWeather(lat, lon);
            },
            (error) => {
                console.log('Geolocation error:', error.message);
                // Keep default or saved location
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
        );
    }
}

function reverseGeocode(lat, lon) {
    // Use OpenStreetMap's Nominatim API (free, no API key needed)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;

    fetch(url, {
        headers: { 'User-Agent': 'ProductivityTracker/1.0' }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const state = data.address.state || '';
            const country = data.address.country_code?.toUpperCase() || '';

            if (city) {
                // Format: "City, State" or "City, Country"
                if (state && country === 'US') {
                    userLocation = `${city}, ${state}`;
                } else if (state) {
                    userLocation = `${city}, ${state}`;
                } else {
                    userLocation = city;
                }

                localStorage.setItem('userLocation', userLocation);
                updateLocationDisplay();
            }
        }
    })
    .catch(error => {
        console.log('Reverse geocode error:', error);
    });
}

function updateLocationDisplay() {
    const locationEl = document.getElementById('headerLocation');
    if (locationEl) {
        let displayText = userLocation;
        if (currentWeather) {
            displayText += ` | ${currentWeather.temp}°C ${currentWeather.icon}`;
        }
        locationEl.textContent = displayText;
    }
}

// Fetch weather using Open-Meteo API (free, no API key required)
function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.current) {
                const temp = Math.round(data.current.temperature_2m);
                const weatherCode = data.current.weather_code;
                const icon = getWeatherIcon(weatherCode);
                const description = getWeatherDescription(weatherCode);

                currentWeather = { temp, icon, description };
                updateLocationDisplay();
            }
        })
        .catch(error => {
            console.log('Weather fetch error:', error);
        });
}

// Get weather icon based on WMO weather code
function getWeatherIcon(code) {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️';           // Clear sky
    if (code === 1) return '🌤️';           // Mainly clear
    if (code === 2) return '⛅';            // Partly cloudy
    if (code === 3) return '☁️';           // Overcast
    if (code >= 45 && code <= 48) return '🌫️';  // Fog
    if (code >= 51 && code <= 55) return '🌧️';  // Drizzle
    if (code >= 56 && code <= 57) return '🌨️';  // Freezing drizzle
    if (code >= 61 && code <= 65) return '🌧️';  // Rain
    if (code >= 66 && code <= 67) return '🌨️';  // Freezing rain
    if (code >= 71 && code <= 77) return '❄️';  // Snow
    if (code >= 80 && code <= 82) return '🌦️';  // Rain showers
    if (code >= 85 && code <= 86) return '🌨️';  // Snow showers
    if (code >= 95 && code <= 99) return '⛈️';  // Thunderstorm
    return '🌡️';
}

// Get weather description based on WMO weather code
function getWeatherDescription(code) {
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 56 && code <= 57) return 'Freezing drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 66 && code <= 67) return 'Freezing rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
}

// =============================================================================
// LIVE QUOTES SYSTEM
// =============================================================================

// Display quote in the header
function displayQuote(quote) {
    const quoteEl = document.getElementById('headerQuote');
    if (quoteEl && quote) {
        quoteEl.innerHTML = `"${quote.text}" — ${quote.author}`;
    }
}

// Initialize quote on page load
function initializeQuotes() {
    fetchNewQuote();
}

// Fetch a new random quote for the header
function fetchNewQuote() {
    const quoteEl = document.getElementById('headerQuote');
    if (quoteEl) {
        quoteEl.textContent = 'Loading inspiration...';
    }

    // Use type.fit API (1600+ quotes, reliable)
    fetch('https://type.fit/api/quotes')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Get a truly random quote using current timestamp
                const randomIndex = Math.floor(Math.random() * data.length);
                const quoteData = data[randomIndex];
                displayQuote({
                    text: quoteData.text,
                    author: quoteData.author ? quoteData.author.replace(', type.fit', '') : 'Unknown'
                });
            }
        })
        .catch(error => {
            console.log('Quote API error:', error);
            // Fallback quotes array
            const fallbackQuotes = [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
                { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
                { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
                { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
                { text: "Your limitation—it's only your imagination.", author: "Unknown" },
                { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
                { text: "Great things never come from comfort zones.", author: "Unknown" },
                { text: "Dream it. Wish it. Do it.", author: "Unknown" },
                { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
                { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
                { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
                { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" }
            ];
            const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
            displayQuote(fallbackQuotes[randomIndex]);
        });
}

// =============================================================================
// EVENT LISTENERS SETUP
// =============================================================================

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

    // Load template button
    document.getElementById('loadTemplateBtn').addEventListener('click', showLoadTemplateModal);

    // Excel export/import buttons
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('importExcelBtn').addEventListener('click', () => {
        document.getElementById('excelFileInput').click();
    });
    document.getElementById('excelFileInput').addEventListener('change', importFromExcel);

    // Duration inputs (global listener)
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('duration')) {
            validateAndUpdateDuration(e.target);
            redistributeTime();
        }
    });

    // Setup new tab-specific listeners
    setupDiaryListeners();
    setupCaloriesListeners();
    setupFitnessListeners();

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }
}

// =============================================================================
// DARK MODE
// =============================================================================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    // Toggle icons
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'inline';
        moonIcon.style.display = isDark ? 'inline' : 'none';
    }

    // Save preference
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

function loadDarkModePreference() {
    const savedPref = localStorage.getItem('darkMode');
    if (savedPref === 'true') {
        document.body.classList.add('dark-mode');
        const sunIcon = document.querySelector('.icon-sun');
        const moonIcon = document.querySelector('.icon-moon');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline';
        }
    }
}

// =============================================================================
// SETTINGS
// =============================================================================

function openSettings() {
    alert('Settings panel coming soon!\n\nFeatures planned:\n- Location settings\n- Default categories\n- Data export/backup\n- Theme customization');
}

// =============================================================================
// TAB SYSTEM
// =============================================================================

function setupTabListeners() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabContent = document.getElementById(`${tabName}Tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Activate button
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (tabBtn) {
        tabBtn.classList.add('active');
    }

    appState.activeTab = tabName;
}

// =============================================================================
// DATE & TIME DISPLAY
// =============================================================================

function updateDateTime() {
    const now = new Date();
    const dayName = DAYS[now.getDay()];
    const day = now.getDate();
    const monthName = MONTHS[now.getMonth()];
    const year = now.getFullYear();

    let timeString;
    if (timeFormat === 12) {
        const hours = now.getHours();
        const mins = now.getMinutes().toString().padStart(2, '0');
        const secs = now.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        timeString = `${displayHours}:${mins}:${secs} ${period}`;
    } else {
        const hours = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        const secs = now.getSeconds().toString().padStart(2, '0');
        timeString = `${hours}:${mins}:${secs}`;
    }

    // Update header datetime (date, time separated by comma)
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.textContent = `${dayName} ${day} ${monthName} ${year}, ${timeString}`;
    }

    // Location is updated by updateLocationDisplay() when weather loads
}

// Update working date color based on whether it matches today
function updateWorkingDateColor() {
    const workingDateSpan = document.querySelector('.header-working span');
    if (!workingDateSpan) return;

    const today = new Date();

    // Compare just the date parts (year, month, day) - ignore time
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const selectedStr = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;

    const isToday = (todayStr === selectedStr);

    if (isToday) {
        // Green color for today (working on current day)
        workingDateSpan.style.color = '#34c759';
    } else {
        // Blue color for other days
        workingDateSpan.style.color = '#1cb0f6';
    }
}

// =============================================================================
// CALENDAR MODULE
// =============================================================================

function changeYear(direction) {
    currentDate.setFullYear(currentDate.getFullYear() + direction);
    updateDateDisplay();
    generateYearView();
    generateMonthCalendar('prev', -1);
    generateMonthCalendar('current', 0);
    generateMonthCalendar('next', 1);
    saveData();
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendars();
    updateDateDisplay();
    saveData();
}

function toggleMonthSelector() {
    const selector = document.getElementById('monthSelector');
    if (selector.style.display === 'none') {
        showMonthSelector();
    } else {
        hideMonthSelector();
    }
}

function showMonthSelector() {
    hideYearSelector();

    const selector = document.getElementById('monthSelector');
    const grid = document.getElementById('monthGrid');
    const monthElement = document.getElementById('currentMonthDisplay');

    grid.innerHTML = '';

    MONTHS.forEach((month, index) => {
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

    const rect = monthElement.getBoundingClientRect();
    const containerRect = monthElement.closest('.left-panel').getBoundingClientRect();

    selector.style.position = 'absolute';
    selector.style.left = (rect.left - containerRect.left - 20) + 'px';
    selector.style.top = (rect.bottom - containerRect.top + 5) + 'px';
    selector.style.display = 'block';
}

function hideMonthSelector() {
    document.getElementById('monthSelector').style.display = 'none';
}

function toggleYearSelector() {
    const selector = document.getElementById('yearSelectorPopup');
    if (selector.style.display === 'none') {
        showYearSelector();
    } else {
        hideYearSelector();
    }
}

function showYearSelector() {
    hideMonthSelector();

    const selector = document.getElementById('yearSelectorPopup');
    const select = document.getElementById('yearSelect');

    select.innerHTML = '';
    const currentYear = currentDate.getFullYear();

    for (let year = 1900; year <= 2100; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        select.appendChild(option);
    }

    selector.style.display = 'block';
}

function hideYearSelector() {
    document.getElementById('yearSelectorPopup').style.display = 'none';
}

function updateDateDisplay() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = MONTHS[currentDate.getMonth()];

    // Update year display
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = currentYear;
    }

    // Update month display (if visible)
    const monthDisplay = document.getElementById('currentMonthDisplay');
    if (monthDisplay) {
        monthDisplay.textContent = `${currentMonth} ${currentYear}`;
    }
}

function generateCalendars() {
    updateDateDisplay();

    // Generate year view (12-month grid)
    generateYearView();

    // Generate month view (3 months)
    generateMonthCalendar('prev', -1);
    generateMonthCalendar('current', 0);
    generateMonthCalendar('next', 1);

    // Set initial view state
    updateCalendarViewDisplay();
}

// =============================================================================
// YEAR VIEW (Apple Calendar Style)
// =============================================================================

function generateYearView() {
    const yearGrid = document.getElementById('yearGrid');
    if (!yearGrid) return;

    yearGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const today = new Date();

    // Generate 12 mini month cards
    for (let month = 0; month < 12; month++) {
        const monthCard = createMiniMonthCard(year, month, today);
        yearGrid.appendChild(monthCard);
    }
}

function createMiniMonthCard(year, month, today) {
    const card = document.createElement('div');
    card.className = 'year-month-card';

    // Click to zoom to this month
    card.addEventListener('click', () => {
        zoomToMonth(year, month);
    });

    // Month label
    const label = document.createElement('div');
    label.className = 'mini-month-label';
    label.textContent = MONTHS[month];
    card.appendChild(label);

    // Mini calendar grid
    const miniCal = document.createElement('div');
    miniCal.className = 'mini-calendar';

    // Day headers (S M T W T F S)
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach((day, index) => {
        const header = document.createElement('div');
        header.className = 'mini-day';
        if (index === 0) header.classList.add('sunday');
        header.textContent = day;
        header.style.fontWeight = '700';
        header.style.fontSize = '8px';
        header.style.color = index === 0 ? '#ff3b30' : '#86868b';
        miniCal.appendChild(header);
    });

    // Generate days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month days (faded)
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = document.createElement('div');
        dayEl.className = 'mini-day other-month';
        dayEl.textContent = day;
        miniCal.appendChild(dayEl);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'mini-day';
        dayEl.textContent = day;

        // Check if Sunday
        const dateObj = new Date(year, month, day);
        if (dateObj.getDay() === 0) {
            dayEl.classList.add('sunday');
        }

        // Check if today
        if (today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day) {
            dayEl.style.background = '#007aff';
            dayEl.style.color = 'white';
            dayEl.style.borderRadius = '50%';
            dayEl.style.fontWeight = '700';
        }

        // Check if logged
        const dateStr = formatDateForStorage(year, month, day);
        if (loggedDays.includes(dateStr)) {
            dayEl.style.background = '#34c759';
            dayEl.style.color = 'white';
            dayEl.style.borderRadius = '50%';
        }

        miniCal.appendChild(dayEl);
    }

    // Fill remaining cells (next month, faded)
    const totalCells = miniCal.children.length - 7; // Subtract header row
    const remainingCells = 35 - totalCells;
    for (let day = 1; day <= remainingCells && day <= 14; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'mini-day other-month';
        dayEl.textContent = day;
        miniCal.appendChild(dayEl);
    }

    card.appendChild(miniCal);
    return card;
}

function zoomToMonth(year, month) {
    // Set current date to the clicked month
    currentDate = new Date(year, month, 1);

    // Switch to month view
    appState.calendarView = 'month';

    // Regenerate calendars and update display
    updateDateDisplay();
    generateMonthCalendar('prev', -1);
    generateMonthCalendar('current', 0);
    generateMonthCalendar('next', 1);
    updateCalendarViewDisplay();
}

function showYearView() {
    appState.calendarView = 'year';
    generateYearView();
    updateCalendarViewDisplay();
}

function showMonthView() {
    appState.calendarView = 'month';
    updateCalendarViewDisplay();
}

function toggleCalendarView() {
    if (appState.calendarView === 'year') {
        appState.calendarView = 'month';
    } else {
        appState.calendarView = 'year';
        generateYearView();
    }
    updateCalendarViewDisplay();
}

function updateCalendarViewDisplay() {
    const yearView = document.getElementById('calendarYearView');
    const monthView = document.getElementById('calendarMonthView');
    const toggleBtn = document.getElementById('yearViewToggle');

    if (!yearView || !monthView) return;

    if (appState.calendarView === 'year') {
        yearView.classList.remove('hidden');
        monthView.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.textContent = 'Month';
            toggleBtn.classList.add('active');
        }
    } else {
        yearView.classList.add('hidden');
        monthView.classList.add('active');
        if (toggleBtn) {
            toggleBtn.textContent = 'Year';
            toggleBtn.classList.remove('active');
        }
    }
}

function generateMonthCalendar(type, monthOffset) {
    const targetDate = new Date(currentDate);
    targetDate.setMonth(targetDate.getMonth() + monthOffset);

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    // Get the month section container
    const monthSection = document.getElementById(type === 'current' ? 'currentMonthSection' : `${type}Month`);

    // Create or update month header
    let monthHeader = monthSection.querySelector('.month-header');
    if (!monthHeader) {
        monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthSection.insertBefore(monthHeader, monthSection.firstChild);
    }

    // Build header content based on type - using up/down arrows for month nav
    if (type === 'current') {
        monthHeader.className = 'month-header with-nav';
        monthHeader.innerHTML = `
            <button class="btn-nav" onclick="changeMonth(-1)">&#9650;</button>
            <span class="month-label">${MONTHS[month]} ${year}</span>
            <button class="btn-nav" onclick="changeMonth(1)">&#9660;</button>
        `;
    } else {
        monthHeader.className = 'month-header';
        monthHeader.innerHTML = `<span class="month-label">${MONTHS[month]} ${year}</span>`;
    }

    // Generate calendar grid
    let calendarElement = document.querySelector(`#${type}Calendar`);
    calendarElement.innerHTML = '';

    // Add day headers (Sunday highlighted in red)
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach((day, index) => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        if (index === 0) dayHeader.classList.add('sunday'); // Sunday in red
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

    // Check if this day is a Sunday (day of week = 0)
    const dateObj = new Date(year, month, day);
    if (dateObj.getDay() === 0) {
        dayElement.classList.add('sunday');
    }

    if (isOtherMonth) dayElement.classList.add('other-month');
    if (isToday) dayElement.classList.add('today');

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
        generateCalendars();
        loadTimetableForDate();
        loadAllTabsForDate();
    });

    return dayElement;
}

// =============================================================================
// TIMETABLE MODULE
// =============================================================================

function loadTimetableForDate() {
    const dayName = DAYS[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const monthName = MONTHS[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();

    // Update working date display
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    if (selectedDateDisplay) {
        selectedDateDisplay.textContent = `${dayName} ${day} ${monthName} ${year}`;
    }

    // Update working date color (red = today, blue = other day)
    updateWorkingDateColor();

    const dateStr = getCurrentDateStr();

    if (savedTimetables[dateStr]) {
        const savedData = savedTimetables[dateStr];
        // Handle both old format (array) and new format (object with startHour and rows)
        if (Array.isArray(savedData)) {
            loadTimetableData(savedData);
        } else {
            // New format: update startHour and load rows
            if (savedData.startHour !== undefined) {
                startHour = savedData.startHour;
                document.getElementById('startTimeSelect').value = startHour;
            }
            loadTimetableData(savedData.rows || []);
        }
    } else {
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';
        createDefaultTimetable();
    }

    console.log(`Loaded timetable for: ${dayName} ${day} ${monthName} ${year}`);
}

function addRow(afterRowId) {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const targetRow = tbody.querySelector(`tr[data-row-id="${afterRowId}"]`);

    const newRow = createTableRow(rowCounter++);

    // Insert before the auto-fill row (last row), or after target row
    const autoFillRow = rows[rows.length - 1];

    if (targetRow === autoFillRow) {
        // If clicking + on auto-fill row, insert before it
        tbody.insertBefore(newRow, autoFillRow);
    } else if (targetRow.nextElementSibling) {
        tbody.insertBefore(newRow, targetRow.nextElementSibling);
    } else {
        tbody.insertBefore(newRow, autoFillRow);
    }

    redistributeTime();
    updateRowButtons();
    saveData();
}

function deleteRow(rowId) {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Need at least 1 activity + 1 auto-fill = 2 rows minimum
    if (rows.length <= 1) {
        alert('Cannot delete the last row.');
        return;
    }

    const rowToDelete = tbody.querySelector(`tr[data-row-id="${rowId}"]`);
    if (rowToDelete) {
        const rowIndex = rows.indexOf(rowToDelete);
        const rowType = getRowType(rowToDelete, rowIndex, rows.length);

        // Can't delete the auto-fill row (last row)
        if (rowType === 'autofill') {
            alert('Cannot delete the Sleep/Buffer row. It auto-fills remaining time.');
            return;
        }

        // Delete activity row
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
        <td><input type="text" class="comment" placeholder="Add comment..."></td>
        <td class="row-actions">
            <button class="add-btn" onclick="addRow(${id})">+</button>
            <button class="delete-btn" onclick="deleteRow(${id})">-</button>
        </td>
    `;

    // Add event listeners
    const durationInput = row.querySelector('.duration');
    const taskInput = row.querySelector('.task');
    const commentInput = row.querySelector('.comment');
    const categorySelect = row.querySelector('.category-select');
    const categoryCustom = row.querySelector('.category-custom');

    durationInput.addEventListener('input', function() {
        validateAndUpdateDuration(this);
        redistributeTime();
    });
    taskInput.addEventListener('input', saveData);
    commentInput.addEventListener('input', saveData);

    setupCategorySystem(categorySelect, categoryCustom);

    return row;
}

function createDefaultTimetable() {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    // Create one empty activity row for the user to start with
    const activityRow = createTableRow(0);
    activityRow.querySelector('.duration').value = '1.0';
    activityRow.querySelector('.task').placeholder = 'Enter your first activity...';
    tbody.appendChild(activityRow);

    // Auto-fill Sleep row (always last, auto-calculates remaining time)
    const sleepRow = createTableRow(1);
    sleepRow.dataset.isAutoFill = 'true';
    sleepRow.querySelector('.duration').value = '23.0';
    sleepRow.querySelector('.duration').readOnly = true;
    sleepRow.querySelector('.task').value = 'Sleep';
    const sleepCategorySelect = sleepRow.querySelector('.category-select');
    if (sleepCategorySelect) {
        sleepCategorySelect.value = 'sleeping';
        updateCategoryDisplay(sleepCategorySelect, 'sleeping');
    }
    tbody.appendChild(sleepRow);

    rowCounter = 2;
    redistributeTime();
    updateRowButtons();
}

function redistributeTime() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (rows.length === 0) return;

    // Calculate total activity duration (all rows except last auto-fill)
    let totalActivityDuration = 0;

    rows.forEach((row, index) => {
        const rowType = getRowType(row, index, rows.length);
        const durationInput = row.querySelector('.duration');

        if (rowType === 'activity') {
            durationInput.readOnly = false;
            const duration = parseFloat(durationInput.value) || 0;
            totalActivityDuration += duration;
        }
    });

    // Update auto-fill row (last row) - fills remaining time
    const autoFillRow = rows[rows.length - 1];
    if (autoFillRow) {
        const remaining = Math.max(0, 24 - totalActivityDuration);
        const durationInput = autoFillRow.querySelector('.duration');
        durationInput.value = remaining.toFixed(2);
        durationInput.readOnly = true;
        autoFillRow.dataset.isAutoFill = 'true';
        autoFillRow.classList.add('autofill-row');
    }

    // Update start times for all rows
    const startTimeMinutes = startHour * 60;
    let currentTimeMinutes = startTimeMinutes;

    rows.forEach((row) => {
        const durationHours = parseFloat(row.querySelector('.duration').value) || 0;
        const durationMinutes = durationHours * 60;

        const startTimeCell = row.querySelector('.start-time');
        startTimeCell.textContent = formatTime(currentTimeMinutes);

        currentTimeMinutes += durationMinutes;
    });

    updateRowStyling();
    updateTimetableFooter();
    saveData();
}

function updateRowStyling() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (rows.length === 0) return;

    rows.forEach((row, index) => {
        const rowType = getRowType(row, index, rows.length);
        const durationInput = row.querySelector('.duration');
        const taskInput = row.querySelector('.task');
        const categorySelect = row.querySelector('.category-select');

        // Reset styling
        taskInput.style.fontWeight = '';
        taskInput.style.color = '';
        durationInput.style.color = '';
        durationInput.style.fontWeight = '';
        row.classList.remove('autofill-row');
        row.style.backgroundColor = '';

        // Apply styling based on row type
        if (rowType === 'autofill') {
            row.classList.add('autofill-row');
            // No special color - just italics via CSS
        }
        // No yellow highlight for max duration - keeping rows uniform

        // Apply category background color
        if (categorySelect && categorySelect.value) {
            applyCategoryBackground(row, categorySelect.value);
        }
    });
}

// Apply category background color to row
function applyCategoryBackground(row, categoryValue) {
    const allCategories = [...PRESET_CATEGORIES, ...customCategories];
    const category = allCategories.find(cat => cat.value === categoryValue);

    if (category) {
        const categorySelect = row.querySelector('.category-select');

        if (categorySelect) {
            categorySelect.style.backgroundColor = category.color;
            categorySelect.style.color = getContrastColor(category.color);
            categorySelect.style.fontWeight = 'bold';
            categorySelect.style.borderColor = category.color;
        }
    }
}

// Get contrasting text color (white or black) based on background
function getContrastColor(hexColor) {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
}

function updateRowButtons() {
    const tbody = document.getElementById('timetableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    if (rows.length === 0) return;

    rows.forEach((row, index) => {
        const addBtn = row.querySelector('.add-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        const rowType = getRowType(row, index, rows.length);

        if (rowType === 'autofill') {
            // Auto-fill row: can add before it, but can't delete it
            addBtn.style.display = 'inline';
            deleteBtn.style.display = 'none';
        } else {
            // Activity rows: can add after, can delete (unless it's the only activity)
            addBtn.style.display = 'inline';
            // Can delete if there's more than just this row + autofill
            deleteBtn.style.display = rows.length > 2 ? 'inline' : 'none';
        }
    });
}

// =============================================================================
// CATEGORY SYSTEM
// =============================================================================

function setupCategorySystem(selectElement, customElement) {
    populateCategories(selectElement);

    selectElement.addEventListener('change', function() {
        if (this.value === 'custom') {
            customElement.style.display = 'block';
            selectElement.style.display = 'none';
            customElement.focus();
        } else {
            updateCategoryDisplay(this, this.value);
            saveData();
        }
    });

    customElement.addEventListener('blur', function() {
        if (this.value.trim()) {
            const customValue = this.value.trim().toLowerCase();
            if (!customCategories.some(cat => cat.value === customValue)) {
                customCategories.push({
                    value: customValue,
                    label: this.value.trim(),
                    color: "#666666"
                });
                saveCustomCategories();
            }

            populateCategories(selectElement);
            selectElement.value = customValue;
            updateCategoryDisplay(selectElement, customValue);
        }

        customElement.style.display = 'none';
        selectElement.style.display = 'block';
        saveData();
    });

    customElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') this.blur();
    });
}

function populateCategories(selectElement) {
    selectElement.innerHTML = '<option value="">Select category...</option>';

    PRESET_CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        option.style.color = category.color;
        selectElement.appendChild(option);
    });

    customCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.value;
        option.textContent = category.label;
        option.style.color = category.color;
        selectElement.appendChild(option);
    });

    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '+ Add custom category...';
    customOption.style.fontStyle = 'italic';
    selectElement.appendChild(customOption);
}

function updateCategoryDisplay(selectElement, value) {
    const allCategories = [...PRESET_CATEGORIES, ...customCategories];
    const category = allCategories.find(cat => cat.value === value);

    if (category) {
        // Solid background with contrasting text
        selectElement.style.backgroundColor = category.color;
        selectElement.style.borderColor = category.color;
        selectElement.style.color = getContrastColor(category.color);
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

// =============================================================================
// DIARY MODULE
// =============================================================================

function setupDiaryListeners() {
    const saveDiaryBtn = document.getElementById('saveDiaryBtn');
    if (saveDiaryBtn) {
        saveDiaryBtn.addEventListener('click', saveDiary);
    }

    const diaryContent = document.getElementById('diaryContent');
    if (diaryContent) {
        diaryContent.addEventListener('input', saveDiary);
    }
}

function saveDiary() {
    const dateStr = getCurrentDateStr();
    const content = document.getElementById('diaryContent')?.value || '';

    if (!appState.savedData[dateStr]) {
        appState.savedData[dateStr] = {};
    }
    appState.savedData[dateStr].diary = content;

    saveData();
}

function loadDiary() {
    const dateStr = getCurrentDateStr();
    const content = appState.savedData[dateStr]?.diary || '';
    const diaryContent = document.getElementById('diaryContent');
    if (diaryContent) {
        diaryContent.value = content;
    }
}

// =============================================================================
// CALORIES MODULE (uses table-based functions defined later)
// =============================================================================

function setupCaloriesListeners() {
    // Table-based calorie tracking - no separate listeners needed
    // +/- buttons handle row management, auto-save on input is set in addCalorieRow
}

// =============================================================================
// FITNESS ACTIVITY MODULE
// =============================================================================

function setupFitnessListeners() {
    // No more add exercise button - using +/- in rows
}

function addFitnessRow(afterRow = null) {
    const tbody = document.getElementById('fitnessBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="exercise-name" placeholder="Exercise"></td>
        <td>
            <select class="exercise-type">
                <option value="exercise">Exercise</option>
                <option value="body">Body</option>
            </select>
        </td>
        <td><input type="number" class="sets" min="0" placeholder="0"></td>
        <td><input type="number" class="reps" min="0" placeholder="0"></td>
        <td><input type="number" class="weight-kg" min="0" step="0.5" placeholder="0"></td>
        <td><input type="number" class="duration-min" min="0" placeholder="0"></td>
        <td><input type="number" class="calories-burnt" min="0" placeholder="0"></td>
        <td><input type="text" class="exercise-comment" placeholder="Notes"></td>
        <td class="actions">
            <button class="add-btn" onclick="addFitnessRow(this.closest('tr'))">+</button>
            <button class="delete-btn" onclick="deleteFitnessRow(this)">-</button>
        </td>
    `;

    // Auto-save on input and select change
    row.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            saveFitness();
            updateFitnessStats();
        });
        input.addEventListener('change', () => {
            saveFitness();
            updateFitnessStats();
        });
    });

    if (afterRow && afterRow.parentNode === tbody) {
        afterRow.after(row);
    } else {
        tbody.appendChild(row);
    }

    saveFitness();
    updateFitnessStats();
}

function deleteFitnessRow(btn) {
    const tbody = document.getElementById('fitnessBody');
    const rows = tbody.querySelectorAll('tr');

    // Keep at least one row
    if (rows.length <= 1) {
        // Clear the row instead of deleting
        const row = btn.closest('tr');
        row.querySelectorAll('input').forEach(input => input.value = '');
        saveFitness();
        updateFitnessStats();
        return;
    }

    btn.closest('tr').remove();
    saveFitness();
    updateFitnessStats();
}

function saveFitness() {
    const dateStr = getCurrentDateStr();
    const rows = document.querySelectorAll('#fitnessBody tr');
    const exercises = [];

    rows.forEach(row => {
        exercises.push({
            exercise: row.querySelector('.exercise-name')?.value || '',
            type: row.querySelector('.exercise-type')?.value || 'exercise',
            sets: parseInt(row.querySelector('.sets')?.value) || 0,
            reps: parseInt(row.querySelector('.reps')?.value) || 0,
            kg: parseFloat(row.querySelector('.weight-kg')?.value) || 0,
            duration: parseInt(row.querySelector('.duration-min')?.value) || 0,
            caloriesBurnt: parseInt(row.querySelector('.calories-burnt')?.value) || 0,
            comment: row.querySelector('.exercise-comment')?.value || ''
        });
    });

    if (!appState.savedData[dateStr]) {
        appState.savedData[dateStr] = {};
    }
    appState.savedData[dateStr].fitness = exercises;

    saveData();
}

function loadFitness() {
    const dateStr = getCurrentDateStr();
    const exercises = appState.savedData[dateStr]?.fitness || [];
    const tbody = document.getElementById('fitnessBody');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (exercises.length === 0) {
        // Add one empty row by default
        addFitnessRow();
        return;
    }

    exercises.forEach(ex => {
        const row = document.createElement('tr');
        // Support both old 'weight' key and new 'kg' key for backward compatibility
        const kgValue = ex.kg || ex.weight || '';
        const typeValue = ex.type || 'exercise';
        row.innerHTML = `
            <td><input type="text" class="exercise-name" placeholder="Exercise" value="${ex.exercise || ''}"></td>
            <td>
                <select class="exercise-type">
                    <option value="exercise" ${typeValue === 'exercise' ? 'selected' : ''}>Exercise</option>
                    <option value="body" ${typeValue === 'body' ? 'selected' : ''}>Body</option>
                </select>
            </td>
            <td><input type="number" class="sets" min="0" placeholder="0" value="${ex.sets || ''}"></td>
            <td><input type="number" class="reps" min="0" placeholder="0" value="${ex.reps || ''}"></td>
            <td><input type="number" class="weight-kg" min="0" step="0.5" placeholder="0" value="${kgValue}"></td>
            <td><input type="number" class="duration-min" min="0" placeholder="0" value="${ex.duration || ''}"></td>
            <td><input type="number" class="calories-burnt" min="0" placeholder="0" value="${ex.caloriesBurnt || ''}"></td>
            <td><input type="text" class="exercise-comment" placeholder="Notes" value="${ex.comment || ''}"></td>
            <td class="actions">
                <button class="add-btn" onclick="addFitnessRow(this.closest('tr'))">+</button>
                <button class="delete-btn" onclick="deleteFitnessRow(this)">-</button>
            </td>
        `;

        row.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                saveFitness();
                updateFitnessStats();
            });
            input.addEventListener('change', () => {
                saveFitness();
                updateFitnessStats();
            });
        });

        tbody.appendChild(row);
    });

    updateFitnessStats();
}

function updateFitnessStats() {
    const rows = document.querySelectorAll('#fitnessBody tr');
    let totalDuration = 0;
    let totalCaloriesBurnt = 0;
    let bodyWeights = [];

    rows.forEach(row => {
        const type = row.querySelector('.exercise-type')?.value || 'exercise';
        const kg = parseFloat(row.querySelector('.weight-kg')?.value) || 0;

        totalDuration += parseInt(row.querySelector('.duration-min')?.value) || 0;
        totalCaloriesBurnt += parseInt(row.querySelector('.calories-burnt')?.value) || 0;

        // Collect body weights from "body" type rows
        if (type === 'body' && kg > 0) {
            bodyWeights.push(kg);
        }
    });

    // Calculate average body weight
    const avgBodyWeight = bodyWeights.length > 0
        ? (bodyWeights.reduce((a, b) => a + b, 0) / bodyWeights.length).toFixed(1)
        : '--';

    const avgWeightEl = document.getElementById('avgBodyWeight');
    if (avgWeightEl) {
        avgWeightEl.innerHTML = `<strong>${avgBodyWeight}</strong>`;
    }

    const durationEl = document.getElementById('totalDurationFitness');
    if (durationEl) {
        durationEl.innerHTML = `<strong>${totalDuration} min</strong>`;
    }

    const caloriesEl = document.getElementById('totalCaloriesBurnt');
    if (caloriesEl) {
        caloriesEl.innerHTML = `<strong>${totalCaloriesBurnt}</strong>`;
    }
}

function clearFitnessTable() {
    if (confirm('Clear all fitness entries for this day?')) {
        const tbody = document.getElementById('fitnessBody');
        if (tbody) {
            tbody.innerHTML = '';
            addFitnessRow();
        }

        const dateStr = getCurrentDateStr();
        if (appState.savedData[dateStr]) {
            appState.savedData[dateStr].fitness = [];
        }
        saveData();
        updateFitnessStats();
    }
}

// =============================================================================
// DIET TRACKING MODULE (renamed from Calories)
// =============================================================================

function addDietRow(afterRow = null) {
    const tbody = document.getElementById('dietBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="food-item" placeholder="Food item"></td>
        <td><input type="number" class="food-portion" min="0" placeholder="g"></td>
        <td>
            <select class="food-type">
                <option value="">-</option>
                <option value="food">Food</option>
                <option value="drink">Drink</option>
                <option value="snack">Snack</option>
                <option value="supplement">Supplement</option>
                <option value="meal">Meal</option>
            </select>
        </td>
        <td><input type="number" class="food-protein" min="0" placeholder="0"></td>
        <td><input type="number" class="food-carbs" min="0" placeholder="0"></td>
        <td><input type="number" class="food-fat" min="0" placeholder="0"></td>
        <td><input type="number" class="food-calories" min="0" placeholder="0"></td>
        <td><input type="text" class="food-comment" placeholder="Notes"></td>
        <td class="actions">
            <button class="add-btn" onclick="addDietRow(this.closest('tr'))">+</button>
            <button class="delete-btn" onclick="deleteDietRow(this)">-</button>
        </td>
    `;

    // Auto-save on input/change
    row.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => {
            saveDiet();
            updateDietStats();
        });
        el.addEventListener('change', () => {
            saveDiet();
            updateDietStats();
        });
    });

    if (afterRow && afterRow.parentNode === tbody) {
        afterRow.after(row);
    } else {
        tbody.appendChild(row);
    }

    saveDiet();
    updateDietStats();
}

function deleteDietRow(btn) {
    const tbody = document.getElementById('dietBody');
    const rows = tbody.querySelectorAll('tr');

    // Keep at least one row
    if (rows.length <= 1) {
        // Clear the row instead of deleting
        const row = btn.closest('tr');
        row.querySelectorAll('input').forEach(input => input.value = '');
        row.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
        saveDiet();
        updateDietStats();
        return;
    }

    btn.closest('tr').remove();
    saveDiet();
    updateDietStats();
}

function saveDiet() {
    const dateStr = getCurrentDateStr();
    const rows = document.querySelectorAll('#dietBody tr');
    const foods = [];

    rows.forEach(row => {
        foods.push({
            item: row.querySelector('.food-item')?.value || '',
            portion: parseInt(row.querySelector('.food-portion')?.value) || 0,
            type: row.querySelector('.food-type')?.value || '',
            protein: parseInt(row.querySelector('.food-protein')?.value) || 0,
            carbs: parseInt(row.querySelector('.food-carbs')?.value) || 0,
            fat: parseInt(row.querySelector('.food-fat')?.value) || 0,
            calories: parseInt(row.querySelector('.food-calories')?.value) || 0,
            comment: row.querySelector('.food-comment')?.value || ''
        });
    });

    if (!appState.savedData[dateStr]) {
        appState.savedData[dateStr] = {};
    }
    appState.savedData[dateStr].diet = foods;

    saveData();
}

function loadDiet() {
    const dateStr = getCurrentDateStr();
    // Support both old 'calories' key and new 'diet' key for backward compatibility
    const foods = appState.savedData[dateStr]?.diet || appState.savedData[dateStr]?.calories || [];
    const tbody = document.getElementById('dietBody');

    if (!tbody) return;
    tbody.innerHTML = '';

    if (!Array.isArray(foods) || foods.length === 0) {
        // Add one empty row by default
        addDietRow();
        return;
    }

    foods.forEach(food => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="food-item" placeholder="Food item" value="${food.item || ''}"></td>
            <td><input type="number" class="food-portion" min="0" placeholder="g" value="${food.portion || ''}"></td>
            <td>
                <select class="food-type">
                    <option value="">-</option>
                    <option value="food" ${food.type === 'food' ? 'selected' : ''}>Food</option>
                    <option value="drink" ${food.type === 'drink' ? 'selected' : ''}>Drink</option>
                    <option value="snack" ${food.type === 'snack' ? 'selected' : ''}>Snack</option>
                    <option value="supplement" ${food.type === 'supplement' ? 'selected' : ''}>Supplement</option>
                    <option value="meal" ${food.type === 'meal' ? 'selected' : ''}>Meal</option>
                </select>
            </td>
            <td><input type="number" class="food-protein" min="0" placeholder="0" value="${food.protein || ''}"></td>
            <td><input type="number" class="food-carbs" min="0" placeholder="0" value="${food.carbs || ''}"></td>
            <td><input type="number" class="food-fat" min="0" placeholder="0" value="${food.fat || ''}"></td>
            <td><input type="number" class="food-calories" min="0" placeholder="0" value="${food.calories || ''}"></td>
            <td><input type="text" class="food-comment" placeholder="Notes" value="${food.comment || ''}"></td>
            <td class="actions">
                <button class="add-btn" onclick="addDietRow(this.closest('tr'))">+</button>
                <button class="delete-btn" onclick="deleteDietRow(this)">-</button>
            </td>
        `;

        row.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                saveDiet();
                updateDietStats();
            });
            el.addEventListener('change', () => {
                saveDiet();
                updateDietStats();
            });
        });

        tbody.appendChild(row);
    });

    updateDietStats();
}

function updateDietStats() {
    const rows = document.querySelectorAll('#dietBody tr');
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;

    rows.forEach(row => {
        totalProtein += parseInt(row.querySelector('.food-protein')?.value) || 0;
        totalCarbs += parseInt(row.querySelector('.food-carbs')?.value) || 0;
        totalFat += parseInt(row.querySelector('.food-fat')?.value) || 0;
        totalCalories += parseInt(row.querySelector('.food-calories')?.value) || 0;
    });

    const proteinEl = document.getElementById('totalProtein');
    if (proteinEl) proteinEl.innerHTML = `<strong>${totalProtein}g</strong>`;

    const carbsEl = document.getElementById('totalCarbs');
    if (carbsEl) carbsEl.innerHTML = `<strong>${totalCarbs}g</strong>`;

    const fatEl = document.getElementById('totalFat');
    if (fatEl) fatEl.innerHTML = `<strong>${totalFat}g</strong>`;

    const calEl = document.getElementById('totalCalories');
    if (calEl) calEl.innerHTML = `<strong>${totalCalories}</strong>`;
}

function clearDietTable() {
    if (confirm('Clear all diet entries for this day?')) {
        const tbody = document.getElementById('dietBody');
        if (tbody) {
            tbody.innerHTML = '';
            addDietRow();
        }

        const dateStr = getCurrentDateStr();
        if (appState.savedData[dateStr]) {
            appState.savedData[dateStr].diet = [];
        }
        saveData();
        updateDietStats();
    }
}

// Backward compatibility aliases
function addCalorieRow(afterRow = null) { addDietRow(afterRow); }
function deleteCalorieRow(btn) { deleteDietRow(btn); }
function saveCalories() { saveDiet(); }
function loadCalories() { loadDiet(); }
function updateCalorieStats() { updateDietStats(); }
function clearCaloriesTable() { clearDietTable(); }

function clearDiary() {
    if (confirm('Clear the diary for this day?')) {
        const diaryContent = document.getElementById('diaryContent');
        if (diaryContent) {
            diaryContent.value = '';
        }

        const dateStr = getCurrentDateStr();
        if (appState.savedData[dateStr]) {
            appState.savedData[dateStr].diary = '';
        }
        saveData();
    }
}

function loadAllTabsForDate() {
    loadDiary();
    loadCalories();
    loadFitness();
}

// =============================================================================
// CLEAR FUNCTIONS
// =============================================================================

function clearCurrentTable() {
    if (confirm('Are you sure you want to clear the current day\'s timetable?')) {
        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';
        createDefaultTimetable();
        updateRowButtons();
        saveData();
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
        localStorage.removeItem('savedTimetables');
        localStorage.removeItem('loggedDays');
        localStorage.removeItem(CONFIG.STORAGE_KEY);

        savedTimetables = {};
        loggedDays = [];
        appState.savedData = {};

        const tbody = document.getElementById('timetableBody');
        tbody.innerHTML = '';

        createDefaultTimetable();
        updateRowButtons();
        generateCalendars();

        // Clear diary tab
        const diaryContent = document.getElementById('diaryContent');
        if (diaryContent) diaryContent.value = '';

        // Clear diet tab
        const dietBody = document.getElementById('dietBody');
        if (dietBody) {
            dietBody.innerHTML = '';
            addDietRow();
        }

        // Clear fitness tab
        const fitnessBody = document.getElementById('fitnessBody');
        if (fitnessBody) {
            fitnessBody.innerHTML = '';
            addFitnessRow();
        }

        alert('All data has been cleared.');
    }
}

// =============================================================================
// LOG DAY FUNCTIONALITY
// =============================================================================

function logDay() {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0) {
        alert('No timetable entries to log');
        return;
    }

    const dateStr = getCurrentDateStr();

    // Save timetable with startHour for this specific day
    const timetableData = getTimetableData();
    savedTimetables[dateStr] = {
        startHour: startHour,
        rows: timetableData
    };

    if (!loggedDays.includes(dateStr)) {
        loggedDays.push(dateStr);
    }

    console.log('Logging day:', dateStr);
    console.log('Logged days:', loggedDays);
    console.log('Saved timetables:', savedTimetables);

    saveData();
    generateCalendars();

    alert('Day logged successfully!');
}

// =============================================================================
// DATA PERSISTENCE
// =============================================================================

function saveData() {
    // Save timetable data (legacy format for backward compatibility)
    const timetableData = {
        savedTimetables: savedTimetables,
        loggedDays: loggedDays,
        rowCounter: rowCounter,
        startHour: startHour,
        timeFormat: timeFormat,
        userLocation: userLocation,
        selectedDate: selectedDate.toISOString(),
        customCategories: customCategories
    };
    localStorage.setItem('timetableData', JSON.stringify(timetableData));

    // Save unified app data (new format)
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(appState.savedData));
}

function loadData() {
    // Load legacy timetable data
    const savedData = localStorage.getItem('timetableData');
    if (savedData) {
        const data = JSON.parse(savedData);

        savedTimetables = data.savedTimetables || {};
        loggedDays = data.loggedDays || [];
        rowCounter = data.rowCounter || 1;
        startHour = data.startHour || CONFIG.DEFAULT_START_HOUR;
        timeFormat = data.timeFormat || CONFIG.DEFAULT_TIME_FORMAT;
        userLocation = data.userLocation || CONFIG.DEFAULT_LOCATION;
        customCategories = data.customCategories || [];

        if (data.selectedDate) {
            selectedDate = new Date(data.selectedDate);
        }

        document.getElementById('startTimeSelect').value = startHour;
        document.getElementById('timeFormatSelect').value = timeFormat;

        updateRowButtons();
    } else {
        savedTimetables = {};
        loggedDays = [];
        customCategories = [];
        updateRowButtons();
    }

    // Load unified app data
    const appData = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (appData) {
        appState.savedData = JSON.parse(appData);
    }
}

function getTimetableData() {
    const tbody = document.getElementById('timetableBody');
    const rows = tbody.querySelectorAll('tr');
    const data = [];

    rows.forEach((row, index) => {
        const categorySelect = row.querySelector('.category-select');
        const categoryValue = categorySelect ? categorySelect.value : '';
        const commentInput = row.querySelector('.comment');
        const commentValue = commentInput ? commentInput.value : '';

        data.push({
            id: parseInt(row.dataset.rowId) || index,
            duration: row.querySelector('.duration').value,
            task: row.querySelector('.task').value,
            category: categoryValue,
            comment: commentValue,
            isAutoFill: row.dataset.isAutoFill === 'true'
        });
    });

    return data;
}

function loadTimetableData(data) {
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        createDefaultTimetable();
        return;
    }

    // Check if data has the old format (with isBuffer) and migrate
    const hasOldFormat = data.some(row => row.isBuffer === true);

    if (hasOldFormat) {
        // Migrate old format: filter out Start/End rows, keep activities and buffer
        data = data.filter(row => {
            const task = (row.task || '').toLowerCase();
            // Keep buffer row and activities, skip "start" and "day end"
            return task !== 'start' && task !== 'day end';
        });

        // Convert buffer row to autofill
        data.forEach(row => {
            if (row.isBuffer) {
                row.isAutoFill = true;
                delete row.isBuffer;
            }
        });
    }

    // Ensure there's at least one activity row
    const hasActivities = data.some(row => !row.isAutoFill);
    if (!hasActivities) {
        createDefaultTimetable();
        return;
    }

    // Load the rows
    let maxId = 0;
    data.forEach((rowData, index) => {
        const row = createTableRow(rowData.id || index);
        row.querySelector('.duration').value = rowData.duration || '1.0';
        row.querySelector('.task').value = rowData.task || '';

        // Load comment
        const commentInput = row.querySelector('.comment');
        if (commentInput && rowData.comment) {
            commentInput.value = rowData.comment;
        }

        // Mark as auto-fill if it is
        if (rowData.isAutoFill) {
            row.dataset.isAutoFill = 'true';
            row.querySelector('.duration').readOnly = true;
        }

        const categorySelect = row.querySelector('.category-select');
        if (categorySelect && rowData.category) {
            categorySelect.value = rowData.category;
            updateCategoryDisplay(categorySelect, rowData.category);
        }

        tbody.appendChild(row);
        maxId = Math.max(maxId, rowData.id || index);
    });

    rowCounter = maxId + 1;

    // Ensure there's an auto-fill row at the end
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const lastRow = rows[rows.length - 1];
    if (!lastRow.dataset.isAutoFill) {
        // Add auto-fill row
        const sleepRow = createTableRow(rowCounter++);
        sleepRow.dataset.isAutoFill = 'true';
        sleepRow.querySelector('.duration').readOnly = true;
        sleepRow.querySelector('.task').value = 'Sleep';
        const sleepCategorySelect = sleepRow.querySelector('.category-select');
        if (sleepCategorySelect) {
            sleepCategorySelect.value = 'sleeping';
            updateCategoryDisplay(sleepCategorySelect, 'sleeping');
        }
        tbody.appendChild(sleepRow);
    }

    redistributeTime();
    updateRowButtons();
}

// =============================================================================
// EXCEL EXPORT/IMPORT
// =============================================================================

function exportToExcel() {
    if (loggedDays.length === 0) {
        alert('No logged days to export');
        return;
    }

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Timetable (clean columns - no metadata)
    const timetableExcelData = [
        ['Date', 'Start Time', 'End Time', 'Duration (hrs)', 'Task', 'Category', 'Comment']
    ];

    // Sort logged days from oldest to newest
    const sortedLoggedDays = [...loggedDays].sort((a, b) => a.localeCompare(b));

    console.log('Exporting logged days (sorted):', sortedLoggedDays);
    console.log('Saved timetables:', savedTimetables);

    sortedLoggedDays.forEach(dateStr => {
        const savedData = savedTimetables[dateStr];
        if (!savedData) {
            console.log('No data for date:', dateStr);
            return;
        }

        // Handle both old format (array) and new format (object with startHour and rows)
        let dayStartHour, timetableRows;
        if (Array.isArray(savedData)) {
            // Old format: savedData is directly an array of rows
            dayStartHour = startHour; // Use current startHour as fallback
            timetableRows = savedData;
        } else {
            // New format: savedData is { startHour, rows }
            dayStartHour = savedData.startHour || startHour;
            timetableRows = savedData.rows || [];
        }

        console.log('Processing date:', dateStr, 'startHour:', dayStartHour, 'rows:', timetableRows.length);

        let currentTimeMinutes = dayStartHour * 60;

        timetableRows.forEach((rowData) => {
            const durationHours = parseFloat(rowData.duration) || 0;
            const durationMinutes = durationHours * 60;
            const task = rowData.task || '';
            const comment = rowData.comment || '';

            let categoryLabel = '';
            if (rowData.category) {
                const allCategories = [...PRESET_CATEGORIES, ...customCategories];
                const category = allCategories.find(cat => cat.value === rowData.category);
                categoryLabel = category ? category.label : rowData.category;
            }

            const endTimeMinutes = currentTimeMinutes + durationMinutes;
            const startTimeExcel = (currentTimeMinutes % (24 * 60)) / (24 * 60);
            const endTimeExcel = (endTimeMinutes % (24 * 60)) / (24 * 60);

            const [year, month, day] = dateStr.split('-').map(Number);
            // Excel date serial: days since Dec 30, 1899 (Excel's epoch with leap year bug)
            // Use UTC to avoid timezone issues
            const excelDate = Date.UTC(year, month - 1, day);
            const excelEpoch = Date.UTC(1899, 11, 30); // Dec 30, 1899
            const excelDateSerial = Math.round((excelDate - excelEpoch) / (24 * 60 * 60 * 1000));

            timetableExcelData.push([
                excelDateSerial,
                startTimeExcel,
                endTimeExcel,
                durationHours.toFixed(2),
                task,
                categoryLabel,
                comment
            ]);

            currentTimeMinutes = endTimeMinutes;
        });
    });

    const timetableSheet = XLSX.utils.aoa_to_sheet(timetableExcelData);
    timetableSheet['!cols'] = [
        { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 },
        { width: 30 }, { width: 15 }, { width: 30 }
    ];

    // Apply date/time formatting
    const range = XLSX.utils.decode_range(timetableSheet['!ref']);
    for (let row = 1; row <= range.e.r; row++) {
        const dateCell = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (timetableSheet[dateCell]) timetableSheet[dateCell].z = 'yyyy-mm-dd';

        const startTimeCell = XLSX.utils.encode_cell({ r: row, c: 1 });
        if (timetableSheet[startTimeCell]) timetableSheet[startTimeCell].z = 'hh:mm';

        const endTimeCell = XLSX.utils.encode_cell({ r: row, c: 2 });
        if (timetableSheet[endTimeCell]) timetableSheet[endTimeCell].z = 'hh:mm';
    }

    XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable');

    // Sheet 2: Diary (always created) - sorted by date oldest to newest
    const diaryData = [['Date', 'Entry']];
    Object.keys(appState.savedData).sort((a, b) => a.localeCompare(b)).forEach(dateStr => {
        if (appState.savedData[dateStr]?.diary) {
            diaryData.push([dateStr, appState.savedData[dateStr].diary]);
        }
    });
    const diarySheet = XLSX.utils.aoa_to_sheet(diaryData);
    diarySheet['!cols'] = [{ width: 12 }, { width: 80 }];
    XLSX.utils.book_append_sheet(workbook, diarySheet, 'Diary');

    // Sheet 3: Diet (renamed from Calories) - sorted by date oldest to newest
    const dietData = [['Date', 'Food Item', 'Portion (g)', 'Type', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Calories', 'Comment']];
    Object.keys(appState.savedData).sort((a, b) => a.localeCompare(b)).forEach(dateStr => {
        // Support both new 'diet' key and old 'calories' key
        const foods = appState.savedData[dateStr]?.diet || appState.savedData[dateStr]?.calories;
        // Handle new array format (multiple food items)
        if (Array.isArray(foods)) {
            foods.forEach(food => {
                if (food.item || food.calories || food.protein) {
                    dietData.push([
                        dateStr,
                        food.item || '',
                        food.portion || 0,
                        food.type || '',
                        food.protein || 0,
                        food.carbs || 0,
                        food.fat || 0,
                        food.calories || 0,
                        food.comment || ''
                    ]);
                }
            });
        }
    });
    const dietSheet = XLSX.utils.aoa_to_sheet(dietData);
    dietSheet['!cols'] = [{ width: 12 }, { width: 20 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 8 }, { width: 10 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, dietSheet, 'Diet');

    // Sheet 4: Fitness (updated columns with Type) - sorted by date oldest to newest
    const fitnessData = [['Date', 'Exercise', 'Type', 'Sets', 'Reps', 'kg', 'Duration (min)', 'Burnt (kcal)', 'Comment']];
    Object.keys(appState.savedData).sort((a, b) => a.localeCompare(b)).forEach(dateStr => {
        const exercises = appState.savedData[dateStr]?.fitness || [];
        exercises.forEach(ex => {
            if (ex.exercise || ex.sets || ex.reps || ex.caloriesBurnt || ex.duration || ex.kg) {
                fitnessData.push([
                    dateStr,
                    ex.exercise || '',
                    ex.type || 'exercise',
                    ex.sets || 0,
                    ex.reps || 0,
                    ex.kg || ex.weight || 0,  // Support both new 'kg' and old 'weight' keys
                    ex.duration || 0,
                    ex.caloriesBurnt || 0,
                    ex.comment || ''
                ]);
            }
        });
    });
    const fitnessSheet = XLSX.utils.aoa_to_sheet(fitnessData);
    fitnessSheet['!cols'] = [{ width: 12 }, { width: 22 }, { width: 10 }, { width: 6 }, { width: 6 }, { width: 8 }, { width: 12 }, { width: 10 }, { width: 25 }];
    XLSX.utils.book_append_sheet(workbook, fitnessSheet, 'Fitness');

    // Save file
    const today = new Date();
    const todayStr = formatDateForStorage(today.getFullYear(), today.getMonth(), today.getDate());
    const filename = `Timetable_All_Days_${todayStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
    console.log(`Exported to ${filename}`);
}

function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Helper function for date parsing
            function parseExcelDate(value) {
                if (typeof value === 'number') {
                    // Excel date serial: days since Dec 30, 1899 (Excel's epoch with leap year bug)
                    // Use UTC to avoid timezone issues
                    const excelEpoch = Date.UTC(1899, 11, 30); // Dec 30, 1899
                    const dateMs = excelEpoch + Math.round(value) * 24 * 60 * 60 * 1000;
                    const date = new Date(dateMs);
                    return formatDateForStorage(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                } else if (typeof value === 'string') {
                    if (value.includes('-') && value.length >= 8) return value;
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return formatDateForStorage(date.getFullYear(), date.getMonth(), date.getDate());
                    }
                }
                return null;
            }

            // Import Timetable sheet
            if (workbook.SheetNames.includes('Timetable')) {
                const worksheet = workbook.Sheets['Timetable'];
                const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (excelData.length >= 2) {
                    const dataByDate = {};

                    excelData.slice(1).forEach((rowData) => {
                        if (rowData.length >= 7) {
                            const dateStr = parseExcelDate(rowData[0]);
                            if (dateStr) {
                                if (!dataByDate[dateStr]) dataByDate[dateStr] = [];

                                const categoryLabel = rowData[5] || '';
                                let categoryValue = '';
                                if (categoryLabel) {
                                    const allCategories = [...PRESET_CATEGORIES, ...customCategories];
                                    const category = allCategories.find(cat =>
                                        cat.label === categoryLabel ||
                                        cat.label.toLowerCase().includes(categoryLabel.toLowerCase())
                                    );
                                    categoryValue = category ? category.value : categoryLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
                                }

                                const hasNewFormat = rowData.length >= 10;
                                const isBuffer = rowData[7] === true || rowData[7] === 'true' || rowData[7] === 'TRUE';
                                const rowType = hasNewFormat ? (rowData[8] || '') : '';
                                const position = hasNewFormat ? (parseInt(rowData[9]) || 0) : 0;

                                dataByDate[dateStr].push({
                                    duration: (parseFloat(rowData[3]) || 0).toFixed(2),
                                    task: rowData[4] || '',
                                    category: categoryValue,
                                    comment: rowData[6] || '',
                                    isBuffer: isBuffer,
                                    rowType: rowType,
                                    position: position
                                });
                            }
                        }
                    });

                    // Process and save timetables
                    Object.keys(dataByDate).forEach(dateStr => {
                        const importedRows = dataByDate[dateStr];
                        importedRows.sort((a, b) => a.position - b.position);

                        const properTimetable = [];
                        let currentRowId = 0;

                        let startRow = importedRows.find(row => row.rowType === 'start');
                        let endRow = importedRows.find(row => row.rowType === 'end');
                        let bufferRow = importedRows.find(row => row.rowType === 'buffer' || row.isBuffer);
                        let activityRows = importedRows.filter(row =>
                            row.rowType === 'activity' ||
                            (row.rowType === '' && !row.isBuffer && row !== startRow && row !== endRow)
                        );

                        // Fallback identification
                        if (!startRow && !endRow && !bufferRow) {
                            startRow = importedRows.find(row => row.task.toLowerCase().includes('start'));
                            endRow = importedRows.find(row => row.task.toLowerCase().includes('end'));
                            bufferRow = importedRows.find(row =>
                                row.isBuffer || row.task.toLowerCase().includes('sleep') ||
                                row.task.toLowerCase().includes('buffer')
                            );
                            activityRows = importedRows.filter(row =>
                                row !== startRow && row !== endRow && row !== bufferRow
                            );
                        }

                        // Build timetable
                        properTimetable.push({
                            id: currentRowId++,
                            duration: CONFIG.FIXED_ROW_DURATION.toFixed(2),
                            task: startRow?.task || 'Start',
                            category: startRow?.category || '',
                            comment: startRow?.comment || '',
                            isBuffer: false
                        });

                        activityRows.forEach(row => {
                            properTimetable.push({
                                id: currentRowId++,
                                duration: row.duration,
                                task: row.task,
                                category: row.category,
                                comment: row.comment || '',
                                isBuffer: false
                            });
                        });

                        properTimetable.push({
                            id: currentRowId++,
                            duration: bufferRow?.duration || (23 + 59/60).toFixed(2),
                            task: bufferRow?.task || 'Sleep',
                            category: bufferRow?.category || 'sleeping',
                            comment: bufferRow?.comment || '',
                            isBuffer: true
                        });

                        properTimetable.push({
                            id: currentRowId++,
                            duration: CONFIG.FIXED_ROW_DURATION.toFixed(2),
                            task: endRow?.task || 'Day End',
                            category: endRow?.category || '',
                            comment: endRow?.comment || '',
                            isBuffer: false
                        });

                        savedTimetables[dateStr] = properTimetable;
                        if (!loggedDays.includes(dateStr)) loggedDays.push(dateStr);
                    });
                }
            }

            // Import Diary sheet
            if (workbook.SheetNames.includes('Diary')) {
                const diarySheet = workbook.Sheets['Diary'];
                const diaryData = XLSX.utils.sheet_to_json(diarySheet, { header: 1 });

                diaryData.slice(1).forEach(row => {
                    if (row[0] && row[1]) {
                        const dateStr = parseExcelDate(row[0]) || row[0];
                        if (!appState.savedData[dateStr]) appState.savedData[dateStr] = {};
                        appState.savedData[dateStr].diary = row[1];
                    }
                });
            }

            // Import Diet sheet (new format with macros) - also check for old 'Calories' sheet name
            const dietSheetName = workbook.SheetNames.includes('Diet') ? 'Diet' :
                                  workbook.SheetNames.includes('Calories') ? 'Calories' : null;

            if (dietSheetName) {
                const dietSheet = workbook.Sheets[dietSheetName];
                const dietData = XLSX.utils.sheet_to_json(dietSheet, { header: 1 });

                // Check header to determine format
                const headerRow = dietData[0] || [];
                const hasNewFormat = headerRow.includes('Protein (g)') || headerRow.includes('Portion (g)');

                const dietByDate = {};
                dietData.slice(1).forEach(row => {
                    if (row[0]) {
                        const dateStr = parseExcelDate(row[0]) || row[0];
                        if (!dietByDate[dateStr]) dietByDate[dateStr] = [];

                        if (hasNewFormat) {
                            // New format: Date, Food Item, Portion, Type, Protein, Carbs, Fat, Calories, Comment
                            dietByDate[dateStr].push({
                                item: row[1] || '',
                                portion: parseInt(row[2]) || 0,
                                type: row[3] || '',
                                protein: parseInt(row[4]) || 0,
                                carbs: parseInt(row[5]) || 0,
                                fat: parseInt(row[6]) || 0,
                                calories: parseInt(row[7]) || 0,
                                comment: row[8] || ''
                            });
                        } else {
                            // Old format: Date, Food Item, Type, Class, Calories, Comment
                            dietByDate[dateStr].push({
                                item: row[1] || '',
                                portion: 0,
                                type: row[2] || '',
                                protein: 0,
                                carbs: 0,
                                fat: 0,
                                calories: parseInt(row[4]) || 0,
                                comment: row[5] || ''
                            });
                        }
                    }
                });

                Object.keys(dietByDate).forEach(dateStr => {
                    if (!appState.savedData[dateStr]) appState.savedData[dateStr] = {};
                    appState.savedData[dateStr].diet = dietByDate[dateStr];
                });
            }

            // Import Fitness sheet (format: Date, Exercise, Type, Sets, Reps, kg, Duration, Burnt, Comment)
            if (workbook.SheetNames.includes('Fitness')) {
                const fitnessSheet = workbook.Sheets['Fitness'];
                const fitnessData = XLSX.utils.sheet_to_json(fitnessSheet, { header: 1 });

                // Check header to determine format
                const headerRow = fitnessData[0] || [];
                const hasTypeColumn = headerRow.includes('Type');
                const hasNewFormat = headerRow.includes('Duration (min)') || headerRow.includes('Duration');

                const fitnessByDate = {};
                fitnessData.slice(1).forEach(row => {
                    if (row[0]) {
                        const dateStr = parseExcelDate(row[0]) || row[0];
                        if (!fitnessByDate[dateStr]) fitnessByDate[dateStr] = [];

                        if (hasTypeColumn) {
                            // Newest format: Date, Exercise, Type, Sets, Reps, kg, Duration, Burnt, Comment
                            fitnessByDate[dateStr].push({
                                exercise: row[1] || '',
                                type: row[2] || 'exercise',
                                sets: parseInt(row[3]) || 0,
                                reps: parseInt(row[4]) || 0,
                                kg: parseFloat(row[5]) || 0,
                                duration: parseInt(row[6]) || 0,
                                caloriesBurnt: parseInt(row[7]) || 0,
                                comment: row[8] || ''
                            });
                        } else if (hasNewFormat) {
                            // Previous format: Date, Exercise, Sets, Reps, kg, Duration, Burnt, Comment
                            fitnessByDate[dateStr].push({
                                exercise: row[1] || '',
                                type: 'exercise',
                                sets: parseInt(row[2]) || 0,
                                reps: parseInt(row[3]) || 0,
                                kg: parseFloat(row[4]) || 0,
                                duration: parseInt(row[5]) || 0,
                                caloriesBurnt: parseInt(row[6]) || 0,
                                comment: row[7] || ''
                            });
                        } else {
                            // Old format: Date, Exercise, Sets, Reps, Weight, Body Wt, Steps, Distance, Burnt, Comment
                            fitnessByDate[dateStr].push({
                                exercise: row[1] || '',
                                type: 'exercise',
                                sets: parseInt(row[2]) || 0,
                                reps: parseInt(row[3]) || 0,
                                kg: parseFloat(row[4]) || 0,
                                duration: 0,
                                caloriesBurnt: parseInt(row[8]) || 0,
                                comment: row[9] || ''
                            });
                        }
                    }
                });

                Object.keys(fitnessByDate).forEach(dateStr => {
                    if (!appState.savedData[dateStr]) appState.savedData[dateStr] = {};
                    appState.savedData[dateStr].fitness = fitnessByDate[dateStr];
                });
            }

            // Reload current date
            const currentDateStr = getCurrentDateStr();
            if (savedTimetables[currentDateStr]) {
                const tbody = document.getElementById('timetableBody');
                tbody.innerHTML = '';
                const savedData = savedTimetables[currentDateStr];
                // Handle both old format (array) and new format (object with startHour and rows)
                if (Array.isArray(savedData)) {
                    loadTimetableData(savedData);
                } else {
                    if (savedData.startHour !== undefined) {
                        startHour = savedData.startHour;
                        document.getElementById('startTimeSelect').value = startHour;
                    }
                    loadTimetableData(savedData.rows || []);
                }
            }

            loadAllTabsForDate();
            saveData();
            generateCalendars();

            alert('Successfully imported data from Excel!');

        } catch (error) {
            console.error('Error importing Excel file:', error);
            alert('Error importing Excel file. Please check the format and try again.');
        }

        event.target.value = '';
    };

    reader.readAsArrayBuffer(file);
}

// Keep presetCategories as alias for backward compatibility
const presetCategories = PRESET_CATEGORIES;

// =============================================================================
// LOAD TEMPLATE FUNCTIONALITY
// =============================================================================

function showLoadTemplateModal() {
    const template = getTemplateForDate(selectedDate);
    const workoutName = getWorkoutNameForDay(template.dayNumber);

    const modalHtml = `
        <div class="modal-overlay" id="templateModal">
            <div class="modal-content">
                <h3>Load Template for ${template.dayName}</h3>
                <p class="modal-subtitle">${workoutName} Day</p>

                <div class="template-options">
                    <label class="template-checkbox">
                        <input type="checkbox" id="loadTimetable" checked>
                        <span>Timetable</span>
                        <small>${template.timetable.rows.length} activities</small>
                    </label>

                    <label class="template-checkbox">
                        <input type="checkbox" id="loadDiet" checked>
                        <span>Diet</span>
                        <small>${template.diet.length} food items</small>
                    </label>

                    <label class="template-checkbox">
                        <input type="checkbox" id="loadFitness" checked>
                        <span>Fitness</span>
                        <small>${template.fitness.length} exercises</small>
                    </label>
                </div>

                <div class="modal-warning">
                    <small>This will replace existing data for the selected day.</small>
                </div>

                <div class="modal-buttons">
                    <button class="btn btn-secondary" onclick="closeTemplateModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="loadSelectedTemplates()">Load Template</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeTemplateModal() {
    const modal = document.getElementById('templateModal');
    if (modal) modal.remove();
}

function loadSelectedTemplates() {
    const loadTimetable = document.getElementById('loadTimetable').checked;
    const loadDiet = document.getElementById('loadDiet').checked;
    const loadFitness = document.getElementById('loadFitness').checked;

    if (!loadTimetable && !loadDiet && !loadFitness) {
        alert('Please select at least one template to load.');
        return;
    }

    const template = getTemplateForDate(selectedDate);
    const dateStr = getCurrentDateStr();

    // Ensure date entry exists
    if (!appState.savedData[dateStr]) {
        appState.savedData[dateStr] = {};
    }

    if (loadTimetable) {
        loadTimetableTemplate(template.timetable);
    }

    if (loadDiet) {
        loadDietTemplate(template.diet);
    }

    if (loadFitness) {
        loadFitnessTemplate(template.fitness);
    }

    saveData();
    closeTemplateModal();

    const loaded = [];
    if (loadTimetable) loaded.push('Timetable');
    if (loadDiet) loaded.push('Diet');
    if (loadFitness) loaded.push('Fitness');

    alert(`Loaded: ${loaded.join(', ')} template for ${template.dayName}`);
}

function loadTimetableTemplate(template) {
    // Set start hour
    startHour = template.startHour;
    appState.startHour = template.startHour;
    document.getElementById('startTimeSelect').value = template.startHour;

    // Clear existing timetable
    const tbody = document.getElementById('timetableBody');
    tbody.innerHTML = '';

    // Reset row counter
    rowCounter = 0;

    // Add rows from template (all except last one, which becomes auto-fill)
    const templateRows = template.rows;

    templateRows.forEach((rowData, index) => {
        const isLastRow = index === templateRows.length - 1;
        const row = createTableRow(rowCounter++);

        // Set values
        const durationInput = row.querySelector('.duration');
        const taskInput = row.querySelector('.task');
        const categorySelect = row.querySelector('.category-select');
        const commentInput = row.querySelector('.comment');

        if (durationInput) durationInput.value = rowData.duration;
        if (taskInput) taskInput.value = rowData.task;
        if (commentInput) commentInput.value = rowData.comment || '';

        // Set category
        if (categorySelect && rowData.category) {
            categorySelect.value = rowData.category;
            updateCategoryDisplay(categorySelect, rowData.category);
        }

        // Make last row the auto-fill row
        if (isLastRow) {
            row.dataset.isAutoFill = 'true';
            if (durationInput) durationInput.readOnly = true;
        }

        tbody.appendChild(row);
    });

    // Update display
    redistributeTime();
    updateRowButtons();
    saveData();
}

function loadDietTemplate(dietItems) {
    const tbody = document.getElementById('dietBody');
    if (!tbody) {
        console.error('Diet tbody not found');
        return;
    }

    tbody.innerHTML = '';

    dietItems.forEach(food => {
        const row = document.createElement('tr');
        // Use explicit checks to preserve 0 values
        const portion = food.portion !== undefined ? food.portion : '';
        const protein = food.protein !== undefined ? food.protein : '';
        const carbs = food.carbs !== undefined ? food.carbs : '';
        const fat = food.fat !== undefined ? food.fat : '';
        const calories = food.calories !== undefined ? food.calories : '';

        row.innerHTML = `
            <td><input type="text" class="food-item" placeholder="Food item" value="${food.item || ''}"></td>
            <td><input type="number" class="food-portion" min="0" placeholder="g" value="${portion}"></td>
            <td>
                <select class="food-type">
                    <option value="">-</option>
                    <option value="food" ${food.type === 'food' ? 'selected' : ''}>Food</option>
                    <option value="drink" ${food.type === 'drink' ? 'selected' : ''}>Drink</option>
                    <option value="snack" ${food.type === 'snack' ? 'selected' : ''}>Snack</option>
                    <option value="supplement" ${food.type === 'supplement' ? 'selected' : ''}>Supplement</option>
                    <option value="meal" ${food.type === 'meal' ? 'selected' : ''}>Meal</option>
                </select>
            </td>
            <td><input type="number" class="food-protein" min="0" placeholder="0" value="${protein}"></td>
            <td><input type="number" class="food-carbs" min="0" placeholder="0" value="${carbs}"></td>
            <td><input type="number" class="food-fat" min="0" placeholder="0" value="${fat}"></td>
            <td><input type="number" class="food-calories" min="0" placeholder="0" value="${calories}"></td>
            <td><input type="text" class="food-comment" placeholder="Notes" value="${food.comment || ''}"></td>
            <td class="actions">
                <button class="add-btn" onclick="addDietRow(this.closest('tr'))">+</button>
                <button class="delete-btn" onclick="deleteDietRow(this)">-</button>
            </td>
        `;

        row.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => {
                saveDiet();
                updateDietStats();
            });
            el.addEventListener('change', () => {
                saveDiet();
                updateDietStats();
            });
        });

        tbody.appendChild(row);
    });

    // Save diet data and update stats
    saveDiet();
    updateDietStats();
}

function loadFitnessTemplate(exercises) {
    const tbody = document.getElementById('fitnessBody');
    if (!tbody) {
        console.error('Fitness tbody not found');
        return;
    }

    tbody.innerHTML = '';

    exercises.forEach(ex => {
        const row = document.createElement('tr');
        // Use explicit checks to preserve 0 values
        const typeValue = ex.type || 'exercise';
        const sets = ex.sets !== undefined ? ex.sets : '';
        const reps = ex.reps !== undefined ? ex.reps : '';
        const kg = ex.kg !== undefined ? ex.kg : '';
        const duration = ex.duration !== undefined ? ex.duration : '';
        const caloriesBurnt = ex.caloriesBurnt !== undefined ? ex.caloriesBurnt : '';

        row.innerHTML = `
            <td><input type="text" class="exercise-name" placeholder="Exercise" value="${ex.exercise || ''}"></td>
            <td>
                <select class="exercise-type">
                    <option value="exercise" ${typeValue === 'exercise' ? 'selected' : ''}>Exercise</option>
                    <option value="body" ${typeValue === 'body' ? 'selected' : ''}>Body</option>
                </select>
            </td>
            <td><input type="number" class="sets" min="0" placeholder="0" value="${sets}"></td>
            <td><input type="number" class="reps" min="0" placeholder="0" value="${reps}"></td>
            <td><input type="number" class="weight-kg" min="0" step="0.5" placeholder="0" value="${kg}"></td>
            <td><input type="number" class="duration-min" min="0" placeholder="0" value="${duration}"></td>
            <td><input type="number" class="calories-burnt" min="0" placeholder="0" value="${caloriesBurnt}"></td>
            <td><input type="text" class="exercise-comment" placeholder="Notes" value="${ex.comment || ''}"></td>
            <td class="actions">
                <button class="add-btn" onclick="addFitnessRow(this.closest('tr'))">+</button>
                <button class="delete-btn" onclick="deleteFitnessRow(this)">-</button>
            </td>
        `;

        row.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => {
                saveFitness();
                updateFitnessStats();
            });
            input.addEventListener('change', () => {
                saveFitness();
                updateFitnessStats();
            });
        });

        tbody.appendChild(row);
    });

    // Save fitness data and update stats
    saveFitness();
    updateFitnessStats();
}
