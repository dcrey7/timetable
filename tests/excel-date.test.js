/**
 * Unit Tests for Excel Date Calculations
 * Run with: node tests/excel-date.test.js
 */

// ============ Helper Functions (copied from script.js) ============

function formatDateForStorage(year, month, day) {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Export: Convert date string to Excel serial number
function dateToExcelSerial(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const excelDate = Date.UTC(year, month - 1, day);
    const excelEpoch = Date.UTC(1899, 11, 30); // Dec 30, 1899
    return Math.round((excelDate - excelEpoch) / (24 * 60 * 60 * 1000));
}

// Import: Convert Excel serial number to date string
function excelSerialToDate(serial) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const dateMs = excelEpoch + Math.round(serial) * 24 * 60 * 60 * 1000;
    const date = new Date(dateMs);
    return formatDateForStorage(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// Sorting function for dates
function sortDatesOldestFirst(dates) {
    return [...dates].sort((a, b) => a.localeCompare(b));
}

// ============ Test Framework ============

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    testsRun++;
    try {
        fn();
        testsPassed++;
        console.log(`  ✓ ${name}`);
    } catch (error) {
        testsFailed++;
        console.log(`  ✗ ${name}`);
        console.log(`    Error: ${error.message}`);
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message} Expected ${expected}, got ${actual}`);
    }
}

function assertArrayEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// ============ Test Suites ============

console.log('\n=== Excel Date Calculation Tests ===\n');

console.log('Date to Excel Serial:');
test('January 1, 2026 should be 46023', () => {
    assertEqual(dateToExcelSerial('2026-01-01'), 46023);
});

test('January 5, 2026 should be 46027', () => {
    assertEqual(dateToExcelSerial('2026-01-05'), 46027);
});

test('January 1, 2000 should be 36526', () => {
    assertEqual(dateToExcelSerial('2000-01-01'), 36526);
});

test('December 31, 2025 should be 46022', () => {
    assertEqual(dateToExcelSerial('2025-12-31'), 46022);
});

test('March 1, 1900 should be 61 (after leap year bug)', () => {
    assertEqual(dateToExcelSerial('1900-03-01'), 61);
});

console.log('\nExcel Serial to Date:');
test('46023 should be January 1, 2026', () => {
    assertEqual(excelSerialToDate(46023), '2026-01-01');
});

test('46027 should be January 5, 2026', () => {
    assertEqual(excelSerialToDate(46027), '2026-01-05');
});

test('36526 should be January 1, 2000', () => {
    assertEqual(excelSerialToDate(36526), '2000-01-01');
});

console.log('\nRoundtrip Tests (Export -> Import):');
test('All dates in January 2026 should roundtrip correctly', () => {
    for (let day = 1; day <= 31; day++) {
        const dateStr = `2026-01-${day.toString().padStart(2, '0')}`;
        const serial = dateToExcelSerial(dateStr);
        const backToDate = excelSerialToDate(serial);
        assertEqual(backToDate, dateStr, `Day ${day}:`);
    }
});

test('Leap year date Feb 29, 2024 should roundtrip correctly', () => {
    const dateStr = '2024-02-29';
    const serial = dateToExcelSerial(dateStr);
    const backToDate = excelSerialToDate(serial);
    assertEqual(backToDate, dateStr);
});

test('Year boundary Dec 31 -> Jan 1 should work correctly', () => {
    const dec31 = dateToExcelSerial('2025-12-31');
    const jan1 = dateToExcelSerial('2026-01-01');
    assertEqual(jan1 - dec31, 1, 'Consecutive days should differ by 1');
});

test('Full year 2026 roundtrip (365 days)', () => {
    for (let i = 0; i < 365; i++) {
        const date = new Date(Date.UTC(2026, 0, 1 + i));
        const dateStr = formatDateForStorage(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const serial = dateToExcelSerial(dateStr);
        const backToDate = excelSerialToDate(serial);
        assertEqual(backToDate, dateStr, `Day ${i + 1} of 2026:`);
    }
});

console.log('\nDate Sorting Tests:');
test('Unsorted dates should be sorted oldest to newest', () => {
    const unsorted = ['2026-01-05', '2025-12-20', '2026-01-01', '2025-11-15', '2026-01-03'];
    const sorted = sortDatesOldestFirst(unsorted);
    assertArrayEqual(sorted, ['2025-11-15', '2025-12-20', '2026-01-01', '2026-01-03', '2026-01-05']);
});

test('Already sorted dates should remain unchanged', () => {
    const sorted = ['2025-01-01', '2025-06-15', '2026-01-01'];
    const result = sortDatesOldestFirst(sorted);
    assertArrayEqual(result, sorted);
});

test('Single date should return unchanged', () => {
    const single = ['2026-01-05'];
    const result = sortDatesOldestFirst(single);
    assertArrayEqual(result, single);
});

test('Empty array should return empty', () => {
    const empty = [];
    const result = sortDatesOldestFirst(empty);
    assertArrayEqual(result, []);
});

test('Original array should not be mutated', () => {
    const original = ['2026-01-05', '2025-01-01'];
    const originalCopy = [...original];
    sortDatesOldestFirst(original);
    assertArrayEqual(original, originalCopy);
});

console.log('\nEdge Cases:');
test('First day of each month 2026', () => {
    const firstDays = [
        '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01',
        '2026-05-01', '2026-06-01', '2026-07-01', '2026-08-01',
        '2026-09-01', '2026-10-01', '2026-11-01', '2026-12-01'
    ];
    firstDays.forEach(dateStr => {
        const serial = dateToExcelSerial(dateStr);
        const backToDate = excelSerialToDate(serial);
        assertEqual(backToDate, dateStr, `${dateStr}:`);
    });
});

test('Last day of each month 2026', () => {
    const lastDays = [
        '2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30',
        '2026-05-31', '2026-06-30', '2026-07-31', '2026-08-31',
        '2026-09-30', '2026-10-31', '2026-11-30', '2026-12-31'
    ];
    lastDays.forEach(dateStr => {
        const serial = dateToExcelSerial(dateStr);
        const backToDate = excelSerialToDate(serial);
        assertEqual(backToDate, dateStr, `${dateStr}:`);
    });
});

test('formatDateForStorage handles single digit months and days', () => {
    assertEqual(formatDateForStorage(2026, 0, 5), '2026-01-05');
    assertEqual(formatDateForStorage(2026, 11, 25), '2026-12-25');
    assertEqual(formatDateForStorage(2026, 8, 9), '2026-09-09');
});

// ============ Summary ============

console.log('\n=== Test Summary ===');
console.log(`Total: ${testsRun}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed!\n');
    process.exit(1);
}
