'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Onboarding from '../components/Onboarding';
import AchievementsNotifier from '../components/AchievementsNotifier';
import ActiveWorkoutPanel from '../components/ActiveWorkoutPanel';
import ReportExporter from '../components/ReportExporter';

// Tabs
import DashboardTab from '../components/tabs/DashboardTab';
import WorkoutsTab from '../components/tabs/WorkoutsTab';
import DietTab from '../components/tabs/DietTab';
import AdminTab from '../components/tabs/AdminTab';

// Icons
import { 
  Home as HomeIcon, Dumbbell, Apple, LineChart, Shield, MessageSquare, 
  Settings, Flame, Activity, FileText, ChevronDown, User, Sparkles, X
} from 'lucide-react';

export default function Home() {
  const { profile, streakDays } = useApp();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showExportModal, setShowExportModal] = useState(false);

  // Eliminate SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Forging Workspace...</span>
      </div>
    );
  }

  // Blocker if profile not setup
  if (!profile) {
    return <Onboarding />;
  }

  // Render current tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab setActiveTab={setActiveTab} />;
      case 'workouts':
        return <WorkoutsTab />;
      case 'diet':
        return <DietTab />;
      case 'admin':
        return <AdminTab />;
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: HomeIcon },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'diet', label: 'Diet & Water', icon: Apple },
    { id: 'admin', label: 'Console', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-50 select-none pb-20 md:pb-0">
      
      {/* ==========================================
          DESKTOP SIDEBAR NAVIGATION
          ========================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 shrink-0 sticky top-0 h-screen p-5 justify-between">
        <div className="space-y-6">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-md text-sm font-black">
              FF
            </div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              FitForge AI
            </span>
          </div>

          {/* Quick profile badge */}
          <div className="flex items-center space-x-3 p-3 bg-zinc-950 border border-zinc-850 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-extrabold text-xs shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-white truncate leading-tight">{profile.name}</h4>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{profile.fitnessGoal}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.25)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3.5 pt-4 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase px-2">
            <span>System Status</span>
            <span className="text-emerald-400">Offline Ready</span>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-[10px] font-black uppercase tracking-wider text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-orange-500" />
            Export Data
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN SCREEN CONTAINER
          ========================================== */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="p-4 bg-zinc-900 border-b border-zinc-800/80 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 md:hidden">
            <div className="h-7 w-7 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-black">FF</div>
            <span className="text-sm font-black tracking-tight text-white">FitForge AI</span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">
              {activeTab === 'dashboard' ? 'Overview' : activeTab} Panel
            </h1>
          </div>

          {/* Quick summaries widgets */}
          <div className="flex items-center space-x-2">
            {/* Streak indicator */}
            <div className="flex items-center gap-1 px-3 py-1 bg-zinc-950 border border-zinc-850 rounded-xl text-xs font-black text-orange-500 shadow-sm">
              <Flame className="h-4 w-4 fill-current animate-pulse" />
              <span>{streakDays}d</span>
            </div>

            {/* Report Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="p-1 px-2.5 bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-black rounded-xl hover:bg-orange-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Tab Content Area */}
        <div className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto space-y-6">
          {renderTabContent()}
        </div>

      </main>

      {/* ==========================================
          MOBILE STICKY BOTTOM NAVIGATION BAR
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-45 bg-zinc-900 border-t border-zinc-850 p-2 grid grid-cols-7 text-center">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive ? 'text-orange-500 scale-[1.03]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[8px] font-bold mt-1 tracking-tight truncate w-full max-w-[45px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* ==========================================
          FLOATING OVERLAY PANELS
          ========================================== */}
      <ActiveWorkoutPanel />
      <AchievementsNotifier />

      {/* ==========================================
          MODAL: EXPORT DATA HUB
          ========================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <ReportExporter />
          </div>
        </div>
      )}

    </div>
  );
}
