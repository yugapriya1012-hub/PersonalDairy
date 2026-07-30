import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';
import GlassCard from '../components/UI/GlassCard';
import { 
  PenTool, Image as ImageIcon, Mic, MicOff, Save, 
  MapPin, CloudSun, Sparkles, Bold, Italic, 
  List, Heading, Hash, Search, Calendar, Trash, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiDiary() {
  // State
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [location, setLocation] = useState('Locating...');
  const [weather, setWeather] = useState('Weather...');

  // Dashboard Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);

  // Refs
  const editorRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load Initial Data
  useEffect(() => {
    const now = new Date();
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    setDate(localDateStr);
    fetchEntries();
    fetchLocationAndWeather();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await apiClient.get('/diary');
      const formatted = (res || []).map(e => ({
        id: e.id,
        date: e.date,
        mood: e.mood,
        htmlContent: e.content,
        plainText: e.content,
        tags: e.tags ? e.tags.split(',') : [],
        imagePreview: e.image_path,
        summary: e.summary,
        timestamp: e.created_at
      }));
      setEntries(formatted);
    } catch (e) {
      console.error('Failed to load diary entries', e);
    }
  };

  const fetchLocationAndWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation(`Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
        
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const data = await res.json();
          setWeather(`${data.current_weather.temperature}°C`);
        } catch (e) {
          setWeather('Unavailable');
        }
      }, () => {
        setLocation('Denied');
        setWeather('Unavailable');
      });
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleTagKeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];
        
        recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        };
        
        recorder.start();
        setIsRecording(true);
      }).catch(() => alert("Microphone access denied."));
    }
  };

  const handleSave = async () => {
    const htmlContent = editorRef.current?.innerHTML.trim();
    const plainText = editorRef.current?.innerText.trim();
    if (!plainText) return alert("Write something first!");

    setIsSaving(true);

    try {
      await apiClient.post('/diary', {
        content: htmlContent,
        date,
        mood,
        tags: tags.join(','),
        image_path: imagePreview
      });
      
      // Refresh entries after save
      await fetchEntries();
      
      // Reset
      if (editorRef.current) editorRef.current.innerHTML = '';
      setTags([]);
      setImagePreview(null);
      setAudioUrl(null);
    } catch (e) {
      console.error("Failed to save entry", e);
      alert("Failed to save entry to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    if(window.confirm("Delete entry?")) {
      try {
        await apiClient.delete(`/diary/${id}`);
        setEntries(prev => prev.filter(e => e.id !== id));
      } catch (e) {
        console.error("Failed to delete", e);
      }
    }
  };

  const moodEmojis = [
    { key: 'excellent', emoji: '🤩' },
    { key: 'good', emoji: '😊' },
    { key: 'neutral', emoji: '😐' },
    { key: 'bad', emoji: '😔' },
    { key: 'terrible', emoji: '😭' },
  ];

  const allTags = [...new Set(entries.flatMap(e => e.tags))];
  let filteredEntries = entries;
  if (searchQuery) {
    filteredEntries = filteredEntries.filter(e => e.plainText.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  if (activeTags.length > 0) {
    filteredEntries = filteredEntries.filter(e => activeTags.some(t => e.tags.includes(t)));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <PenTool className="text-indigo-600" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">AI Diary</h1>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1"><MapPin size={14}/> {location}</span>
            <span className="flex items-center gap-1"><CloudSun size={14}/> {weather}</span>
          </div>
        </div>
      </header>

      {/* Editor */}
      <GlassCard className="space-y-4">
        <div className="flex gap-3 mb-2">
          {moodEmojis.map(m => (
            <button 
              key={m.key} 
              onClick={() => setMood(m.key)}
              className={`text-3xl transition-all ${mood === m.key ? 'scale-125 filter-none' : 'grayscale opacity-50 hover:grayscale-0 hover:scale-110'}`}
              title={m.key}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white/50">
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-200">
            <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-slate-200 rounded text-slate-700"><Bold size={16}/></button>
            <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-slate-200 rounded text-slate-700"><Italic size={16}/></button>
            <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 hover:bg-slate-200 rounded text-slate-700"><List size={16}/></button>
            <button onClick={() => handleFormat('formatBlock', 'H3')} className="p-2 hover:bg-slate-200 rounded text-slate-700"><Heading size={16}/></button>
          </div>
          
          <div 
            ref={editorRef}
            contentEditable
            className="w-full min-h-[150px] p-4 focus:outline-none text-slate-800"
            suppressContentEditableWarning
          />
        </div>

        {/* Tags Input */}
        <div className="flex items-center gap-3 bg-white/50 border border-slate-200 rounded-xl p-2 px-4">
          <Hash size={18} className="text-indigo-400" />
          <input 
            type="text" 
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeydown}
            placeholder="Add tags (press Enter)..."
            className="bg-transparent border-none focus:outline-none flex-1 text-slate-700"
          />
          <div className="flex gap-2">
            {tags.map(t => (
              <span key={t} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                #{t} <X size={12} className="cursor-pointer" onClick={() => setTags(tags.filter(tag => tag !== t))} />
              </span>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="flex flex-wrap gap-4 items-center">
          <input type="file" id="diary-img-upload" accept="image/*" className="hidden" onChange={handleImageChange} />
          <button onClick={() => document.getElementById('diary-img-upload').click()} className="px-4 py-2 flex items-center gap-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors bg-white/50">
            <ImageIcon size={18} /> Image
          </button>
          
          <button onClick={toggleRecording} className={`px-4 py-2 flex items-center gap-2 border rounded-xl transition-colors ${isRecording ? 'border-red-200 bg-red-50 text-red-600 animate-pulse' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white/50'}`}>
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />} 
            {isRecording ? 'Stop Recording' : 'Voice Note'}
          </button>
        </div>

        {/* Previews */}
        <div className="flex gap-4">
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} className="h-24 rounded-lg border border-slate-200 object-cover" />
              <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14}/></button>
            </div>
          )}
          {audioUrl && (
            <div className="relative bg-slate-100 p-2 rounded-xl flex items-center">
              <audio src={audioUrl} controls className="h-8" />
              <button onClick={() => setAudioUrl(null)} className="ml-2 text-red-500"><X size={18}/></button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none bg-white/50 text-slate-700 font-medium" />
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2 disabled:opacity-70">
            {isSaving ? <Sparkles className="animate-spin" size={18} /> : <Save size={18} />} 
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </GlassCard>

      {/* Dashboard */}
      <div className="mt-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search past entries..." className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 items-center flex-1">
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t!==tag) : [...prev, tag])} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-white/60 border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Mini Calendar */}
          <GlassCard className="col-span-1 p-4 hidden md:block">
            {(() => {
              let year, month;
              if (date) {
                const [y, m] = date.split('-');
                year = parseInt(y, 10);
                month = parseInt(m, 10) - 1;
              } else {
                const now = new Date();
                year = now.getFullYear();
                month = now.getMonth();
              }
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
              
              const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

              return (
                <>
                  <h3 className="font-bold text-slate-700 flex items-center justify-center gap-2 mb-4"><Calendar size={18}/> {monthName}</h3>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-slate-400 font-semibold mb-1">{d}</div>)}
                    {Array.from({length: firstDay}).map((_,i) => <div key={`pad-${i}`}/>)}
                    {Array.from({length: daysInMonth}).map((_,i) => {
                      const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                      const hasEntry = entries.some(e => e.date === dStr);
                      const isSelected = date === dStr;
                      const isToday = todayStr === dStr;
                      
                      return (
                        <button 
                          key={i}
                          onClick={() => setDate(dStr)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-full text-xs transition-all relative cursor-pointer
                            ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md' : 
                              isToday ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-300' :
                              'text-slate-600 hover:bg-slate-100'}
                          `}
                        >
                          <span className={hasEntry ? '-mt-1' : ''}>{i+1}</span>
                          {hasEntry && (
                            <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </GlassCard>

          {/* Entry Cards */}
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <AnimatePresence>
              {filteredEntries.map((entry) => (
                <motion.div key={entry.id} layout initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.95}}>
                  <GlassCard className="p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-sm">{new Date(entry.date).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'})}</span>
                      <span className="text-xl">{moodEmojis.find(m => m.key === entry.mood)?.emoji || '😐'}</span>
                    </div>
                    <div className="flex gap-4">
                      {entry.imagePreview && <img src={entry.imagePreview} className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0" />}
                      <div className="flex-1">
                        <div dangerouslySetInnerHTML={{__html: entry.htmlContent}} className="text-slate-700 line-clamp-3 mb-2" />
                      </div>
                    </div>
                    {entry.tags?.length > 0 && (
                      <div className="flex gap-2">
                        {entry.tags.map(t => <span key={t} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">#{t}</span>)}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        {entry.summary === 'A brief thought.' 
                          ? (entry.plainText?.length > 40 ? entry.plainText.substring(0, 40) + '...' : entry.plainText) 
                          : entry.summary}
                      </span>
                      <button onClick={() => deleteEntry(entry.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash size={16}/></button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
              {filteredEntries.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-medium">No entries found.</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
