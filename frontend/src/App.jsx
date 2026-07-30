import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import LifeDashboard from './pages/LifeDashboard';
import AiDiary from './pages/AiDiary';
import Tracker from './pages/Tracker';
import Challenges from './pages/Challenges';
import Planner from './pages/Planner';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import History from './pages/History';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
      <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Sidebar />
        
        <main className="flex-1 p-8 ml-64 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<LifeDashboard />} />
            <Route path="/diary" element={<AiDiary />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
    </UserProvider>
  );
}

export default App;
