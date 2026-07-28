import { useState, useEffect } from 'react';
import GlassCard from '../components/UI/GlassCard';
import { Quote, Brain, Flame, Target, BookOpen, Wallet, ArrowRight } from 'lucide-react';
import apiClient from '../api/apiClient';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [dateStr, setDateStr] = useState('');
  const [quote, setQuote] = useState('Loading AI Inspiration...');
  const [challenge, setChallenge] = useState('Loading challenge...');
  const [stats, setStats] = useState({ score: '--', study: '--', expense: '0.00', streak: '--' });

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateStr(new Date().toLocaleDateString('en-US', options));

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const [quoteRes, challengeRes, streakRes] = await Promise.all([
          apiClient.get('/quote').catch(() => null),
          apiClient.get('/challenge').catch(() => null),
          apiClient.get('/streak').catch(() => null)
        ]);

        if (quoteRes) setQuote(`"${quoteRes.quote}"`);
        if (challengeRes) setChallenge(challengeRes.challenge);
        
        let newStats = { ...stats };
        if (streakRes) newStats.streak = streakRes.streak;

        const today = new Date().toISOString().split('T')[0];
        try {
          const trackerRes = await apiClient.get(`/tracker/${today}`);
          newStats.score = trackerRes.productivity_score;
          newStats.study = trackerRes.study_hours;
        } catch (e) {
          // No tracker data for today yet
        }
        
        setStats(newStats);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-1">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold tracking-tight text-slate-800"
        >
          Welcome Back, <span className="gradient-text">Creator</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 font-medium"
        >
          {dateStr}
        </motion.p>
      </header>

      <GlassCard className="flex items-center gap-4 border-l-4 border-l-indigo-500">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Quote className="text-indigo-600" size={24} />
        </div>
        <p className="text-lg font-medium text-slate-700 italic">{quote}</p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-500" size={20} />
              <h3 className="font-bold text-slate-700">AI Creative Challenge</h3>
            </div>
            <p className="text-slate-600 mb-6">{challenge}</p>
          </div>
          <div className="flex gap-3 mt-auto">
            <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-md shadow-indigo-500/30 hover:shadow-lg transition-all flex items-center gap-2">
              Do Challenge <ArrowRight size={16} />
            </button>
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Skip
            </button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <Flame className="text-orange-500" size={20} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Current Streak</h3>
          <h2 className="text-3xl font-bold gradient-text">{stats.streak} days</h2>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <Target className="text-emerald-500" size={20} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Productivity Score</h3>
          <h2 className="text-3xl font-bold gradient-text">{stats.score}/10</h2>
        </GlassCard>
        
        <GlassCard className="flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <BookOpen className="text-blue-500" size={20} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Study Hours</h3>
          <h2 className="text-3xl font-bold gradient-text">{stats.study} hrs</h2>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center text-center">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-3">
            <Wallet className="text-pink-500" size={20} />
          </div>
          <h3 className="text-sm font-medium text-slate-500 mb-1">Expenses Today</h3>
          <h2 className="text-3xl font-bold gradient-text">${stats.expense}</h2>
        </GlassCard>
      </div>
    </div>
  );
}
