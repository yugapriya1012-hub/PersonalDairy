import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, BrainCircuit, CheckCircle2, Clock, CalendarDays, 
  Target, GraduationCap, GripVertical, Plus, Trash2, Edit2, 
  Copy, Heart, Play, Pause, RotateCcw, AlertTriangle, 
  TrendingUp, Award, Zap, Download, Printer, FileDown,
  MoreVertical, ChevronRight, Check, Sparkles
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import GlassCard from '../components/UI/GlassCard';
import apiClient from '../api/apiClient';

// MOCK DATA for rich UI display (Cleared for real usage)
const MOCK_STATS = { subjects: 0, activePlans: 0, tasksCompleted: 0, studyHours: 0 };
const WEEKLY_DATA = [];
const MOCK_TASKS = [];
const MOCK_SUBJECTS = [];
const MOCK_ACTIVITIES = [];

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

export default function Planner() {
  const [streak, setStreak] = useLocalStorage('lifeos_streak', 0);
  const [plans, setPlans] = useLocalStorage('lifeos_plans', []);
  const [subjects, setSubjects] = useLocalStorage('lifeos_subjects', MOCK_SUBJECTS);
  const [tasks, setTasks] = useLocalStorage('lifeos_tasks', MOCK_TASKS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const { register, handleSubmit, reset, watch } = useForm();
  
  const hasPlans = plans.length > 0;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const onGeneratePlan = async (data) => {
    setIsGenerating(true);
    try {
      const payload = {
        subjects: data.subject,
        topics: data.topics,
        exam_date: data.examDate,
        hours_per_day: parseFloat(data.hours) || 2.0
      };
      const res = await apiClient.post('/planner', payload);
      
      let timeline = [];
      try {
        timeline = JSON.parse(res.plan_text);
      } catch (e) {
        console.error("Failed to parse timeline JSON from AI", e, res.plan_text);
      }
      
      const newPlan = {
        id: res.id,
        ...data,
        timeline: timeline
      };
      setPlans([newPlan, ...plans]);
      reset();
    } catch (e) {
      console.error("Failed to generate plan", e);
      alert("Failed to generate study plan. Ensure backend is running and API key is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const handleAddSubject = () => {
    const name = window.prompt("Enter new subject name:");
    if (name) {
      setSubjects([...subjects, { name, color: 'bg-slate-500', progress: 0, exam: 'TBD' }]);
    }
  };

  const handleAddTask = () => {
    const topic = window.prompt("Enter new task topic:");
    if (topic) {
      setTasks([{ id: Date.now(), subject: 'General', topic, duration: '1h', priority: 'Medium', completed: false }, ...tasks]);
    }
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newTopic = window.prompt("Edit task topic:", task.topic);
    if (newTopic) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, topic: newTopic } : t));
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm("Delete this active plan?")) {
      setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleToggleTimelineItem = (planId, itemIndex) => {
    setPlans(plans.map(p => {
      if (p.id !== planId) return p;
      const newTimeline = [...p.timeline];
      newTimeline[itemIndex] = { ...newTimeline[itemIndex], completed: !newTimeline[itemIndex].completed };
      return { ...p, timeline: newTimeline };
    }));
  };

  const totalStudyHours = plans.reduce((acc, plan) => {
    return acc + plan.timeline.reduce((itemAcc, item) => itemAcc + (item.completed ? (item.hours || 0) : 0), 0);
  }, 0);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plans));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "study_plans.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            setPlans([...imported, ...plans]);
            alert("Plans imported successfully!");
          }
        } catch (err) {
          alert("Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 pt-4 pb-4 px-2 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={28} /> Study Planner
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Plan smarter with AI and achieve your learning goals.</p>
        </div>
        <div className="flex items-center gap-6 bg-white/60 px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Time</span>
            <span className="text-slate-700 font-bold">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
            <span className="text-orange-500 font-bold flex items-center gap-1"><Zap size={14}/> {streak} Days</span>
          </div>
        </div>
      </header>

      {/* 12. Quick Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={handleAddSubject} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"><Plus size={16}/> Add Subject</button>
        <button onClick={handleAddTask} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"><Plus size={16}/> Add Task</button>
        
        <input type="file" id="import-plan" accept=".json" className="hidden" onChange={handleImport} />
        <button onClick={() => document.getElementById('import-plan').click()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"><FileDown size={16}/> Import Plan</button>
        
        <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"><Download size={16}/> Export</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"><Printer size={16}/> Print</button>
      </div>

      {/* 2. Top Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Subjects', val: subjects.length, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Active Plans', val: plans.length, icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Completed Tasks', val: tasks.filter(t => t.completed).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Study Hours', val: totalStudyHours.toFixed(1), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div whileHover={{ y: -4 }} key={i}>
            <GlassCard className="p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 border border-slate-200/60 bg-white/60">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.val}</h3>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. AI Study Plan Generator Form */}
          <GlassCard className="p-6 md:p-8 bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/80 shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-md shadow-indigo-200">
                <BrainCircuit className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Generate AI Study Plan</h2>
            </div>
            
            <form onSubmit={handleSubmit(onGeneratePlan)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subject</label>
                  <input {...register("subject", {required: true})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Advanced Calculus" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Exam Date</label>
                  <input type="date" {...register("examDate", {required: true})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Topics to Cover (Optional)</label>
                <input {...register("topics")} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Limits, Derivatives, Integrals" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Difficulty</label>
                  <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl border border-slate-200/50">
                    {['Easy', 'Medium', 'Hard'].map(lvl => (
                      <label key={lvl} className="flex-1">
                        <input type="radio" value={lvl} {...register("difficulty")} className="peer hidden" defaultChecked={lvl === 'Medium'} />
                        <div className="text-center py-2 text-sm font-semibold text-slate-500 rounded-lg cursor-pointer peer-checked:bg-white peer-checked:text-indigo-600 peer-checked:shadow-sm transition-all">
                          {lvl}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Study Style</label>
                  <select {...register("style")} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 appearance-none">
                    <option>Pomodoro (25/5)</option>
                    <option>Deep Work (90/20)</option>
                    <option>Revision First</option>
                    <option>Balanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between">
                  <span>Daily Study Commitment</span>
                  <span className="text-indigo-600 font-bold">{watch('hours') || 3} Hours/Day</span>
                </label>
                <input type="range" min="1" max="8" step="0.5" defaultValue="3" {...register("hours")} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>

              <button disabled={isGenerating} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {isGenerating ? <BrainCircuit className="animate-pulse" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Synthesizing AI Plan...' : 'Generate Intelligent Plan'}
              </button>
            </form>
          </GlassCard>

          {/* 15. Empty State OR 4. Generated Timeline */}
          {!hasPlans && !isGenerating && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-20 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={48} className="text-indigo-300" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">No Study Plans Yet</h3>
              <p className="text-slate-500 max-w-sm mb-8">Generate your first AI-powered study plan to stay organized and achieve your goals.</p>
            </motion.div>
          )}

          {hasPlans && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Target size={24} className="text-indigo-500"/> Active Plans</h2>
              
              <AnimatePresence>
                {plans.map(plan => (
                  <motion.div key={plan.id} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
                    <GlassCard className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-extrabold text-slate-800">{plan.subject}</h3>
                            <button onClick={() => handleDeletePlan(plan.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Delete Plan"><Trash2 size={18}/></button>
                          </div>
                          <div className="flex gap-3 mt-2 text-sm font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><CalendarDays size={14}/> Exam: {plan.examDate}</span>
                            <span className="flex items-center gap-1"><Clock size={14}/> {plan.hours}h / day</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">{plan.style}</span>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500">
                        {plan.timeline.map((item, idx) => (
                          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-pointer" onClick={() => handleToggleTimelineItem(plan.id, idx)}>
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-indigo-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                              {item.completed ? <Check size={12}/> : <div className="w-2 h-2 bg-white rounded-full"/>}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200/60 bg-white/80 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{item.period || `Week ${item.week}`}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{item.priority}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-2">{item.title}</h4>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: item.completed ? '100%' : '30%'}}></div>
                              </div>
                              <p className="text-xs text-slate-400 text-right font-semibold">{item.hours} hrs est.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* 5. Today's Tasks */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={24} className="text-emerald-500"/> Today's Tasks</h2>
              <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="cursor-grab text-slate-300 hover:text-slate-500">
                    <GripVertical size={20} />
                  </div>
                  <div onClick={() => handleToggleTask(task.id)} className={`cursor-pointer w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}>
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.topic}</h4>
                    <span className="text-xs font-semibold text-slate-500">{task.subject}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{task.duration}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>{task.priority}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button onClick={() => handleEditTask(task.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* 9. Study Timer */}
          <GlassCard className="p-6 text-center bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
            {/* Glowing orb background */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl transition-transform duration-1000 ${isTimerRunning ? 'scale-150' : 'scale-100'}`}></div>
            
            <h3 className="text-slate-400 font-bold text-sm mb-4 uppercase tracking-wider relative z-10">Focus Timer</h3>
            <div className="text-6xl font-black text-white tracking-tighter mb-6 font-mono relative z-10 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex justify-center gap-4 relative z-10">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/20"
              >
                {isTimerRunning ? <Pause fill="currentColor" size={24}/> : <Play fill="currentColor" size={24} className="ml-1"/>}
              </button>
              <button 
                onClick={() => {setIsTimerRunning(false); setTimeLeft(25*60);}}
                className="w-14 h-14 rounded-full border border-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <RotateCcw size={20}/>
              </button>
            </div>
            <div className="mt-4 flex justify-center gap-1 relative z-10">
              {[1,2,3,4].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i===1 ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
              ))}
            </div>
          </GlassCard>



          {/* 10. Weekly Progress Chart */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Weekly Progress</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis yAxisId="left" hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border:'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{r:6, fill:'#6366f1', stroke:'#fff', strokeWidth:2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 7. Subject Management */}
          <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Subjects</h3>
              <button className="text-slate-400 hover:text-indigo-600"><Plus size={18}/></button>
            </div>
            <div className="space-y-3">
              {subjects.map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white/50 hover:bg-white transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${sub.color}`}></div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-700">{sub.name}</h4>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Exam in {sub.exam}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{sub.progress}%</span>
                    <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600"><ChevronRight size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 11. Achievements Section */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Award size={18} className="text-amber-500"/> Achievements</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 flex flex-col items-center justify-center shadow-sm relative group cursor-help">
                <span className="text-2xl drop-shadow-md">🔥</span>
                <span className="text-[9px] font-bold text-orange-700 mt-1 uppercase tracking-wider">7 Days</span>
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">7 Day Streak</div>
              </div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-50 border border-indigo-200 flex flex-col items-center justify-center shadow-sm relative group cursor-help">
                <span className="text-2xl drop-shadow-md">🏆</span>
                <span className="text-[9px] font-bold text-indigo-700 mt-1 uppercase tracking-wider">Plan #1</span>
              </div>
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex flex-col items-center justify-center shadow-sm relative group cursor-help">
                <span className="text-2xl drop-shadow-md opacity-50 grayscale">📚</span>
                <span className="text-[9px] font-bold text-emerald-700 mt-1 uppercase tracking-wider opacity-50">100 Tsk</span>
              </div>
            </div>
          </GlassCard>

          {/* 13. Recent Activity */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {MOCK_ACTIVITIES.map((act, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i !== MOCK_ACTIVITIES.length - 1 && <div className="absolute left-2.5 top-6 w-px h-full bg-slate-200"></div>}
                  <div className={`w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 z-10`}>
                    <act.icon className={act.color} size={10} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{act.action}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{act.time}</p>
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
