import { useState, useEffect } from 'react';
import GlassCard from '../components/UI/GlassCard';
import { TrendingUp, Activity, CheckCircle } from 'lucide-react';
import apiClient from '../api/apiClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Tracker() {
  const [formData, setFormData] = useState({
    study_hours: 0,
    workout_mins: 0,
    sleep_hours: 8,
    water_glasses: 0,
    productivity_score: 5
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    // In a real app, we'd fetch historical data here.
    setHistory([]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSave = async () => {
    try {
      await apiClient.post('/tracker', formData);
      alert('Tracker updated successfully!');
    } catch (e) {
      console.error('Failed to update tracker', e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <TrendingUp className="text-emerald-600" size={24} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Daily Tracker</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <GlassCard className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-emerald-500" size={20} /> Today's Log
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Study (Hrs)</label>
              <input type="number" name="study_hours" step="0.5" value={formData.study_hours} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Workout (Mins)</label>
              <input type="number" name="workout_mins" value={formData.workout_mins} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sleep (Hrs)</label>
              <input type="number" name="sleep_hours" step="0.5" value={formData.sleep_hours} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Water (Glasses)</label>
              <input type="number" name="water_glasses" value={formData.water_glasses} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Productivity (1-10)</label>
              <input type="number" name="productivity_score" min="1" max="10" value={formData.productivity_score} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white/50" />
            </div>

            <button onClick={handleSave} className="w-full py-2.5 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Update Tracker
            </button>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} /> Weekly Trends
          </h2>
          
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="score" name="Productivity" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" dataKey="study" name="Study Hours" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorStudy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
