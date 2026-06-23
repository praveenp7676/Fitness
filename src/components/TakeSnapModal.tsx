'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, Download, Copy, Check, Share2 } from 'lucide-react';
import { getLocalDateString } from '../lib/db';

export default function TakeSnapModal() {
  const { 
    profile, workouts, dietLogs, waterLogs, snapDate, setSnapDate 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(snapDate || getLocalDateString());
  const [snapImgUrl, setSnapImgUrl] = useState<string | null>(null);
  const [copiedSnap, setCopiedSnap] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Re-generate snapshot whenever selected date or data changes
  useEffect(() => {
    if (snapDate) {
      generateSnapshot();
    }
  }, [selectedDate, workouts, dietLogs, waterLogs, profile]);

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

  const handleShareSnap = async () => {
    if (!snapImgUrl) return;
    try {
      const response = await fetch(snapImgUrl);
      const blob = await response.blob();
      const file = new File([blob], `fitforge_summary_${selectedDate}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `FitForge AI Daily Summary - ${selectedDate}`,
          text: `Check out my FitForge workout and diet summary for ${selectedDate}!`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `FitForge AI Daily Summary - ${selectedDate}`,
          text: `Check out my FitForge workout and diet summary for ${selectedDate}!`,
          url: window.location.origin,
        });
      } else {
        await handleCopySnap();
        alert("Web Share is not supported on this browser. The snapshot has been copied to your clipboard!");
      }
    } catch (err) {
      console.error("Error sharing snapshot:", err);
      await handleCopySnap();
      alert("Could not share. The snapshot has been copied to your clipboard instead!");
    }
  };

  const generateSnapshot = () => {
    setIsGenerating(true);
    // Create elements matching DashboardTab logic
    const todayDiet = dietLogs.filter(d => d.date === selectedDate);
    const caloriesConsumed = todayDiet.reduce((acc, d) => acc + d.calories, 0);
    const proteinConsumed = todayDiet.reduce((acc, d) => acc + d.protein, 0);
    const carbsConsumed = todayDiet.reduce((acc, d) => acc + d.carbs, 0);
    const fatConsumed = todayDiet.reduce((acc, d) => acc + d.fat, 0);

    const calorieTarget = profile?.fitnessGoal === 'Lose Fat' 
      ? 1800 
      : profile?.fitnessGoal === 'Build Muscle' || profile?.fitnessGoal === 'Gain Weight' 
        ? 2800 
        : 2200;

    const proteinTarget = profile ? Math.round(profile.weight * 2) : 140;

    const todayWater = waterLogs.find(w => w.date === selectedDate);
    const waterAmount = todayWater ? todayWater.amountMl : 0;
    const waterGoal = todayWater ? todayWater.goalMl : 3000;

    const todayWorkouts = workouts.filter(w => w.date === selectedDate);

    // Canvas drawing
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

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
    setIsGenerating(false);
  };

  if (!snapDate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 animate-scale-up max-h-[95vh] overflow-y-auto relative text-zinc-50 flex flex-col items-center">
        
        <button 
          onClick={() => setSnapDate(null)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1.5 rounded-lg bg-zinc-950/40 border border-zinc-800/40 cursor-pointer transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Snapshot Generator</span>
          <h3 className="text-xl font-black text-white">Daily Infographic Card</h3>
        </div>

        {/* Date Selector */}
        <div className="w-full max-w-[450px] bg-zinc-950 p-3 rounded-2xl border border-zinc-850 flex items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400 font-extrabold">Active Snapshot Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
          />
        </div>

        {/* Preview image */}
        <div className="w-full border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 aspect-square max-w-[450px] shadow-2xl relative flex items-center justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Generating Card...</span>
            </div>
          ) : snapImgUrl ? (
            <img src={snapImgUrl} alt="FitForge Infographic Summary" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-zinc-500">Failed to render card preview.</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[450px]">
          <button
            onClick={handleCopySnap}
            disabled={!snapImgUrl}
            className="flex-1 py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer disabled:opacity-50"
          >
            {copiedSnap ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-orange-500" />
                Copy Image
              </>
            )}
          </button>

          <button
            onClick={handleShareSnap}
            disabled={!snapImgUrl}
            className="flex-1 py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="h-4 w-4 text-orange-500" />
            Share Card
          </button>

          <button
            onClick={handleDownloadSnap}
            disabled={!snapImgUrl}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
  );
}
