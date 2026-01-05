// =============================================================================
// DEFAULT TEMPLATES - Based on Fat Loss Plan Document
// =============================================================================

const DEFAULT_TEMPLATES = {
    // =============================================================================
    // TIMETABLE TEMPLATES (per day of week)
    // =============================================================================
    timetable: {
        // Monday - Back + Biceps
        1: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 5, task: 'Work', category: 'working', comment: 'Morning block' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Chicken+rice+dal' },
                { duration: 3, task: 'Work', category: 'working', comment: 'Afternoon block' },
                { duration: 1.5, task: 'Gym - Back + Biceps', category: 'exercise', comment: '' },
                { duration: 0.5, task: 'Cardio Walk', category: 'exercise', comment: '15 min incline' },
                { duration: 3, task: 'Personal Time', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Chicken curry+naan' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: 'Yogurt+fruit' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Tuesday - Chest + Triceps
        2: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 5, task: 'Work', category: 'working', comment: 'Morning block' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Chicken+rice+dal' },
                { duration: 3, task: 'Work', category: 'working', comment: 'Afternoon block' },
                { duration: 1.5, task: 'Gym - Chest + Triceps', category: 'exercise', comment: '' },
                { duration: 0.5, task: 'Rest/Shower', category: 'personal', comment: 'No cardio today' },
                { duration: 3, task: 'Personal Time', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Chicken curry+naan' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: 'Yogurt+fruit' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Wednesday - Cardio + Abs
        3: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 5, task: 'Work', category: 'working', comment: 'Morning block' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Meatballs+spaghetti' },
                { duration: 3, task: 'Work', category: 'working', comment: 'Afternoon block' },
                { duration: 0.5, task: 'Gym - Abs', category: 'exercise', comment: '' },
                { duration: 0.5, task: 'Cardio', category: 'exercise', comment: '30 min steady' },
                { duration: 3.5, task: 'Personal Time', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Kerala beef+rice' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: 'Yogurt+fruit' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Thursday - Legs
        4: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 5, task: 'Work', category: 'working', comment: 'Morning block' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Meatballs+spaghetti' },
                { duration: 3, task: 'Work', category: 'working', comment: 'Afternoon block' },
                { duration: 1.5, task: 'Gym - Legs', category: 'exercise', comment: '' },
                { duration: 0.25, task: 'Recovery Walk', category: 'exercise', comment: '10 min' },
                { duration: 3.25, task: 'Personal Time', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Kerala beef+rice' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: 'Yogurt+fruit' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Friday - Shoulders + Arms
        5: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 5, task: 'Work', category: 'working', comment: 'Morning block' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Chicken+noodles' },
                { duration: 3, task: 'Work', category: 'working', comment: 'Afternoon block' },
                { duration: 1.5, task: 'Gym - Shoulders + Arms', category: 'exercise', comment: '' },
                { duration: 0.5, task: 'Cardio Walk', category: 'exercise', comment: '15 min incline' },
                { duration: 3, task: 'Personal Time', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Dal+rice+eggs' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: 'Yogurt+fruit' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Saturday - Football + Cheat Meal
        6: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: 'Sleep in ok' },
                { duration: 5, task: 'Personal Time', category: 'chilling', comment: 'Weekend' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Normal meal' },
                { duration: 2, task: 'Rest/Digest', category: 'chilling', comment: 'Before football' },
                { duration: 2, task: 'Football', category: 'exercise', comment: 'Weekly game' },
                { duration: 1, task: 'Post-Game Rest', category: 'personal', comment: 'Shower etc' },
                { duration: 3, task: 'Evening', category: 'chilling', comment: 'Social time' },
                { duration: 1, task: 'Cheat Meal Dinner', category: 'eating', comment: 'Weekly treat' },
                { duration: 0.5, task: 'Evening', category: 'chilling', comment: '' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        },
        // Sunday - Rest + Meal Prep
        0: {
            startHour: 6,
            rows: [
                { duration: 1, task: 'Morning Routine', category: 'personal', comment: '' },
                { duration: 1, task: 'Light Walk/Stretch', category: 'exercise', comment: 'Recovery' },
                { duration: 3, task: 'Meal Prep', category: 'eating', comment: 'Batch cooking' },
                { duration: 1, task: 'Lunch', category: 'eating', comment: 'Leftovers' },
                { duration: 6, task: 'Personal Time', category: 'chilling', comment: 'Relax' },
                { duration: 3, task: 'Evening', category: 'chilling', comment: '' },
                { duration: 1, task: 'Dinner', category: 'eating', comment: 'Leftover cleanup' },
                { duration: 0.5, task: 'Evening Snack', category: 'eating', comment: '' },
                { duration: 1.5, task: 'Wind Down', category: 'personal', comment: '' },
                { duration: 6, task: 'Sleep', category: 'sleeping', comment: '' }
            ]
        }
    },

    // =============================================================================
    // DIET TEMPLATES (per day of week - based on meal rotation)
    // =============================================================================
    diet: {
        // Monday - Chicken + Dal day
        1: [
            { item: 'Chicken breast', portion: 200, type: 'food', protein: 62, carbs: 0, fat: 7, calories: 330, comment: 'Lunch' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Lunch' },
            { item: 'Dal', portion: 200, type: 'food', protein: 18, carbs: 40, fat: 2, calories: 230, comment: 'Lunch' },
            { item: 'Wok vegetables', portion: 200, type: 'food', protein: 4, carbs: 15, fat: 2, calories: 80, comment: 'Lunch' },
            { item: 'Cooking oil', portion: 15, type: 'food', protein: 0, carbs: 0, fat: 14, calories: 120, comment: '1 tbsp' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large snack' },
            { item: 'Apple', portion: 180, type: 'snack', protein: 0, carbs: 25, fat: 0, calories: 95, comment: 'Snack' },
            { item: 'Chicken curry', portion: 200, type: 'food', protein: 40, carbs: 8, fat: 15, calories: 335, comment: 'Dinner' },
            { item: 'Naan', portion: 90, type: 'food', protein: 8, carbs: 45, fat: 5, calories: 260, comment: 'Dinner' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Berries', portion: 100, type: 'snack', protein: 1, carbs: 12, fat: 0, calories: 50, comment: 'Evening' },
            { item: 'Whey protein', portion: 30, type: 'supplement', protein: 24, carbs: 3, fat: 2, calories: 120, comment: 'Post-workout' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Black coffee', portion: 500, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 10, comment: '2 cups' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ],
        // Tuesday - same as Monday
        2: [
            { item: 'Chicken breast', portion: 200, type: 'food', protein: 62, carbs: 0, fat: 7, calories: 330, comment: 'Lunch' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Lunch' },
            { item: 'Dal', portion: 200, type: 'food', protein: 18, carbs: 40, fat: 2, calories: 230, comment: 'Lunch' },
            { item: 'Wok vegetables', portion: 200, type: 'food', protein: 4, carbs: 15, fat: 2, calories: 80, comment: 'Lunch' },
            { item: 'Cooking oil', portion: 15, type: 'food', protein: 0, carbs: 0, fat: 14, calories: 120, comment: '1 tbsp' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large snack' },
            { item: 'Banana', portion: 120, type: 'snack', protein: 1, carbs: 27, fat: 0, calories: 105, comment: 'Snack' },
            { item: 'Chicken curry', portion: 200, type: 'food', protein: 40, carbs: 8, fat: 15, calories: 335, comment: 'Dinner' },
            { item: 'Naan', portion: 90, type: 'food', protein: 8, carbs: 45, fat: 5, calories: 260, comment: 'Dinner' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Strawberries', portion: 100, type: 'snack', protein: 1, carbs: 8, fat: 0, calories: 32, comment: 'Evening' },
            { item: 'Whey protein', portion: 30, type: 'supplement', protein: 24, carbs: 3, fat: 2, calories: 120, comment: 'Post-workout' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Black coffee', portion: 500, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 10, comment: '2 cups' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ],
        // Wednesday - Meatballs + Beef
        3: [
            { item: 'Beef meatballs', portion: 150, type: 'food', protein: 35, carbs: 5, fat: 18, calories: 320, comment: 'Lunch' },
            { item: 'Spaghetti', portion: 150, type: 'food', protein: 7, carbs: 45, fat: 1, calories: 220, comment: 'Lunch' },
            { item: 'Tomato sauce', portion: 100, type: 'food', protein: 2, carbs: 8, fat: 1, calories: 50, comment: 'Lunch' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large snack' },
            { item: 'Banana', portion: 120, type: 'snack', protein: 1, carbs: 27, fat: 0, calories: 105, comment: 'Snack' },
            { item: 'Kerala beef fry', portion: 150, type: 'food', protein: 38, carbs: 5, fat: 15, calories: 310, comment: 'Dinner' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Dinner' },
            { item: 'Dal', portion: 150, type: 'food', protein: 14, carbs: 30, fat: 1, calories: 175, comment: 'Dinner' },
            { item: 'Vegetables', portion: 150, type: 'food', protein: 3, carbs: 10, fat: 2, calories: 60, comment: 'Dinner' },
            { item: 'Cooking oil', portion: 15, type: 'food', protein: 0, carbs: 0, fat: 14, calories: 120, comment: '1 tbsp' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Orange', portion: 150, type: 'snack', protein: 1, carbs: 15, fat: 0, calories: 65, comment: 'Evening' },
            { item: 'Whey protein', portion: 30, type: 'supplement', protein: 24, carbs: 3, fat: 2, calories: 120, comment: 'Post-workout' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Black coffee', portion: 500, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 10, comment: '2 cups' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ],
        // Thursday - same as Wednesday
        4: [
            { item: 'Beef meatballs', portion: 150, type: 'food', protein: 35, carbs: 5, fat: 18, calories: 320, comment: 'Lunch' },
            { item: 'Spaghetti', portion: 150, type: 'food', protein: 7, carbs: 45, fat: 1, calories: 220, comment: 'Lunch' },
            { item: 'Tomato sauce', portion: 100, type: 'food', protein: 2, carbs: 8, fat: 1, calories: 50, comment: 'Lunch' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large snack' },
            { item: 'Apple', portion: 180, type: 'snack', protein: 0, carbs: 25, fat: 0, calories: 95, comment: 'Snack' },
            { item: 'Kerala beef fry', portion: 150, type: 'food', protein: 38, carbs: 5, fat: 15, calories: 310, comment: 'Dinner' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Dinner' },
            { item: 'Dal', portion: 150, type: 'food', protein: 14, carbs: 30, fat: 1, calories: 175, comment: 'Dinner' },
            { item: 'Vegetables', portion: 150, type: 'food', protein: 3, carbs: 10, fat: 2, calories: 60, comment: 'Dinner' },
            { item: 'Cooking oil', portion: 15, type: 'food', protein: 0, carbs: 0, fat: 14, calories: 120, comment: '1 tbsp' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Berries', portion: 100, type: 'snack', protein: 1, carbs: 12, fat: 0, calories: 50, comment: 'Evening' },
            { item: 'Whey protein', portion: 30, type: 'supplement', protein: 24, carbs: 3, fat: 2, calories: 120, comment: 'Post-workout' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Black coffee', portion: 500, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 10, comment: '2 cups' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ],
        // Friday - Chicken + Thai noodles
        5: [
            { item: 'Chicken breast', portion: 200, type: 'food', protein: 62, carbs: 0, fat: 7, calories: 330, comment: 'Lunch' },
            { item: 'Thai rice noodles', portion: 150, type: 'food', protein: 4, carbs: 50, fat: 1, calories: 230, comment: 'Lunch' },
            { item: 'Vegetables stir-fry', portion: 200, type: 'food', protein: 4, carbs: 15, fat: 5, calories: 100, comment: 'Lunch' },
            { item: 'Cooking oil', portion: 15, type: 'food', protein: 0, carbs: 0, fat: 14, calories: 120, comment: '1 tbsp' },
            { item: 'Eggs', portion: 150, type: 'food', protein: 18, carbs: 2, fat: 15, calories: 210, comment: '3 large snack' },
            { item: 'Apple', portion: 180, type: 'snack', protein: 0, carbs: 25, fat: 0, calories: 95, comment: 'Snack' },
            { item: 'Dal', portion: 200, type: 'food', protein: 18, carbs: 40, fat: 2, calories: 230, comment: 'Dinner' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Dinner' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large dinner' },
            { item: 'Vegetables', portion: 150, type: 'food', protein: 3, carbs: 10, fat: 0, calories: 50, comment: 'Dinner' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Berries', portion: 100, type: 'snack', protein: 1, carbs: 12, fat: 0, calories: 50, comment: 'Evening' },
            { item: 'Whey protein', portion: 30, type: 'supplement', protein: 24, carbs: 3, fat: 2, calories: 120, comment: 'Post-workout' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ],
        // Saturday - Cheat Meal Day
        6: [
            { item: 'Chicken breast', portion: 200, type: 'food', protein: 62, carbs: 0, fat: 7, calories: 330, comment: 'Lunch' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Lunch' },
            { item: 'Vegetables', portion: 150, type: 'food', protein: 3, carbs: 10, fat: 0, calories: 50, comment: 'Lunch' },
            { item: 'Banana', portion: 120, type: 'snack', protein: 1, carbs: 27, fat: 0, calories: 105, comment: 'Pre-football' },
            { item: 'Cheat meal', portion: 400, type: 'meal', protein: 30, carbs: 100, fat: 50, calories: 1000, comment: 'Post-football treat' },
            { item: 'Greek yogurt', portion: 100, type: 'snack', protein: 10, carbs: 4, fat: 0, calories: 60, comment: 'Late evening' },
            { item: 'Water', portion: 4000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '4L extra hydration' }
        ],
        // Sunday - Rest + Meal Prep
        0: [
            { item: 'Oats', portion: 50, type: 'food', protein: 7, carbs: 35, fat: 3, calories: 190, comment: 'Breakfast' },
            { item: 'Milk', portion: 200, type: 'drink', protein: 6, carbs: 10, fat: 6, calories: 120, comment: 'Breakfast' },
            { item: 'Mixed nuts', portion: 20, type: 'snack', protein: 4, carbs: 4, fat: 10, calories: 115, comment: 'Breakfast' },
            { item: 'Leftovers', portion: 300, type: 'meal', protein: 40, carbs: 40, fat: 10, calories: 400, comment: 'Lunch' },
            { item: 'Eggs', portion: 100, type: 'food', protein: 12, carbs: 1, fat: 10, calories: 140, comment: '2 large snack' },
            { item: 'Fruit', portion: 150, type: 'snack', protein: 1, carbs: 20, fat: 0, calories: 80, comment: 'Snack' },
            { item: 'Dal fresh', portion: 200, type: 'food', protein: 18, carbs: 40, fat: 2, calories: 230, comment: 'Dinner' },
            { item: 'Rice cooked', portion: 150, type: 'food', protein: 4, carbs: 45, fat: 0, calories: 195, comment: 'Dinner' },
            { item: 'Vegetables', portion: 150, type: 'food', protein: 3, carbs: 10, fat: 0, calories: 50, comment: 'Dinner' },
            { item: 'Greek yogurt', portion: 150, type: 'food', protein: 15, carbs: 6, fat: 0, calories: 90, comment: 'Evening' },
            { item: 'Water', portion: 3000, type: 'drink', protein: 0, carbs: 0, fat: 0, calories: 0, comment: '3L daily' },
            { item: 'Creatine', portion: 5, type: 'supplement', protein: 0, carbs: 0, fat: 0, calories: 0, comment: 'Daily' }
        ]
    },

    // =============================================================================
    // FITNESS TEMPLATES (per day of week)
    // =============================================================================
    fitness: {
        // Monday - Back + Biceps
        1: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Deadlift', sets: 4, reps: 8, kg: 80, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Pull-ups', sets: 4, reps: 10, kg: 0, duration: 0, caloriesBurnt: 0, comment: 'Bodyweight' },
            { exercise: 'Barbell Row', sets: 3, reps: 12, kg: 50, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Seated Cable Row', sets: 3, reps: 12, kg: 40, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Barbell Curl', sets: 3, reps: 12, kg: 25, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Hammer Curl', sets: 3, reps: 12, kg: 12, duration: 0, caloriesBurnt: 0, comment: 'Each arm' },
            { exercise: 'Incline Walk', sets: 0, reps: 0, kg: 0, duration: 15, caloriesBurnt: 100, comment: 'Cardio' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 200, comment: '8000 steps' }
        ],
        // Tuesday - Chest + Triceps
        2: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Bench Press', sets: 4, reps: 10, kg: 60, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Incline DB Press', sets: 3, reps: 12, kg: 20, duration: 0, caloriesBurnt: 0, comment: 'Each arm' },
            { exercise: 'Cable Crossover', sets: 3, reps: 15, kg: 15, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Close-Grip Bench', sets: 3, reps: 10, kg: 40, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Tricep Pushdown', sets: 3, reps: 15, kg: 25, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Overhead Extension', sets: 3, reps: 12, kg: 15, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 200, comment: '8000 steps' }
        ],
        // Wednesday - Cardio + Abs
        3: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Steady Cardio', sets: 0, reps: 0, kg: 0, duration: 30, caloriesBurnt: 250, comment: 'Bike or jog' },
            { exercise: 'Hanging Leg Raises', sets: 3, reps: 15, kg: 0, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Cable Crunch', sets: 3, reps: 20, kg: 30, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Plank', sets: 3, reps: 60, kg: 0, duration: 0, caloriesBurnt: 0, comment: '60 seconds' },
            { exercise: 'Russian Twists', sets: 3, reps: 20, kg: 0, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 300, comment: '10000 steps' }
        ],
        // Thursday - Legs
        4: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Barbell Squat', sets: 4, reps: 10, kg: 70, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Romanian Deadlift', sets: 3, reps: 12, kg: 50, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Leg Press', sets: 3, reps: 12, kg: 120, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Bulgarian Split Squat', sets: 3, reps: 10, kg: 15, duration: 0, caloriesBurnt: 0, comment: 'Each leg' },
            { exercise: 'Leg Curl', sets: 3, reps: 15, kg: 35, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Calf Raises', sets: 4, reps: 20, kg: 60, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Recovery Walk', sets: 0, reps: 0, kg: 0, duration: 10, caloriesBurnt: 50, comment: 'Light' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 200, comment: '8000 steps' }
        ],
        // Friday - Shoulders + Arms
        5: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Overhead Press', sets: 4, reps: 10, kg: 40, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Lateral Raises', sets: 3, reps: 15, kg: 8, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Rear Delt Flyes', sets: 3, reps: 15, kg: 8, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Face Pulls', sets: 3, reps: 20, kg: 20, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Barbell Curl', sets: 3, reps: 12, kg: 25, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Skull Crushers', sets: 3, reps: 12, kg: 20, duration: 0, caloriesBurnt: 0, comment: '' },
            { exercise: 'Incline Walk', sets: 0, reps: 0, kg: 0, duration: 15, caloriesBurnt: 100, comment: 'Cardio' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 200, comment: '8000 steps' }
        ],
        // Saturday - Football
        6: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Football Match', sets: 0, reps: 0, kg: 0, duration: 90, caloriesBurnt: 600, comment: 'Weekly game' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 400, comment: '12000 steps' }
        ],
        // Sunday - Rest
        0: [
            { exercise: 'Weigh-in', sets: 0, reps: 0, kg: 80, duration: 0, caloriesBurnt: 0, comment: 'Morning' },
            { exercise: 'Light Walk', sets: 0, reps: 0, kg: 0, duration: 30, caloriesBurnt: 100, comment: 'Recovery' },
            { exercise: 'Stretching', sets: 0, reps: 0, kg: 0, duration: 15, caloriesBurnt: 0, comment: '' },
            { exercise: 'Daily Steps', sets: 0, reps: 0, kg: 0, duration: 0, caloriesBurnt: 150, comment: '5000 steps' }
        ]
    }
};

// Day names for display
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Get template for a specific date
function getTemplateForDate(date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return {
        dayName: DAY_NAMES[dayOfWeek],
        dayNumber: dayOfWeek,
        timetable: DEFAULT_TEMPLATES.timetable[dayOfWeek],
        diet: DEFAULT_TEMPLATES.diet[dayOfWeek],
        fitness: DEFAULT_TEMPLATES.fitness[dayOfWeek]
    };
}

// Get workout name for display
function getWorkoutNameForDay(dayOfWeek) {
    const workouts = {
        0: 'Rest Day',
        1: 'Back + Biceps',
        2: 'Chest + Triceps',
        3: 'Cardio + Abs',
        4: 'Legs',
        5: 'Shoulders + Arms',
        6: 'Football'
    };
    return workouts[dayOfWeek];
}
