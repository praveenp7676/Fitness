'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Trophy, Calendar, Droplet, Moon, Sparkles, TrendingUp, ChevronRight, Dumbbell, Apple, X, Camera, Download, Copy, Check } from 'lucide-react';
import { getLocalDateString } from '../../lib/db';

export default function DashboardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { 
    profile, workouts, dietLogs, waterLogs, streakDays, achievements 
  } = useApp();

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [showSnapModal, setShowSnapModal] = useState(false);
  const [snapImgUrl, setSnapImgUrl] = useState<string | null>(null);
  const [copiedSnap, setCopiedSnap] = useState(false);

  const handleCopySnap = async () => {
    if (!snapImgUrl) return;
    try {
      const response = await fetch(snapImgUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedSnap(true);
      setTimeout(() => setCopiedSnap(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed: ", err);
      alert("Failed to copy image. You can right-click and save it, or download it using the button.");
    }
  };

  const handleDownloadSnap = () => {
    if (!snapImgUrl) return;
    const a = document.createElement('a');
    a.href = snapImgUrl;
    a.download = `fitforge_summary_${selectedDate}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const generateSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1000);
    bgGrad.addColorStop(0, '#09090b'); // zinc-950
    bgGrad.addColorStop(1, '#18181b'); // zinc-900
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Draw Top-Right Ambient Glow
    const glowGrad = ctx.createRadialGradient(850, 150, 50, 850, 150, 450);
    glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.15)'); // orange opacity
    glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Card border
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 996, 996);

    // Draw Header Section
    // Logo block
    const logoGrad = ctx.createLinearGradient(40, 40, 90, 90);
    logoGrad.addColorStop(0, '#f97316'); // orange-500
    logoGrad.addColorStop(1, '#d97706'); // amber-600
    ctx.fillStyle = logoGrad;
    
    // Rounded rect helper
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    };

    drawRoundRect(40, 40, 60, 60, 15);

    // Logo text "FF"
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FF', 70, 70);

    // Brand title
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    ctx.fillText('FitForge AI', 115, 42);

    ctx.fillStyle = '#a1a1aa'; // zinc-400
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('PREMIUM PERFORMANCE CONSOLE', 115, 78);

    // Date tag
    ctx.textAlign = 'right';
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillStyle = '#f97316'; // orange-500
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(formattedDate.toUpperCase(), 960, 45);

    // Athlete Profile Subheader
    ctx.fillStyle = '#3f3f46'; // zinc-700
    ctx.fillRect(40, 120, 920, 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(profile?.name || 'Iron Athlete', 40, 140);

    ctx.fillStyle = '#a1a1aa'; // zinc-400
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${profile?.fitnessGoal || 'General Fitness'}  •  ${profile?.weight || '--'} kg  •  ${profile?.height || '--'} cm`, 40, 168);

    // ==========================================
    // WORKOUT DETAILS SECTION (LEFT SIDE, X: 40 to 470)
    // ==========================================
    ctx.fillStyle = '#18181b'; // zinc-900 block
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 1.5;
    drawRoundRect(40, 210, 440, 680, 20);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px system-ui, -apple-system, sans-serif';
    ctx.fillText("WORKOUT LOG", 65, 235);

    // Dumbbell Icon drawing
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(375, 245);
    ctx.lineTo(395, 245);
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(370, 237, 5, 16);
    ctx.fillRect(395, 237, 5, 16);

    let yOffset = 285;
    if (todayWorkouts.length === 0) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#71717a'; // zinc-500
      ctx.font = '500 14px system-ui, -apple-system, sans-serif';
      ctx.fillText("No workouts logged for this day.", 260, 480);
    } else {
      ctx.textAlign = 'left';
      todayWorkouts.forEach((w) => {
        if (yOffset > 800) return; // avoid drawing past bottom
        
        ctx.fillStyle = '#f97316';
        ctx.font = '900 14px system-ui, -apple-system, sans-serif';
        ctx.fillText(w.name.toUpperCase(), 65, yOffset);
        yOffset += 24;

        w.exercises.forEach((ex) => {
          if (yOffset > 830) return;
          const completedSets = ex.sets.filter(s => s.isCompleted);
          if (completedSets.length === 0) return;
          const setsStr = completedSets
            .map(s => `${s.actualWeight}kg x ${s.actualReps}`)
            .join(', ');

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          ctx.fillText(ex.name, 65, yOffset);

          // Wrap sets description if too long
          ctx.textAlign = 'right';
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '500 12px system-ui, -apple-system, sans-serif';
          ctx.fillText(setsStr, 455, yOffset);
          
          ctx.textAlign = 'left';
          yOffset += 22;
        });

        yOffset += 15; // spacing between workouts
      });
    }

    // ==========================================
    // DIET & NUTRITION SECTION (RIGHT SIDE, X: 520 to 960)
    // ==========================================
    ctx.fillStyle = '#18181b'; // zinc-900 block
    ctx.strokeStyle = '#27272a'; // zinc-800
    ctx.lineWidth = 1.5;
    drawRoundRect(520, 210, 440, 680, 20);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px system-ui, -apple-system, sans-serif';
    ctx.fillText("DIET & NUTRITION", 545, 235);

    // Apple Icon placeholder shape
    ctx.fillStyle = '#a855f7'; // purple
    ctx.beginPath();
    ctx.arc(885, 246, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(895, 246, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22c55e'; // green leaf
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(890, 239);
    ctx.quadraticCurveTo(892, 233, 897, 234);
    ctx.stroke();

    // 1. Calories progress bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText("Calories Consumed", 545, 290);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f97316';
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${caloriesConsumed} / ${calorieTarget} kcal`, 935, 290);
    ctx.textAlign = 'left';

    // Draw Bar
    ctx.fillStyle = '#27272a';
    drawRoundRect(545, 315, 390, 14, 7);
    const calPercent = Math.min(1, caloriesConsumed / calorieTarget);
    if (calPercent > 0) {
      const calBarGrad = ctx.createLinearGradient(545, 0, 935, 0);
      calBarGrad.addColorStop(0, '#f97316');
      calBarGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = calBarGrad;
      drawRoundRect(545, 315, 390 * calPercent, 14, 7);
    }

    // 2. Protein progress bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText("Protein Intake", 545, 365);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a855f7';
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${proteinConsumed}g / ${proteinTarget}g`, 935, 365);
    ctx.textAlign = 'left';

    // Draw Bar
    ctx.fillStyle = '#27272a';
    drawRoundRect(545, 390, 390, 14, 7);
    const protPercent = Math.min(1, proteinConsumed / proteinTarget);
    if (protPercent > 0) {
      const protBarGrad = ctx.createLinearGradient(545, 0, 935, 0);
      protBarGrad.addColorStop(0, '#a855f7');
      protBarGrad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = protBarGrad;
      drawRoundRect(545, 390, 390 * protPercent, 14, 7);
    }

    // Other macros breakdown
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText("Carbs & Fats Breakdown", 545, 440);

    ctx.fillStyle = '#e4e4e7'; // zinc-200
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Carbs Logged: ${carbsConsumed}g`, 545, 470);
    ctx.fillText(`Fats Logged: ${fatConsumed}g`, 545, 495);

    // 3. Water consumed progress bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText("Water Intake", 545, 550);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#06b6d4';
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${waterAmount}ml / ${waterGoal}ml`, 935, 550);
    ctx.textAlign = 'left';

    // Draw Bar
    ctx.fillStyle = '#27272a';
    drawRoundRect(545, 575, 390, 14, 7);
    const waterPercent = Math.min(1, waterAmount / waterGoal);
    if (waterPercent > 0) {
      const waterBarGrad = ctx.createLinearGradient(545, 0, 935, 0);
      waterBarGrad.addColorStop(0, '#06b6d4');
      waterBarGrad.addColorStop(1, '#0891b2');
      ctx.fillStyle = waterBarGrad;
      drawRoundRect(545, 575, 390 * waterPercent, 14, 7);
    }

    // Food list summary
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText("MEAL DETAILS", 545, 635);
    
    let mealY = 670;
    if (todayDiet.length === 0) {
      ctx.fillStyle = '#71717a';
      ctx.font = '500 13px system-ui, -apple-system, sans-serif';
      ctx.fillText("No meals logged for this day.", 545, mealY);
    } else {
      todayDiet.slice(0, 7).forEach((d) => { // limit to 7 to prevent overflow
        if (mealY > 860) return;
        ctx.fillStyle = '#e4e4e7';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`• ${d.foodName}`, 545, mealY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#f97316';
        ctx.font = '600 12px system-ui, -apple-system, sans-serif';
        ctx.fillText(`${d.calories} kcal`, 935, mealY);
        
        ctx.textAlign = 'left';
        mealY += 22;
      });
      if (todayDiet.length > 7) {
        ctx.fillStyle = '#71717a';
        ctx.font = 'italic 11px system-ui, -apple-system, sans-serif';
        ctx.fillText(`+ ${todayDiet.length - 7} more food items`, 545, mealY);
      }
    }

    // ==========================================
    // FOOTER SECTION
    // ==========================================
    ctx.fillStyle = '#3f3f46'; // zinc-700
    ctx.fillRect(40, 920, 920, 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#71717a';
    ctx.font = '800 12px system-ui, -apple-system, sans-serif';
    ctx.fillText("BUILD STRENGTH. SEIZE PROGRESSION.", 40, 945);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#52525b';
    ctx.font = '500 11px system-ui, -apple-system, sans-serif';
    ctx.fillText("FITFORGE AI ENGINE  •  FITFORGE.AI", 960, 945);

    // Save as state image URL
    const url = canvas.toDataURL('image/png');
    setSnapImgUrl(url);
    setShowSnapModal(true);
  };

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
            onClick={generateSnapshot}
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

      {/* ==========================================
          MODAL: SNAPSHOT PREVIEW & ACTIONS
          ========================================== */}
      {showSnapModal && snapImgUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 animate-scale-up max-h-[95vh] overflow-y-auto relative text-zinc-50 flex flex-col items-center">
            
            <button 
              onClick={() => { setShowSnapModal(false); setSnapImgUrl(null); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1.5 rounded-lg bg-zinc-950/40 border border-zinc-800/40 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Snapshot Created</span>
              <h3 className="text-lg font-black text-white mt-0.5">Shareable Infographic Card</h3>
            </div>

            {/* Preview image */}
            <div className="w-full border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 aspect-square max-w-[450px] shadow-2xl relative">
              <img src={snapImgUrl} alt="FitForge Infographic Summary" className="w-full h-full object-contain" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full max-w-[450px]">
              <button
                onClick={handleCopySnap}
                className="flex-1 py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer"
              >
                {copiedSnap ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-orange-500" />
                    Copy to Clipboard
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSnap}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-500 text-center leading-normal">
              You can also right-click (or long press on mobile) the card preview to save it directly.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
