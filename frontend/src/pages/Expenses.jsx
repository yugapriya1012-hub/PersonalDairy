import { useState, useEffect } from 'react';
import GlassCard from '../components/UI/GlassCard';
import { Wallet, Plus, CreditCard } from 'lucide-react';
import apiClient from '../api/apiClient';

export default function Expenses() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const res = await apiClient.get('/expenses');
      setExpenses(res || []);
    } catch (e) {
      console.error('Failed to load expenses', e);
    }
  };

  const addExpense = async () => {
    if (!amount) return;
    try {
      await apiClient.post('/expenses', {
        amount: parseFloat(amount),
        category,
        description,
        date
      });
      setAmount('');
      setDescription('');
      loadExpenses();
    } catch (e) {
      console.error('Failed to add expense', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
            <Wallet className="text-pink-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>
        </div>
      </header>

      <GlassCard className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount ($)"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50"
            />
          </div>
          <div className="md:col-span-1">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50"
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (Optional)"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50"
            />
          </div>
        </div>
        <button 
          onClick={addExpense}
          className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-md shadow-pink-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Expense
        </button>
      </GlassCard>

      <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <CreditCard className="text-pink-500" size={24} /> Recent Expenses
        </h2>
        
        {expenses.map((exp, idx) => (
          <GlassCard key={idx} className="flex justify-between items-center py-4">
            <div>
              <h3 className="font-bold text-slate-700">{exp.category}</h3>
              <p className="text-sm text-slate-500">{exp.description || 'No description'} • {exp.date}</p>
            </div>
            <div className="text-xl font-bold text-pink-600">
              ${exp.amount.toFixed(2)}
            </div>
          </GlassCard>
        ))}
        {expenses.length === 0 && <p className="text-slate-500">No expenses recorded yet.</p>}
      </div>
    </div>
  );
}
