'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Sparkles, Database, Trash2, Check, RefreshCw, Copy, Download, Upload } from 'lucide-react';
import { db, getLocalDateString } from '../../lib/db';

const BACKUP_KEYS = {
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

export default function AdminTab() {
  const { exercises, deleteExercise } = useApp();
  const [importText, setImportText] = React.useState('');

  const handleExportData = () => {
    try {
      const data: Record<string, string | null> = {};
      Object.entries(BACKUP_KEYS).forEach(([keyName, keyValue]) => {
        data[keyName] = localStorage.getItem(keyValue);
      });
      const jsonString = JSON.stringify(data);
      navigator.clipboard.writeText(jsonString)
        .then(() => {
          alert('Backup copied to clipboard! Paste it on your phone or save it somewhere safe.');
        })
        .catch(err => {
          console.error('Clipboard copy failed:', err);
          alert('Could not copy to clipboard automatically. Please copy the data from the textbox or download it as a file.');
          setImportText(jsonString);
        });
    } catch (e) {
      alert('Export failed: ' + (e as Error).message);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const data: Record<string, string | null> = {};
      Object.entries(BACKUP_KEYS).forEach(([keyName, keyValue]) => {
        data[keyName] = localStorage.getItem(keyValue);
      });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitforge_backup_${getLocalDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed: ' + (e as Error).message);
    }
  };

  const handleImportData = (rawText: string) => {
    if (!rawText || !rawText.trim()) {
      alert('Please paste or upload backup data first.');
      return;
    }
    try {
      const parsed = JSON.parse(rawText.trim()) as Record<string, string | null>;
      const expectedKeys = Object.keys(BACKUP_KEYS);
      const actualKeys = Object.keys(parsed);
      const isValid = actualKeys.some(k => expectedKeys.includes(k));
      
      if (!isValid) {
        alert('Invalid backup format. Make sure you copied the correct FitForge backup data.');
        return;
      }

      if (!confirm('WARNING: Importing this backup will overwrite ALL current profile details, templates, logs, and achievements on this device. Do you want to proceed?')) {
        return;
      }

      Object.entries(parsed).forEach(([keyName, value]) => {
        const keyValue = BACKUP_KEYS[keyName as keyof typeof BACKUP_KEYS];
        if (keyValue) {
          if (value === null) {
            localStorage.removeItem(keyValue);
          } else {
            localStorage.setItem(keyValue, value);
          }
        }
      });

      alert('Sync successful! Reloading to load your data...');
      window.location.reload();
    } catch (e) {
      alert('Failed to parse data: ' + (e as Error).message + '. Make sure the backup text is copied correctly.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportText(text);
        handleImportData(text);
      }
    };
    reader.onerror = () => {
      alert('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleSeedMockData = () => {
    if (!confirm('This will seed historical workouts, weight logs, sleep logs, and diet items so you can instantly preview FitForge AI charts, AI Coach tips, and metrics. Proceed?')) {
      return;
    }

    // 1. Seed Profile
    const profile = {
      name: 'Alexander Mercer',
      age: 26,
      gender: 'Male',
      height: 182,
      weight: 82,
      fitnessGoal: 'Build Muscle',
      activityLevel: 'Moderately Active'
    };
    db.saveProfile(profile);

    // Get date string relative helper
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return getLocalDateString(d);
    };

    // 2. Seed Body weight progression logs (generates a beautiful line chart!)
    const bodyLogs = [
      { id: 'b1', date: daysAgo(21), weight: 84.0, bodyFatPercentage: 16.0, chest: 104, waist: 86, arms: 37, thighs: 59, shoulders: 118 },
      { id: 'b2', date: daysAgo(14), weight: 83.2, bodyFatPercentage: 15.7, chest: 104, waist: 85, arms: 37.2, thighs: 59, shoulders: 119 },
      { id: 'b3', date: daysAgo(7), weight: 82.5, bodyFatPercentage: 15.4, chest: 105, waist: 84.2, arms: 37.5, thighs: 58.5, shoulders: 119.5 },
      { id: 'b4', date: daysAgo(1), weight: 82.0, bodyFatPercentage: 15.0, chest: 105, waist: 83.5, arms: 37.8, thighs: 58, shoulders: 120 }
    ];
    bodyLogs.forEach(b => db.saveBodyLog(b));

    // 3. Seed Workout Logs (Includes heavy set reps)
    const workouts = [
      // Workout 1: Push Day 10 Days Ago
      {
        id: 'wl_1',
        templateId: 'ppl-push',
        name: 'Push (Chest/Shoulders/Triceps)',
        date: daysAgo(10),
        durationSeconds: 2700,
        notes: 'Felt strong, bench bar moved quick.',
        exercises: [
          {
            exerciseId: 'bench_press',
            name: 'Bench Press',
            targetMuscle: 'Chest',
            sets: [
              { targetWeight: 70, targetReps: 10, actualWeight: 70, actualReps: 10, isCompleted: true },
              { targetWeight: 75, targetReps: 8, actualWeight: 75, actualReps: 8, isCompleted: true },
              { targetWeight: 80, targetReps: 6, actualWeight: 80, actualReps: 5, isCompleted: true }
            ]
          },
          {
            exerciseId: 'shoulder_press',
            name: 'Dumbbell Shoulder Press',
            targetMuscle: 'Shoulders',
            sets: [
              { targetWeight: 20, targetReps: 10, actualWeight: 20, actualReps: 10, isCompleted: true },
              { targetWeight: 22, targetReps: 8, actualWeight: 22, actualReps: 8, isCompleted: true }
            ]
          }
        ]
      },
      // Workout 2: Pull Day 8 Days Ago
      {
        id: 'wl_2',
        templateId: 'ppl-pull',
        name: 'Pull (Back/Biceps)',
        date: daysAgo(8),
        durationSeconds: 3100,
        notes: 'Lats got a great pump.',
        exercises: [
          {
            exerciseId: 'deadlift',
            name: 'Deadlift',
            targetMuscle: 'Back',
            sets: [
              { targetWeight: 100, targetReps: 5, actualWeight: 100, actualReps: 5, isCompleted: true },
              { targetWeight: 120, targetReps: 5, actualWeight: 120, actualReps: 5, isCompleted: true }
            ]
          },
          {
            exerciseId: 'pull_up',
            name: 'Pull-up',
            targetMuscle: 'Back',
            sets: [
              { targetWeight: 0, targetReps: 8, actualWeight: 0, actualReps: 8, isCompleted: true },
              { targetWeight: 0, targetReps: 6, actualWeight: 0, actualReps: 6, isCompleted: true }
            ]
          }
        ]
      },
      // Workout 3: Legs Day 6 Days Ago
      {
        id: 'wl_3',
        templateId: 'ppl-legs',
        name: 'Legs + Core',
        date: daysAgo(6),
        durationSeconds: 2800,
        notes: 'Squats depth was perfect.',
        exercises: [
          {
            exerciseId: 'squat',
            name: 'Barbell Back Squat',
            targetMuscle: 'Legs',
            sets: [
              { targetWeight: 80, targetReps: 10, actualWeight: 80, actualReps: 10, isCompleted: true },
              { targetWeight: 90, targetReps: 8, actualWeight: 90, actualReps: 8, isCompleted: true }
            ]
          }
        ]
      },
      // Workout 4: Push Day 4 Days Ago (Provides progressive overload compared to 10 days ago!)
      {
        id: 'wl_4',
        templateId: 'ppl-push',
        name: 'Push (Chest/Shoulders/Triceps)',
        date: daysAgo(4),
        durationSeconds: 2850,
        notes: 'Overloaded bench weight! Smashed the targets.',
        exercises: [
          {
            exerciseId: 'bench_press',
            name: 'Bench Press',
            targetMuscle: 'Chest',
            sets: [
              { targetWeight: 70, targetReps: 10, actualWeight: 70, actualReps: 10, isCompleted: true },
              // Overload: 77.5kg is more than 75kg
              { targetWeight: 75, targetReps: 8, actualWeight: 77.5, actualReps: 8, isCompleted: true },
              // Overload: 82.5kg is more than 80kg
              { targetWeight: 80, targetReps: 6, actualWeight: 82.5, actualReps: 6, isCompleted: true }
            ]
          },
          {
            exerciseId: 'shoulder_press',
            name: 'Dumbbell Shoulder Press',
            targetMuscle: 'Shoulders',
            sets: [
              { targetWeight: 20, targetReps: 10, actualWeight: 20, actualReps: 10, isCompleted: true },
              { targetWeight: 22, targetReps: 8, actualWeight: 24, actualReps: 8, isCompleted: true }
            ]
          }
        ]
      },
      // Workout 5: Pull Day 2 Days Ago
      {
        id: 'wl_5',
        templateId: 'ppl-pull',
        name: 'Pull (Back/Biceps)',
        date: daysAgo(2),
        durationSeconds: 2900,
        notes: 'Heavy deadlifts.',
        exercises: [
          {
            exerciseId: 'deadlift',
            name: 'Deadlift',
            targetMuscle: 'Back',
            sets: [
              { targetWeight: 100, targetReps: 5, actualWeight: 105, actualReps: 5, isCompleted: true },
              { targetWeight: 120, targetReps: 5, actualWeight: 125, actualReps: 5, isCompleted: true }
            ]
          }
        ]
      },
      // Workout 6: Legs Day Yesterday
      {
        id: 'wl_6',
        templateId: 'ppl-legs',
        name: 'Legs + Core',
        date: daysAgo(1),
        durationSeconds: 2950,
        notes: 'Leg soreness incoming.',
        exercises: [
          {
            exerciseId: 'squat',
            name: 'Barbell Back Squat',
            targetMuscle: 'Legs',
            sets: [
              { targetWeight: 80, targetReps: 10, actualWeight: 85, actualReps: 10, isCompleted: true },
              { targetWeight: 90, targetReps: 8, actualWeight: 95, actualReps: 8, isCompleted: true }
            ]
          }
        ]
      }
    ];
    workouts.forEach(w => db.saveWorkout(w));

    // 4. Seed Diet logs
    const dietLogs = [
      { id: 'd1', date: daysAgo(1), mealCategory: 'Breakfast' as any, foodName: 'Oats with milk and banana', quantity: '1 bowl', calories: 480, protein: 18.5, carbs: 75.0, fat: 9.0 },
      { id: 'd2', date: daysAgo(1), mealCategory: 'Lunch' as any, foodName: 'Grilled Chicken Breast and Brown Rice', quantity: '250g', calories: 580, protein: 55.0, carbs: 56.0, fat: 7.2 },
      { id: 'd3', date: daysAgo(1), mealCategory: 'Post Workout' as any, foodName: 'Whey Protein Shake', quantity: '1 scoop', calories: 120, protein: 24.0, carbs: 3.0, fat: 1.5 },
      { id: 'd4', date: daysAgo(1), mealCategory: 'Dinner' as any, foodName: 'Salmon Fillet and Broccoli', quantity: '200g', calories: 450, protein: 38.0, carbs: 8.0, fat: 22.0 }
    ];
    dietLogs.forEach(d => db.saveDietLog(d));

    // 5. Seed Sleep logs
    const sleepLogs = [
      { id: 's1', date: daysAgo(4), startTime: '22:30', endTime: '06:00', hours: 7.5, quality: 'Good' as any },
      { id: 's2', date: daysAgo(3), startTime: '23:00', endTime: '06:00', hours: 7.0, quality: 'Fair' as any },
      { id: 's3', date: daysAgo(2), startTime: '22:00', endTime: '06:00', hours: 8.0, quality: 'Excellent' as any },
      { id: 's4', date: daysAgo(1), startTime: '23:30', endTime: '06:00', hours: 6.5, quality: 'Poor' as any }
    ];
    sleepLogs.forEach(s => db.saveSleepLog(s));

    // 6. Seed Water logs
    db.saveWaterAmount(daysAgo(4), 2800, 3000);
    db.saveWaterAmount(daysAgo(3), 3200, 3000);
    db.saveWaterAmount(daysAgo(2), 3000, 3000);
    db.saveWaterAmount(daysAgo(1), 1800, 3000); // dehydration alert trigger!

    // Save initial profile achievements
    db.unlockAchievement('profile_setup', 'Forge Initiated', 'You set up your profile and started your journey.', '🔥');
    db.unlockAchievement('first_workout', 'First Blood', 'You completed your first logged workout session.', '💪');

    // Reload page to refresh context
    window.location.reload();
  };

  const handleClearDatabase = () => {
    if (confirm('CAUTION: This will delete ALL local storage data, including templates, workouts, profile, photos, and achievements. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Seed controls header */}
      <div className="forge-card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Database Seed Console</h3>
            <p className="text-xs text-zinc-500">Seed sample logs or format local client data storage</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleSeedMockData}
            className="flex-1 p-5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 rounded-2xl text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm group-hover:underline">Seed Full Sample History</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Fills the database with 3 weeks of weight logs, 6 completed workouts, meals, water entries, and unlocks achievements. Reloads page instantly.
              </p>
            </div>
          </button>

          <button
            onClick={handleClearDatabase}
            className="flex-1 p-5 bg-red-950/10 hover:bg-red-950/20 text-red-500 border border-red-500/30 rounded-2xl text-left transition-all group flex items-start gap-4 cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm group-hover:underline">Purge Local Storage</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Deletes profile, templates, active sets, water intake, sleep durations, and photos. Warning: This cannot be undone!
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Sync & Backup Console */}
      <div className="forge-card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Sync & Backup</h3>
            <p className="text-xs text-zinc-500">Transfer profile details, custom exercises, templates, and history between devices</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 py-3 px-4 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              Copy Backup to Clipboard
            </button>
            <button
              onClick={handleDownloadBackup}
              className="flex-1 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Backup File
            </button>
          </div>

          <div className="border-t border-zinc-850/50 pt-4 space-y-3">
            <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Import / Restore Backup</label>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste the exported backup text string here..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-xs h-20 resize-none font-mono"
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                id="backup-file-upload"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('backup-file-upload')?.click()}
                className="py-2.5 px-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Upload .json File
              </button>
              <button
                onClick={() => handleImportData(importText)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Restore Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises oversight list */}
      <div className="forge-card p-6">
        <h3 className="text-lg font-black text-white mb-4">Manage Active Exercises</h3>
        <p className="text-xs text-zinc-500 mb-6">List of active exercises loaded in the library database. Standard seed exercises cannot be deleted.</p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {exercises.map(ex => (
            <div key={ex.id} className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">{ex.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{ex.targetMuscle} • {ex.equipment}</span>
              </div>
              <div>
                {ex.isCustom ? (
                  <button 
                    onClick={() => deleteExercise(ex.id)}
                    className="p-1 px-2 text-xs font-bold text-red-500 hover:underline"
                  >
                    Delete Custom
                  </button>
                ) : (
                  <span className="text-[9px] px-2 py-0.5 bg-zinc-900 text-zinc-500 font-extrabold rounded-md uppercase tracking-wider">System Standard</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
