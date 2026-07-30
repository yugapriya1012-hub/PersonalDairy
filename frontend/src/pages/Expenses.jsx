import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Download, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import apiClient from '../api/apiClient';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-xl shadow-slate-200/20 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const CATEGORY_COLORS = {
  'Food': '#f43f5e',
  'Transport': '#3b82f6',
  'Shopping': '#8b5cf6',
  'Health': '#10b981',
  'Entertainment': '#f59e0b',
  'Other': '#6366f1'
};

export default function Expenses() {
  const [transactions, setTransactions] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Date selection state (YYYY-MM)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/expenses');
      setTransactions(res || []);
    } catch (e) {
      console.error('Failed to load expenses', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseAmount || isNaN(expenseAmount)) return;
    
    const amount = parseFloat(expenseAmount);
    try {
      await apiClient.post('/expenses', {
        amount,
        category: expenseCategory,
        description: expenseDesc,
        date: new Date().toISOString().split('T')[0] // today's date
      });
      setExpenseAmount('');
      setExpenseDesc('');
      fetchExpenses(); // Refresh data
    } catch (e) {
      console.error('Failed to add expense', e);
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  // Derived state for the selected month
  const selectedMonthString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (!txn.date) return false;
      const date = new Date(txn.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const spentThisMonth = useMemo(() => {
    return filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  }, [filteredTransactions]);

  const expenseData = useMemo(() => {
    const data = {};
    filteredTransactions.forEach(txn => {
      if (!data[txn.category]) data[txn.category] = 0;
      data[txn.category] += txn.amount;
    });
    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other']
    }));
  }, [filteredTransactions]);

  // Aggregate daily spending for the month chart
  const weeklySpending = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayTotal = filteredTransactions
        .filter(t => {
           // careful: new Date('2026-07-30') uses UTC. Safer to split by hyphen.
           const parts = t.date.split('-'); 
           return parts.length === 3 && parseInt(parts[2]) === i;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      data.push({ day: i.toString(), amount: dayTotal });
    }
    return data;
  }, [filteredTransactions, selectedMonth, selectedYear]);


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Wallet className="text-emerald-600" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Expense Tracker</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your daily spending and budget.</p>
          </div>
        </div>
      </header>

      {/* Month Picker */}
      <GlassCard className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 min-w-[200px] justify-center">
            <Calendar className="text-emerald-500" /> {selectedMonthString}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight size={24} className="text-slate-600" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 font-medium">Total Spent this Month</p>
          <p className="text-3xl font-bold text-emerald-600">${spentThisMonth.toFixed(2)}</p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Wallet className="text-emerald-500" /> Expense Manager
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-slate-700 mb-4">Add Expense</h4>
            <div className="space-y-4">
              <input 
                type="number" 
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount ($)" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <select 
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
              <input 
                type="text" 
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Description" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <button 
                onClick={handleAddExpense}
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus size={18} /> Add Expense
              </button>
            </div>

            <div className="mt-6">
              <h5 className="font-bold text-slate-700 mb-3 text-sm">Transactions in {selectedMonthString}</h5>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredTransactions.map(txn => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{txn.category}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">{txn.description || 'No description'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">${txn.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400">{txn.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No expenses recorded in this month.</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-700 mb-4">Spending Categories</h4>
            <div className="h-[220px]">
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                   No data for chart
                 </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-100">
          <h4 className="font-bold text-slate-700 mb-4">Daily Trend ({selectedMonthString})</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySpending}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
