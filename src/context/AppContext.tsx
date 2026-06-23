'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, UserProfile, Exercise, WorkoutTemplate, WorkoutLog, 
  DietLog, BodyLog, ProgressPhotos, WaterLog, SleepLog, Achievement,
  estimateMacros, getLocalDateString
} from '../lib/db';
import confetti from 'canvas-confetti';

interface ActiveWorkoutState {
  log: WorkoutLog;
  startTime: number; // timestamp ms
  elapsedSeconds: number;
}

interface AIRecommendation {
  type: 'success' | 'warning' | 'info';
  category: 'workout' | 'diet' | 'sleep' | 'recovery' | 'general';
  message: string;
}

interface AppContextType {
  profile: UserProfile | null;
  templates: WorkoutTemplate[];
  workouts: WorkoutLog[];
  exercises: Exercise[];
  dietLogs: DietLog[];
  bodyLogs: BodyLog[];
  progressPhotos: ProgressPhotos;
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  achievements: Achievement[];
  
  // Active Workout
  activeWorkout: ActiveWorkoutState | null;
  startWorkout: (templateId?: string) => void;
  updateActiveWorkout: (updated: WorkoutLog) => void;
  completeActiveWorkout: () => void;
  cancelActiveWorkout: () => void;
  restTimeRemaining: number; // seconds
  startRestTimer: (seconds: number) => void;
  
  // Actions
  updateProfile: (profile: UserProfile) => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  addTemplate: (template: Omit<WorkoutTemplate, 'id' | 'updatedAt'>) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  addDietLog: (mealCategory: DietLog['mealCategory'], foodName: string, quantity: string, manualMacros?: Partial<Omit<DietLog, 'id' | 'date' | 'mealCategory' | 'foodName'>>, customDate?: string) => void;
  deleteDietLog: (id: string) => void;
  addBodyLog: (log: Omit<BodyLog, 'id'>) => void;
  uploadProgressPhoto: (type: 'front' | 'side' | 'back', base64: string) => void;
  addWater: (amountMl: number, customDate?: string) => void;
  addSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  deleteSleepLog: (id: string) => void;

  // AI recommendations & Recovery
  aiRecommendations: AIRecommendation[];
  recoveryStatus: Record<string, { percent: number; hoursRemaining: number }>;
  readinessScore: number;
  streakDays: number;
  
  // Unlocked achievement popup trigger
  latestUnlockedAchievement: Achievement | null;
  clearLatestAchievement: () => void;

