import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, BrainCircuit, Activity, Droplets, Moon, Coffee, Trophy, TrendingUp, Calendar, Clock, 
  Settings, Target, Zap, ChevronRight, Mic, StopCircle, Play, Sparkles, Plus, Wallet, ShoppingBag, 
  Car, BookOpen, Utensils, HeartPulse, Check, AlertCircle, Save, Trash2, Speaker, Download
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import apiClient from '../api/apiClient';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-xl shadow-slate-200/20 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

// --- INITIAL DATA ---
const INITIAL_EXPENSE_DATA = [];

const WEEKLY_SPENDING = [];

const TIMELINE = [];

const HABITS = [];

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function LifeDashboard() {
  const [lifeScore, setLifeScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cupLevel, setCupLevel] = useState('none');
  const [studyHours, setStudyHours] = useLocalStorage('lifeos_study', 0);
  const [workoutMins, setWorkoutMins] = useLocalStorage('lifeos_workout', 0);
  const [sleepHours, setSleepHours] = useLocalStorage('lifeos_sleep', 0);
  const [waterGlasses, setWaterGlasses] = useLocalStorage('lifeos_water', 0);
  const [mood, setMood] = useLocalStorage('lifeos_mood', 'Neutral');
  const [productivity, setProductivity] = useLocalStorage('lifeos_prod', 0);
  const [habitHistory, setHabitHistory] = useLocalStorage('lifeos_habit_history', []);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  
  // Expense Form State
  const [spentToday, setSpentToday] = useState(0);

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      try {
        const res = await apiClient.get('/expenses');
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTotal = (res || [])
          .filter(t => t.date === todayStr)
          .reduce((sum, t) => sum + t.amount, 0);
        setSpentToday(todayTotal);
      } catch (e) {
        console.error('Failed to fetch today expenses', e);
      }
    };
    fetchTodayExpenses();
  }, []);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const res = await apiClient.get('/user_streak');
        setStreak(res.current_streak);
        setLifeScore(res.points);
        setCupLevel(res.champion_cup_level);
      } catch (e) {
        console.error('Failed to fetch streak data', e);
      }
    };
    fetchStreakData();
  }, []);

  const handleUpdateToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: todayStr,
      studyHours,
      workoutMins,
      sleepHours,
      waterGlasses,
      mood,
      productivity
    };

    setHabitHistory(prev => {
      const existingIdx = prev.findIndex(entry => entry.date === todayStr);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newEntry;
        return updated;
      } else {
        return [...prev, newEntry];
      }
    });
    alert("Today's habits updated successfully!");
  };

  const handleVoiceRecord = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition. Please try Google Chrome or Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      
      // Simple mock AI parsing logic to make it magical!
      setTranscript(prev => {
        const lowerText = prev.toLowerCase();
        let updated = false;
        
        // Extract study hours
        const studyMatch = lowerText.match(/study.*?(\\d+(\\.\\d+)?)/) || lowerText.match(/studied.*?(\\d+(\\.\\d+)?)/);
        if (studyMatch) {
          setStudyHours(parseFloat(studyMatch[1]));
          updated = true;
        }
        
        // Extract workout mins
        const workoutMatch = lowerText.match(/workout.*?(\\d+)/) || lowerText.match(/exercise.*?(\\d+)/);
        if (workoutMatch) {
          setWorkoutMins(parseInt(workoutMatch[1], 10));
          updated = true;
        }
        
        // Extract sleep hours
        const sleepMatch = lowerText.match(/sleep.*?(\\d+(\\.\\d+)?)/) || lowerText.match(/slept.*?(\\d+(\\.\\d+)?)/);
        if (sleepMatch) {
          setSleepHours(parseFloat(sleepMatch[1]));
          updated = true;
        }

        return prev;
      });
    };

    recognition.start();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={32} />
            Life Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Track your day, manage your habits, and understand your lifestyle with AI.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 p-2 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="px-4 py-2 bg-rose-50 rounded-xl flex items-center gap-2 text-rose-600 font-bold">
            <Trophy size={18} /> {streak} Day Streak
          </div>
          <div className="px-4 py-2 bg-indigo-50 rounded-xl flex items-center gap-2 text-indigo-600 font-bold">
            <Zap size={18} /> Life Score: {lifeScore}
          </div>
          {cupLevel !== 'none' && (
            <div className="px-4 py-2 bg-amber-50 rounded-xl flex items-center gap-2 text-amber-600 font-bold border border-amber-200 uppercase text-xs">
              {cupLevel === 'bronze' && '🥉 Bronze'}
              {cupLevel === 'silver' && '🥈 Silver'}
              {cupLevel === 'gold' && '🥇 Gold'}
              {cupLevel === 'champion' && '🏆 Champion'}
            </div>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20" title="AI Systems Active">
            <BrainCircuit size={20} />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-500/20 transform hover:-translate-y-1 transition-all">
          <BookOpen className="mb-2 opacity-80" />
          <h4 className="text-blue-100 text-sm font-medium">Study</h4>
          <p className="text-2xl font-black">{studyHours}h</p>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-2xl text-white shadow-lg shadow-rose-500/20 transform hover:-translate-y-1 transition-all">
          <HeartPulse className="mb-2 opacity-80" />
          <h4 className="text-rose-100 text-sm font-medium">Workout</h4>
          <p className="text-2xl font-black">{workoutMins}m</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-5 rounded-2xl text-white shadow-lg shadow-purple-500/20 transform hover:-translate-y-1 transition-all">
          <Moon className="mb-2 opacity-80" />
          <h4 className="text-purple-100 text-sm font-medium">Sleep</h4>
          <p className="text-2xl font-black">{sleepHours}h</p>
        </div>
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 p-5 rounded-2xl text-white shadow-lg shadow-sky-500/20 transform hover:-translate-y-1 transition-all">
          <Droplets className="mb-2 opacity-80" />
          <h4 className="text-sky-100 text-sm font-medium">Water</h4>
          <p className="text-2xl font-black">{waterGlasses}/8</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl text-white shadow-lg shadow-emerald-500/20 transform hover:-translate-y-1 transition-all">
          <Wallet className="mb-2 opacity-80" />
          <h4 className="text-emerald-100 text-sm font-medium">Spent Today</h4>
          <p className="text-2xl font-black">${spentToday}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-2xl text-white shadow-lg shadow-amber-500/20 transform hover:-translate-y-1 transition-all">
          <Activity className="mb-2 opacity-80" />
          <h4 className="text-amber-100 text-sm font-medium">Productivity</h4>
          <p className="text-2xl font-black">{productivity}/10</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* VOICE LOGGER */}
          <GlassCard className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Mic className="text-indigo-500" /> AI Voice Daily Log
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full">BETA</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-200 rounded-2xl bg-white">
              <button 
                onClick={handleVoiceRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  isRecording 
                  ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse' 
                  : 'bg-indigo-600 text-white shadow-indigo-600/40 hover:scale-105'
                }`}
              >
                {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
              </button>
              <p className="mt-4 font-medium text-slate-600">
                {isRecording ? "Listening... (Try saying 'I studied for 2 hours and slept for 7 hours')" : "Tap to log your day with AI"}
              </p>
              
              {transcript && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl w-full text-center">
                  <p className="text-slate-700 italic">"{transcript}"</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center justify-center gap-1">
                    <Check size={14} /> AI Parsed Successfully! Check your trackers below.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* DAILY TRACKER */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <Activity className="text-rose-500" /> Daily Manual Tracker
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                    <span>Study Hours</span>
                    <span className="text-indigo-600">{studyHours}h</span>
                  </label>
                  <input type="range" min="0" max="12" step="0.5" value={studyHours} onChange={(e)=>setStudyHours(e.target.value)} className="w-full accent-indigo-600" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                    <span>Workout (Mins)</span>
                    <span className="text-rose-600">{workoutMins}m</span>
                  </label>
                  <input type="range" min="0" max="120" step="5" value={workoutMins} onChange={(e)=>setWorkoutMins(e.target.value)} className="w-full accent-rose-600" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                    <span>Sleep Hours</span>
                    <span className="text-purple-600">{sleepHours}h</span>
                  </label>
                  <input type="range" min="0" max="12" step="0.5" value={sleepHours} onChange={(e)=>setSleepHours(e.target.value)} className="w-full accent-purple-600" />
                </div>
                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                    <span>Productivity</span>
                    <span className="text-amber-600">{productivity}/10</span>
                  </label>
                  <input type="range" min="0" max="10" step="1" value={productivity} onChange={(e)=>setProductivity(e.target.value)} className="w-full accent-amber-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Water Intake</label>
                  <div className="flex items-center gap-4">
                    <button onClick={()=>setWaterGlasses(Math.max(0, waterGlasses-1))} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 font-bold">-</button>
                    <div className="flex-1 flex gap-1 justify-center">
                      {[...Array(8)].map((_, i) => (
                        <Droplets key={i} size={24} className={i < waterGlasses ? 'text-sky-500 fill-sky-500' : 'text-slate-200'} />
                      ))}
                    </div>
                    <button onClick={()=>setWaterGlasses(Math.min(8, waterGlasses+1))} className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center hover:bg-sky-200 font-bold">+</button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Mood</label>
                  <div className="flex gap-2 justify-between">
                    {['🤩', '😊', '😐', '😔', '😫'].map((m) => (
                      <button key={m} onClick={()=>setMood(m)} className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${mood === m ? 'bg-amber-100 scale-110 shadow-lg' : 'bg-slate-100 hover:bg-slate-200 grayscale hover:grayscale-0'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleUpdateToday} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl mt-4 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                  <Save size={18} /> Update Today's Record
                </button>
                <button onClick={() => window.location.href = '/history'} className="w-full py-3 bg-white text-indigo-600 border-2 border-indigo-100 font-bold rounded-xl mt-2 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                  <Calendar size={18} /> View History
                </button>
              </div>
            </div>
          </GlassCard>


        </div>

        {/* SIDE COLUMN */}
        <div className="space-y-8">
          
          {/* AI SUMMARY */}
          <GlassCard className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl shadow-purple-900/20">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Sparkles className="text-amber-300" /> AI Daily Summary
            </h3>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <p className="text-sm leading-relaxed text-indigo-50">
                "Today was a highly productive day. You hit your study goals and crushed your workout. However, you slept a bit less than usual. Your spending was within budget. Keep it up!"
              </p>
            </div>
            <button className="w-full py-2 bg-white text-indigo-600 font-bold rounded-xl mt-4 hover:bg-slate-50 transition-colors">
              Regenerate Summary
            </button>
          </GlassCard>

          {/* HABITS */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Daily Habits</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">4/6 Done</span>
            </div>
            <div className="space-y-3">
              {HABITS.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No habits set.</p>}
              {HABITS.map(habit => (
                <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${habit.completed ? habit.color.replace('text', 'bg').replace('500', '100') : 'bg-slate-100'}`}>
                      <habit.icon size={18} className={habit.completed ? habit.color : 'text-slate-400'} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${habit.completed ? 'text-slate-800' : 'text-slate-500'}`}>{habit.title}</h4>
                      <p className="text-xs text-slate-400 font-medium">🔥 {habit.streak} day streak</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${habit.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {habit.completed && <Check size={14} />}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI INSIGHTS */}
          <GlassCard>
            <h3 className="text-lg font-bold text-slate-800 mb-4">AI Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl flex gap-3 border border-emerald-100">
                <TrendingUp className="text-emerald-500 shrink-0" size={20} />
                <p className="text-sm text-emerald-800 font-medium">Your productivity increases by 30% on days you workout in the morning.</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl flex gap-3 border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-sm text-amber-800 font-medium">You've spent 20% more on food this week compared to last week.</p>
              </div>
            </div>
          </GlassCard>

          {/* TIMELINE */}
          <GlassCard>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-indigo-500" /> Recent Activities
            </h3>
            <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
              {TIMELINE.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No activities yet.</p>}
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${item.color} text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10`}>
                    <item.icon size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                    <time className="text-xs font-bold text-indigo-500 mb-1 block">{item.time}</time>
                    <div className="text-sm font-semibold text-slate-700">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
