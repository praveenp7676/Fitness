import { createClient } from '@supabase/supabase-js';

// Supabase client fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// TYPES DEFINITIONS
// ==========================================

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  height: number; // cm
  weight: number; // kg
  fitnessGoal: string;
  activityLevel: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  tips: string[];
  isCustom?: boolean;
}

export interface WorkoutSet {
  targetWeight: number;
  targetReps: number;
  actualWeight?: number;
  actualReps?: number;
  isCompleted: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  muscleGroups: string[];
  notes?: string;
  exercises: WorkoutExercise[];
  updatedAt: string;
}

export interface WorkoutLog {
  id: string;
  templateId?: string;
  name: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  notes?: string;
  exercises: WorkoutExercise[];
}

export interface DietLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealCategory: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Pre Workout' | 'Post Workout';
  foodName: string;
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

export interface BodyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  shoulders?: number;
}

export interface ProgressPhotos {
  frontUrl?: string; // base64 or URL
  sideUrl?: string;
  backUrl?: string;
  dates?: {
    front?: string;
    side?: string;
    back?: string;
  };
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  goalMl: number;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  hours: number;
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string; // Date ISO string
  icon: string;
}

// ==========================================
// SEED DATA
// ==========================================

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'bench_press',
    name: 'Bench Press',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Lie flat on the bench and grasp the barbell with a medium-wide grip.',
      'Unrack the bar and hold it straight over your chest with locked elbows.',
      'Inhale and lower the barbell slowly to your mid-chest.',
      'Push the bar back up to the starting position while exhaling.'
    ],
    tips: ['Keep your feet flat on the floor', 'Avoid flaring your elbows past 75 degrees']
  },
  {
    id: 'incline_bench_press',
    name: 'Incline Bench Press',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Lie on an incline bench set to about 30-45 degrees.',
      'Grip the bar slightly wider than shoulder width.',
      'Lower the bar slowly to your upper chest.',
      'Drive the bar straight back up to full extension.'
    ],
    tips: ['Focus on contracting upper chest', 'Do not bounce the bar off your chest']
  },
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    targetMuscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Calves', 'Abs'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Rest the bar on your upper back/traps, feet shoulder-width apart.',
      'Initiate the squat by bending at the hips and knees, sitting back.',
      'Descend until thighs are parallel to the floor or lower.',
      'Drive through your heels to return to the starting position.'
    ],
    tips: ['Keep your spine neutral', 'Keep your knees tracking over your toes']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    targetMuscle: 'Back',
    secondaryMuscles: ['Legs', 'Glutes', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Stand with mid-foot under the bar, feet hip-width apart.',
      'Bend over and grab the bar with a shoulder-width grip.',
      'Drop your hips slightly, flatten your back, and pull your chest up.',
      'Stand up with the weight, keeping the bar close to your shins.',
      'Lower the bar with control.'
    ],
    tips: ['Do not round your lower back', 'Engage your lats before pulling']
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Shoulders'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Sit at a pulldown station and secure your knees under the pads.',
      'Grasp the bar with a wide overhand grip.',
      'Pull the bar down to your upper chest while leaning slightly back.',
      'Slowly return the bar to the starting position.'
    ],
    tips: ['Pull with your elbows, not your hands', 'Keep your shoulders down and back']
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    targetMuscle: 'Legs',
    secondaryMuscles: ['Glutes', 'Calves'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Sit in the leg press machine and place your feet shoulder-width on the sled.',
      'Lower the safety pins and bend your knees to lower the sled toward your chest.',
      'Press the sled away using your heels, keeping knees slightly bent at the top.'
    ],
    tips: ['Do not lock your knees at the top', 'Do not let your tailbone lift off the seat']
  },
  {
    id: 'shoulder_press',
    name: 'Dumbbell Shoulder Press',
    targetMuscle: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Sit on a bench with back support, holding dumbbells at shoulder level.',
      'Press the dumbbells straight up until your arms are fully extended.',
      'Lower the dumbbells slowly back to the starting position.'
    ],
    tips: ['Do not arch your lower back excessively', 'Keep elbows slightly forward']
  },
  {
    id: 'cable_fly',
    name: 'Cable Chest Fly',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Set pulleys to chest height, grab handles, and step forward with one foot.',
      'With a slight bend in your elbows, sweep your hands forward in an arc.',
      'Bring hands together in front of your chest and squeeze.',
      'Slowly return to the start position feeling the chest stretch.'
    ],
    tips: ['Maintain a constant elbow bend', 'Squeeze your chest at peak contraction']
  },
  {
    id: 'pull_up',
    name: 'Pull-up',
    targetMuscle: 'Back',
    secondaryMuscles: ['Biceps', 'Abs'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Hang from a pull-up bar with an overhand grip, slightly wider than shoulder width.',
      'Pull yourself up until your chin clears the bar, pulling elbows down.',
      'Lower yourself back down with control to a full dead hang.'
    ],
    tips: ['Avoid using momentum or swinging', 'Depress your shoulder blades first']
  },
  {
    id: 'push_up',
    name: 'Push-up',
    targetMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Triceps', 'Abs'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Get into a plank position with hands slightly wider than shoulder width.',
      'Lower your body until your chest almost touches the floor.',
      'Push your body back up, keeping a straight line from head to heels.'
    ],
    tips: ['Keep your core and glutes engaged', 'Do not let your hips sag']
  }
];

