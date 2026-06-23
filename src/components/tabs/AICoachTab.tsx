'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, MessageSquare, Send, ArrowRight, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { getLocalDateString } from '../../lib/db';

interface ChatMessage {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export default function AICoachTab() {
  const { aiRecommendations, workouts, dietLogs, sleepLogs, waterLogs, recoveryStatus, profile, achievements } = useApp();
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'coach',
      text: `Hello! I am your FitForge AI coach. I analyze your workout volume, sleep patterns, protein consistency, and muscle fatigue to keep you on track. Ask me anything, like:\n• "What muscle should I train next?"\n• "Is my diet okay today?"\n• "Did I hit progressive overload?"\n• "Evaluate my sleep quality."`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Client-side Heuristic Chatbot Engine
  const generateCoachResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    const today = getLocalDateString();

    // 1. Muscle training recommendation query
    if (q.includes('train') || q.includes('muscle') || q.includes('next') || q.includes('split')) {
      const fullyRecovered = Object.entries(recoveryStatus)
        .filter(([_, status]) => status.percent === 100)
        .map(([muscle]) => muscle);
      
      const highlyFatigued = Object.entries(recoveryStatus)
        .filter(([_, status]) => status.percent < 50)
        .map(([muscle, status]) => `${muscle} (${status.hoursRemaining}h remaining)`);

      let response = '';
      if (fullyRecovered.length > 0) {
        response += `Based on recovery indices, the following muscle groups are at 100% readiness and should be prioritized for your next training session: **${fullyRecovered.slice(0, 4).join(', ')}**.\n\n`;
      } else {
        response += `All your muscles are undergoing hypertrophy adaptation. If you must train, keep it light.\n\n`;
      }

      if (highlyFatigued.length > 0) {
        response += `⚠️ Avoid heavy loads on: **${highlyFatigued.slice(0, 3).join(', ')}** to prevent overuse injuries.`;
      }

      return response;
    }

    // 2. Diet & Macros query
    if (q.includes('diet') || q.includes('eat') || q.includes('protein') || q.includes('calorie') || q.includes('food')) {
      const todayDiet = dietLogs.filter(d => d.date === today);
      const totalCalories = todayDiet.reduce((acc, d) => acc + d.calories, 0);
      const totalProtein = todayDiet.reduce((acc, d) => acc + d.protein, 0);
      const targetProtein = profile ? Math.round(profile.weight * 2) : 140;

      let response = `**Today's Diet Summary:**\n• Consumed: **${totalCalories} kcal**\n• Protein: **${totalProtein}g** / Target: **${targetProtein}g**\n\n`;

      if (totalProtein < targetProtein * 0.7) {
        response += `📈 *Coach Advice:* You are currently falling short of your protein target by **${Math.max(0, targetProtein - totalProtein)}g**. Add some lean chicken breast, eggs, paneer, or whey isolate to secure muscle protein synthesis.`;
      } else {
        response += `🎉 *Coach Advice:* Excellent protein intake! Your muscle fibers have the necessary building blocks to repair and grow. Keep this consistency up.`;
      }

      return response;
    }

    // 3. Progressive Overload query
    if (q.includes('overload') || q.includes('progression') || q.includes('strength') || q.includes('heavy') || q.includes('bench')) {
      if (workouts.length < 2) {
        return "I need at least **2 completed workout logs** in my database to calculate strength changes and confirm progressive overload. Keep logging your sessions!";
      }

      // Check if weight increased in recent workouts
      const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      const prevSame = sorted.slice(1).find(w => w.name === latest.name);

      if (!prevSame) {
        return `I evaluated your last workout (**${latest.name}**), but I couldn't find a previous session of the same workout template to compare weights. Log another session of this template to map strength curves!`;
      }

      let overloadExs: string[] = [];
      latest.exercises.forEach(le => {
        const pe = prevSame.exercises.find(e => e.exerciseId === le.exerciseId);
        if (pe) {
          const maxLatest = Math.max(...le.sets.filter(s => s.isCompleted).map(s => s.actualWeight || 0));
          const maxPrev = Math.max(...pe.sets.filter(s => s.isCompleted).map(s => s.actualWeight || 0));
          if (maxLatest > maxPrev && maxPrev > 0) {
            overloadExs.push(`${le.name} (+${maxLatest - maxPrev} kg)`);
          }
        }
      });

      if (overloadExs.length > 0) {
        return `🔥 **Progressive Overload Confirmed!**\nIn your latest workout, you successfully increased weight on the following exercises compared to your previous session:\n• ${overloadExs.join('\n• ')}\n\nThis stimulus forces mechanical tension adaptation, driving hypertrophy and power gains. Phenomenal work!`;
      } else {
        return `Double check your weights next time. You matched or lifted slightly less weight compared to your previous session of this template. Aim to add 1-2.5kg or 1 extra rep to secure progressive overload!`;
      }
    }

