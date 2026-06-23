'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Scale, TrendingUp, Camera, Plus, Trash2, Calendar } from 'lucide-react';

import { getLocalDateString } from '../../lib/db';

export default function ProgressTab() {
  const { bodyLogs, addBodyLog, progressPhotos, uploadProgressPhoto } = useApp();

  const today = getLocalDateString();

  // Forms states
  const [showLogModal, setShowLogModal] = useState(false);
  const [formMetrics, setFormMetrics] = useState({
    weight: 70,
    bodyFatPercentage: 15,
    chest: 100,
    waist: 80,
    arms: 35,
    thighs: 55,
    shoulders: 110,
    date: today
  });

  const handleMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyLog(formMetrics);
    setShowLogModal(false);
  };

  // Convert uploaded image to Base64
  const handlePhotoUpload = (type: 'front' | 'side' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        uploadProgressPhoto(type, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Weight Trend Line Chart calculation
  // Build a custom SVG line path to render weight changes beautifully.
  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 24;

  const chartSVGPath = React.useMemo(() => {
    if (bodyLogs.length < 2) return '';

    // Take last 8 entries
    const entries = [...bodyLogs].slice(-8);
    const weights = entries.map(e => e.weight);
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const rangeW = maxW - minW || 1;

    const points = entries.map((entry, idx) => {
      const x = padding + (idx / (entries.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((entry.weight - minW) / rangeW) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [bodyLogs]);

  const latestLog = bodyLogs.length > 0 ? bodyLogs[bodyLogs.length - 1] : null;

  return (
    <div className="space-y-6">
      
      {/* Metrics Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Latest Weight Card */}
        <div className="forge-card p-6 flex items-center justify-between bg-gradient-to-br from-zinc-900 to-zinc-950">
          <div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Current Weight</span>
            <h3 className="text-3xl font-black text-white mt-1">
              {latestLog ? `${latestLog.weight} kg` : '--'}
            </h3>
            {bodyLogs.length > 1 ? (
              <span className={`text-[10px] font-bold ${
                bodyLogs[bodyLogs.length - 1].weight - bodyLogs[0].weight < 0 
                  ? 'text-emerald-400' 
                  : 'text-orange-400'
              }`}>
                {(bodyLogs[bodyLogs.length - 1].weight - bodyLogs[0].weight).toFixed(1)} kg overall change
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500">Log entries to trace trend</span>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md shrink-0">
            <Scale className="h-6 w-6" />
          </div>
        </div>

        {/* Latest Body Fat Card */}
        <div className="forge-card p-6 flex items-center justify-between bg-gradient-to-br from-zinc-900 to-zinc-950">
          <div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Body Fat %</span>
            <h3 className="text-3xl font-black text-white mt-1">
              {latestLog?.bodyFatPercentage ? `${latestLog.bodyFatPercentage}%` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-500">Estimates muscle composition</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Rapid log trigger */}
        <div className="forge-card p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 border-dashed border-zinc-800/80">
          <button 
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Log Body Metrics
          </button>
          <span className="text-[10px] text-zinc-500 mt-2">Log weight & tape measurements</span>
        </div>

      </div>

      {/* Charts & Measurements Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Weight Trend SVG chart */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="forge-card p-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Weight Progression
              </h3>
              <p className="text-xs text-zinc-400 mb-6">Trace weight changes over logged history</p>
            </div>

            {bodyLogs.length < 2 ? (
              <div className="h-48 border border-dashed border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 text-xs">
                Requires at least 2 body log entries to generate chart.
              </div>
            ) : (
              <div className="relative">
                {/* SVG responsive viewport */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1={padding} y1={chartHeight/2} x2={chartWidth - padding} y2={chartHeight/2} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3,3" />

                  {/* Draw Glow Fill */}
                  <path 
                    d={`${chartSVGPath} L ${chartWidth - padding},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`} 
                    fill="url(#chartGlow)" 
                  />

                  {/* Weight Line */}
                  <path 
                    d={chartSVGPath} 
                    fill="none" 
                    stroke="#f97316" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  />

                  {/* Plot Dots */}
                  {bodyLogs.slice(-8).map((log, idx, arr) => {
                    const entries = arr;
                    const weights = entries.map(e => e.weight);
                    const minW = Math.min(...weights) - 2;
                    const maxW = Math.max(...weights) + 2;
                    const rangeW = maxW - minW || 1;

                    const x = padding + (idx / (entries.length - 1)) * (chartWidth - padding * 2);
                    const y = chartHeight - padding - ((log.weight - minW) / rangeW) * (chartHeight - padding * 2);
                    return (
                      <g key={idx} className="group">
                        <circle cx={x} cy={y} r="5" fill="#fafafa" stroke="#ea580c" strokeWidth="2.5" className="transition-all hover:r-7 cursor-pointer" />
                        <text x={x} y={y - 10} fill="#fafafa" fontSize="9" fontWeight="bold" textAnchor="middle" className="hidden group-hover:block pointer-events-none">
                          {log.weight}kg
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-6 mt-1">
                  <span>{bodyLogs.slice(-8)[0]?.date}</span>
                  <span>{bodyLogs.slice(-8)[bodyLogs.slice(-8).length - 1]?.date}</span>
                </div>
              </div>
            )}
          </div>

          {/* Before/After Progress Photos */}
          <div className="forge-card p-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-orange-500" />
              Before-After Photos
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Compare front, side, and back snapshots</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Front Photo */}
              <ProgressPhotoSlot 
                type="front" 
                title="Front Angle" 
                imgUrl={progressPhotos.frontUrl} 
                date={progressPhotos.dates?.front}
                onUpload={handlePhotoUpload} 
              />

              {/* Side Photo */}
              <ProgressPhotoSlot 
                type="side" 
                title="Side Profile" 
                imgUrl={progressPhotos.sideUrl} 
                date={progressPhotos.dates?.side}
                onUpload={handlePhotoUpload} 
              />

              {/* Back Photo */}
              <ProgressPhotoSlot 
                type="back" 
                title="Back Lats" 
                imgUrl={progressPhotos.backUrl} 
                date={progressPhotos.dates?.back}
                onUpload={handlePhotoUpload} 
              />

            </div>
          </div>

        </div>

        {/* Right Column: Measurements History logs */}
        <div className="space-y-6">
          <div className="forge-card p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                <Scale className="h-5 w-5 text-orange-500" />
                Tape Measurements
              </h3>
              
              {!latestLog ? (
                <div className="py-8 text-center text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                  No tape logs added yet. Hit "Log Body Metrics" to begin.
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Chest', value: latestLog.chest, unit: 'cm' },
                    { label: 'Waist', value: latestLog.waist, unit: 'cm' },
                    { label: 'Arms', value: latestLog.arms, unit: 'cm' },
                    { label: 'Thighs', value: latestLog.thighs, unit: 'cm' },
                    { label: 'Shoulders', value: latestLog.shoulders, unit: 'cm' }
                  ].map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-zinc-800 transition-all">
                      <span className="text-xs font-bold text-zinc-400">{m.label}</span>
                      <span className="text-sm font-extrabold text-white">{m.value ? `${m.value} ${m.unit}` : '--'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {bodyLogs.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800/60 text-center">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider mb-2">Last logged entry</span>
                <span className="text-xs text-white font-extrabold flex items-center justify-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-orange-500" />
                  {latestLog?.date}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ==========================================
          MODAL: LOG BODY METRICS
          ========================================== */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <h3 className="text-lg font-black text-white">Log Body Metrics</h3>
            
            <form onSubmit={handleMetricSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formMetrics.weight}
                    onChange={e => setFormMetrics(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Body Fat % (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formMetrics.bodyFatPercentage}
                    onChange={e => setFormMetrics(prev => ({ ...prev, bodyFatPercentage: parseFloat(e.target.value) || 0 }))}
                    className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Tape measures grid */}
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-3">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block">Tape Measurements (cm)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block">Chest</label>
                    <input
                      type="number"
                      value={formMetrics.chest}
                      onChange={e => setFormMetrics(prev => ({ ...prev, chest: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block">Waist</label>
                    <input
                      type="number"
                      value={formMetrics.waist}
                      onChange={e => setFormMetrics(prev => ({ ...prev, waist: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block">Arms</label>
                    <input
                      type="number"
                      value={formMetrics.arms}
                      onChange={e => setFormMetrics(prev => ({ ...prev, arms: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block">Thighs</label>
                    <input
                      type="number"
                      value={formMetrics.thighs}
                      onChange={e => setFormMetrics(prev => ({ ...prev, thighs: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block">Shoulders</label>
                    <input
                      type="number"
                      value={formMetrics.shoulders}
                      onChange={e => setFormMetrics(prev => ({ ...prev, shoulders: parseFloat(e.target.value) || 0 }))}
                      className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-zinc-500 tracking-wider">Log Date</label>
                <input
                  type="date"
                  value={formMetrics.date}
                  onChange={e => setFormMetrics(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-2 block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex space-x-2 border-t border-zinc-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent for progress photo upload slot
function ProgressPhotoSlot({
  type, title, imgUrl, date, onUpload
}: {
  type: 'front' | 'side' | 'back';
  title: string;
  imgUrl?: string;
  date?: string;
  onUpload: (type: 'front' | 'side' | 'back', file: File) => void;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-xs font-extrabold text-zinc-400">{title}</span>
      <div className="relative aspect-[3/4] w-full bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center overflow-hidden hover:border-orange-500/20 transition-all group">
        {imgUrl ? (
          <>
            <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <label className="cursor-pointer px-3 py-1.5 bg-orange-500 text-white font-extrabold text-[10px] rounded-lg shadow-lg">
                Replace Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(type, file);
                  }}
                />
              </label>
            </div>
            {date && (
              <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-bold text-zinc-300">
                {date}
              </div>
            )}
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-300 transition-all px-4">
            <Camera className="h-7 w-7 mb-2 text-zinc-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-center">Add Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onUpload(type, file);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
