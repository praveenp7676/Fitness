'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Apple, Plus, Trash2, Droplet, Sparkles, Edit2, Check, HelpCircle } from 'lucide-react';
import { estimateMacros, getLocalDateString } from '../../lib/db';

const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre Workout', 'Post Workout'] as const;

export default function DietTab() {
  const { dietLogs, addDietLog, deleteDietLog, waterLogs, addWater, profile } = useApp();

  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);

  // Daily Diet calculations
  const todayDiet = dietLogs.filter(d => d.date === selectedDate);
  const totalCalories = todayDiet.reduce((acc, d) => acc + d.calories, 0);
  const totalProtein = todayDiet.reduce((acc, d) => acc + d.protein, 0);
  const totalCarbs = todayDiet.reduce((acc, d) => acc + d.carbs, 0);
  const totalFat = todayDiet.reduce((acc, d) => acc + d.fat, 0);

  // Targets
  const calorieTarget = profile?.fitnessGoal === 'Lose Fat' 
    ? 1800 
    : profile?.fitnessGoal === 'Build Muscle' || profile?.fitnessGoal === 'Gain Weight' 
      ? 2800 
      : 2200;

  const proteinTarget = profile ? Math.round(profile.weight * 2) : 140;
  const carbsTarget = Math.round((calorieTarget * 0.45) / 4);
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);

  // Daily Water
  const todayWater = waterLogs.find(w => w.date === selectedDate);
  const waterAmount = todayWater ? todayWater.amountMl : 0;
  const waterGoal = todayWater ? todayWater.goalMl : 3000;

  // Add Food form states
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<typeof MEAL_CATEGORIES[number]>('Breakfast');
  
  const [foodForm, setFoodForm] = useState({
    foodName: '',
    quantity: '100g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    isManual: false,
    notes: ''
  });

  // Handle food input typing for auto estimation
  const handleFoodNameChange = (val: string) => {
    const estimated = estimateMacros(val);
    setFoodForm(prev => {
      if (prev.isManual) {
        return { ...prev, foodName: val };
      } else {
        return {
          ...prev,
          foodName: val,
          calories: estimated.calories,
          protein: estimated.protein,
          carbs: estimated.carbs,
          fat: estimated.fat
        };
      }
    });
  };

  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.foodName.trim()) return;

    addDietLog(
      activeCategory,
      foodForm.foodName,
      foodForm.quantity,
      {
        calories: foodForm.calories,
        protein: foodForm.protein,
        carbs: foodForm.carbs,
        fat: foodForm.fat,
        notes: foodForm.notes
      },
      selectedDate
    );

    // Reset Form
    setFoodForm({
      foodName: '',
      quantity: '100g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      isManual: false,
      notes: ''
    });
    setShowAddFoodModal(false);
  };

  const toggleManualEstimation = () => {
    setFoodForm(prev => ({
      ...prev,
      isManual: !prev.isManual
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Date Selector Console */}
      <div className="forge-card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gradient-to-r from-zinc-900 to-zinc-950">
        <div>
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Nutrition Console</span>
          <h2 className="text-xl font-black text-white mt-0.5">Diet & Hydration</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
          <span>Date to Log/View:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Macro Analytics Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Calories Card */}
        <div className="forge-card p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Calories</span>
            <Apple className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalCalories}</span>
            <span className="text-xs text-zinc-500"> / {calorieTarget} kcal</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (totalCalories / calorieTarget) * 100)}%` }}
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Protein Card */}
        <div className="forge-card p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Protein</span>
            <span className="h-2 w-2 rounded-full bg-purple-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalProtein}g</span>
            <span className="text-xs text-zinc-500"> / {proteinTarget}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Carbs Card */}
        <div className="forge-card p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Carbohydrates</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalCarbs}g</span>
            <span className="text-xs text-zinc-500"> / {carbsTarget}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (totalCarbs / carbsTarget) * 100)}%` }}
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Fat Card */}
        <div className="forge-card p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Fats</span>
            <span className="h-2 w-2 rounded-full bg-pink-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalFat}g</span>
            <span className="text-xs text-zinc-500"> / {fatTarget}g</span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (totalFat / fatTarget) * 100)}%` }}
              className="bg-pink-500 h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

      </div>

      {/* Main Grid: Meals & Water */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Meal Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="forge-card p-6">
            <h3 className="text-lg font-black text-white mb-6">
              {selectedDate === today ? "Today's Meals" : `Meals on ${selectedDate}`}
            </h3>
            
            <div className="space-y-6">
              {MEAL_CATEGORIES.map(category => {
                const categoryMeals = todayDiet.filter(m => m.mealCategory === category);
                const mealCals = categoryMeals.reduce((acc, m) => acc + m.calories, 0);

                return (
                  <div key={category} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{category}</h4>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{mealCals} Calories</span>
                      </div>
                      <button
                        onClick={() => { setActiveCategory(category); setShowAddFoodModal(true); }}
                        className="p-1 px-2.5 bg-zinc-800 hover:bg-orange-500 hover:text-white text-zinc-400 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        Log Item
                      </button>
                    </div>

                    {categoryMeals.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-1">No items logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {categoryMeals.map(meal => (
                          <div key={meal.id} className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-zinc-800 transition-all">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-white">{meal.foodName}</span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <span>{meal.quantity || '1 Serving'}</span>
                                <span>•</span>
                                <span className="text-purple-400">P: {meal.protein}g</span>
                                <span className="text-amber-500">C: {meal.carbs}g</span>
                                <span className="text-pink-400">F: {meal.fat}g</span>
                              </div>
                              {meal.notes && <p className="text-[10px] text-zinc-500 italic mt-0.5">"{meal.notes}"</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-orange-400">{meal.calories} kcal</span>
                              <button 
                                onClick={() => deleteDietLog(meal.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Water Tracking */}
        <div>
          
          <div className="forge-card p-6 flex flex-col items-center text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
            <Droplet className="h-8 w-8 text-cyan-400 animate-bounce mb-2" />
            <h3 className="text-lg font-black text-white">
              {selectedDate === today ? "Water Intake" : `Water on ${selectedDate}`}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 mb-6">Stay hydrated to improve muscle recovery and power output.</p>
            
            {/* Visual Glass indicator */}
            <div className="relative w-28 h-40 bg-zinc-950 border-4 border-zinc-800 rounded-b-3xl rounded-t-lg overflow-hidden flex items-end">
              <div 
                style={{ height: `${Math.min(100, (waterAmount / waterGoal) * 100)}%` }}
                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 opacity-80 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-700"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-white">{waterAmount} ml</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Goal: {waterGoal}ml</span>
              </div>
            </div>

            <span className="text-sm font-bold text-zinc-400 mt-4">
              {Math.min(100, Math.round((waterAmount / waterGoal) * 100))}% Complete
            </span>

            {/* Quick add water buttons */}
            <div className="grid grid-cols-2 gap-2 w-full mt-6">
              <button 
                onClick={() => addWater(250, selectedDate)}
                className="py-2.5 px-3 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/30 text-xs font-bold text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all cursor-pointer"
              >
                + 250ml
              </button>
              <button 
                onClick={() => addWater(500, selectedDate)}
                className="py-2.5 px-3 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/30 text-xs font-bold text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all cursor-pointer"
              >
                + 500ml
              </button>
              <button 
                onClick={() => addWater(1000, selectedDate)}
                className="py-2.5 px-3 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/30 text-xs font-bold text-cyan-400 hover:bg-cyan-500/5 rounded-xl transition-all col-span-2 cursor-pointer"
              >
                + 1.0 Litre
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          MODAL: SMART ADD FOOD FORM
          ========================================== */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-orange-500 tracking-wider">Log to {activeCategory}</span>
              <h3 className="text-lg font-black text-white mt-0.5">Add Food Item</h3>
            </div>

            <form onSubmit={handleAddFoodSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Food Name</label>
                <div className="relative mt-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oatmeal, Chicken, Banana..."
                    value={foodForm.foodName}
                    onChange={e => handleFoodNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-semibold"
                  />
                  {!foodForm.isManual && foodForm.foodName.trim() && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                      <Sparkles className="h-3 w-3" />
                      Smart Estimator
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Quantity / Serving</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100g, 2 eggs, 1 banana"
                    value={foodForm.quantity}
                    onChange={e => setFoodForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Calories (kcal)</label>
                  <input
                    type="number"
                    disabled={!foodForm.isManual}
                    value={foodForm.calories}
                    onChange={e => setFoodForm(prev => ({ ...prev, calories: parseInt(e.target.value, 10) || 0 }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-white text-sm font-bold disabled:text-zinc-500 disabled:bg-zinc-950/40"
                  />
                </div>
              </div>

              {/* Macro breakdown */}
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">Estimated Macro Split</span>
                  <button
                    type="button"
                    onClick={toggleManualEstimation}
                    className="text-[10px] font-bold text-orange-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    {foodForm.isManual ? 'Lock Auto-Estimator' : 'Manual Override'}
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">Protein (g)</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!foodForm.isManual}
                      value={foodForm.protein}
                      onChange={e => setFoodForm(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-purple-400 font-semibold focus:outline-none focus:border-purple-500 disabled:text-zinc-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">Carbs (g)</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!foodForm.isManual}
                      value={foodForm.carbs}
                      onChange={e => setFoodForm(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-amber-500 font-semibold focus:outline-none focus:border-amber-500 disabled:text-zinc-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block">Fats (g)</span>
                    <input
                      type="number"
                      step="0.1"
                      disabled={!foodForm.isManual}
                      value={foodForm.fat}
                      onChange={e => setFoodForm(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs text-pink-400 font-semibold focus:outline-none focus:border-pink-500 disabled:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. post workout protein shake"
                  value={foodForm.notes}
                  onChange={e => setFoodForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 border-t border-zinc-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Log Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
