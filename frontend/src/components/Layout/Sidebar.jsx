import { NavLink } from 'react-router-dom';
import { Home, Book, Trophy, CalendarCheck, Languages, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';

export default function Sidebar() {
  const { user } = useUser();
  const navItems = [
    { name: 'Life Dashboard', path: '/dashboard', icon: Home },
    { name: 'AI Diary', path: '/diary', icon: Book },
    { name: 'Creative Challenges', path: '/challenges', icon: Trophy },
    { name: 'Study Planner', path: '/planner', icon: CalendarCheck },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 w-64 h-screen bg-white/70 backdrop-blur-md border-r border-slate-200/50 p-4 flex flex-col z-50 shadow-sm"
    >
      <div className="flex items-center gap-3 px-4 py-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30">
          L
        </div>
        <h2 className="text-2xl font-bold gradient-text tracking-tight">LifeOS AI</h2>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-auto border-t border-slate-200/50">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-slate-600">{user.avatar}</span>
          </div>
          <div className="flex flex-col items-start text-sm truncate">
            <span className="font-semibold text-slate-800 truncate w-full text-left">{user.name}</span>
            <span className="text-xs text-slate-500">Log out</span>
          </div>
        </button>
      </div>
    </motion.aside>
  );
}
