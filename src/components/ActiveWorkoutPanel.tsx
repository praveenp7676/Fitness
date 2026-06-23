'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, StopCircle, X, Plus, AlertCircle, Sparkles, Check, Clock, 
  Trash2, ShieldCheck, Search
} from 'lucide-react';
import { WorkoutLog, WorkoutExercise, WorkoutSet } from '../lib/db';

export default function ActiveWorkoutPanel() {
  const { 
    activeWorkout, updateActiveWorkout, completeActiveWorkout, 
    cancelActiveWorkout, restTimeRemaining, startRestTimer, exercises 
  } = useApp();

  const [expanded, setExpanded] = useState(false);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [exSearch, setExSearch] = useState('');

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add exercise to active workout
  const handleAddExerciseToWorkout = (exId: string, exName: string, targetMuscle: string) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    
    // Prevent duplicate exercises
    if (currentLog.exercises.some(e => e.exerciseId === exId)) {
      alert('Exercise already added to this session!');
      return;
    }

    currentLog.exercises.push({
      exerciseId: exId,
      name: exName,
      targetMuscle: targetMuscle,
      sets: [{ targetWeight: 40, targetReps: 10, isCompleted: false }],
      notes: ''
    });

    updateActiveWorkout(currentLog);
    setShowAddExModal(false);
    setExSearch('');
  };

  // Remove exercise from active workout
  const handleRemoveExercise = (idx: number) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    currentLog.exercises = currentLog.exercises.filter((_, i) => i !== idx);
    updateActiveWorkout(currentLog);
  };

  // Toggle set completed state & trigger rest timer
  const handleToggleSetCompleted = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    const set = currentLog.exercises[exIdx].sets[setIdx];
    
    const wasCompleted = set.isCompleted;
    set.isCompleted = !wasCompleted;

    // Default weight/reps if empty
    if (!wasCompleted) {
      if (set.actualWeight === undefined || isNaN(set.actualWeight)) {
        set.actualWeight = set.targetWeight;
      }
      if (set.actualReps === undefined || isNaN(set.actualReps)) {
        set.actualReps = set.targetReps;
      }
      // Start 90s rest timer
      startRestTimer(90);
    }

    updateActiveWorkout(currentLog);
  };

  // Handle inputs changes in set
  const handleSetChange = (exIdx: number, setIdx: number, field: 'actualWeight' | 'actualReps', value: string) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    const parsed = parseFloat(value);
    
    currentLog.exercises[exIdx].sets[setIdx][field] = isNaN(parsed) ? undefined : parsed;
    updateActiveWorkout(currentLog);
  };

  // Add a new set to an exercise in active session
  const handleAddSetToExercise = (exIdx: number) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    const ex = currentLog.exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];

    ex.sets.push({
      targetWeight: lastSet ? lastSet.targetWeight : 20,
      targetReps: lastSet ? lastSet.targetReps : 10,
      isCompleted: false
    });

    updateActiveWorkout(currentLog);
  };

  // Remove a set from exercise in active session
  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    if (!activeWorkout) return;
    const currentLog = { ...activeWorkout.log };
    currentLog.exercises[exIdx].sets = currentLog.exercises[exIdx].sets.filter((_, idx) => idx !== setIdx);
    updateActiveWorkout(currentLog);
  };

  if (!activeWorkout) return null;

  return (
    <>
      {/* ==========================================
          MINIMIZED STATE: FLOATING BOTTOM BAR
          ========================================== */}
      {!expanded && (
        <div className="fixed bottom-18 md:bottom-6 left-4 right-4 z-40 bg-zinc-900 border border-orange-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(249,115,22,0.15)] flex items-center justify-between cursor-pointer animate-slide-up hover:border-orange-500/60" onClick={() => setExpanded(true)}>
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{activeWorkout.log.name}</h4>
              <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                Stopwatch: {formatTime(activeWorkout.elapsedSeconds)}
                {restTimeRemaining > 0 && (
                  <span className="text-cyan-400">• Rest: {restTimeRemaining}s</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              className="px-3.5 py-1.5 bg-orange-500 text-white font-extrabold text-[10px] rounded-lg cursor-pointer"
            >
              Open log
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Discard workout?')) cancelActiveWorkout(); }}
              className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          EXPANDED STATE: FULL WORKOUT CONSOLE
          ========================================== */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-end">
          
          <div className="w-full max-w-4xl mx-auto h-[92vh] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
                  <Play className="h-5 w-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeWorkout.log.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      Stopwatch: <strong className="text-orange-500 font-black">{formatTime(activeWorkout.elapsedSeconds)}</strong>
                    </span>
                    <span className="text-zinc-700 text-xs hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold">
                      <span>Log Date:</span>
                      <input 
                        type="date"
                        value={activeWorkout.log.date}
                        onChange={e => {
                          const currentLog = { ...activeWorkout.log };
                          currentLog.date = e.target.value;
                          updateActiveWorkout(currentLog);
                        }}
                        className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-[11px] font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAddExModal(true)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  + Add Exercise
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Rest Timer Banner */}
            {restTimeRemaining > 0 && (
              <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-5 py-2 flex items-center justify-between text-xs text-cyan-400 animate-pulse">
                <span className="font-bold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Resting in progress...
                </span>
                <strong className="font-black text-sm">{restTimeRemaining}s remaining</strong>
              </div>
            )}

            {/* Log Body Scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {activeWorkout.log.exercises.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-3xl">
                  <Plus className="h-10 w-10 mx-auto mb-2 text-zinc-700" />
                  No exercises added. Add an exercise to begin your training session.
                </div>
              ) : (
                activeWorkout.log.exercises.map((ex, exIdx) => (
                  <div key={exIdx} className="forge-card p-5 bg-zinc-950/60 border border-zinc-850 rounded-2xl space-y-4 relative">
                    
                    <button 
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div>
                      <h4 className="font-extrabold text-sm text-white">{ex.name}</h4>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{ex.targetMuscle}</span>
                    </div>

                    {/* Sets listing table */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        <span>Set</span>
                        <span>Target</span>
                        <span>Weight (kg)</span>
                        <span>Reps</span>
                        <span>Complete</span>
                        <span></span>
                      </div>
                      
                      {ex.sets.map((set, setIdx) => (
                        <div key={setIdx} className={`grid grid-cols-6 gap-2 items-center text-center p-1.5 rounded-lg transition-all ${
                          set.isCompleted ? 'bg-emerald-500/5' : 'bg-transparent'
                        }`}>
                          <span className="text-xs font-bold text-zinc-400">{setIdx + 1}</span>
                          <span className="text-[10px] text-zinc-500 font-semibold">{set.targetWeight}kg × {set.targetReps}</span>
                          
                          <input
                            type="number"
                            value={set.actualWeight === undefined ? '' : set.actualWeight}
                            onChange={e => handleSetChange(exIdx, setIdx, 'actualWeight', e.target.value)}
                            placeholder={set.targetWeight.toString()}
                            className="w-16 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white focus:outline-none focus:border-orange-500 font-semibold mx-auto"
                          />
                          
                          <input
                            type="number"
                            value={set.actualReps === undefined ? '' : set.actualReps}
                            onChange={e => handleSetChange(exIdx, setIdx, 'actualReps', e.target.value)}
                            placeholder={set.targetReps.toString()}
                            className="w-16 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white focus:outline-none focus:border-orange-500 font-semibold mx-auto"
                          />

                          <button
                            type="button"
                            onClick={() => handleToggleSetCompleted(exIdx, setIdx)}
                            className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all mx-auto ${
                              set.isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                            className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSetToExercise(exIdx)}
                      className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Set
                    </button>
                  </div>
                ))
              )}
              
              {/* Workout notes input */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Session Notes</span>
                <textarea
                  placeholder="Record how your energy, form, or joint health felt during this workout..."
                  value={activeWorkout.log.notes || ''}
                  onChange={e => {
                    const currentLog = { ...activeWorkout.log };
                    currentLog.notes = e.target.value;
                    updateActiveWorkout(currentLog);
                  }}
                  className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white h-20 resize-none placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

            </div>

            {/* Bottom Controls */}
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex gap-4">
              <button
                type="button"
                onClick={() => { if(confirm('Discard this workout?')) cancelActiveWorkout(); }}
                className="flex-1 py-3 bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 text-zinc-400 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Discard Session
              </button>
              <button
                type="button"
                onClick={completeActiveWorkout}
                className="flex-[2] py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="h-4.5 w-4.5" />
                Finish Workout & Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD EXERCISE TO ACTIVE WORKOUT
          ========================================== */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Select Exercise</h3>
              <button onClick={() => setShowAddExModal(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search exercise..."
                value={exSearch}
                onChange={e => setExSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {exercises
                .filter(ex => ex.name.toLowerCase().includes(exSearch.toLowerCase()))
                .map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToWorkout(ex.id, ex.name, ex.targetMuscle)}
                    className="w-full p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl flex items-center justify-between hover:border-orange-500/30 transition-all text-left"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{ex.name}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">{ex.targetMuscle}</span>
                    </div>
                    <span className="text-[10px] text-orange-400 font-bold bg-orange-500/5 px-2 py-0.5 border border-orange-500/10 rounded">
                      Add
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