  // Snapshot modal trigger state
  snapDate: string | null;
  setSnapDate: (date: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [bodyLogs, setBodyLogs] = useState<BodyLog[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhotos>({});
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active workout states
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [snapDate, setSnapDate] = useState<string | null>(null);
  const [restTimeRemaining, setRestTimeRemaining] = useState<number>(0);
  const [latestUnlockedAchievement, setLatestUnlockedAchievement] = useState<Achievement | null>(null);

  // Load data from db on client mount
  useEffect(() => {
    setProfile(db.getProfile());
    setTemplates(db.getTemplates());
    setWorkouts(db.getWorkouts());
    setExercises(db.getExercises());
    setDietLogs(db.getDietLogs());
    setBodyLogs(db.getBodyLogs());
    setProgressPhotos(db.getProgressPhotos());
    setWaterLogs(db.getWaterLogs());
    setSleepLogs(db.getSleepLogs());
    setAchievements(db.getAchievements());
    setIsLoaded(true);
  }, []);

  // Sync client data back to disk in development mode (running on localhost)
  useEffect(() => {
    if (!isLoaded) return;

    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      
      const backupData = {
        profile: localStorage.getItem('fitforge_profile'),
        templates: localStorage.getItem('fitforge_templates'),
        workouts: localStorage.getItem('fitforge_workouts'),
        exercises: localStorage.getItem('fitforge_exercises'),
        diet: localStorage.getItem('fitforge_diet'),
        body: localStorage.getItem('fitforge_body'),
        photos: localStorage.getItem('fitforge_photos'),
        water: localStorage.getItem('fitforge_water'),
        sleep: localStorage.getItem('fitforge_sleep'),
        achievements: localStorage.getItem('fitforge_achievements')
      };

      fetch('/api/save-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('[FitForge Dev Sync] Successfully synced localStorage to default_data.json!');
        }
      })
      .catch(err => {
        console.error('[FitForge Dev Sync] Failed to sync to disk:', err);
      });
    }
  }, [isLoaded, templates, exercises, workouts, dietLogs, waterLogs, sleepLogs, profile, achievements]);

  // Sync active workout timer
  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setActiveWorkout(prev => {
        if (!prev) return null;
        return {
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime) / 1000)
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Sync rest timer
  useEffect(() => {
    if (restTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          // Play audio tick or sound if desired, or let flash do the work
          if (typeof window !== 'undefined') {
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.15);
            } catch (e) {
              console.log('Audio error:', e);
            }
          }
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimeRemaining]);

  const refreshAll = () => {
    setProfile(db.getProfile());
    setTemplates(db.getTemplates());
    setWorkouts(db.getWorkouts());
    setExercises(db.getExercises());
    setDietLogs(db.getDietLogs());
    setBodyLogs(db.getBodyLogs());
    setProgressPhotos(db.getProgressPhotos());
    setWaterLogs(db.getWaterLogs());
    setSleepLogs(db.getSleepLogs());
    setAchievements(db.getAchievements());
  };

  // Helper to unlock badges
  const triggerUnlock = (id: string, title: string, desc: string, icon: string) => {
    const success = db.unlockAchievement(id, title, desc, icon);
    if (success) {
      const allAch = db.getAchievements();
      setAchievements(allAch);
      const newlyUnlocked = allAch.find(a => a.id === id);
      if (newlyUnlocked) {
        setLatestUnlockedAchievement(newlyUnlocked);
        // Fire confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // ==========================================
  // ACTIONS IMPLEMENTATION
  // ==========================================

  const updateProfile = (newProfile: UserProfile) => {
    db.saveProfile(newProfile);
    setProfile(newProfile);
    triggerUnlock('profile_setup', 'Forge Initiated', 'You set up your profile and started your journey.', '🔥');
  };

  const addCustomExercise = (ex: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = {
      ...ex,
      id: 'custom_' + Date.now()
    };
    db.saveExercise(newEx);
    setExercises(db.getExercises());
    triggerUnlock('custom_exercise', 'Innovator', 'Create your first custom exercise.', '💡');
  };

  const deleteExercise = (id: string) => {
    db.deleteExercise(id);
    setExercises(db.getExercises());
  };

  const addTemplate = (tpl: Omit<WorkoutTemplate, 'id' | 'updatedAt'>) => {
    const newTpl: WorkoutTemplate = {
      ...tpl,
      id: 'template_' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    db.saveTemplate(newTpl);
    setTemplates(db.getTemplates());
    triggerUnlock('create_template', 'Architect', 'Design your first workout template.', '📐');
  };

  const updateTemplate = (tpl: WorkoutTemplate) => {
    db.saveTemplate(tpl);
    setTemplates(db.getTemplates());
  };

  const duplicateTemplate = (id: string) => {
    const target = templates.find(t => t.id === id);
    if (!target) return;
    const duplicated: WorkoutTemplate = {
      ...target,
      id: 'template_' + Date.now(),
      name: `${target.name} (Copy)`,
      updatedAt: new Date().toISOString()
    };
    db.saveTemplate(duplicated);
    setTemplates(db.getTemplates());
  };

  const deleteTemplate = (id: string) => {
    db.deleteTemplate(id);
    setTemplates(db.getTemplates());
  };

  const startWorkout = (templateId?: string) => {
    let baseLog: WorkoutLog;

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        baseLog = {
          id: 'log_' + Date.now(),
          templateId: template.id,
          name: template.name,
          date: getLocalDateString(),
          durationSeconds: 0,
          notes: template.notes,
          exercises: JSON.parse(JSON.stringify(template.exercises)) // deep clone sets
        };
      } else {
        baseLog = {
          id: 'log_' + Date.now(),
          name: 'Custom Workout',
          date: getLocalDateString(),
          durationSeconds: 0,
          exercises: []
        };
      }
    } else {
      baseLog = {
        id: 'log_' + Date.now(),
        name: 'Custom Workout',
        date: getLocalDateString(),
        durationSeconds: 0,
        exercises: []
      };
    }

    setActiveWorkout({
      log: baseLog,
      startTime: Date.now(),
      elapsedSeconds: 0
    });
  };

  const updateActiveWorkout = (updated: WorkoutLog) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        log: updated
      };
    });
  };

  const completeActiveWorkout = () => {
    if (!activeWorkout) return;
    const finalLog = {
      ...activeWorkout.log,
      durationSeconds: activeWorkout.elapsedSeconds
    };

    // Save log
    db.saveWorkout(finalLog);
    const updatedWorkouts = db.getWorkouts();
    setWorkouts(updatedWorkouts);

    // Perform PR detection & achievements processing
    let maxWeightBench = 0;
    let maxWeightDeadlift = 0;
    let maxWeightSquat = 0;
    let totalVolume = 0;

    finalLog.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.isCompleted && set.actualWeight && set.actualReps) {
          const wt = set.actualWeight;
          totalVolume += wt * set.actualReps;
          
          if (ex.exerciseId === 'bench_press' && wt > maxWeightBench) maxWeightBench = wt;
          if (ex.exerciseId === 'deadlift' && wt > maxWeightDeadlift) maxWeightDeadlift = wt;
          if (ex.exerciseId === 'squat' && wt > maxWeightSquat) maxWeightSquat = wt;
        }
      });
    });

    // Check unlocks
    triggerUnlock('first_workout', 'First Blood', 'You completed your first logged workout session.', '💪');

    if (updatedWorkouts.length >= 7) {
      triggerUnlock('7_workouts', 'Week One Complete', 'Logged 7 workouts total.', '🏆');
    }
    if (updatedWorkouts.length >= 30) {
      triggerUnlock('30_workouts', 'Consistency King', 'Logged 30 workouts total.', '👑');
    }
    if (updatedWorkouts.length >= 100) {
      triggerUnlock('100_workouts', 'Centurion', 'Logged 100 workouts total.', '🚀');
    }

    if (maxWeightBench >= 100) {
      triggerUnlock('bench_100', 'Century Press', 'Bench pressed 100kg (220lbs) or more.', '🏋️‍♂️');
    }
    if (maxWeightDeadlift >= 200) {
      triggerUnlock('deadlift_200', 'Earth Shaker', 'Deadlifted 200kg (440lbs) or more.', '🌋');
    }
    if (totalVolume >= 10000) {
      triggerUnlock('volume_king', 'Iron Giant', 'Shifted over 10,000kg of total volume in one workout.', '🐘');
    }

    // Reset active session
    setActiveWorkout(null);
    setRestTimeRemaining(0);
  };

  const cancelActiveWorkout = () => {
    setActiveWorkout(null);
    setRestTimeRemaining(0);
  };

  const startRestTimer = (seconds: number) => {
    setRestTimeRemaining(seconds);
  };

  // --- Diet ---
  const addDietLog = (
    mealCategory: DietLog['mealCategory'], 
    foodName: string, 
    quantity: string, 
    manualMacros?: Partial<Omit<DietLog, 'id' | 'date' | 'mealCategory' | 'foodName'>>,
    customDate?: string
  ) => {
    const estimated = estimateMacros(foodName);
    // Parse quantity (e.g. "200g" -> multiply macros by 2, or "2 eggs" -> multiply standard egg by 2)
    let multiplier = 1;
    const gMatch = quantity.match(/^(\d+(?:\.\d+)?)\s*(?:g|ml)$/i);
    const pieceMatch = quantity.match(/^(\d+)\s*(?:pcs|pc|eggs|egg|slice|slices|scoop|scoops|bananas|banana)?$/i);

    if (gMatch) {
      const parsedG = parseFloat(gMatch[1]);
      if (estimated.servingSize.toLowerCase().includes('100')) {
        multiplier = parsedG / 100;
      } else if (estimated.servingSize.toLowerCase().includes('ml') && estimated.servingSize.toLowerCase().includes('100')) {
        multiplier = parsedG / 100;
      }
    } else if (pieceMatch) {
      const pcs = parseInt(pieceMatch[1], 10);
      if (estimated.servingSize.toLowerCase().includes('1 large') || estimated.servingSize.toLowerCase().includes('1 medium') || estimated.servingSize.toLowerCase().includes('1 scoop') || estimated.servingSize.toLowerCase().includes('1 slice')) {
        multiplier = pcs;
      } else if (estimated.servingSize.toLowerCase().includes('2 large')) {
        multiplier = pcs / 2;
      }
    }

    const log: DietLog = {
      id: 'diet_' + Date.now(),
      date: customDate || getLocalDateString(),
      mealCategory,
      foodName,
      quantity,
      calories: Math.round((manualMacros?.calories !== undefined ? manualMacros.calories : estimated.calories * multiplier)),
      protein: parseFloat((manualMacros?.protein !== undefined ? manualMacros.protein : estimated.protein * multiplier).toFixed(1)),
      carbs: parseFloat((manualMacros?.carbs !== undefined ? manualMacros.carbs : estimated.carbs * multiplier).toFixed(1)),
      fat: parseFloat((manualMacros?.fat !== undefined ? manualMacros.fat : estimated.fat * multiplier).toFixed(1)),
      notes: manualMacros?.notes
    };

    db.saveDietLog(log);
    setDietLogs(db.getDietLogs());
    triggerUnlock('first_food', 'Nutrient Fuel', 'Logged your first food item.', '🍏');
  };

  const deleteDietLog = (id: string) => {
    db.deleteDietLog(id);
    setDietLogs(db.getDietLogs());
  };

  // --- Body ---
  const addBodyLog = (log: Omit<BodyLog, 'id'>) => {
    const fullLog: BodyLog = {
      ...log,
      id: 'body_' + Date.now()
    };
    db.saveBodyLog(fullLog);
    setBodyLogs(db.getBodyLogs());
    triggerUnlock('body_tracking', 'Self Reflector', 'Logged weight or tape measurements.', '📏');
  };

  const uploadProgressPhoto = (type: 'front' | 'side' | 'back', base64: string) => {
    db.saveProgressPhoto(type, base64);
    setProgressPhotos(db.getProgressPhotos());
    triggerUnlock('progress_photo', 'Paparazzi', 'Uploaded a progress photo.', '📸');
  };

  // --- Water ---
  const addWater = (amountMl: number, customDate?: string) => {
    const activeDate = customDate || getLocalDateString();
    const logs = db.getWaterLogs();
    const todayLog = logs.find(l => l.date === activeDate);
    const currentGoal = todayLog ? todayLog.goalMl : 3000; // default 3L
    const currentAmount = todayLog ? todayLog.amountMl : 0;
    
    db.saveWaterAmount(activeDate, currentAmount + amountMl, currentGoal);
    const updated = db.getWaterLogs();
    setWaterLogs(updated);

    if (currentAmount + amountMl >= currentGoal) {
      triggerUnlock('water_goal', 'Hydration Hero', 'Met your water intake goal for the day.', '💧');
    }
  };

  // --- Sleep ---
  const addSleepLog = (log: Omit<SleepLog, 'id'>) => {
    const newLog: SleepLog = {
      ...log,
      id: 'sleep_' + Date.now()
    };
    db.saveSleepLog(newLog);
    setSleepLogs(db.getSleepLogs());
    triggerUnlock('sleep_logged', 'Rest & Recovery', 'Logged your sleep details.', '💤');

    if (log.quality === 'Excellent' && log.hours >= 8) {
      triggerUnlock('perfect_sleep', 'Deep Slumber', 'Logged 8+ hours of Excellent quality sleep.', '🛌');
    }
  };

  const deleteSleepLog = (id: string) => {
    db.deleteSleepLog(id);
    setSleepLogs(db.getSleepLogs());
  };

  const clearLatestAchievement = () => {
    setLatestUnlockedAchievement(null);
  };

  // ==========================================
  // CALCULATED METRICS
  // ==========================================

  // Streak days
  const streakDays = React.useMemo(() => {
    if (workouts.length === 0) return 0;
    const dates = workouts.map(w => w.date);
    const uniqueSortedDates = Array.from(new Set(dates)).sort().reverse();
    
    let streak = 0;
    let expected = new Date();
    
    for (let i = 0; i < uniqueSortedDates.length; i++) {
      const dStr = uniqueSortedDates[i];
      const workoutDate = new Date(dStr);
      
      // Calculate diff in days
      const diffTime = Math.abs(expected.getTime() - workoutDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Check if within 1 day (today or yesterday to sustain streak)
      if (i === 0 && diffDays > 1) {
        break; // Streak broken
      }
      
      if (i > 0) {
        const prevDate = new Date(uniqueSortedDates[i - 1]);
        const dayDiff = Math.round((prevDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          streak++;
        } else if (dayDiff > 1) {
          break; // Streak broken
        }
      } else {
        streak = 1;
      }
      expected = workoutDate;
    }
    return streak;
  }, [workouts]);

  // Muscle recovery calculations
  // Base recovery: 72 hours per trained muscle.
  // Standard recovery score is calculated based on hours elapsed since the last time a muscle was trained.
  const recoveryStatus = React.useMemo(() => {
    const muscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Forearms', 'Glutes', 'Calves', 'Neck', 'Full Body'];
    const result: Record<string, { percent: number; hoursRemaining: number }> = {};
    
    muscles.forEach(m => {
      // Find latest workout containing this muscle
      const matchingWorkouts = workouts.filter(w => {
        // If template references PPL or specific muscle groups
        const template = templates.find(t => t.id === w.templateId);
        const logMuscles = template ? template.muscleGroups : [];
        
        // Also check actual exercise muscle targets in the log
        const exerciseMuscles = w.exercises.map(e => e.targetMuscle);
        
        return logMuscles.includes(m) || exerciseMuscles.includes(m);
      });

      if (matchingWorkouts.length === 0) {
        result[m] = { percent: 100, hoursRemaining: 0 };
        return;
      }

      // Sort by date desc
      matchingWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastTrainedDate = new Date(matchingWorkouts[0].date);
      const hoursElapsed = (Date.now() - lastTrainedDate.getTime()) / (1000 * 60 * 60);

      const recoveryTimeTotal = 72; // default 72 hours
      const hoursRemaining = Math.max(0, recoveryTimeTotal - hoursElapsed);
      const percent = Math.min(100, Math.round((hoursElapsed / recoveryTimeTotal) * 100));

      result[m] = { percent, hoursRemaining: parseFloat(hoursRemaining.toFixed(1)) };
    });

    return result;
  }, [workouts, templates]);

  // Overall readiness score (0-100) based on sleep (40%), recovery (40%), and water (20%)
  const readinessScore = React.useMemo(() => {
    const today = getLocalDateString();
    
    // 1. Water score (0-20)
    const todayWater = waterLogs.find(w => w.date === today);
    const waterScore = todayWater ? Math.min(20, (todayWater.amountMl / todayWater.goalMl) * 20) : 10; // default 10/20

    // 2. Sleep score (0-40)
    let sleepScore = 25; // default
    if (sleepLogs.length > 0) {
      const lastSleep = sleepLogs[sleepLogs.length - 1];
      const hoursFactor = Math.min(1, lastSleep.hours / 8);
      const qualityMultiplier = 
        lastSleep.quality === 'Excellent' ? 1 :
        lastSleep.quality === 'Good' ? 0.85 :
        lastSleep.quality === 'Fair' ? 0.70 : 0.50;
      sleepScore = Math.round(hoursFactor * qualityMultiplier * 40);
    }

    // 3. Recovery score (0-40) - average of all muscle group recovery percentages
    const recoveryKeys = Object.keys(recoveryStatus);
    const avgRecovery = recoveryKeys.length > 0 
      ? recoveryKeys.reduce((acc, k) => acc + recoveryStatus[k].percent, 0) / recoveryKeys.length
      : 100;
    const recoveryScore = Math.round((avgRecovery / 100) * 40);

    return Math.min(100, waterScore + sleepScore + recoveryScore);
  }, [waterLogs, sleepLogs, recoveryStatus]);

  // AI recommendations engine
  const aiRecommendations = React.useMemo(() => {
    const recs: AIRecommendation[] = [];
    const today = getLocalDateString();

    // 1. Diet Protein Check
    if (profile) {
      const todayDiet = dietLogs.filter(d => d.date === today);
      const totalProtein = todayDiet.reduce((acc, d) => acc + d.protein, 0);
      const targetProtein = profile.weight * 2; // 2g per kg
      
      if (totalProtein < targetProtein * 0.7 && profile.fitnessGoal.includes('Muscle')) {
        recs.push({
          type: 'warning',
          category: 'diet',
          message: `Protein intake is low today (${totalProtein}g / Target: ${Math.round(targetProtein)}g). Increase protein (chicken, paneer, eggs, whey) to promote muscle synthesis.`
        });
      } else if (totalProtein >= targetProtein) {
        recs.push({
          type: 'success',
          category: 'diet',
          message: `Incredible protein consistency today! You smashed your ${Math.round(targetProtein)}g protein target. Keep it up!`
        });
      }
    }

    // 2. Training legs check
    const legRecovery = recoveryStatus['Legs'];
    if (legRecovery && legRecovery.hoursRemaining === 0) {
      // Find if legs was trained in last 10 days
      const legWorkouts = workouts.filter(w => {
        const template = templates.find(t => t.id === w.templateId);
        const logMuscles = template ? template.muscleGroups : [];
        const exerciseMuscles = w.exercises.map(e => e.targetMuscle);
        return logMuscles.includes('Legs') || exerciseMuscles.includes('Legs');
      });

      let daysSinceLegs = 999;
      if (legWorkouts.length > 0) {
        legWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const diff = Date.now() - new Date(legWorkouts[0].date).getTime();
        daysSinceLegs = Math.floor(diff / (1000 * 60 * 60 * 24));
      }

      if (daysSinceLegs > 10) {
        recs.push({
          type: 'warning',
          category: 'workout',
          message: `It has been ${daysSinceLegs === 999 ? 'over 10' : daysSinceLegs} days since your last Leg workout. Leg training boosts total testosterone and overall strength!`
        });
      }
    }

    // 3. Sleep check
    if (sleepLogs.length > 0) {
      const lastSleep = sleepLogs[sleepLogs.length - 1];
      if (lastSleep.hours < 6.5) {
        recs.push({
          type: 'warning',
          category: 'sleep',
          message: `Your sleep last night was low (${lastSleep.hours} hrs). Poor sleep impairs recovery, lowers growth hormone production, and increases injury risk. Aim for 7-8 hours.`
        });
      }
    } else {
      recs.push({
        type: 'info',
        category: 'sleep',
        message: 'No sleep logs found. Start logging your sleep start/end times to track performance metrics.'
      });
    }

    // 4. Water check
    const todayWater = waterLogs.find(w => w.date === today);
    if (todayWater) {
      const pct = (todayWater.amountMl / todayWater.goalMl) * 100;
      if (pct < 50) {
        recs.push({
          type: 'warning',
          category: 'recovery',
          message: `Hydration level is low (${todayWater.amountMl}ml / ${todayWater.goalMl}ml). Dehydration reduces physical strength by up to 15%. Drink up!`
        });
      }
    } else {
      recs.push({
        type: 'info',
        category: 'recovery',
        message: 'Remember to track your daily water intake. Goal is 3000ml (3L).'
      });
    }

    // 5. Progressive Overload praise
    if (workouts.length >= 2) {
      // Find if latest workout has increased weight compared to previous of the same template
      const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      const prevSame = sorted.slice(1).find(w => w.name === latest.name);

      if (prevSame) {
        let overloaded = false;
        latest.exercises.forEach(le => {
          const pe = prevSame.exercises.find(e => e.exerciseId === le.exerciseId);
          if (pe) {
            const maxLatest = Math.max(...le.sets.filter(s => s.isCompleted).map(s => s.actualWeight || 0));
            const maxPrev = Math.max(...pe.sets.filter(s => s.isCompleted).map(s => s.actualWeight || 0));
            if (maxLatest > maxPrev && maxPrev > 0) {
              overloaded = true;
            }
          }
        });
        if (overloaded) {
          recs.push({
            type: 'success',
            category: 'workout',
            message: 'Excellent progressive overload detected! You lifted heavier compared to your last session. Keep pushing limits.'
          });
        }
      }
    }

    // Fallback general recommendations if list is empty
    if (recs.length === 0) {
      recs.push({
        type: 'info',
        category: 'general',
        message: 'Consistency is key. Log workouts, macros, water, and sleep daily for optimal AI evaluation.'
      });
    }

    return recs;
  }, [profile, dietLogs, workouts, sleepLogs, waterLogs, recoveryStatus, templates]);

  return (
    <AppContext.Provider value={{
      profile, templates, workouts, exercises, dietLogs, bodyLogs, progressPhotos, waterLogs, sleepLogs, achievements,
      activeWorkout, startWorkout, updateActiveWorkout, completeActiveWorkout, cancelActiveWorkout,
      restTimeRemaining, startRestTimer,
      updateProfile, addCustomExercise, deleteExercise, addTemplate, updateTemplate, duplicateTemplate, deleteTemplate,
      addDietLog, deleteDietLog, addBodyLog, uploadProgressPhoto, addWater, addSleepLog, deleteSleepLog,
      aiRecommendations, recoveryStatus, readinessScore, streakDays,
      latestUnlockedAchievement, clearLatestAchievement,
      snapDate, setSnapDate
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
