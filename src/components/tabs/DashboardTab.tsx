'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Trophy, Calendar, Droplet, Moon, Sparkles, TrendingUp, ChevronRight, Dumbbell, Apple, X, Camera, Download, Copy, Check } from 'lucide-react';
import { getLocalDateString } from '../../lib/db';

export default function DashboardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { 
    profile, workouts, dietLogs, waterLogs, streakDays, achievements, setSnapDate 
  } = useApp();

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  // Daily Diet calculations
  const todayDiet = dietLogs.filter(d => d.date === selectedDate);
  const caloriesConsumed = todayDiet.reduce((acc, d) => acc + d.calories, 0);
  const proteinConsumed = todayDiet.reduce((acc, d) => acc + d.protein, 0);
  const carbsConsumed = todayDiet.reduce((acc, d) => acc + d.carbs, 0);
  const fatConsumed = todayDiet.reduce((acc, d) => acc + d.fat, 0);

  // Targets
  const calorieTarget = profile?.fitnessGoal === 'Lose Fat' 
    ? 1800 
    : profile?.fitnessGoal === 'Build Muscle' || profile?.fitnessGoal === 'Gain Weight' 
      ? 2800 
      : 2200;

  const proteinTarget = profile ? Math.round(profile.weight * 2) : 140;

  // Daily Water
  const todayWater = waterLogs.find(w => w.date === selectedDate);
  const waterAmount = todayWater ? todayWater.amountMl : 0;
  const waterGoal = todayWater ? todayWater.goalMl : 3000;

  const todayWorkouts = workouts.filter(w => w.date === selectedDate);

  return (
    <div className="space-y-6">
      
      {/* Date Selector Console */}
      <div className="forge-card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gradient-to-r from-zinc-900 to-zinc-950">
        <div>
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Analysis Console</span>
          <h2 className="text-xl font-black text-white mt-0.5">Performance Overview</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Selected Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            />
          </div>
          <button
            onClick={() => setSnapDate(selectedDate)}
            className="px-3.5 py-2 bg-orange-600/10 border border-orange-500/20 text-orange-400 hover:bg-orange-600 hover:text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="h-3.5 w-3.5" />
            Take Snap
          </button>
        </div>
      </div>
      
      {/* Premium Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* User Card */}
        <div className="forge-card p-6 flex flex-col justify-between bg-gradient-to-br from-zinc-900 to-zinc-950">
          <div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Welcome back</span>
            <h2 className="text-2xl font-black text-white mt-1">{profile?.name || 'Iron Athlete'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-semibold text-orange-500">
                {profile?.fitnessGoal || 'General Fitness'}
              </span>
              <span className="px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-400">
                {profile?.activityLevel.split(' ')[0] || 'Active'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Weight: <strong className="text-white">{profile?.weight || '--'} kg</strong></span>
            <span className="text-zinc-400 text-sm">Height: <strong className="text-white">{profile?.height || '--'} cm</strong></span>
          </div>
        </div>

        {/* Workout Streak Card */}
        <div className="forge-card p-6 flex items-center justify-between bg-gradient-to-br from-zinc-900 to-orange-950/20">
          <div className="space-y-1">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Workout Streak</span>
            <h3 className="text-4xl font-black text-white flex items-baseline gap-1.5">
              {streakDays} <span className="text-lg font-medium text-zinc-400">Days</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-normal">
              {streakDays > 0 
                ? 'Keep the fire burning! Smashed your session.' 
                : 'Complete your first workout to initiate your streak!'}
            </p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <Flame className="h-9 w-9 fill-current animate-pulse" />
          </div>
        </div>

      </div>

      {/* Daily Progress Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Calories Ring */}
        <div className="forge-card p-5 flex flex-col items-center justify-center text-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Calories</span>
          <div className="relative h-28 w-28 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#27272a" strokeWidth="8" fill="transparent" />
              <circle cx="56" cy="56" r="48" stroke="#f97316" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(1, caloriesConsumed / calorieTarget))}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{caloriesConsumed}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">/ {calorieTarget} kcal</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 mt-3 font-medium">
            {Math.round((caloriesConsumed / calorieTarget) * 100)}% Consumed
          </span>
        </div>

        {/* Protein Ring */}
        <div className="forge-card p-5 flex flex-col items-center justify-center text-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Protein</span>
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#27272a" strokeWidth="8" fill="transparent" />
              <circle cx="56" cy="56" r="48" stroke="#a855f7" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(1, proteinConsumed / proteinTarget))}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{proteinConsumed}g</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">/ {proteinTarget}g</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 mt-3 font-medium">
            {Math.round((proteinConsumed / proteinTarget) * 100)}% Hitting target
          </span>
        </div>

        {/* Water Ring */}
        <div className="forge-card p-5 flex flex-col items-center justify-center text-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3">Water</span>
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#27272a" strokeWidth="8" fill="transparent" />
              <circle cx="56" cy="56" r="48" stroke="#06b6d4" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(1, waterAmount / waterGoal))}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white">{(waterAmount / 1000).toFixed(1)}L</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">/ {(waterGoal/1000).toFixed(1)}L</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 mt-3 font-medium flex items-center gap-1">
            <Droplet className="h-3 w-3 text-cyan-400 fill-current" />
            {Math.round((waterAmount / waterGoal) * 100)}% Completed
          </span>
        </div>



      </div>

      {/* Main Stats Column Layout (Today's Logs Only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Today's Workout Results */}
        <div className="forge-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-orange-500" />
              {selectedDate === today ? "Today's Workout" : `Workout on ${selectedDate}`}
            </h3>
          </div>

          {todayWorkouts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              {selectedDate === today ? "No exercises completed today yet." : `No exercises completed on ${selectedDate}.`}
            </div>
          ) : (
            <div className="space-y-5">
              {todayWorkouts.map((w, wIdx) => (
                <div key={wIdx} className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
                    {w.name}
                  </div>
                  <div className="space-y-2">
                    {w.exercises.map((ex, exIdx) => {
                      const completedSets = ex.sets.filter(s => s.isCompleted);
                      if (completedSets.length === 0) return null;
                      const setsStr = completedSets
                        .map(s => `${s.actualWeight}kg × ${s.actualReps}`)
                        .join(', ');
                      return (
                        <div key={exIdx} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-extrabold text-white">{ex.name}</span>
                          <span className="text-zinc-400 font-semibold">{setsStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Diet Summary (Badges / Shortcuts) */}
        <div className="forge-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Apple className="h-5 w-5 text-orange-500" />
              {selectedDate === today ? "Today's Diet Summary" : `Diet Summary on ${selectedDate}`}
            </h3>
          </div>

          {todayDiet.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              {selectedDate === today ? "No meals logged today yet." : `No meals logged on ${selectedDate}.`}
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">
                {selectedDate === today ? "Items Logged Today" : `Items Logged on ${selectedDate}`}
              </span>
              
              {/* Commas / Shortcuts display */}
              <div className="flex flex-wrap gap-2">
                {todayDiet.map(d => (
                  <div key={d.id} className="px-3.5 py-2 bg-zinc-950 border border-zinc-850 text-xs font-bold text-zinc-300 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <span>{d.foodName}</span>
                    {d.quantity && (
                      <span className="text-[9px] text-zinc-500 font-semibold">({d.quantity})</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-zinc-850/50 flex justify-between text-[11px] font-bold text-zinc-500 uppercase">
                <span>Calories: <strong className="text-white">{caloriesConsumed} kcal</strong></span>
                <span>Protein: <strong className="text-white">{proteinConsumed}g</strong></span>
              </div>
            </div>
          )}
        </div>

      </div>



    </div>
  );
}
