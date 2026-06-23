'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Dumbbell, Plus, Search, HelpCircle, Copy, Share2, Edit2, Trash2, 
  ChevronDown, ChevronUp, Check, Play, BookOpen, Layers
} from 'lucide-react';
import { Exercise, WorkoutTemplate, WorkoutExercise, WorkoutSet } from '../../lib/db';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 
  'Abs', 'Forearms', 'Glutes', 'Calves', 'Neck', 'Full Body'
];

export default function WorkoutsTab() {
  const { 
    templates, exercises, startWorkout, addTemplate, updateTemplate, 
    deleteTemplate, duplicateTemplate, addCustomExercise, deleteExercise
  } = useApp();

  // Tab subsections: 'templates' | 'exercises' | 'create_template'
  const [activeSubTab, setActiveSubTab] = useState<'templates' | 'exercises'>('templates');
  
  // Muscle filtering state
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom exercise modal state
  const [showCustomExModal, setShowCustomExModal] = useState(false);
  const [newExData, setNewExData] = useState({
    name: '',
    targetMuscle: 'Chest',
    secondaryMuscles: [] as string[],
    equipment: 'Dumbbells',
    difficulty: 'Beginner' as Exercise['difficulty'],
    instructions: '',
    tips: ''
  });

  // Template creation/editing state
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateEditorMuscleFilter, setTemplateEditorMuscleFilter] = useState<string>('All');

  // Toggle muscle selection
  const handleMuscleToggle = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(prev => prev.filter(m => m !== muscle));
    } else {
      setSelectedMuscles(prev => [...prev, muscle]);
    }
  };

  // Smart filter exercises
  const filteredExercises = React.useMemo(() => {
    return exercises.filter(ex => {
      // Search matching
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ex.targetMuscle.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Muscle matching
      if (selectedMuscles.length === 0) return matchesSearch;
      
      const matchesMuscle = selectedMuscles.includes(ex.targetMuscle) ||
                            ex.secondaryMuscles.some(m => selectedMuscles.includes(m));
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, selectedMuscles, searchQuery]);

  // Export/Share template
  const handleShareTemplate = (tpl: WorkoutTemplate) => {
    const rawData = JSON.stringify({
      fitforge_template: true,
      name: tpl.name,
      muscleGroups: tpl.muscleGroups,
      notes: tpl.notes,
      exercises: tpl.exercises.map(e => ({
        exerciseId: e.exerciseId,
        name: e.name,
        targetMuscle: e.targetMuscle,
        sets: e.sets.map(s => ({ targetWeight: s.targetWeight, targetReps: s.targetReps, isCompleted: false }))
      }))
    }, null, 2);

    navigator.clipboard.writeText(rawData);
    alert('Workout template schema copied to clipboard! You can share this raw text with your friends.');
  };

  // Add custom exercise
  const handleCreateExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExData.name.trim()) return;

    addCustomExercise({
      name: newExData.name,
      targetMuscle: newExData.targetMuscle,
      secondaryMuscles: newExData.secondaryMuscles,
      equipment: newExData.equipment,
      difficulty: newExData.difficulty,
      instructions: newExData.instructions.split('\n').filter(l => l.trim() !== ''),
      tips: newExData.tips.split('\n').filter(l => l.trim() !== ''),
      isCustom: true
    });

    setNewExData({
      name: '',
      targetMuscle: 'Chest',
      secondaryMuscles: [],
      equipment: 'Dumbbells',
      difficulty: 'Beginner',
      instructions: '',
      tips: ''
    });
    setShowCustomExModal(false);
  };

  // Handle template creation/editing save
  const handleSaveTemplate = () => {
    const tpl = editingTemplate;
    if (!tpl || !tpl.name?.trim()) {
      alert('Template Name is required.');
      return;
    }
    if (!tpl.exercises || tpl.exercises.length === 0) {
      alert('Add at least one exercise to the template.');
      return;
    }

    // Auto calculate muscle groups based on exercises
    const derivedMuscles = Array.from(new Set(tpl.exercises.map(e => e.targetMuscle)));

    const templateToSave: WorkoutTemplate = {
      ...tpl,
      muscleGroups: derivedMuscles,
      updatedAt: new Date().toISOString()
    };

    if (tpl.id && tpl.id !== '') {
      updateTemplate(templateToSave);
    } else {
      addTemplate(templateToSave);
    }
    
    setEditingTemplate(null);
    setShowTemplateEditor(false);
  };

  const startNewTemplateDesign = () => {
    setEditingTemplate({
      id: '',
      name: '',
      notes: '',
      exercises: [],
      muscleGroups: [],
      updatedAt: new Date().toISOString()
    });
    setShowTemplateEditor(true);
  };

  const loadTemplateToEditor = (tpl: WorkoutTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl)));
    setShowTemplateEditor(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub navigation bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab('templates'); setShowTemplateEditor(false); }}
            className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'templates' && !showTemplateEditor
                ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Workout Templates
          </button>
          <button
            onClick={() => { setActiveSubTab('exercises'); setShowTemplateEditor(false); }}
            className={`px-4 py-2 text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'exercises' && !showTemplateEditor
                ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Exercise Library
          </button>
        </div>

        {!showTemplateEditor && activeSubTab === 'templates' && (
          <button
            onClick={startNewTemplateDesign}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>
        )}

        {!showTemplateEditor && activeSubTab === 'exercises' && (
          <button
            onClick={() => setShowCustomExModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Custom Exercise
          </button>
        )}
      </div>

      {/* ==========================================
          SUB TAB: TEMPLATE EDITOR VIEW
          ========================================== */}
      {showTemplateEditor && editingTemplate && (
        <div className="forge-card p-6 space-y-6 bg-gradient-to-b from-zinc-900 to-zinc-950 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white">
              {editingTemplate.id ? 'Edit Template' : 'Design New Template'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => { setShowTemplateEditor(false); setEditingTemplate(null); }}
                className="px-4 py-2 text-xs font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Template Name</label>
              <input
                type="text"
                value={editingTemplate.name || ''}
                onChange={e => setEditingTemplate(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                placeholder="e.g. Bro Split Push Day"
                className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Workout Notes / Description</label>
              <textarea
                value={editingTemplate.notes || ''}
                onChange={e => setEditingTemplate(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                placeholder="Notes about intensity, rest targets, or exercise swaps..."
                className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm h-20 resize-none"
              />
            </div>

            {/* Configured Exercises */}
            <div className="space-y-4">
              <span className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Exercises Added</span>
              
              {(!editingTemplate.exercises || editingTemplate.exercises.length === 0) ? (
                <p className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-800 rounded-xl">
                  Select exercises from the library list below to add them to this template.
                </p>
              ) : (
                <div className="space-y-3">
                  {editingTemplate.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 relative">
                      <button 
                        onClick={() => {
                          setEditingTemplate(prev => {
                            if (!prev) return null;
                            const clone = { ...prev };
                            clone.exercises = clone.exercises.filter((_, idx) => idx !== exIdx);
                            return clone;
                          });
                        }}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          <Dumbbell className="h-4 w-4 text-orange-500" />
                          {ex.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{ex.targetMuscle}</span>
                      </div>

                      {/* Sets list */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Set</span>
                          <span>Target Weight (kg)</span>
                          <span>Target Reps</span>
                          <span>Actions</span>
                        </div>
                        {ex.sets.map((set, setIdx) => (
                          <div key={setIdx} className="grid grid-cols-5 items-center text-center">
                            <span className="text-xs font-bold text-zinc-400">{setIdx + 1}</span>
                            <input
                              type="number"
                              value={set.targetWeight === 0 ? '' : set.targetWeight}
                              placeholder="0"
                              onChange={e => {
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  const clone = { ...prev };
                                  clone.exercises[exIdx].sets[setIdx].targetWeight = parseFloat(e.target.value) || 0;
                                  return clone;
                                });
                              }}
                              className="mx-auto w-16 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white focus:outline-none focus:border-orange-500 font-semibold"
                            />
                            <input
                              type="number"
                              value={set.targetReps === 0 ? '' : set.targetReps}
                              placeholder="0"
                              onChange={e => {
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  const clone = { ...prev };
                                  clone.exercises[exIdx].sets[setIdx].targetReps = parseInt(e.target.value, 10) || 0;
                                  return clone;
                                });
                              }}
                              className="mx-auto w-16 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-white focus:outline-none focus:border-orange-500 font-semibold"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  const clone = { ...prev };
                                  clone.exercises[exIdx].sets = clone.exercises[exIdx].sets.filter((_, idx) => idx !== setIdx);
                                  return clone;
                                });
                              }}
                              className="text-xs font-bold text-red-500 hover:underline"
                            >
                              Remove Set
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplate(prev => {
                            if (!prev) return null;
                            const clone = { ...prev };
                            const lastSet = clone.exercises[exIdx].sets[clone.exercises[exIdx].sets.length - 1];
                            clone.exercises[exIdx].sets.push({
                              targetWeight: lastSet ? lastSet.targetWeight : 20,
                              targetReps: lastSet ? lastSet.targetReps : 10,
                              isCompleted: false
                            });
                            return clone;
                          });
                        }}
                        className="text-xs font-extrabold text-orange-500 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Add Set
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inline Exercise Seeder for custom build */}
            <div className="border-t border-zinc-800 pt-4 mt-6">
              <span className="block text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-2">Click below to add exercises to template</span>
              
              {/* Muscle selector pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-thin">
                {['All', ...MUSCLE_GROUPS].map(muscle => {
                  const isActive = templateEditorMuscleFilter === muscle;
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => setTemplateEditorMuscleFilter(muscle)}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.15)] border-orange-500/40'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>

              {/* Exercises List */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 mt-2">
                {exercises
                  .filter(ex => {
                    if (templateEditorMuscleFilter === 'All') return true;
                    return ex.targetMuscle === templateEditorMuscleFilter || ex.secondaryMuscles.includes(templateEditorMuscleFilter);
                  })
                  .map(ex => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        setEditingTemplate(prev => {
                          if (!prev) return null;
                          const clone = { ...prev };
                          const exists = clone.exercises.some(e => e.exerciseId === ex.id);
                          if (exists) return prev; // prevent duplicate
                          
                          clone.exercises.push({
                            exerciseId: ex.id,
                            name: ex.name,
                            targetMuscle: ex.targetMuscle,
                            sets: [{ targetWeight: 40, targetReps: 10, isCompleted: false }]
                          });
                          return clone;
                        });
                      }}
                      className="p-2.5 text-left text-xs bg-zinc-950 border border-zinc-850 hover:border-orange-500/40 hover:bg-orange-500/5 rounded-xl font-bold text-white transition-all truncate"
                    >
                      + {ex.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUB TAB: TEMPLATES LISTING
          ========================================== */}
      {activeSubTab === 'templates' && !showTemplateEditor && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl text-zinc-500">
              <Layers className="h-10 w-15 mx-auto mb-2 text-zinc-600" />
              <p className="font-extrabold text-white text-sm">No workout templates designed</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">Forge templates to trigger standardized tracking sessions.</p>
              <button 
                onClick={startNewTemplateDesign}
                className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer"
              >
                Design First Template
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="forge-card p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-white text-lg leading-tight">{tpl.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tpl.muscleGroups.map(m => (
                            <span key={m} className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 rounded-md">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0 bg-zinc-950/60 p-1 rounded-xl border border-zinc-850">
                        <button 
                          onClick={() => loadTemplateToEditor(tpl)}
                          title="Edit Template"
                          className="p-1.5 text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => duplicateTemplate(tpl.id)}
                          title="Duplicate Template"
                          className="p-1.5 text-zinc-400 hover:text-purple-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleShareTemplate(tpl)}
                          title="Share Template"
                          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Delete template?')) deleteTemplate(tpl.id); }}
                          title="Delete Template"
                          className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {tpl.notes && <p className="text-xs text-zinc-400 mt-3 italic line-clamp-2">{tpl.notes}</p>}

                    <div className="mt-4 pt-4 border-t border-zinc-850/50 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">Exercise Outline</span>
                      <ul className="text-xs text-zinc-300 space-y-1">
                        {tpl.exercises.slice(0, 3).map((ex, idx) => (
                          <li key={idx} className="flex justify-between items-center">
                            <span>{ex.name}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">{ex.sets.length} Sets</span>
                          </li>
                        ))}
                        {tpl.exercises.length > 3 && (
                          <li className="text-[10px] text-zinc-500 font-bold italic">+{tpl.exercises.length - 3} more exercises</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => startWorkout(tpl.id)}
                    className="w-full mt-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(249,115,22,0.25)] transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Start Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SUB TAB: EXERCISE LIBRARY VIEW
          ========================================== */}
      {activeSubTab === 'exercises' && !showTemplateEditor && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Interactive Muscle Group Cards Selector */}
          <div>
            <span className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider mb-3">Filter by Muscle Group</span>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {MUSCLE_GROUPS.map(muscle => {
                const isSelected = selectedMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => handleMuscleToggle(muscle)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400 font-extrabold shadow-[0_0_10px_rgba(249,115,22,0.15)]'
                        : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Inputs */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search exercise by name or primary muscle..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold transition-all"
              />
            </div>
            {selectedMuscles.length > 0 && (
              <button 
                onClick={() => setSelectedMuscles([])}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Smart exercises filtered list */}
          <div className="space-y-3">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                No exercises match your search query or muscle selection.
              </div>
            ) : (
              filteredExercises.map(ex => (
                <ExerciseDetailsCard key={ex.id} ex={ex} deleteExercise={deleteExercise} />
              ))
            )}
          </div>

        </div>
      )}

      {/* ==========================================
          MODAL: CUSTOM EXERCISE DESIGNER
          ========================================== */}
      {showCustomExModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white">Create Custom Exercise</h3>
            <form onSubmit={handleCreateExerciseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Hammer Curl"
                  value={newExData.name}
                  onChange={e => setNewExData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Primary Target Muscle</label>
                  <select
                    value={newExData.targetMuscle}
                    onChange={e => setNewExData(prev => ({ ...prev, targetMuscle: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {MUSCLE_GROUPS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Equipment</label>
                  <select
                    value={newExData.equipment}
                    onChange={e => setNewExData(prev => ({ ...prev, equipment: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {['Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Band', 'Other'].map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Difficulty</label>
                <div className="mt-2 flex space-x-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as Exercise['difficulty'][]).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setNewExData(prev => ({ ...prev, difficulty: diff }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        newExData.difficulty === diff
                          ? 'border-orange-500 bg-orange-600/10 text-orange-400 font-extrabold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Step-by-step Instructions (One per line)</label>
                <textarea
                  placeholder="1. Set incline bench to 30 degrees&#10;2. Grab weight with underhand grip&#10;3. Curl dumbbells without shifting shoulders"
                  value={newExData.instructions}
                  onChange={e => setNewExData(prev => ({ ...prev, instructions: e.target.value }))}
                  className="mt-2 block w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Training Tips (One per line)</label>
                <textarea
                  placeholder="Keep elbows pinned to your sides&#10;Squeeze biceps at peak for 1 second"
                  value={newExData.tips}
                  onChange={e => setNewExData(prev => ({ ...prev, tips: e.target.value }))}
                  className="mt-2 block w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs h-16 resize-none"
                />
              </div>

              <div className="flex space-x-2 border-t border-zinc-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomExModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Create Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Collapsible Exercise Details Card
function ExerciseDetailsCard({ ex, deleteExercise }: { ex: Exercise; deleteExercise: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`p-4 bg-zinc-900 border rounded-2xl transition-all ${expanded ? 'border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]' : 'border-zinc-800/80 hover:border-zinc-700'}`}>
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-orange-500 font-extrabold text-sm shrink-0">
            {ex.name[0]}
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm leading-snug">{ex.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-zinc-400">{ex.targetMuscle}</span>
              <span className="text-zinc-600 text-[10px]">•</span>
              <span className="text-[10px] text-zinc-500">{ex.equipment}</span>
              <span className="text-zinc-600 text-[10px]">•</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                ex.difficulty === 'Beginner' 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : ex.difficulty === 'Intermediate' 
                    ? 'bg-amber-500/10 text-amber-400' 
                    : 'bg-red-500/10 text-red-400'
              }`}>{ex.difficulty}</span>
            </div>
          </div>
        </div>
        <div>
          {expanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3.5 animate-slide-up text-xs text-zinc-300">
          
          {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
            <div>
              <strong className="text-white block mb-0.5">Secondary Muscles:</strong>
              <span className="text-zinc-400 text-xs">{ex.secondaryMuscles.join(', ')}</span>
            </div>
          )}

          <div>
            <strong className="text-white flex items-center gap-1 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-orange-500" />
              Instructions:
            </strong>
            <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
              {ex.instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ol>
          </div>

          {ex.tips && ex.tips.length > 0 && (
            <div className="bg-orange-500/5 border border-orange-500/10 p-3 rounded-xl">
              <strong className="text-orange-400 flex items-center gap-1 mb-1 font-extrabold text-[11px] uppercase tracking-wider">
                <HelpCircle className="h-3.5 w-3.5 text-orange-500" />
                Forge Pro Tip:
              </strong>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 italic">
                {ex.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {ex.isCustom && (
            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => { if(confirm('Delete custom exercise?')) deleteExercise(ex.id); }}
                className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Custom Exercise
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
