import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Palette, Bot, Bell, Book, BookOpen, Activity, Languages, 
  Shield, Database, Settings as AppIcon, Crown, HelpCircle, Info, 
  AlertTriangle, LogOut, Save, Download, Trash2, Camera, Check, ChevronRight
} from 'lucide-react';
import { useUser } from '../context/UserContext';

// --- REUSABLE SETTINGS COMPONENTS ---

const SectionCard = ({ title, children }) => (
  <div className="bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-xl shadow-slate-200/20 rounded-2xl p-6 mb-6">
    <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleRow = ({ label, description, active, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="pr-4">
      <h4 className="font-medium text-slate-700">{label}</h4>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <button 
      onClick={() => onChange(!active)}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${active ? 'bg-indigo-500' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

const SelectRow = ({ label, description, options, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="pr-4">
      <h4 className="font-medium text-slate-700">{label}</h4>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
    >
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

const InputRow = ({ label, type = "text", value, placeholder, onChange }) => (
  <div className="py-3 border-b border-slate-100 last:border-0">
    <label className="block font-medium text-slate-700 mb-2">{label}</label>
    <input 
      type={type} 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
    />
  </div>
);

const ButtonRow = ({ label, description, buttonText, onClick, isDanger }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="pr-4">
      <h4 className="font-medium text-slate-700">{label}</h4>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors shrink-0 ${
        isDanger 
        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
      }`}
    >
      {buttonText}
    </button>
  </div>
);

// --- MAIN SETTINGS COMPONENT ---

export default function Settings() {
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('Account');
  const [draftUser, setDraftUser] = useState(user);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setDraftUser(user);
  }, [user]);

  const handleSaveProfile = () => {
    updateUser(draftUser);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Generic mock state for toggles
  const [toggles, setToggles] = useState({
    dark: false, compact: false, biometric: true, ai_diary: true,
    ai_study: true, private_mode: false, exam_remind: true,
    data_sharing: false, location: false, auto_backup: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [selects, setSelects] = useState({
    theme: 'Light',
    accent: 'Indigo',
    font_size: 'Medium',
    font_family: 'System Sans',
    anim_speed: 'Normal',
    persona: 'Motivational',
    response_style: 'Detailed',
    language: 'English',
    sound: 'Chime',
    template: 'Evening Reflection',
    diary_time: '9:00 PM',
    pomodoro: '50/10 mins',
    study_time: 'Early Morning',
    difficulty: 'Intermediate',
    english_level: 'Intermediate',
    accent_pref: 'American English',
    profile_vis: 'Private',
    app_lang: 'English',
    date_format: 'MM/DD/YYYY',
    time_format: '12-hour',
    currency: 'USD ($)',
    start_page: 'Life Dashboard'
  });

  const handleSelect = (key, val) => {
    setSelects(prev => ({ ...prev, [key]: val }));
  };

  const TABS = [
    { id: 'Account', icon: User, label: 'Account Settings' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
    { id: 'AI', icon: Bot, label: 'AI Settings' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Diary', icon: Book, label: 'Diary Settings' },
    { id: 'Study', icon: BookOpen, label: 'Study Settings' },
    { id: 'Life', icon: Activity, label: 'Life Tracker' },
    { id: 'English', icon: Languages, label: 'English Learning' },
    { id: 'Privacy', icon: Shield, label: 'Privacy Settings' },
    { id: 'Backup', icon: Database, label: 'Backup & Storage' },
    { id: 'App', icon: AppIcon, label: 'App Settings' },
    { id: 'Premium', icon: Crown, label: 'Premium Plan' },
    { id: 'Help', icon: HelpCircle, label: 'Help & Support' },
    { id: 'About', icon: Info, label: 'About' },
    { id: 'Danger', icon: AlertTriangle, label: 'Danger Zone', isDanger: true }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Profile Information">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-3xl">
                    {user.avatar}
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-700 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">User Profile</h4>
                  <p className="text-slate-500 text-sm">Update your photo and personal details.</p>
                </div>
              </div>
              <InputRow label="Full Name" value={draftUser.name} onChange={(v) => setDraftUser(prev => ({...prev, name: v}))} />
              <InputRow label="Email Address" type="email" value={draftUser.email} onChange={(v) => setDraftUser(prev => ({...prev, email: v}))} />
              <InputRow label="Bio" value={draftUser.bio} onChange={(v) => setDraftUser(prev => ({...prev, bio: v}))} />
              
              <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  className={`px-6 py-2.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isSaved 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  }`}
                >
                  {isSaved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </SectionCard>
            
            <SectionCard title="Security">
              <InputRow label="Current Password" type="password" placeholder="••••••••" />
              <InputRow label="New Password" type="password" placeholder="••••••••" />
              <ToggleRow label="Biometric Authentication" description="Use Touch ID or Face ID to login." active={toggles.biometric} onChange={() => handleToggle('biometric')} />
              <ButtonRow label="Active Sessions" description="Manage devices logged into your account." buttonText="View Sessions" />
              <ButtonRow label="Sign Out Everywhere" description="Log out of all devices immediately." buttonText="Sign Out All" isDanger />
            </SectionCard>
          </div>
        );

      case 'Appearance':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Theme & Display">
              <SelectRow label="Theme" options={['Light', 'Dark', 'System Default']} value={selects.theme} onChange={(v) => handleSelect('theme', v)} />
              <SelectRow label="Accent Color" options={['Indigo', 'Rose', 'Emerald', 'Amber']} value={selects.accent} onChange={(v) => handleSelect('accent', v)} />
              <ToggleRow label="Compact Mode" description="Reduce padding to fit more content on screen." active={toggles.compact} onChange={() => handleToggle('compact')} />
            </SectionCard>
            <SectionCard title="Typography & Animations">
              <SelectRow label="Font Size" options={['Small', 'Medium', 'Large']} value={selects.font_size} onChange={(v) => handleSelect('font_size', v)} />
              <SelectRow label="Font Family" options={['System Sans', 'Inter', 'Serif', 'Monospace']} value={selects.font_family} onChange={(v) => handleSelect('font_family', v)} />
              <SelectRow label="Animation Speed" options={['Fast', 'Normal', 'Slow', 'Reduced Motion']} value={selects.anim_speed} onChange={(v) => handleSelect('anim_speed', v)} />
            </SectionCard>
          </div>
        );

      case 'AI':
        return (
          <div className="animate-fade-in">
            <SectionCard title="AI Assistant Personality">
              <SelectRow label="AI Persona" description="How the AI communicates with you." options={['Friendly', 'Professional', 'Motivational', 'Teacher']} value={selects.persona} onChange={(v) => handleSelect('persona', v)} />
              <SelectRow label="Response Style" options={['Short & Direct', 'Detailed', 'Creative']} value={selects.response_style} onChange={(v) => handleSelect('response_style', v)} />
              <SelectRow label="Language" options={['English', 'Tamil', 'Tanglish']} value={selects.language} onChange={(v) => handleSelect('language', v)} />
            </SectionCard>
            <SectionCard title="AI Feature Toggles">
              <ToggleRow label="Diary Suggestions" description="AI will suggest reflections while writing." active={toggles.ai_diary} onChange={() => handleToggle('ai_diary')} />
              <ToggleRow label="Study Planner Integration" description="AI will optimize your study schedule." active={toggles.ai_study} onChange={() => handleToggle('ai_study')} />
              <ToggleRow label="English Grammar Correction" description="Auto-correct mistakes in chat." active={true} onChange={()=>{}} />
              <ToggleRow label="Life Insights" description="Weekly AI analysis of your habits." active={true} onChange={()=>{}} />
            </SectionCard>
          </div>
        );

      case 'Notifications':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Push Notifications">
              <ToggleRow label="Daily Reminder" active={true} onChange={()=>{}} />
              <ToggleRow label="Study Reminders" active={true} onChange={()=>{}} />
              <ToggleRow label="Diary Reflection Time" active={true} onChange={()=>{}} />
              <ToggleRow label="Habit Tracking" active={true} onChange={()=>{}} />
              <ToggleRow label="Expense Alerts" active={false} onChange={()=>{}} />
              <ToggleRow label="Achievement Unlocked" active={true} onChange={()=>{}} />
            </SectionCard>
            <SectionCard title="Notification Preferences">
              <SelectRow label="Notification Sound" options={['Chime', 'Bloop', 'Silent']} value={selects.sound} onChange={(v) => handleSelect('sound', v)} />
              <ToggleRow label="Vibration" active={true} onChange={()=>{}} />
              <ToggleRow label="Email Reports" description="Receive weekly PDF reports via email." active={false} onChange={()=>{}} />
            </SectionCard>
          </div>
        );

      case 'Diary':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Diary Preferences">
              <SelectRow label="Default Template" options={['Blank', 'Gratitude', 'Morning Pages', 'Evening Reflection']} value={selects.template} onChange={(v) => handleSelect('template', v)} />
              <ToggleRow label="Private Mode" description="Hide entries from screen when away." active={toggles.private_mode} onChange={() => handleToggle('private_mode')} />
              <ToggleRow label="Auto Save" active={true} onChange={()=>{}} />
              <ToggleRow label="Mood Tracking Prompt" active={true} onChange={()=>{}} />
              <SelectRow label="Daily Reminder Time" options={['8:00 PM', '9:00 PM', '10:00 PM']} value={selects.diary_time} onChange={(v) => handleSelect('diary_time', v)} />
            </SectionCard>
            <SectionCard title="AI Diary Features">
              <ToggleRow label="AI Auto Summary" description="Generate a weekly summary of your entries." active={true} onChange={()=>{}} />
              <ToggleRow label="AI Reflection Questions" active={true} onChange={()=>{}} />
            </SectionCard>
          </div>
        );

      case 'Study':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Study Preferences">
              <InputRow label="Daily Study Goal (Hours)" type="number" value="4" />
              <SelectRow label="Pomodoro Duration" options={['25/5 mins', '50/10 mins', '90/15 mins']} value={selects.pomodoro} onChange={(v) => handleSelect('pomodoro', v)} />
              <SelectRow label="Preferred Study Time" options={['Early Morning', 'Afternoon', 'Late Night']} value={selects.study_time} onChange={(v) => handleSelect('study_time', v)} />
              <SelectRow label="Target Difficulty Level" options={['Beginner', 'Intermediate', 'Advanced']} value={selects.difficulty} onChange={(v) => handleSelect('difficulty', v)} />
              <ToggleRow label="Exam Reminders" active={toggles.exam_remind} onChange={() => handleToggle('exam_remind')} />
            </SectionCard>
          </div>
        );

      case 'Life':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Daily Targets">
              <InputRow label="Water Goal (Glasses)" type="number" value="8" />
              <InputRow label="Sleep Goal (Hours)" type="number" value="8" />
              <InputRow label="Workout Goal (Mins)" type="number" value="45" />
              <InputRow label="Productivity Target (/10)" type="number" value="8" />
              <ToggleRow label="Weekly Report Generation" active={true} onChange={()=>{}} />
            </SectionCard>
          </div>
        );

      case 'English':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Learning Profile">
              <SelectRow label="Current Level" options={['Beginner', 'Intermediate', 'Advanced']} value={selects.english_level} onChange={(v) => handleSelect('english_level', v)} />
              <InputRow label="Daily Word Goal" type="number" value="10" />
              <SelectRow label="Preferred Accent" options={['American English', 'British English', 'Australian English']} value={selects.accent_pref} onChange={(v) => handleSelect('accent_pref', v)} />
              <ToggleRow label="Speaking Practice Reminders" active={true} onChange={()=>{}} />
            </SectionCard>
          </div>
        );

      case 'Privacy':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Data & Privacy">
              <SelectRow label="Profile Visibility" options={['Public', 'Friends Only', 'Private']} value={selects.profile_vis} onChange={(v) => handleSelect('profile_vis', v)} />
              <ToggleRow label="Share Anonymous Usage Data" description="Help us improve LifeOS." active={toggles.data_sharing} onChange={() => handleToggle('data_sharing')} />
              <ToggleRow label="Allow AI Data Processing" description="Required for advanced AI insights." active={true} onChange={()=>{}} />
              <ToggleRow label="Location Permission" description="Used for contextual weather/diary insights." active={toggles.location} onChange={() => handleToggle('location')} />
            </SectionCard>
            <SectionCard title="Personal Data">
              <ButtonRow label="Export Data" description="Download all your diary, study, and tracking data as JSON." buttonText="Export JSON" />
              <ButtonRow label="Request Data Deletion" description="Remove specific data sets without deleting account." buttonText="Manage Data" isDanger />
            </SectionCard>
          </div>
        );

      case 'Backup':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Cloud Backup">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-indigo-900">Storage Usage</span>
                  <span className="text-sm font-bold text-indigo-600">45 MB / 1 GB</span>
                </div>
                <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[5%]"></div>
                </div>
              </div>
              <ToggleRow label="Auto Cloud Backup" description="Sync data to cloud over Wi-Fi." active={toggles.auto_backup} onChange={() => handleToggle('auto_backup')} />
              <ButtonRow label="Manual Backup" description="Force a sync immediately." buttonText="Backup Now" />
              <ButtonRow label="Restore from Backup" description="Overwrite local data with cloud data." buttonText="Restore" />
              <ButtonRow label="Clear Local Cache" description="Free up space on your device." buttonText="Clear Cache" isDanger />
            </SectionCard>
          </div>
        );

      case 'App':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Regional Settings">
              <SelectRow label="App Language" options={['English', 'Spanish', 'French']} value={selects.app_lang} onChange={(v) => handleSelect('app_lang', v)} />
              <SelectRow label="Date Format" options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} value={selects.date_format} onChange={(v) => handleSelect('date_format', v)} />
              <SelectRow label="Time Format" options={['12-hour', '24-hour']} value={selects.time_format} onChange={(v) => handleSelect('time_format', v)} />
              <SelectRow label="Currency" options={['USD ($)', 'EUR (€)', 'INR (₹)']} value={selects.currency} onChange={(v) => handleSelect('currency', v)} />
              <SelectRow label="Default Start Page" options={['Life Dashboard', 'AI Diary', 'Study Planner']} value={selects.start_page} onChange={(v) => handleSelect('start_page', v)} />
            </SectionCard>
          </div>
        );

      case 'Premium':
        return (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Crown size={120} />
              </div>
              <div className="relative z-10">
                <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-black uppercase tracking-wider rounded-full mb-4 inline-block">Current Plan</span>
                <h2 className="text-4xl font-black mb-2">LifeOS Pro</h2>
                <p className="text-indigo-200 mb-6 max-w-sm">You have access to unlimited AI queries, 10GB cloud storage, and priority support.</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3"><Check size={18} className="text-emerald-400" /> Advanced AI Analytics</div>
                  <div className="flex items-center gap-3"><Check size={18} className="text-emerald-400" /> Infinite Cloud Backup</div>
                  <div className="flex items-center gap-3"><Check size={18} className="text-emerald-400" /> Premium Voices & Personas</div>
                </div>

                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-slate-50 transition-colors">Manage Subscription</button>
                  <button className="px-6 py-3 bg-indigo-800 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">View Billing History</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Help':
        return (
          <div className="animate-fade-in">
            <SectionCard title="Support Center">
              <ButtonRow label="FAQ & Documentation" description="Read guides on how to use LifeOS." buttonText="Read Docs" />
              <ButtonRow label="Contact Support" description="Average response time: 2 hours." buttonText="Email Us" />
              <ButtonRow label="Report a Problem" description="Found a bug? Let us know." buttonText="Report Bug" />
              <ButtonRow label="Send Feedback" description="Have a feature request?" buttonText="Give Feedback" />
              <ButtonRow label="Rate LifeOS" description="Love the app? Leave a review!" buttonText="Rate 5 Stars" />
            </SectionCard>
          </div>
        );

      case 'About':
        return (
          <div className="animate-fade-in">
            <SectionCard title="About LifeOS AI">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
                  L
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800">LifeOS AI</h4>
                  <p className="text-slate-500 font-medium">Version 2.4.0 (Build 4829)</p>
                </div>
              </div>
              <ButtonRow label="Terms & Conditions" buttonText="View" />
              <ButtonRow label="Privacy Policy" buttonText="View" />
              <ButtonRow label="Open Source Licenses" buttonText="View" />
              <div className="text-center pt-8 pb-4">
                <p className="text-sm font-medium text-slate-400">© 2026 LifeOS Technologies Inc. All rights reserved.</p>
              </div>
            </SectionCard>
          </div>
        );

      case 'Danger':
        return (
          <div className="animate-fade-in">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-rose-700 mb-2 flex items-center gap-2">
                <AlertTriangle /> Danger Zone
              </h3>
              <p className="text-rose-600/80 mb-6 font-medium text-sm">Proceed with caution. Actions taken here are irreversible.</p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">Deactivate Account</h4>
                    <p className="text-xs text-slate-500 mt-1">Temporarily hide your profile and data. You can return anytime.</p>
                  </div>
                  <button className="px-4 py-2 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200">Deactivate</button>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800">Delete Account & Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Permanently erase your account, diaries, and cloud backups.</p>
                  </div>
                  <button className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20">Delete Forever</button>
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen pb-20 animate-fade-in font-sans">
      
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <AppIcon className="text-slate-400" size={32} />
          Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Customize your LifeOS AI experience.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                ${activeTab === tab.id 
                  ? tab.isDanger ? 'bg-rose-100 text-rose-700 shadow-sm' : 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : tab.isDanger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
            >
              <tab.icon size={18} className="shrink-0" />
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="opacity-50" />}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
