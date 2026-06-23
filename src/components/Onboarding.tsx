'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Activity, Target, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { updateProfile } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    gender: 'Male',
    height: 175,
    weight: 70,
    fitnessGoal: 'Build Muscle',
    activityLevel: 'Moderately Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    updateProfile(formData);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-[0_0_30px_rgba(249,115,22,0.3)] mb-4">
          <Sparkles className="h-10 w-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">FitForge AI</span>
        </h2>
        <p className="mt-2 text-zinc-400">
          Let's forge your path to peak performance. Enter your details to initialize your smart coach.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 animate-slide-up">
        <div className="bg-zinc-900 border border-zinc-800 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Row 1: Name & Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-zinc-300">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-zinc-300">
                  Age (Years)
                </label>
                <input
                  id="age"
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Row 2: Height & Weight & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-zinc-300">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-semibold text-zinc-300">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  required
                  min="50"
                  max="250"
                  value={formData.height}
                  onChange={e => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-semibold text-zinc-300">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  required
                  min="20"
                  max="500"
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="mt-2 block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Row 3: Fitness Goal */}
            <div>
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-orange-500" />
                Select Your Fitness Goal
              </label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Build Muscle', 'Lose Fat', 'Gain Weight', 
                  'Improve Strength', 'General Fitness', 'Athletic Performance'
                ].map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, fitnessGoal: goal }))}
                    className={`p-3 text-sm font-medium rounded-xl border text-center transition-all ${
                      formData.fitnessGoal === goal
                        ? 'border-orange-500 bg-orange-600/10 text-orange-500 font-semibold shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Activity Level */}
            <div>
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-orange-500" />
                Current Activity Level
              </label>
              <div className="mt-2 space-y-2">
                {[
                  { name: 'Sedentary', desc: 'Little to no exercise, desk job' },
                  { name: 'Lightly Active', desc: 'Light exercise or active job 1-3 days/week' },
                  { name: 'Moderately Active', desc: 'Moderate exercise or gym 3-5 days/week' },
                  { name: 'Very Active', desc: 'Hard exercise or sports 6-7 days/week' },
                  { name: 'Athlete', desc: 'Professional training multiple times daily' }
                ].map(act => (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, activityLevel: act.name }))}
                    className={`w-full p-3.5 text-left rounded-xl border flex items-center justify-between transition-all ${
                      formData.activityLevel === act.name
                        ? 'border-orange-500 bg-orange-600/10 text-orange-500 font-semibold'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{act.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{act.desc}</div>
                    </div>
                    {formData.activityLevel === act.name && (
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="w-full mt-2 py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Initiate FitForge AI
              <ArrowRight className="h-5 w-5" />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
