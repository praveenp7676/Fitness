'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Moon, Clock, Plus, Trash2, Calendar, Smile } from 'lucide-react';

import { getLocalDateString } from '../../lib/db';

export default function RecoveryTab() {
  const { recoveryStatus, sleepLogs, addSleepLog, deleteSleepLog, readinessScore } = useApp();

  const today = getLocalDateString();

  // Forms states
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepForm, setSleepForm] = useState({
    date: today,
    startTime: '22:00',
    endTime: '06:00',
    hours: 8,
    quality: 'Good' as 'Poor' | 'Fair' | 'Good' | 'Excellent'
  });

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto calculate hours from times
    const [startH, startM] = sleepForm.startTime.split(':').map(Number);
    const [endH, endM] = sleepForm.endTime.split(':').map(Number);
    
    let hoursDiff = endH - startH + (endM - startM) / 60;
    if (hoursDiff < 0) {
      hoursDiff += 24; // spans past midnight
    }

    addSleepLog({
      date: sleepForm.date,
      startTime: sleepForm.startTime,
      endTime: sleepForm.endTime,
      hours: parseFloat(hoursDiff.toFixed(1)),
      quality: sleepForm.quality
    });

    setShowSleepModal(false);
  };

  // Sort muscle groups by recovery progress
  const sortedMuscles = Object.entries(recoveryStatus).sort((a, b) => a[1].percent - b[1].percent);

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Readiness Core Card */}
        <div className="forge-card p-6 flex flex-col justify-between md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950">
          <div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">System Recovery Readiness</span>
            <h3 className="text-3xl font-black text-white mt-1">Readiness Score: {readinessScore}%</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Calculated dynamically by blending your last sleep logs, cellular water hydration, and muscular fatigue.
              {readinessScore > 80 
                ? ' Your nervous system is fully primed. Perfect time for heavy strength testing!'
                : readinessScore > 50
                  ? ' Good functional readiness. Warm up well and focus on controlled progressive volume.'
                  : ' Extreme fatigue or under-recovery detected. Plan a rest day or gentle mobility drill.'}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Total recovery items tracked: <strong>12 Muscle Groups</strong></span>
          </div>
        </div>

        {/* Add Sleep Rapid Callout */}
        <div className="forge-card p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-zinc-900 to-blue-950/20 border-blue-500/20">
          <Moon className="h-7 w-7 text-blue-400 animate-pulse mb-2" />
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">Sleep Tracker</span>
          <button
            onClick={() => setShowSleepModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Log Last Night's Sleep
          </button>
        </div>

      </div>

      {/* Soreness and sleep columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Muscle Soreness List */}
        <div className="forge-card p-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-orange-500" />
            Muscular Recovery States
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 mb-6">Estimated time for fibers to rebuild (hypertrophy rest cycle: 72 hours).</p>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {sortedMuscles.map(([muscle, status]) => (
              <div key={muscle} className="space-y-1.5 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">{muscle}</span>
                  <span className={`font-bold ${status.percent === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {status.percent === 100 
                      ? 'Fully Recovered' 
                      : `${status.hoursRemaining}h remaining (${status.percent}%)`}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${status.percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      status.percent === 100 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                        : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep History Logs */}
        <div className="forge-card p-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
            <Moon className="h-5 w-5 text-blue-400" />
            Sleep Quality & Schedule
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 mb-6">Monitor sleep duration logs for hormone synthesis and fatigue elimination.</p>

          {sleepLogs.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-3xl">
              No sleep logs recorded yet. Begin logging bedtimes to map recovery.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {[...sleepLogs].reverse().map(log => (
                <div key={log.id} className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-zinc-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{log.hours} hours</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                        log.quality === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.quality === 'Good' ? 'bg-blue-500/10 text-blue-400' :
                        log.quality === 'Fair' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.quality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {log.startTime} - {log.endTime}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {log.date}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteSleepLog(log.id)}
                    className="text-zinc-600 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          MODAL: LOG SLEEP DETAILS
          ========================================== */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <h3 className="text-lg font-black text-white">Log Sleep Session</h3>
            
            <form onSubmit={handleSleepSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Bed Time (Start)</label>
                  <input
                    type="time"
                    required
                    value={sleepForm.startTime}
                    onChange={e => setSleepForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Wake Time (End)</label>
                  <input
                    type="time"
                    required
                    value={sleepForm.endTime}
                    onChange={e => setSleepForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Date Slept</label>
                  <input
                    type="date"
                    required
                    value={sleepForm.date}
                    onChange={e => setSleepForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Sleep Quality</label>
                  <select
                    value={sleepForm.quality}
                    onChange={e => setSleepForm(prev => ({ ...prev, quality: e.target.value as any }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-white text-xs"
                  >
                    <option value="Poor">Poor 🥱</option>
                    <option value="Fair">Fair 🪵</option>
                    <option value="Good">Good 💤</option>
                    <option value="Excellent">Excellent ⚡</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 border-t border-zinc-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSleepModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Save sleep log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