export const SMART_FOOD_DB: Record<string, { calories: number; protein: number; carbs: number; fat: number; servingSize: string }> = {
  oats: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, servingSize: '100g' },
  oatmeal: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, servingSize: '100g' },
  banana: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, servingSize: '1 medium (100g)' },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' },
  chicken: { calories: 180, protein: 25, carbs: 0, fat: 8, servingSize: '100g' },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g cooked' },
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g cooked' },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g cooked' },
  paneer: { calories: 265, protein: 18, carbs: 1.2, fat: 20.8, servingSize: '100g' },
  cottage_cheese: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingSize: '100g' },
  egg: { calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3, servingSize: '1 large (50g)' },
  eggs: { calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '2 large (100g)' },
  'whey protein': { calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: '1 scoop (30g)' },
  protein_powder: { calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: '1 scoop (30g)' },
  almonds: { calories: 579, protein: 21, carbs: 22, fat: 49, servingSize: '100g' },
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1, servingSize: '100ml semi-skimmed' },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '1 medium (100g)' },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g' },
  fish: { calories: 150, protein: 22, carbs: 0, fat: 6, servingSize: '100g' },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: '100g' },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1, servingSize: '100g' },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: '100g' },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g' },
  avocado: { calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: '100g' },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '100g' },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g' },
  yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: '100g Greek' },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2, servingSize: '100g' }
};