    // 4. Sleep evaluation query
    if (q.includes('sleep') || q.includes('rest') || q.includes('bed')) {
      const todaySleep = sleepLogs.find(s => s.date === today);
      
      if (!todaySleep && sleepLogs.length === 0) {
        return "No sleep logs found. Log your bedtime and wake times in the **Recovery** tab so I can diagnose your sleep cycles!";
      }

      const activeSleep = todaySleep || sleepLogs[sleepLogs.length - 1];
      let response = `Your last sleep log shows **${activeSleep.hours} hours** of sleep, rated as **${activeSleep.quality}** quality.\n\n`;

      if (activeSleep.hours < 7) {
        response += `⚠️ *Coach warning:* Sleeping less than 7 hours limits REM/deep cycles, boosting cortisol (stress hormone) and lowering growth hormone. This spikes muscle soreness. Target 8 hours tonight.`;
      } else if (activeSleep.quality === 'Excellent' || activeSleep.quality === 'Good') {
        response += `💤 *Coach advice:* Great sleep quality! Deep sleep is where tissue recovery occurs. Your nervous system is well-rested.`;
      } else {
        response += `🪵 *Coach advice:* Hours are okay, but quality was fair. Limit screen exposure 1 hour before bed to secure deep REM sleep.`;
      }

      return response;
    }

    // 5. Water query
    if (q.includes('water') || q.includes('hydrat') || q.includes('drink')) {
      const todayWater = waterLogs.find(w => w.date === today);
      const amount = todayWater ? todayWater.amountMl : 0;
      const goal = todayWater ? todayWater.goalMl : 3000;

      let response = `You logged **${amount}ml** of water today against your **${goal}ml** target.\n\n`;
      if (amount < goal * 0.5) {
        response += `💧 *Coach Advice:* You are currently dehydrated. Dehydration thickens blood, slowing nutrient delivery to recovering muscle tissues, reducing strength by up to 15%. Drink a glass of water immediately!`;
      } else if (amount >= goal) {
        response += `🥤 *Coach Advice:* Fully hydrated! Your cells are saturated, supporting protein synthesis and joint lubrication. Outstanding.`;
      } else {
        response += `💧 *Coach Advice:* Good progress, but keep sipping to hit that ${goal}ml mark by tonight.`;
      }
      return response;
    }

    // 6. General advice fallbacks
    return `Interesting question! Let me evaluate your progress. You have logged **${workouts.length} workouts**, unlocked **${achievements.length} badges**, and logged weight trends. Make sure you hit your daily protein goal (${profile ? Math.round(profile.weight * 2) : 140}g) and keep workout streak 🔥 active. Let me know if you want tips on weight loss, muscle gain, sleep quality, or specific exercises.`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate thinking & reply
    setTimeout(() => {
      const replyText = generateCoachResponse(userMsg.text);
      const coachMsg: ChatMessage = {
        sender: 'coach',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Diagnostics list */}
      <div className="forge-card p-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Coach Diagnostic Center</h3>
            <p className="text-xs text-zinc-500">Live AI analysis of your training volume, sleep, and macro inputs</p>
          </div>
        </div>

        <div className="space-y-3">
          {aiRecommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className={`p-4 border rounded-xl flex items-start gap-3.5 transition-all text-xs ${
                rec.type === 'warning' 
                  ? 'border-orange-500/20 bg-orange-500/5 text-orange-200' 
                  : rec.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200' 
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {rec.type === 'warning' && <ShieldAlert className="h-4.5 w-4.5 text-orange-500" />}
                {rec.type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />}
                {rec.type === 'info' && <HelpCircle className="h-4.5 w-4.5 text-zinc-500" />}
              </div>
              <div className="leading-relaxed">
                <span className="font-extrabold uppercase text-[9px] tracking-wider block opacity-75 mb-0.5">{rec.category}</span>
                {rec.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="forge-card p-0 flex flex-col h-[500px] overflow-hidden bg-zinc-950 border border-zinc-850 rounded-2xl">
        
        {/* Chat Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-850 flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-md text-lg shrink-0">
            🤖
          </div>
          <div>
            <h4 className="font-black text-white text-sm">FitForge AI Assistant</h4>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online • Ready to coach
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'coach' && (
                <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-xs shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow ${
                msg.sender === 'user'
                  ? 'bg-orange-500 text-white rounded-tr-none'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                {msg.text}
                <span className="block text-[8px] opacity-60 text-right mt-1.5 font-semibold">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendChat} className="p-3 bg-zinc-900 border-t border-zinc-850 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type a message (e.g. 'What muscle to train next?')..."
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs font-semibold"
          />
          <button 
            type="submit"
            className="p-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
