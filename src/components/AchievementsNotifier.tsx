'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Award, X } from 'lucide-react';

export default function AchievementsNotifier() {
  const { latestUnlockedAchievement, clearLatestAchievement } = useApp();

  useEffect(() => {
    if (!latestUnlockedAchievement) return;

    // Auto dismiss after 5.5 seconds
    const timer = setTimeout(() => {
      clearLatestAchievement();
    }, 5500);

    return () => clearTimeout(timer);
  }, [latestUnlockedAchievement, clearLatestAchievement]);

  if (!latestUnlockedAchievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full bg-zinc-900/90 border border-orange-500/40 rounded-2xl p-5 shadow-[0_10px_30px_rgba(249,115,22,0.2)] backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-3xl shrink-0">
            {latestUnlockedAchievement.icon}
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-orange-500">Achievement Unlocked!</span>
            <h4 className="text-lg font-extrabold text-white mt-0.5 leading-snug">{latestUnlockedAchievement.title}</h4>
            <p className="text-sm text-zinc-400 mt-1 leading-normal">{latestUnlockedAchievement.description}</p>
          </div>
        </div>
        <button 
          onClick={clearLatestAchievement}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