// Auto estimation heuristic for custom foods
export function estimateMacros(foodName: string): { calories: number; protein: number; carbs: number; fat: number; servingSize: string } {
  const cleanName = foodName.toLowerCase().trim();

  // 1. Direct match check
  if (SMART_FOOD_DB[cleanName]) {
    return SMART_FOOD_DB[cleanName];
  }

  // 2. Keyword checks
  if (cleanName.includes('chicken') || cleanName.includes('turkey') || cleanName.includes('poultry')) {
    return { calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g' };
  }
  if (cleanName.includes('egg')) {
    return SMART_FOOD_DB['egg'];
  }
  if (cleanName.includes('rice') || cleanName.includes('grain') || cleanName.includes('quinoa')) {
    return SMART_FOOD_DB['rice'];
  }
  if (cleanName.includes('oats') || cleanName.includes('porridge') || cleanName.includes('muesli')) {
    return SMART_FOOD_DB['oats'];
  }
  if (cleanName.includes('steak') || cleanName.includes('beef') || cleanName.includes('mutton') || cleanName.includes('pork')) {
    return { calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '100g' };
  }
  if (cleanName.includes('fish') || cleanName.includes('salmon') || cleanName.includes('tuna') || cleanName.includes('cod') || cleanName.includes('shrimp')) {
    return { calories: 180, protein: 22, carbs: 0, fat: 9, servingSize: '100g' };
  }
  if (cleanName.includes('milk') || cleanName.includes('shake') || cleanName.includes('latte')) {
    return SMART_FOOD_DB['milk'];
  }
  if (cleanName.includes('cheese') || cleanName.includes('paneer') || cleanName.includes('tofu')) {
    return SMART_FOOD_DB['paneer'];
  }
  if (cleanName.includes('protein') || cleanName.includes('whey') || cleanName.includes('isolate')) {
    return SMART_FOOD_DB['whey protein'];
  }
  if (cleanName.includes('apple') || cleanName.includes('banana') || cleanName.includes('orange') || cleanName.includes('berry') || cleanName.includes('fruit') || cleanName.includes('grape')) {
    return { calories: 60, protein: 0.8, carbs: 14, fat: 0.2, servingSize: '100g' };
  }
  if (cleanName.includes('broccoli') || cleanName.includes('spinach') || cleanName.includes('salad') || cleanName.includes('lettuce') || cleanName.includes('vegetable') || cleanName.includes('cabbage')) {
    return { calories: 30, protein: 2.5, carbs: 6, fat: 0.3, servingSize: '100g' };
  }
  if (cleanName.includes('nut') || cleanName.includes('peanut') || cleanName.includes('almond') || cleanName.includes('cashew') || cleanName.includes('butter')) {
    return { calories: 590, protein: 22, carbs: 21, fat: 50, servingSize: '100g' };
  }
  if (cleanName.includes('bread') || cleanName.includes('toast') || cleanName.includes('roti') || cleanName.includes('naan') || cleanName.includes('tortilla')) {
    return SMART_FOOD_DB['bread'];
  }

  // 3. Fallback average estimation
  return { calories: 150, protein: 8, carbs: 20, fat: 5, servingSize: '100g' };
}

export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

// ==========================================
// DB ENGINE (LOCAL STORAGE WRAPPER)
// ==========================================

const STORAGE_KEYS = {
  PROFILE: 'fitforge_profile',
  TEMPLATES: 'fitforge_templates',
  WORKOUTS: 'fitforge_workouts',
  EXERCISES: 'fitforge_exercises',
  DIET: 'fitforge_diet',
  BODY: 'fitforge_body',
  PHOTOS: 'fitforge_photos',
  WATER: 'fitforge_water',
  SLEEP: 'fitforge_sleep',
  ACHIEVEMENTS: 'fitforge_achievements'
};

const getLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const db = {
  // --- Profile ---
  getProfile: (): UserProfile | null => {
    return getLocal<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
  },
  saveProfile: (profile: UserProfile): void => {
    setLocal(STORAGE_KEYS.PROFILE, profile);
  },

  // --- Exercises ---
  getExercises: (): Exercise[] => {
    const custom = getLocal<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
    return [...DEFAULT_EXERCISES, ...custom];
  },
  saveExercise: (exercise: Exercise): void => {
    const custom = getLocal<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
    const existsIdx = custom.findIndex(e => e.id === exercise.id);
    if (existsIdx >= 0) {
      custom[existsIdx] = exercise;
    } else {
      custom.push({ ...exercise, isCustom: true });
    }
    setLocal(STORAGE_KEYS.EXERCISES, custom);
  },
  deleteExercise: (id: string): void => {
    const custom = getLocal<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
    const filtered = custom.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EXERCISES, filtered);
  },

  // --- Templates ---
  getTemplates: (): WorkoutTemplate[] => {
    // Return standard default templates if empty
    const templates = getLocal<WorkoutTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
    if (templates.length === 0) {
      const defaultTemplates: WorkoutTemplate[] = [
        {
          id: 'ppl-push',
          name: 'Push (Chest/Shoulders/Triceps)',
          muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
          notes: 'Standard Hypertrophy Push workout. Keep rest between 60-90s.',
          updatedAt: new Date().toISOString(),
          exercises: [
            {
              exerciseId: 'bench_press',
              name: 'Bench Press',
              targetMuscle: 'Chest',
              sets: [
                { targetWeight: 60, targetReps: 10, isCompleted: false },
                { targetWeight: 70, targetReps: 8, isCompleted: false },
                { targetWeight: 80, targetReps: 6, isCompleted: false },
              ]
            },
            {
              exerciseId: 'shoulder_press',
              name: 'Dumbbell Shoulder Press',
              targetMuscle: 'Shoulders',
              sets: [
                { targetWeight: 20, targetReps: 10, isCompleted: false },
                { targetWeight: 20, targetReps: 10, isCompleted: false },
                { targetWeight: 24, targetReps: 8, isCompleted: false },
              ]
            },
            {
              exerciseId: 'push_up',
              name: 'Push-up',
              targetMuscle: 'Chest',
              sets: [
                { targetWeight: 0, targetReps: 15, isCompleted: false },
                { targetWeight: 0, targetReps: 15, isCompleted: false },
              ]
            }
          ]
        },
        {
          id: 'ppl-pull',
          name: 'Pull (Back/Biceps)',
          muscleGroups: ['Back', 'Biceps'],
          notes: 'Standard Hypertrophy Pull workout. Focus on squeezing lats.',
          updatedAt: new Date().toISOString(),
          exercises: [
            {
              exerciseId: 'deadlift',
              name: 'Deadlift',
              targetMuscle: 'Back',
              sets: [
                { targetWeight: 100, targetReps: 5, isCompleted: false },
                { targetWeight: 120, targetReps: 5, isCompleted: false },
                { targetWeight: 140, targetReps: 5, isCompleted: false },
              ]
            },
            {
              exerciseId: 'pull_up',
              name: 'Pull-up',
              targetMuscle: 'Back',
              sets: [
                { targetWeight: 0, targetReps: 8, isCompleted: false },
                { targetWeight: 0, targetReps: 8, isCompleted: false },
                { targetWeight: 0, targetReps: 6, isCompleted: false },
              ]
            },
            {
              exerciseId: 'lat_pulldown',
              name: 'Lat Pulldown',
              targetMuscle: 'Back',
              sets: [
                { targetWeight: 50, targetReps: 12, isCompleted: false },
                { targetWeight: 60, targetReps: 10, isCompleted: false },
                { targetWeight: 60, targetReps: 10, isCompleted: false },
              ]
            }
          ]
        },
        {
          id: 'ppl-legs',
          name: 'Legs + Core',
          muscleGroups: ['Legs', 'Abs'],
          notes: 'Intense lower body session. Focus on depth.',
          updatedAt: new Date().toISOString(),
          exercises: [
            {
              exerciseId: 'squat',
              name: 'Barbell Back Squat',
              targetMuscle: 'Legs',
              sets: [
                { targetWeight: 80, targetReps: 10, isCompleted: false },
                { targetWeight: 90, targetReps: 8, isCompleted: false },
                { targetWeight: 100, targetReps: 6, isCompleted: false },
              ]
            },
            {
              exerciseId: 'leg_press',
              name: 'Leg Press',
              targetMuscle: 'Legs',
              sets: [
                { targetWeight: 120, targetReps: 12, isCompleted: false },
                { targetWeight: 160, targetReps: 10, isCompleted: false },
                { targetWeight: 200, targetReps: 10, isCompleted: false },
              ]
            }
          ]
        }
      ];
      setLocal(STORAGE_KEYS.TEMPLATES, defaultTemplates);
      return defaultTemplates;
    }
    return templates;
  },
  saveTemplate: (template: WorkoutTemplate): void => {
    const templates = db.getTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    const updatedTemplate = { ...template, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      templates[idx] = updatedTemplate;
    } else {
      templates.push(updatedTemplate);
    }
    setLocal(STORAGE_KEYS.TEMPLATES, templates);
  },
  deleteTemplate: (id: string): void => {
    const templates = db.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    setLocal(STORAGE_KEYS.TEMPLATES, filtered);
  },

  // --- Workouts (Logs) ---
  getWorkouts: (): WorkoutLog[] => {
    return getLocal<WorkoutLog[]>(STORAGE_KEYS.WORKOUTS, []);
  },
  saveWorkout: (workout: WorkoutLog): void => {
    const workouts = db.getWorkouts();
    const idx = workouts.findIndex(w => w.id === workout.id);
    if (idx >= 0) {
      workouts[idx] = workout;
    } else {
      workouts.push(workout);
    }
    setLocal(STORAGE_KEYS.WORKOUTS, workouts);
  },
  deleteWorkout: (id: string): void => {
    const workouts = db.getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    setLocal(STORAGE_KEYS.WORKOUTS, filtered);
  },

  // --- Diet Logs ---
  getDietLogs: (): DietLog[] => {
    return getLocal<DietLog[]>(STORAGE_KEYS.DIET, []);
  },
  saveDietLog: (log: DietLog): void => {
    const logs = db.getDietLogs();
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx >= 0) {
      logs[idx] = log;
    } else {
      logs.push(log);
    }
    setLocal(STORAGE_KEYS.DIET, logs);
  },
  deleteDietLog: (id: string): void => {
    const logs = db.getDietLogs();
    const filtered = logs.filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.DIET, filtered);
  },

  // --- Body Tracking ---
  getBodyLogs: (): BodyLog[] => {
    return getLocal<BodyLog[]>(STORAGE_KEYS.BODY, []);
  },
  saveBodyLog: (log: BodyLog): void => {
    const logs = db.getBodyLogs();
    const idx = logs.findIndex(l => l.date === log.date);
    if (idx >= 0) {
      logs[idx] = { ...logs[idx], ...log };
    } else {
      logs.push(log);
    }
    // Sort chronologically
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLocal(STORAGE_KEYS.BODY, logs);
  },
  deleteBodyLog: (id: string): void => {
    const logs = db.getBodyLogs();
    const filtered = logs.filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.BODY, filtered);
  },

  // --- Progress Photos ---
  getProgressPhotos: (): ProgressPhotos => {
    return getLocal<ProgressPhotos>(STORAGE_KEYS.PHOTOS, {});
  },
  saveProgressPhoto: (type: 'front' | 'side' | 'back', base64Url: string): void => {
    const photos = db.getProgressPhotos();
    const dates = photos.dates || {};
    
    photos[`${type}Url`] = base64Url;
    dates[type] = getLocalDateString();
    photos.dates = dates;
    
    setLocal(STORAGE_KEYS.PHOTOS, photos);
  },

  // --- Water Logs ---
  getWaterLogs: (): WaterLog[] => {
    return getLocal<WaterLog[]>(STORAGE_KEYS.WATER, []);
  },
  saveWaterAmount: (date: string, amountMl: number, goalMl: number): void => {
    const logs = db.getWaterLogs();
    const idx = logs.findIndex(l => l.date === date);
    if (idx >= 0) {
      logs[idx].amountMl = amountMl;
      logs[idx].goalMl = goalMl;
    } else {
      logs.push({ date, amountMl, goalMl });
    }
    setLocal(STORAGE_KEYS.WATER, logs);
  },

  // --- Sleep Logs ---
  getSleepLogs: (): SleepLog[] => {
    return getLocal<SleepLog[]>(STORAGE_KEYS.SLEEP, []);
  },
  saveSleepLog: (log: SleepLog): void => {
    const logs = db.getSleepLogs();
    const idx = logs.findIndex(l => l.id === log.id || (l.date === log.date && log.id === l.id));
    const existIdx = logs.findIndex(l => l.id === log.id);
    if (existIdx >= 0) {
      logs[existIdx] = log;
    } else {
      logs.push(log);
    }
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setLocal(STORAGE_KEYS.SLEEP, logs);
  },
  deleteSleepLog: (id: string): void => {
    const logs = db.getSleepLogs();
    const filtered = logs.filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.SLEEP, filtered);
  },

  // --- Achievements ---
  getAchievements: (): Achievement[] => {
    return getLocal<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
  },
  unlockAchievement: (id: string, title: string, description: string, icon: string): boolean => {
    const achievements = db.getAchievements();
    if (achievements.some(a => a.id === id)) {
      return false; // Already unlocked
    }
    const newAchievement: Achievement = {
      id,
      title,
      description,
      unlockedAt: new Date().toISOString(),
      icon
    };
    achievements.push(newAchievement);
    setLocal(STORAGE_KEYS.ACHIEVEMENTS, achievements);
    return true; // Successfully unlocked
  }
};
