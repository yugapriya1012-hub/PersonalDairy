import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Droplets, HeartPulse, Moon, Zap, ArrowLeft, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-xl shadow-slate-200/20 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

export default function History() {
  const [habitHistory, setHabitHistory] = useState([]);

  useEffect(() => {
    const data = window.localStorage.getItem('lifeos_habit_history');
    if (data) {
      const parsed = JSON.parse(data);
      // Sort by date descending
      parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHabitHistory(parsed);
    }
  }, []);

  const getMoodEmoji = (mood) => {
    return mood || 'Neutral';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-600" size={36} />
            Habit History
          </h1>
          <p className="text-slate-500 font-medium mt-2">Track your daily progress and consistency over time.</p>
        </div>
        <button onClick={() => window.location.href = '/dashboard'} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </header>

      {habitHistory.length === 0 ? (
        <GlassCard className="text-center py-20">
          <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No History Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">Update your daily habits on the Dashboard to start tracking your progress over time.</p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {habitHistory.map((day, idx) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={day.date}>
              <GlassCard className="hover:border-indigo-200 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                  </div>
                  <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(day.mood)}</span> Mood
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  
                  {/* Water */}
                  <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex flex-col items-center justify-center text-center">
                    <Droplets className="text-sky-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-sky-700">{day.waterGlasses || 0}</span>
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mt-1">Water (Cups)</span>
                  </div>

                  {/* Sleep */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col items-center justify-center text-center">
                    <Moon className="text-purple-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-purple-700">{day.sleepHours || 0}</span>
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider mt-1">Sleep (Hrs)</span>
                  </div>

                  {/* Study */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <BookOpen className="text-emerald-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-emerald-700">{day.studyHours || 0}</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">Study (Hrs)</span>
                  </div>

                  {/* Workout */}
                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center text-center">
                    <HeartPulse className="text-rose-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-rose-700">{day.workoutMins || 0}</span>
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider mt-1">Workout (Mins)</span>
                  </div>

                  {/* Productivity */}
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex flex-col items-center justify-center text-center">
                    <Zap className="text-indigo-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-indigo-700">{day.productivity || 0}%</span>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1">Productivity</span>
                  </div>

                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
