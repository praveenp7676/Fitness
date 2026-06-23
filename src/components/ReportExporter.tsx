'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Share2, Copy, FileText, Check, Calendar, Download, Upload, AlertCircle } from 'lucide-react';
import { getLocalDateString } from '../lib/db';

export default function ReportExporter({ targetDate }: { targetDate?: string }) {
  const { 
    workouts, dietLogs, waterLogs, sleepLogs, profile 
  } = useApp();

  const today = getLocalDateString();

  // Report configuration state
  const [reportMode, setReportMode] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState(targetDate || today);
  const [rangePreset, setRangePreset] = useState<'7days' | '30days' | 'custom'>('7days');
  
  // Custom range dates (default to last 7 days)
  const defaultStart = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  };
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate, setEndDate] = useState(today);

  const [copied, setCopied] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to calculate list of YYYY-MM-DD dates in a range
  const getDatesInRange = (startStr: string, endStr: string) => {
    const dates: string[] = [];
    const current = new Date(startStr + 'T00:00:00');
    const end = new Date(endStr + 'T00:00:00');
    
    if (isNaN(current.getTime()) || isNaN(end.getTime())) return [];
    
    // Safety guard to avoid locking the thread on huge ranges
    let limit = 366; 
    while (current <= end && limit > 0) {
      dates.push(getLocalDateString(current));
      current.setDate(current.getDate() + 1);
      limit--;
    }
    return dates;
  };

  // Resolve start/end dates based on presets
  const getResolvedDates = () => {
    if (reportMode === 'single') {
      return { start: singleDate, end: singleDate, list: [singleDate] };
    }
    
    let start = startDate;
    let end = endDate;
    
    if (rangePreset === '7days') {
      const d = new Date();
      end = getLocalDateString(d);
      d.setDate(d.getDate() - 6);
      start = getLocalDateString(d);
    } else if (rangePreset === '30days') {
      const d = new Date();
      end = getLocalDateString(d);
      d.setDate(d.getDate() - 29);
      start = getLocalDateString(d);
    }
    
    return { start, end, list: getDatesInRange(start, end) };
  };

  // Helper to generate the text/markdown content for a specific single day
  const generateMarkdownForDay = (dateStr: string, isRangeMode: boolean) => {
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    const dayDiet = dietLogs.filter(d => d.date === dateStr);
    const dayWater = waterLogs.find(w => w.date === dateStr);
    const daySleep = sleepLogs.find(s => s.date === dateStr);

    const calories = dayDiet.reduce((acc, d) => acc + d.calories, 0);
    const protein = dayDiet.reduce((acc, d) => acc + d.protein, 0);
    const carbs = dayDiet.reduce((acc, d) => acc + d.carbs, 0);
    const fat = dayDiet.reduce((acc, d) => acc + d.fat, 0);

    const hasActivity = dayWorkouts.length > 0 || dayDiet.length > 0 || dayWater || daySleep;
    
    // For date range logs, we can list simple headers for empty days or omit/summarize. 
    // Let's print a clean fallback so the user sees a complete calendar timeline.
    if (isRangeMode && !hasActivity) {
      return `### Date: ${dateStr}\n- No activity logged for this day.\n\n`;
    }

    let report = `### Date: ${dateStr}\n`;
    report += `----------------------------------------------------\n`;

    // 1. WORKOUT DETAILS
    report += `#### WORKOUTS:\n`;
    if (dayWorkouts.length === 0) {
      report += `- No workouts logged.\n`;
    } else {
      dayWorkouts.forEach(w => {
        report += `- **Workout: ${w.name}** (${Math.round(w.durationSeconds / 60)} mins)\n`;
        if (w.notes) report += `  Notes: "${w.notes}"\n`;
        w.exercises.forEach(ex => {
          report += `  - Exercise: ${ex.name} (${ex.targetMuscle})\n`;
          const completedSets = ex.sets.filter(s => s.isCompleted);
          if (completedSets.length === 0) {
            report += `    No completed sets recorded.\n`;
          } else {
            completedSets.forEach((s, idx) => {
              report += `    Set ${idx + 1}: ${s.actualWeight}kg x ${s.actualReps} reps (Target: ${s.targetWeight}kg x ${s.targetReps})\n`;
            });
          }
          if (ex.notes) report += `    Notes: "${ex.notes}"\n`;
        });
      });
    }

    // 2. DIET & HYDRATION DETAILS
    report += `\n#### DIET & HYDRATION:\n`;
    report += `- **Total Macros:** ${calories} kcal | Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g\n`;
    if (dayDiet.length === 0) {
      report += `  - No meals logged.\n`;
    } else {
      report += `  **Logged Items:**\n`;
      dayDiet.forEach(d => {
        report += `  - [${d.mealCategory}] ${d.foodName}: ${d.calories} kcal (P: ${d.protein}g, C: ${d.carbs}g, F: ${d.fat}g)${d.quantity ? ` - Qty: ${d.quantity}` : ''}${d.notes ? ` - "${d.notes}"` : ''}\n`;
      });
    }
    report += `- **Water Intake:** ${dayWater ? dayWater.amountMl : 0}ml / Target: ${dayWater ? dayWater.goalMl : 3000}ml\n`;

    // 3. SLEEP STATS
    report += `\n#### SLEEP & RECOVERY:\n`;
    if (daySleep) {
      report += `- Duration: ${daySleep.hours} hours (${daySleep.startTime} - ${daySleep.endTime})\n`;
      report += `- Quality: ${daySleep.quality}\n`;
    } else {
      report += `- No sleep logged.\n`;
    }

    report += `\n`;
    return report;
  };

  // Generate plain text / markdown copy of report
  const generateMarkdownReport = () => {
    const { start, end, list } = getResolvedDates();
    
    let report = ``;
    if (reportMode === 'single') {
      report += `# FitForge AI - Daily Progress Report (${start})\n`;
    } else {
      report += `# FitForge AI - Progress Report (${start} to ${end})\n`;
    }
    
    report += `Athlete: ${profile?.name || 'Iron Athlete'} | Goal: ${profile?.fitnessGoal || 'General Fitness'}\n`;
    report += `====================================================\n\n`;

    if (list.length === 0) {
      report += `No valid dates selected in range.\n`;
    } else {
      list.forEach(d => {
        report += generateMarkdownForDay(d, reportMode === 'range');
      });
    }

    report += `\nReport generated by FitForge AI. Build strength, seize progression.`;
    return report;
  };

  const handleCopyReport = () => {
    const text = generateMarkdownReport();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReport = async () => {
    const text = generateMarkdownReport();
    const { start, end } = getResolvedDates();
    const title = reportMode === 'single' 
      ? `FitForge AI Daily Report - ${start}` 
      : `FitForge AI Progress Report - ${start} to ${end}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      handleCopyReport();
      alert('Web Share API is not supported on this device. The markdown report has been copied to your clipboard!');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // ==========================================
  // LOCAL JSON DATABASE BACKUP/RESTORE
  // ==========================================
  const handleExportJSON = () => {
    try {
      const backup: Record<string, string | null> = {};
      const keys = [
        'fitforge_profile',
        'fitforge_templates',
        'fitforge_workouts',
        'fitforge_exercises',
        'fitforge_diet',
        'fitforge_body',
        'fitforge_photos',
        'fitforge_water',
        'fitforge_sleep',
        'fitforge_achievements'
      ];
      
      keys.forEach(k => {
        backup[k] = localStorage.getItem(k);
      });

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const filename = `fitforge_backup_${getLocalDateString()}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(url);
      
      setBackupStatus({ type: 'success', message: 'Backup file exported successfully!' });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `Export failed: ${err.message}` });
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    fileReader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid backup file format.');
        }

        const validKeys = [
          'fitforge_profile',
          'fitforge_templates',
          'fitforge_workouts',
          'fitforge_exercises',
          'fitforge_diet',
          'fitforge_body',
          'fitforge_photos',
          'fitforge_water',
          'fitforge_sleep',
          'fitforge_achievements'
        ];
        
        let importCount = 0;
        validKeys.forEach(k => {
          if (k in parsed) {
            const val = parsed[k];
            if (val === null) {
              localStorage.removeItem(k);
            } else if (typeof val === 'string') {
              localStorage.setItem(k, val);
              importCount++;
            }
          }
        });

        if (importCount === 0) {
          throw new Error('No valid FitForge data tags found in the uploaded file.');
        }

        setBackupStatus({ type: 'success', message: 'Database restored successfully! Reloading page...' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        setBackupStatus({ type: 'error', message: `Import failed: ${err.message}` });
        setTimeout(() => setBackupStatus(null), 5000);
      }
    };
    
    fileReader.readAsText(files[0]);
  };

  const { start, end } = getResolvedDates();

  return (
    <div className="forge-card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Daily & Progress Reports</h3>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <span>View, print or backup metrics offline</span>
            </p>
          </div>
        </div>
      </div>

      {/* Report Range Configurator */}
      <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
        <div>
          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Report Mode</span>
          <div className="flex bg-zinc-900 p-1 rounded-xl mt-1.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => setReportMode('single')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                reportMode === 'single' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Single Day
            </button>
            <button
              type="button"
              onClick={() => setReportMode('range')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                reportMode === 'range' ? 'bg-orange-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Date Range
            </button>
          </div>
        </div>

        {/* Date Selector Options */}
        {reportMode === 'single' ? (
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Target Date</label>
            <input
              type="date"
              value={singleDate}
              onChange={e => setSingleDate(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Preset Periods</span>
              <div className="flex gap-2 mt-1.5">
                {(['7days', '30days', 'custom'] as const).map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRangePreset(preset)}
                    className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer capitalize ${
                      rangePreset === preset
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {preset === '7days' ? 'Last 7 Days' : preset === '30days' ? 'Last 30 Days' : 'Custom'}
                  </button>
                ))}
              </div>
            </div>

            {rangePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-900">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-black text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={handlePrintPDF}
          className="flex-1 min-w-[140px] py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4 text-orange-500" />
          Print PDF
        </button>

        <button
          onClick={handleCopyReport}
          className="flex-1 min-w-[140px] py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-orange-500" />
              Copy Text
            </>
          )}
        </button>

        <button
          onClick={handleShareReport}
          className="flex-1 min-w-[140px] py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-xs font-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-orange-500" />
          Share Report
        </button>
      </div>

      {/* Printable Area Preview */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-400 font-mono h-48 overflow-y-auto pr-1">
        <div className="text-zinc-600 mb-2 uppercase font-extrabold tracking-widest text-[9px] border-b border-zinc-850 pb-1 flex justify-between">
          <span>Report Console Preview</span>
          <span className="text-orange-500 font-bold">{reportMode === 'single' ? `Day: ${start}` : `Range: ${start} - ${end}`}</span>
        </div>
        <pre className="whitespace-pre-wrap font-mono">{generateMarkdownReport()}</pre>
      </div>

      {/* Local JSON Backup Console */}
      <div className="border-t border-zinc-850 pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-black text-white">Local Database Backup Console</h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Maintain your fitness logs 100% for free. Backup or restore database files locally.</p>
        </div>

        {backupStatus && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            backupStatus.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{backupStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-[10px] font-black uppercase tracking-wider text-zinc-300 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-orange-500" />
            Export Backup
          </button>

          <label className="py-3 bg-zinc-950 border border-zinc-800 hover:border-orange-500/30 text-[10px] font-black uppercase tracking-wider text-zinc-300 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500/5 transition-all cursor-pointer text-center relative overflow-hidden select-none">
            <Upload className="h-3.5 w-3.5 text-orange-500" />
            <span>Import Backup</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </label>
        </div>
      </div>

      {/* CSS print utility stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-report-container, #print-report-container * {
            visibility: visible;
          }
          #print-report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 30px;
          }
          #print-report-container h1 {
            font-size: 26px;
            font-weight: 800;
            color: #000 !important;
            margin-bottom: 5px;
          }
          #print-report-container hr {
            border: 0;
            border-top: 2px solid #ccc;
            margin: 15px 0;
          }
          #print-report-container pre {
            color: black !important;
            font-family: monospace;
            font-size: 11pt;
            line-height: 1.5;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            white-space: pre-wrap;
          }
        }
      `}</style>

      {/* Hidden print container that triggers on window.print() */}
      <div id="print-report-container" className="hidden">
        <h1>FitForge AI - Progress Report</h1>
        <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#444' }}>
          <strong>Athlete:</strong> {profile?.name || 'Iron Athlete'} &nbsp;|&nbsp; 
          <strong>Goal:</strong> {profile?.fitnessGoal || 'General Fitness'} &nbsp;|&nbsp;
          <strong>Period:</strong> {start} to {end}
        </p>
        <hr />
        <pre>{generateMarkdownReport()}</pre>
      </div>

    </div>
  );
}
