import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  BrainCircuit, Trophy, Flame, Star, Search, Filter, Play, Gift, Sparkles, 
  Puzzle, Lightbulb, Zap, Crown, Target, LayoutGrid, Clock, Hash, CheckCircle2 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import GlassCard from '../components/UI/GlassCard';
import apiClient from '../api/apiClient';

// MOCK DATA (Cleared for real usage)
const WEEKLY_XP = [];
const LEADERBOARD = [
  { rank: 1, name: 'You', xp: 0, avatar: '🐼', level: 1 },
];
const ACTIVITIES = [];
const GAMES = [
  { id: 1, title: 'Memory Card Match', category: 'Memory', desc: 'Find the matching pairs before time runs out.', diff: ['Easy', 'Medium', 'Hard'], icon: LayoutGrid, color: 'from-blue-400 to-indigo-500' },
  { id: 2, title: 'Sudoku Master', category: 'Logic', desc: 'Classic number puzzle to train your logical thinking.', diff: ['Medium', 'Hard', 'Expert'], icon: Hash, color: 'from-emerald-400 to-teal-500' },
  { id: 3, title: 'Word Scramble', category: 'Words', desc: 'Unscramble the letters to find the hidden words.', diff: ['Easy', 'Medium'], icon: Zap, color: 'from-amber-400 to-orange-500' },
  { id: 4, title: 'Color Match', category: 'Speed', desc: 'Tap the color that matches the text, not the ink!', diff: ['Hard'], icon: Lightbulb, color: 'from-pink-400 to-rose-500' },
];

const MEMORY_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const QUIZ_QUESTIONS = {
  Basic: [
    { q: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], ans: "Paris" },
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], ans: "Mars" },
    { q: "What is 7 multiplied by 8?", options: ["54", "56", "62", "64"], ans: "56" },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], ans: "7" },
    { q: "Which animal is known as man's best friend?", options: ["Cat", "Bird", "Dog", "Fish"], ans: "Dog" },
    { q: "What is the freezing point of water?", options: ["0°C", "10°C", "32°C", "100°C"], ans: "0°C" },
    { q: "Which of these is a primary color?", options: ["Green", "Purple", "Red", "Orange"], ans: "Red" },
    { q: "How many legs does a spider have?", options: ["6", "8", "10", "12"], ans: "8" },
    { q: "What shape is a stop sign?", options: ["Square", "Hexagon", "Octagon", "Triangle"], ans: "Octagon" },
    { q: "What do cows drink?", options: ["Milk", "Water", "Juice", "Soda"], ans: "Water" },
    { q: "Which gas do humans breathe to survive?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], ans: "Oxygen" },
    { q: "What is the largest land animal?", options: ["Elephant", "Giraffe", "Hippopotamus", "Rhino"], ans: "Elephant" },
    { q: "How many days are in a leap year?", options: ["364", "365", "366", "367"], ans: "366" },
    { q: "What color is a school bus in the US?", options: ["Red", "Yellow", "Blue", "Green"], ans: "Yellow" },
    { q: "Which month has 28 days?", options: ["February", "March", "April", "All of them"], ans: "All of them" }
  ],
  Intermediate: [
    { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], ans: "William Shakespeare" },
    { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: "Pacific" },
    { q: "In which year did the Titanic sink?", options: ["1912", "1905", "1923", "1898"], ans: "1912" },
    { q: "What is the chemical symbol for Gold?", options: ["Ag", "Go", "Au", "Gd"], ans: "Au" },
    { q: "What is the square root of 144?", options: ["10", "12", "14", "16"], ans: "12" },
    { q: "Which element is said to keep bones strong?", options: ["Iron", "Calcium", "Zinc", "Potassium"], ans: "Calcium" },
    { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], ans: "Da Vinci" },
    { q: "What is the capital of Japan?", options: ["Seoul", "Beijing", "Bangkok", "Tokyo"], ans: "Tokyo" },
    { q: "How many bones are in the adult human body?", options: ["198", "206", "214", "220"], ans: "206" },
    { q: "What gas do plants absorb?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], ans: "Carbon Dioxide" },
    { q: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], ans: "Mercury" },
    { q: "What is the tallest mountain in the world?", options: ["K2", "Mount Everest", "Mount Kilimanjaro", "Denali"], ans: "Mount Everest" },
    { q: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Michael Collins"], ans: "Neil Armstrong" },
    { q: "What is the hardest rock?", options: ["Granite", "Diamond", "Marble", "Quartz"], ans: "Diamond" },
    { q: "How many states are in the United States?", options: ["48", "49", "50", "51"], ans: "50" }
  ],
  Advanced: [
    { q: "What is the rarest blood type?", options: ["O-", "B-", "AB-", "A-"], ans: "AB-" },
    { q: "What is the capital city of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], ans: "Canberra" },
    { q: "In physics, what is the fourth state of matter?", options: ["Liquid", "Solid", "Gas", "Plasma"], ans: "Plasma" },
    { q: "What is the smallest country in the world?", options: ["Monaco", "Nauru", "Vatican City", "Tuvalu"], ans: "Vatican City" },
    { q: "Who developed the theory of general relativity?", options: ["Newton", "Galileo", "Bohr", "Einstein"], ans: "Einstein" },
    { q: "What year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], ans: "2007" },
    { q: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], ans: "Diamond" },
    { q: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Onion", "Pepper"], ans: "Avocado" },
    { q: "Which planet has the most moons?", options: ["Saturn", "Jupiter", "Uranus", "Neptune"], ans: "Saturn" },
    { q: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Deoxyribose Acid", "Diribonucleic Acid", "Deoxynucletic Acid"], ans: "Deoxyribonucleic Acid" },
    { q: "Which element has the atomic number 1?", options: ["Helium", "Oxygen", "Hydrogen", "Carbon"], ans: "Hydrogen" },
    { q: "Who painted the Sistine Chapel ceiling?", options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"], ans: "Michelangelo" },
    { q: "What is the study of mushrooms called?", options: ["Botany", "Mycology", "Geology", "Ecology"], ans: "Mycology" },
    { q: "What is the most abundant gas in the Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], ans: "Nitrogen" },
    { q: "What is the capital of Iceland?", options: ["Oslo", "Helsinki", "Reykjavik", "Stockholm"], ans: "Reykjavik" }
  ]
};

const WORD_BANK = ['REACT', 'JAVASCRIPT', 'COMPONENT', 'INTERFACE', 'FRONTEND', 'DATABASE', 'ALGORITHM', 'DEBUGGING'];

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
const COLOR_HEX = {
  'RED': '#ef4444',
  'BLUE': '#3b82f6',
  'GREEN': '#22c55e',
  'YELLOW': '#eab308',
  'PURPLE': '#a855f7',
  'ORANGE': '#f97316'
};

const SUDOKU_INITIAL = [
  [1, 0, 3, 0],
  [0, 4, 0, 2],
  [2, 0, 4, 0],
  [0, 3, 0, 1]
];
const SUDOKU_SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1]
];

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

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [lastActive, setLastActive] = useLocalStorage('lifeos_last_active', '');
  const [lifeScore, setLifeScore] = useState(0);
  
  const [userXP, setUserXP] = useLocalStorage('lifeos_xp', 0);
  const [gamesPlayed, setGamesPlayed] = useLocalStorage('lifeos_games_played', 0);
  
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await apiClient.get('/user_streak');
        setStreak(res.current_streak);
        setLifeScore(res.points);
      } catch (e) {
        console.error('Failed to fetch streak', e);
      }
    };
    fetchStreak();
  }, []);

  const trackActivity = async () => {
    const today = new Date().toDateString();
    const raw = window.localStorage.getItem('lifeos_last_active');
    let currentLastActive = '';
    if (raw) {
      try { currentLastActive = JSON.parse(raw); } catch(e) {}
    }
    
    if (currentLastActive !== today) {
      window.localStorage.setItem('lifeos_last_active', JSON.stringify(today));
      setLastActive(today);
      try {
        const res = await apiClient.post('/user_streak/update', { increment_streak: true, points_to_add: 0 });
        setStreak(res.current_streak);
      } catch (e) {
        console.error('Failed to update streak', e);
      }
    }
  };

  useEffect(() => {
    trackActivity();
  }, [lastActive]);

  const [quizzesDone, setQuizzesDone] = useLocalStorage('lifeos_quizzes_done', 0);
  const [creativityScore, setCreativityScore] = useLocalStorage('lifeos_creativity', 0);
  const [achievementsCount, setAchievementsCount] = useLocalStorage('lifeos_achievements_count', 0);
  const [challengeDone, setChallengeDone] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState('"Write a 3-sentence story about a time-traveling coin."');

  useEffect(() => {
    const prompts = [
      '"Write a 3-sentence story about a time-traveling coin."',
      '"Invent a new holiday and describe its main tradition."',
      '"Describe a color to someone who has been blind since birth."',
      '"What would you do if gravity stopped working for 10 minutes?"',
      '"Write a haiku about your favorite food."',
      '"Create a superhero whose power is extremely inconvenient."'
    ];
    setDailyPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, []);
  const [quizState, setQuizState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState('Basic');
  const [activeQuizQuestions, setActiveQuizQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  
  useEffect(() => {
    let timer;
    if (quizStarted && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQuizFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, timeLeft]);
  
  // Game State
  const [activeGame, setActiveGame] = useState(null);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const startMemoryGame = () => {
    const shuffled = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setMemoryCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setActiveGame('Memory Card Match');
    setGamesPlayed(prev => prev + 1);
    trackActivity();
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const match = memoryCards[newFlipped[0]].emoji === memoryCards[newFlipped[1]].emoji;
      if (match) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === memoryCards.length) {
          setTimeout(triggerWin, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };
  
  // Word Scramble State
  const [wsWord, setWsWord] = useState('');
  const [wsScrambled, setWsScrambled] = useState('');
  const [wsInput, setWsInput] = useState('');
  const [wsWon, setWsWon] = useState(false);

  const startWordScramble = () => {
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    setWsWord(word);
    setWsScrambled(scrambled);
    setWsInput('');
    setWsWon(false);
    setActiveGame('Word Scramble');
    setGamesPlayed(prev => prev + 1);
    trackActivity();
  };

  const handleScrambleSubmit = () => {
    if (wsInput.toUpperCase() === wsWord) {
      setWsWon(true);
      setTimeout(triggerWin, 500);
      setUserXP(prev => prev + 50);
    }
  };

  // Color Match State
  const [cmTargetName, setCmTargetName] = useState('');
  const [cmTargetColor, setCmTargetColor] = useState('');
  const [cmScore, setCmScore] = useState(0);
  const [cmTimeLeft, setCmTimeLeft] = useState(0);

  const nextColorMatchRound = () => {
    const name = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    let color = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
    if (Math.random() > 0.3) {
      const others = COLOR_NAMES.filter(c => c !== name);
      color = others[Math.floor(Math.random() * others.length)];
    }
    setCmTargetName(name);
    setCmTargetColor(color);
  };

  const startColorMatch = () => {
    setCmScore(0);
    setCmTimeLeft(30);
    nextColorMatchRound();
    setActiveGame('Color Match');
    setGamesPlayed(prev => prev + 1);
    trackActivity();
  };

  const handleColorClick = (clickedColorName) => {
    if (cmTimeLeft <= 0) return;
    if (clickedColorName === cmTargetColor) {
      setCmScore(prev => prev + 1);
      nextColorMatchRound();
    } else {
      nextColorMatchRound();
    }
  };

  useEffect(() => {
    let timer;
    if (activeGame === 'Color Match' && cmTimeLeft > 0) {
      timer = setInterval(() => setCmTimeLeft(prev => prev - 1), 1000);
    } else if (activeGame === 'Color Match' && cmTimeLeft === 0 && cmScore > 0) {
      if (cmScore >= 5) {
        triggerWin();
        setUserXP(prev => prev + (cmScore * 5));
      }
    }
    return () => clearInterval(timer);
  }, [activeGame, cmTimeLeft, cmScore]);

  // Sudoku State
  const [sudokuGrid, setSudokuGrid] = useState([]);
  const [sudokuWon, setSudokuWon] = useState(false);

  const startSudoku = () => {
    setSudokuGrid(JSON.parse(JSON.stringify(SUDOKU_INITIAL)));
    setSudokuWon(false);
    setActiveGame('Sudoku Master');
    setGamesPlayed(prev => prev + 1);
    trackActivity();
  };

  const handleSudokuInput = (r, c, val) => {
    if (SUDOKU_INITIAL[r][c] !== 0) return;
    if (sudokuWon) return;
    
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 4) num = 0;
    
    const newGrid = [...sudokuGrid];
    newGrid[r][c] = num;
    setSudokuGrid(newGrid);
    
    let won = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (newGrid[i][j] !== SUDOKU_SOLUTION[i][j]) won = false;
      }
    }
    if (won) {
      setSudokuWon(true);
      setTimeout(triggerWin, 500);
      setUserXP(prev => prev + 100);
    }
  };
  
  // Confetti trigger
  const triggerWin = async () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    try {
      const res = await apiClient.post('/user_streak/update', { increment_streak: false, points_to_add: 10 });
      setLifeScore(res.points);
    } catch (e) {
      console.error('Failed to add points', e);
    }
    trackActivity();
  };

  const claimReward = () => {
    if (!rewardClaimed) {
      setRewardClaimed(true);
      setUserXP(prev => prev + 100);
      triggerWin();
    }
  };

  const completeChallenge = () => {
    if (!challengeDone) {
      setChallengeDone(true);
      setUserXP(prev => prev + 50);
      setCreativityScore(prev => prev + 10);
      triggerWin();
    }
  };

  const handleQuizAnswer = (ans) => {
    if (quizState) return;
    const currentQ = activeQuizQuestions[currentQuestion - 1];
    if (!currentQ) return;
    if (ans === currentQ.ans) {
      setQuizState('correct');
      setUserXP(prev => prev + 20);
      setQuizScore(prev => prev + 1);
      triggerWin();
    } else {
      setQuizState('incorrect');
    }
  };

  const filteredGames = GAMES.filter(g => 
    (filter === 'All' || g.category === filter) && 
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 relative">
      {/* Game Modal Overlay */}
      <AnimatePresence>
        {activeGame && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">{activeGame}</h2>
                  {activeGame === 'Memory Card Match' && <p className="text-slate-500 font-medium mt-1">Moves: {moves}</p>}
                </div>
                <button onClick={() => setActiveGame(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Close Window
                </button>
              </div>

              {activeGame === 'Memory Card Match' ? (
                <>
                  {matched.length === memoryCards.length && (
                    <div className="text-center mb-8 p-6 bg-emerald-100 rounded-2xl border border-emerald-200">
                      <h3 className="text-2xl font-black text-emerald-600 mb-2">You Won in {moves} Moves! 🎉</h3>
                      <button onClick={startMemoryGame} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Play Again</button>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {memoryCards.map((card, i) => {
                      const isFlipped = flipped.includes(i) || matched.includes(i);
                      return (
                        <motion.div 
                          key={i}
                          whileHover={!isFlipped ? { scale: 1.05 } : {}}
                          whileTap={!isFlipped ? { scale: 0.95 } : {}}
                          onClick={() => handleCardClick(i)}
                          className={`aspect-square rounded-2xl flex items-center justify-center text-4xl cursor-pointer shadow-sm transition-all duration-300 transform-gpu ${isFlipped ? 'bg-white border-2 border-indigo-200 rotate-y-180' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md'}`}
                          style={{ perspective: 1000 }}
                        >
                          <div className={`transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                            {card.emoji}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              ) : activeGame === 'Word Scramble' ? (
                <div className="flex flex-col items-center max-w-lg mx-auto">
                  {wsWon ? (
                    <div className="text-center mb-8 p-6 bg-emerald-100 rounded-2xl border border-emerald-200 w-full">
                      <h3 className="text-2xl font-black text-emerald-600 mb-2">You Won! 🎉</h3>
                      <button onClick={startWordScramble} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Play Again</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-500 mb-6 text-center">Unscramble the letters below to find the hidden word.</p>
                      <div className="text-5xl font-black text-indigo-600 tracking-[0.2em] mb-12 bg-indigo-50 py-8 px-12 rounded-3xl border border-indigo-100 shadow-inner w-full text-center">
                        {wsScrambled}
                      </div>
                      <div className="flex gap-4 w-full">
                        <input 
                          type="text" 
                          value={wsInput} 
                          onChange={(e) => setWsInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleScrambleSubmit()}
                          className="flex-1 text-2xl font-bold px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 outline-none text-center uppercase"
                          placeholder="Type answer..."
                        />
                        <button onClick={handleScrambleSubmit} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Check</button>
                      </div>
                    </>
                  )}
                </div>
              ) : activeGame === 'Color Match' ? (
                <div className="flex flex-col items-center max-w-lg mx-auto">
                  {cmTimeLeft <= 0 ? (
                    <div className="text-center mb-8 p-6 bg-emerald-100 rounded-2xl border border-emerald-200 w-full">
                      <h3 className="text-2xl font-black text-emerald-600 mb-2">Time's Up!</h3>
                      <p className="font-bold text-emerald-800 mb-4">You scored {cmScore} points!</p>
                      <button onClick={startColorMatch} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Play Again</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between w-full mb-8 px-4">
                        <div className="text-lg font-bold text-slate-500">Time: <span className="text-rose-500">{cmTimeLeft}s</span></div>
                        <div className="text-lg font-bold text-slate-500">Score: <span className="text-indigo-500">{cmScore}</span></div>
                      </div>
                      <p className="text-slate-500 mb-6 text-center">Select the color of the <strong className="text-slate-800">ink</strong>, not the word!</p>
                      
                      <div 
                        className="text-6xl font-black mb-12 py-12 px-4 rounded-3xl w-full text-center tracking-widest drop-shadow-sm transition-colors duration-200"
                        style={{ color: COLOR_HEX[cmTargetColor] }}
                      >
                        {cmTargetName}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                        {COLOR_NAMES.map(c => (
                          <button 
                            key={c}
                            onClick={() => handleColorClick(c)}
                            className="py-4 rounded-xl font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                            style={{ backgroundColor: COLOR_HEX[c] }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : activeGame === 'Sudoku Master' ? (
                <div className="flex flex-col items-center max-w-lg mx-auto">
                  {sudokuWon && (
                    <div className="text-center mb-8 p-6 bg-emerald-100 rounded-2xl border border-emerald-200 w-full">
                      <h3 className="text-2xl font-black text-emerald-600 mb-2">Puzzle Solved! 🎉</h3>
                      <button onClick={startSudoku} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">Play Again</button>
                    </div>
                  )}
                  <p className="text-slate-500 mb-6 text-center">Fill the 4x4 grid so every row, column, and 2x2 box contains 1-4.</p>
                  <div className="bg-slate-800 p-2 rounded-2xl shadow-xl">
                    <div className="grid grid-cols-4 gap-1 bg-slate-600 p-1 rounded-xl">
                      {sudokuGrid.map((row, r) => 
                        row.map((cell, c) => {
                          const isInitial = SUDOKU_INITIAL[r][c] !== 0;
                          return (
                            <input
                              key={`${r}-${c}`}
                              type="text"
                              maxLength="1"
                              value={cell === 0 ? '' : cell}
                              onChange={(e) => handleSudokuInput(r, c, e.target.value)}
                              disabled={isInitial || sudokuWon}
                              className={`w-16 h-16 md:w-20 md:h-20 text-center text-3xl font-black outline-none 
                                ${isInitial ? 'bg-slate-200 text-slate-800' : 'bg-white text-indigo-600'} 
                                ${(r === 1 && c !== 3) ? 'border-b-4 border-slate-600' : ''}
                                ${(c === 1 && r !== 3) ? 'border-r-4 border-slate-600' : ''}
                                ${(r === 1 && c === 1) ? 'border-b-4 border-r-4 border-slate-600' : ''}
                                focus:bg-indigo-50 focus:ring-4 ring-indigo-400 transition-colors rounded-md`}
                            />
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl opacity-50">🚧</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Under Construction</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">This game mode is currently being built and will be available in a future update. Check back soon!</p>
                  <button onClick={() => setActiveGame(null)} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} gravity={0.15} className="fixed inset-0 z-50 pointer-events-none" />}
      
      {/* 1. Page Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 pt-4 pb-4 px-2 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500 flex items-center gap-2">
            <BrainCircuit className="text-orange-500" size={28} /> Brain Games Hub
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Train your brain, improve creativity, and have fun every day.</p>
        </div>
        <div className="flex items-center gap-3 md:gap-6 bg-white/80 px-4 py-2 md:py-2.5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-2 group cursor-help">
            <div className="p-1.5 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform"><Flame size={18} className="text-orange-500"/></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Streak</span>
              <span className="text-slate-700 font-bold leading-none mt-1">{streak}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-2 group cursor-help">
            <div className="p-1.5 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform"><Star size={18} className="text-amber-500 fill-amber-500"/></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">XP Points</span>
              <span className="text-slate-700 font-bold leading-none mt-1">{userXP.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-2 group cursor-help">
            <div className="p-1.5 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform"><Crown size={18} className="text-indigo-500"/></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Level</span>
              <span className="text-slate-700 font-bold leading-none mt-1">1</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* MAIN COLUMN (3/4 width) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* 2. Top Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Games Played', val: gamesPlayed, icon: Play, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Quizzes Done', val: quizzesDone, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Creativity Score', val: creativityScore, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
              { label: 'Achievements Unlocked', val: [quizzesDone >= 5, gamesPlayed >= 10, creativityScore >= 50, userXP >= 500, quizzesDone >= 10, userXP >= 10000].filter(Boolean).length, icon: Trophy, color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map((stat, i) => (
              <motion.div whileHover={{ y: -4, scale: 1.02 }} key={i}>
                <GlassCard className="p-4 md:p-5 flex flex-col gap-3 border border-slate-200/60 bg-white/60 hover:shadow-lg transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={stat.color} size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">{stat.val}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* 6. Daily Challenge & 11. Daily Reward */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-6 bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-800 rounded-2xl text-white overflow-hidden relative shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm uppercase tracking-wider mb-2">
                    <Target size={16}/> Daily AI Challenge
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight text-white">{dailyPrompt}</h3>
                  <p className="text-indigo-200 text-sm max-w-md mb-4">Boost your lateral thinking by completing today's creative constraint.</p>
                  
                  {!challengeDone && (
                    <textarea 
                      className="w-full bg-indigo-900/40 border border-indigo-400/30 rounded-xl p-4 text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      rows="3"
                      placeholder="Once upon a time..."
                    ></textarea>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  {challengeDone ? (
                    <button disabled className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={18} /> Completed! +50 XP
                    </button>
                  ) : (
                    <>
                      <button onClick={completeChallenge} className="px-6 py-2.5 bg-white text-indigo-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-white/20">Submit & Earn 50 XP</button>
                      <button className="px-4 py-2.5 bg-indigo-800 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Skip</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <GlassCard className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-amber-100 to-orange-50 border-orange-200">
              <h3 className="font-bold text-orange-800 mb-1">Daily Reward</h3>
              <p className="text-xs text-orange-600 mb-4 font-medium">Claim your free XP chest!</p>
              <motion.button 
                onClick={claimReward}
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 10, 0] }}
                disabled={rewardClaimed}
                className="w-24 h-24 relative"
              >
                <div className={`absolute inset-0 bg-orange-400 blur-xl opacity-50 rounded-full ${!rewardClaimed && 'animate-pulse'}`}></div>
                <div className={`relative z-10 w-full h-full bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/50 transition-all ${rewardClaimed ? 'opacity-50 grayscale' : 'cursor-pointer'}`}>
                  {rewardClaimed ? <CheckCircle2 size={40} className="text-white"/> : <Gift size={40} className="text-white"/>}
                </div>
              </motion.button>
              <p className="text-sm font-bold text-orange-600 mt-4">{rewardClaimed ? '+100 XP Claimed!' : 'Click to Open'}</p>
            </GlassCard>
          </div>

          {/* 14. Search & Filter */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Game Catalog</h2>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input 
                  type="text" 
                  placeholder="Search games..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <select 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Memory">Memory</option>
                  <option value="Logic">Logic</option>
                  <option value="Words">Words</option>
                  <option value="Speed">Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Game Categories & 4. Featured Games */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredGames.map(game => (
                <motion.div layout initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} key={game.id}>
                  <GlassCard className="p-1 hover:shadow-xl transition-shadow group overflow-hidden border border-slate-200/50 cursor-pointer h-full">
                    <div className="flex h-full bg-white rounded-xl overflow-hidden">
                      <div className={`w-32 bg-gradient-to-br ${game.color} p-6 flex items-center justify-center relative overflow-hidden shrink-0`}>
                        <game.icon size={48} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{game.category}</span>
                            <div className="flex gap-1">
                              {game.diff.map(d => (
                                <span key={d} className={`w-2 h-2 rounded-full ${d==='Hard'||d==='Expert' ? 'bg-rose-500' : d==='Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} title={d}></span>
                              ))}
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{game.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">{game.desc}</p>
                        </div>
                        <button onClick={() => {
                          if (game.title === 'Memory Card Match') startMemoryGame();
                          else if (game.title === 'Word Scramble') startWordScramble();
                          else if (game.title === 'Color Match') startColorMatch();
                          else if (game.title === 'Sudoku Master') startSudoku();
                          else setActiveGame(game.title);
                        }} className="mt-4 w-full py-2 bg-slate-50 text-indigo-600 font-bold text-sm rounded-lg border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                          Play Now
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
              {filteredGames.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium">No games found matching your criteria.</div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Quiz Section (Mock interface) */}
          <div className="bg-slate-900 p-6 shadow-2xl relative overflow-hidden rounded-2xl border border-slate-700">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white"><Puzzle className="text-indigo-400"/> Daily Quiz Arena</h3>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-indigo-200 border border-white/10">Science & Logic</span>
              </div>
              {quizFinished ? (
                <div className="bg-white/10 p-8 rounded-2xl border border-white/10 mb-6 backdrop-blur-sm shadow-inner text-center">
                  <h3 className="text-3xl font-black text-white mb-2">Quiz Completed! 🎉</h3>
                  <p className="text-indigo-200 text-lg mb-8 font-medium">You scored {quizScore} out of 10!</p>
                  <button 
                    onClick={() => {
                      setQuizFinished(false);
                      setQuizStarted(false);
                      setCurrentQuestion(1);
                      setQuizScore(0);
                      setTimeLeft(60);
                    }} 
                    className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Play Again
                  </button>
                </div>
              ) : !quizStarted ? (
                <div className="bg-white/10 p-8 rounded-2xl border border-white/10 mb-6 backdrop-blur-sm shadow-inner text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to test your knowledge?</h3>
                  <p className="text-indigo-200 text-sm mb-6 max-w-sm mx-auto">Select a difficulty level. You have 60 seconds to answer 10 questions!</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-2">
                    {['Basic', 'Intermediate', 'Advanced'].map(diff => (
                      <button 
                        key={diff}
                        onClick={() => {
                          const shuffled = [...QUIZ_QUESTIONS[diff]].sort(() => 0.5 - Math.random());
                          setActiveQuizQuestions(shuffled.slice(0, 10));
                          setQuizDifficulty(diff);
                          if (!quizStarted) {
                            setQuizStarted(true);
                            setQuizzesDone(prev => prev + 1);
                            trackActivity(`Started ${diff} Quiz`, 'Quiz');
                          }
                          setTimeLeft(60);
                        }} 
                        className={`px-6 py-3 font-bold rounded-xl transition-colors shadow-lg ${
                          diff === 'Basic' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 text-white' :
                          diff === 'Intermediate' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 text-white' :
                          'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 p-6 rounded-2xl border border-white/10 mb-6 backdrop-blur-sm shadow-inner">
                  <div className="flex justify-between text-sm font-bold text-indigo-200 mb-4">
                    <span>{quizDifficulty} • Question {currentQuestion} of 10</span>
                    <span className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                      <Clock size={16}/> 00:{timeLeft.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <h4 className="text-xl font-medium leading-relaxed mb-6 text-white">{activeQuizQuestions[currentQuestion - 1]?.q}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeQuizQuestions[currentQuestion - 1]?.options.map((ans, i) => {
                      const correctAns = activeQuizQuestions[currentQuestion - 1]?.ans;
                      const isSelected = quizState && ans === correctAns;
                      const isWrong = quizState === 'incorrect' && ans !== correctAns;
                      let btnClass = "bg-white/5 hover:bg-indigo-600 hover:border-indigo-500 border-white/10 text-white";
                      
                      if (quizState === 'correct' && ans === correctAns) {
                        btnClass = "bg-emerald-500 border-emerald-400 text-white";
                      } else if (quizState === 'incorrect') {
                        if (ans === correctAns) btnClass = "bg-emerald-500/50 border-emerald-400 text-white"; // show right answer
                        else if (isWrong) btnClass = "bg-rose-500/20 border-rose-500 text-white opacity-50";
                      }

                      return (
                        <button key={i} onClick={() => handleQuizAnswer(ans)} disabled={!!quizState} className={`p-4 rounded-xl border transition-colors text-left font-medium ${btnClass}`}>
                          <span className="inline-block w-6 font-black opacity-70">{['A','B','C','D'][i]}</span> {ans}
                        </button>
                      );
                    })}
                  </div>
                  {quizState && (
                    <div className="mt-6 flex justify-end">
                      <button 
                        onClick={() => {
                          setQuizState(null);
                          if (currentQuestion === 10) {
                            setQuizFinished(true);
                            triggerWin();
                          } else {
                            setCurrentQuestion(prev => prev + 1);
                          }
                        }}
                        className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                        {currentQuestion === 10 ? 'Finish Quiz' : 'Next Question'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SIDEBAR (1/4 width) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* 13. Profile Card */}
          <GlassCard className="p-6 text-center border-t-4 border-t-indigo-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity"><Crown size={48} className="text-indigo-500"/></div>
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl mb-3 relative z-10">🐼</div>
            <h3 className="font-bold text-xl text-slate-800">You</h3>
            <p className="text-sm font-semibold text-slate-400 mb-4">Brainiac Explorer</p>
            
            <div className="text-left mb-2 flex justify-between text-xs font-bold text-slate-500">
              <span>Level 1</span>
              <span>Level 2</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[0%] relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">100 XP to Next Level</p>
          </GlassCard>

          {/* 12. Game Progress Chart */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2"><Sparkles size={16} className="text-amber-500"/> XP Progression</h3>
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_XP}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={5} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border:'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize:'12px'}}
                    cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3'}}
                  />
                  <Line type="monotone" dataKey="xp" stroke="#f59e0b" strokeWidth={3} dot={{r:3, fill:'#f59e0b', strokeWidth:0}} activeDot={{r:5, stroke:'#fff', strokeWidth:2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 8. Achievements */}
          <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Badges</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{[quizzesDone >= 5, gamesPlayed >= 10, creativityScore >= 50, userXP >= 500, quizzesDone >= 10, userXP >= 10000].filter(Boolean).length}/6</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🎮', name: 'Quiz Master', unlocked: quizzesDone >= 5, color: 'from-indigo-400 to-indigo-300' },
                { icon: '🧠', name: 'Memory Genius', unlocked: gamesPlayed >= 10, color: 'from-purple-400 to-purple-300' },
                { icon: '⚡', name: 'Fast Thinker', unlocked: creativityScore >= 50, color: 'from-amber-400 to-amber-300' },
                { icon: '🔥', name: 'Dedicated', unlocked: userXP >= 500, color: 'from-rose-400 to-rose-300' },
                { icon: '🧩', name: 'Logic God', unlocked: quizzesDone >= 10, color: 'from-emerald-400 to-emerald-300' },
                { icon: '💎', name: '10k XP Club', unlocked: userXP >= 10000, color: 'from-cyan-400 to-cyan-300' },
              ].map((badge, i) => (
                <div key={i} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br ${badge.unlocked ? badge.color : 'from-slate-200 to-slate-100 opacity-50 grayscale'} border ${badge.unlocked ? 'border-white shadow-sm' : 'border-slate-200'} cursor-help relative group`}>
                  <span className="text-2xl drop-shadow-sm mb-1">{badge.icon}</span>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none font-bold">
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 9. Leaderboard */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Global Leaderboard</h3>
            <div className="space-y-3">
              {LEADERBOARD.map((user, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${user.name === 'You' ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}>
                  <div className="font-black text-slate-300 text-xs w-3 text-center">{user.rank}</div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm shadow-sm">{user.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm truncate ${user.name === 'You' ? 'text-indigo-700' : 'text-slate-700'}`}>{user.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-400">Level {user.level}</p>
                  </div>
                  <div className="text-xs font-black text-slate-600">{user.xp} <span className="text-[9px] text-slate-400">XP</span></div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 10. Recent Activity */}
          <GlassCard className="p-5">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Recent Activity</h3>
            {ACTIVITIES.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No recent activity.</p>}
            <div className="space-y-4">
              {ACTIVITIES.map((act, i) => (
                <div key={act.id} className="flex gap-3 relative">
                  {i !== ACTIVITIES.length - 1 && <div className="absolute left-2 top-5 w-px h-full bg-slate-100"></div>}
                  <div className="w-4 h-4 mt-1 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <act.icon className={act.color} size={8} strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{act.title}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{act.time}</p>
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
