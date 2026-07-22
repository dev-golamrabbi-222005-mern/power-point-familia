import React, { useState, useEffect } from 'react';
import { User, MealMenu, MealRecord, Deposit, DashboardStats, BazaarAssignment, BazaarExpense, WeeklyPayment } from '../types';
import { Coins, Utensils, Calendar, CalendarDays, Receipt, CreditCard, Clock, FileText, CheckCircle2, AlertTriangle, Send, ShoppingCart, TrendingUp, Wallet, CalendarRange, Eye, X, HelpCircle, Home, Zap, Wifi, UserCheck, Users, PieChart as PieChartIcon, Upload, Trash2, Sun, Moon, Image as ImageIcon, Settings } from 'lucide-react';

interface MemberDashboardProps {
  user: User;
  token: string;
  menus: MealMenu[];
  mealRate: number;
  onRefreshStats: () => void;
}

export default function MemberDashboard({ user, token, menus, mealRate, onRefreshStats }: MemberDashboardProps) {
  const [stats, setStats] = useState<DashboardStats['userStats'] | null>(null);
  const [myRecords, setMyRecords] = useState<MealRecord[]>([]);
  const [myDeposits, setMyDeposits] = useState<Deposit[]>([]);
  
  // Deposit Form State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depError, setDepError] = useState('');
  const [depSuccess, setDepSuccess] = useState('');
  const [depLoading, setDepLoading] = useState(false);

  // Bazaar state
  const [myAssignments, setMyAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [myExpenses, setMyExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [bazaarPairData, setBazaarPairData] = useState<any>(null);
  const [bazaarFormOpen, setBazaarFormOpen] = useState(false);
  const [bazaarAssignmentId, setBazaarAssignmentId] = useState('');
  const [bazaarDate, setBazaarDate] = useState('');
  const [bazaarItems, setBazaarItems] = useState('');
  const [bazaarCost, setBazaarCost] = useState('');
  const [bazaarRemarks, setBazaarRemarks] = useState('');
  const [bazaarLoading, setBazaarLoading] = useState(false);
  const [bazaarMsg, setBazaarMsg] = useState('');
  const [bazaarError, setBazaarError] = useState('');
  const [selectedBazaarDetail, setSelectedBazaarDetail] = useState<string | null>(null);
  const [showBazaarCalendar, setShowBazaarCalendar] = useState(false);
  
  // Public calendar data for the Activity Calendar
  const [publicAssignments, setPublicAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [publicExpenses, setPublicExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [mealSummary, setMealSummary] = useState<{ date: string; lunch: number; dinner: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);
  
  // Meal cancel state
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelSlots, setCancelSlots] = useState<{ date: string; mealType: 'lunch' | 'dinner' }[]>([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  
  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Meal booking temporary loader
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  // Auto-book opt-out state
  const [autoBookDisabled, setAutoBookDisabled] = useState(false);
  const [autoBookLoading, setAutoBookLoading] = useState(false);

  // Active tab for the menubar
  const [activeTab, setActiveTab] = useState<'dashboard' | 'finances' | 'ledger' | 'settings'>('dashboard');

  // House Ledger state
  const [ledgerData, setLedgerData] = useState<{
    monthlySnapshots: any[];
    perMemberDeposits: { userId: string; name: string; totalDeposited: number; depositCount: number }[];
    currentMonth: {
      month: string;
      label: string;
      totalDeposits: number;
      totalMealCost: number;
      totalBazaarExpenses: number;
      totalRefunds: number;
      netBalance: number;
      memberCount: number;
    };
  } | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchAutoBookPreference = async () => {
    try {
      const res = await fetch('/api/settings/auto-book', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAutoBookDisabled(data.autoBookDisabled);
      }
    } catch (e) {}
  };

  const fetchLedger = async () => {
    setLedgerLoading(true);
    try {
      const res = await fetch('/api/public/ledger', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setLedgerData(await res.json());
      }
    } catch (e) {
      // Silent fail
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleToggleAutoBook = async () => {
    setAutoBookLoading(true);
    try {
      const res = await fetch('/api/settings/auto-book', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoBookDisabled: !autoBookDisabled })
      });
      if (res.ok) {
        const data = await res.json();
        setAutoBookDisabled(data.autoBookDisabled);
      }
    } catch (e) {
      console.error('Auto-book toggle error', e);
    } finally {
      setAutoBookLoading(false);
    }
  };

  const fetchMemberData = async () => {
    try {
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsText = await statsRes.text();
      let statsData;
      try { statsData = JSON.parse(statsText); } catch { statsData = {}; }
      if (statsRes.ok) {
        setStats(statsData.userStats);
      }

      const recordsRes = await fetch('/api/records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordsText = await recordsRes.text();
      let recordsData;
      try { recordsData = JSON.parse(recordsText); } catch { recordsData = []; }
      if (recordsRes.ok) {
        setMyRecords(recordsData);
      }

      const depositsRes = await fetch('/api/deposits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const depositsText = await depositsRes.text();
      let depositsData;
      try { depositsData = JSON.parse(depositsText); } catch { depositsData = []; }
      if (depositsRes.ok) {
        setMyDeposits(depositsData);
      }
    } catch (error) {
      console.error('Error fetching member stats', error);
    }
  };

  const fetchBazaarData = async () => {
    try {
      const assignRes = await fetch('/api/bazaar/assign', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignRes.ok) {
        setMyAssignments(await assignRes.json());
      }
      const expRes = await fetch('/api/bazaar/expense', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (expRes.ok) {
        setMyExpenses(await expRes.json());
      }
    } catch (e) {
      console.error('Bazaar fetch error', e);
    }
  };

  const fetchPairData = async () => {
    try {
      const res = await fetch('/api/bazaar/pairs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setBazaarPairData(await res.json());
    } catch (e) {}
  };

  const fetchPublicCalendar = async () => {
    try {
      const res = await fetch('/api/public/calendar');
      if (res.ok) {
        const data = await res.json();
        setPublicAssignments(data.assignments || []);
        setPublicExpenses(data.expenses || []);
        setMealSummary(data.mealSummary || []);
      }
    } catch (e) {
      // Silent fail
    }
  };

  useEffect(() => {
    fetchMemberData();
    fetchBazaarData();
    fetchPairData();
    fetchPublicCalendar();
    fetchAutoBookPreference();
    fetchLedger();
  }, [token, menus]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepError('');
    setDepSuccess('');
    setDepLoading(true);

    if (!amount || Number(amount) <= 0) {
      setDepError('Please specify a positive deposit amount.');
      setDepLoading(false);
      return;
    }

    if (!transactionId.trim()) {
      setDepError('Please supply a valid payment transaction reference ID.');
      setDepLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          date: depositDate,
          paymentMethod,
          transactionId,
          remarks
        })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }

      if (!response.ok) {
        throw new Error(data.message || 'Deposit submission failed.');
      }

      setDepSuccess('Deposit ticket logged! Awaiting Manager authorization.');
      setAmount('');
      setTransactionId('');
      setRemarks('');
      
      fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      setDepError(err.message || 'Network error.');
    } finally {
      setDepLoading(false);
    }
  };

  const handleToggleMeal = async (date: string, mealType: 'lunch' | 'dinner', currentlyBooked: boolean) => {
    const newCount = currentlyBooked ? 0 : 1;
    const actionKey = `${date}-${mealType}`;
    setBookingLoading(actionKey);

    try {
      const response = await fetch('/api/records/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date,
          mealType,
          count: newCount
        })
      });

      if (!response.ok) {
        let errData;
        try { errData = JSON.parse(await response.text()); } catch { errData = {}; }
        throw new Error(errData.message || 'Meal booking change failed.');
      }

      await fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || 'Error updating booking');
    } finally {
      setBookingLoading(null);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size (max 5MB)
    if (!file.type.startsWith('image/')) {
      setBazaarError('Please select an image file (JPEG, PNG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setBazaarError('Image too large. Maximum size is 5MB.');
      return;
    }

    setReceiptFile(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const handleBazaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBazaarError('');
    setBazaarMsg('');
    setBazaarLoading(true);

    const items = bazaarItems.split(',').map(i => i.trim()).filter(i => i);
    if (items.length === 0) {
      setBazaarError('Please specify at least one item purchased.');
      setBazaarLoading(false);
      return;
    }

    const totalCost = Number(bazaarCost);
    if (!totalCost || totalCost <= 0) {
      setBazaarError('Please enter a valid total cost.');
      setBazaarLoading(false);
      return;
    }

    try {
      // Convert receipt to base64 if present
      let receiptImage: string | undefined;
      if (receiptFile) {
        receiptImage = await fileToBase64(receiptFile);
      }

      const response = await fetch('/api/bazaar/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignmentId: bazaarAssignmentId,
          date: bazaarDate,
          items: items.map(name => ({ name, cost: Math.round(totalCost / items.length) })),
          totalCost,
          remarks: bazaarRemarks,
          receiptImage,
        })
      });

      const bazaarText = await response.text();
      let bazaarData;
      try { bazaarData = JSON.parse(bazaarText); } catch { bazaarData = {}; }
      if (!response.ok) throw new Error(bazaarData.message || 'Failed to submit bazaar expense.');

      setBazaarMsg('Bazaar expense submitted! Awaiting verification.');
      fetchBazaarData();
      setBazaarFormOpen(false);
      setBazaarItems('');
      setBazaarCost('');
      setBazaarRemarks('');
      handleRemoveReceipt();
    } catch (err: any) {
      setBazaarError(err.message);
    } finally {
      setBazaarLoading(false);
    }
  };

  // Bulk cancel meals
  const handleCancelMeals = async () => {
    if (cancelSlots.length === 0) return;
    setCancelLoading(true);
    setCancelMsg('');
    try {
      const res = await fetch('/api/records/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slots: cancelSlots })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancel failed.');
      setCancelMsg(data.message);
      setCancelSlots([]);
      fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  // Bazaar delegation state
  const [delegateModal, setDelegateModal] = useState<{ assignmentId: string; date: string } | null>(null);
  const [delegateUserId, setDelegateUserId] = useState('');
  const [delegateLoading, setDelegateLoading] = useState(false);
  const [memberList, setMemberList] = useState<User[]>([]);

  const fetchMembersForDelegation = async () => {
    try {
      const res = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemberList(data.filter((u: User) => u.role === 'member' && u.id !== user.id && u.status === 'approved'));
      }
    } catch (e) {
      console.error('Member fetch error', e);
    }
  };

  const handleDelegateBazaar = async () => {
    if (!delegateModal || !delegateUserId) return;
    setDelegateLoading(true);
    try {
      const res = await fetch('/api/bazaar/assign', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignmentId: delegateModal.assignmentId,
          delegateToUserId: delegateUserId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delegation failed.');
      alert(data.message);
      fetchBazaarData();
      setDelegateModal(null);
      setDelegateUserId('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDelegateLoading(false);
    }
  };

  // Refund (Money-Back) state
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('bKash');
  const [refundMobile, setRefundMobile] = useState('');
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError('');
    setRefundSuccess('');
    setRefundLoading(true);

    if (!refundAmount || Number(refundAmount) <= 0) {
      setRefundError('Please enter a valid amount.');
      setRefundLoading(false);
      return;
    }

    if (Number(refundAmount) > (stats?.totalBalance || 0)) {
      setRefundError(`Insufficient balance. Your available balance is ${stats?.totalBalance.toFixed(0) || 0}৳.`);
      setRefundLoading(false);
      return;
    }

    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for the withdrawal.');
      setRefundLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(refundAmount),
          reason: refundReason,
          paymentMethod: refundMethod,
          mobileNumber: refundMobile,
        })
      });

      const refundText = await response.text();
      let refundData;
      try { refundData = JSON.parse(refundText); } catch { refundData = {}; }

      if (!response.ok) {
        throw new Error(refundData.message || 'Refund request failed.');
      }

      setRefundSuccess('Money-back request submitted! Awaiting Manager/Admin approval.');
      setRefundAmount('');
      setRefundReason('');
      setRefundMobile('');
      
      fetchMemberData();
      onRefreshStats();
    } catch (err: any) {
      setRefundError(err.message || 'Network error.');
    } finally {
      setRefundLoading(false);
    }
  };

  // Utility bills state
  const [utilities, setUtilities] = useState<{
    bills: any[];
    userPayments: any[];
    memberCount: number;
  } | null>(null);
  const [utilitiesLoading, setUtilitiesLoading] = useState(false);
  const [payAllocation, setPayAllocation] = useState<{
    type: 'rent' | 'electricity' | 'wifi' | 'servant_fee';
    amount: string;
  } | null>(null);
  const [payMsg, setPayMsg] = useState('');
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  const fetchUtilities = async () => {
    setUtilitiesLoading(true);
    try {
      const res = await fetch('/api/utilities', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUtilities(await res.json());
    } catch (e) {
      console.error('Utilities fetch error', e);
    } finally {
      setUtilitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, [token]);

  const handleBillPay = async (type: 'rent' | 'electricity' | 'wifi' | 'servant_fee') => {
    if (!payAllocation || !payAllocation.amount || Number(payAllocation.amount) <= 0) return;
    setPayError('');
    setPayMsg('');
    setPayLoading(true);

    try {
      const response = await fetch('/api/utilities/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          month: new Date().toISOString().slice(0, 7),
          type,
          amount: Number(payAllocation.amount),
        })
      });

      const payText = await response.text();
      let payData;
      try { payData = JSON.parse(payText); } catch { payData = {}; }
      if (!response.ok) throw new Error(payData.message || 'Payment failed.');

      setPayMsg(`Allocated ${payAllocation.amount}৳ to ${type.replace('_', ' ')}!`);
      fetchUtilities();
      onRefreshStats();
      setPayAllocation(null);
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const sortedMenus = [...menus].sort((a, b) => b.date.localeCompare(a.date));
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBazaar = myAssignments.find(a => a.date === todayStr && a.status === 'pending');
  const upcomingAssignments = myAssignments.filter(a => a.date >= todayStr && a.status === 'pending').sort((a, b) => a.date.localeCompare(b.date));

  const selectedExpenseDetail = selectedBazaarDetail 
    ? myExpenses.find(e => e.id === selectedBazaarDetail) 
    : null;
  const selectedAssignment = selectedBazaarDetail 
    ? myAssignments.find(a => a.id === selectedExpenseDetail?.assignmentId) 
    : null;

  // Activity Calendar helpers — Full Month Grid
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });

  const getDayInfo = (date: string) => {
    const assignments = publicAssignments.filter(a => a.date === date);
    const expenses = publicExpenses.filter(e => e.date === date);
    const dayMenus = menus.filter(m => m.date === date);
    const totalSpent = expenses.reduce((s, e) => s + e.totalCost, 0);
    const dayNames = assignments.map(a => a.userName).filter(Boolean);
    const dayMealSummary = mealSummary.find(m => m.date === date);
    const hasReceipt = expenses.some(e => !!e.receiptImage);
    return { assignments, expenses, menus: dayMenus, totalSpent, assignedTo: dayNames, mealCounts: dayMealSummary, hasReceipt };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ===== MEMBER MENUBAR ===== */}
      <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'finances'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
          }`}
        >
          <PieChartIcon className="w-3.5 h-3.5" />
          Finances
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Ledger
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === 'dashboard' && <>
      
      {/* Live Meal Rate Banner */}
      <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-teal-600/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Meal Rate</p>
            <p className="text-xl font-black text-zinc-100">
              {stats ? `${stats.liveMealRate.toFixed(2)}৳` : '--'} 
              <span className="text-xs font-normal text-zinc-400 ml-2">per meal (dynamic)</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Total Meals: <span className="font-bold text-zinc-200">{stats?.totalMealsCount || 0}</span></p>
          <p className="text-xs text-zinc-400">Meal Cost: <span className="font-bold text-zinc-200">{stats?.totalMealCost.toFixed(0)}৳</span></p>
        </div>
      </div>
      </>}

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === 'settings' && <>
      {/* Auto-Book Preference Toggle */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-200">Auto-Book Meals</p>
            <p className="text-[10px] text-zinc-500">{autoBookDisabled ? 'You have opted out of automatic meal bookings' : 'Meals will be auto-booked when Manager publishes menus'}</p>
          </div>
        </div>
        <button
          onClick={handleToggleAutoBook}
          disabled={autoBookLoading}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-all duration-200 cursor-pointer focus:outline-hidden disabled:opacity-50 shrink-0 ${
            autoBookDisabled ? 'bg-zinc-700' : 'bg-emerald-500'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            autoBookDisabled ? 'translate-x-1' : 'translate-x-5'
          }`} />
        </button>
      </div>
      </>}

      {/* ===== FINANCES TAB ===== */}
      {activeTab === 'finances' && <>

      {/* 1. Quick Financial Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Balance Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Available Balance</p>
            <h3 className={`text-2xl font-black mt-1 ${stats && stats.totalBalance < 100 ? 'text-red-400 animate-pulse' : 'text-zinc-100'}`}>
              {stats ? `${stats.totalBalance.toFixed(0)}৳` : '--'}
            </h3>
            {stats && stats.totalBalance < 100 && (
              <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> Balance critical. Deposit cash!
              </span>
            )}
            {stats && stats.totalBalance >= 100 && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Account standing safe
              </span>
            )}
          </div>
          <div className={`p-3 rounded-xl ${stats && stats.totalBalance < 100 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Approved Deposits</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats ? `${stats.totalDeposits}৳` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Total cash approved in ledger</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total Meals Count Card */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Meals Count</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats ? `${stats.totalMealsCount} Units` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Meals consumed in system</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Weekly Payment Status */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Weekly Payment</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {stats?.weeklyPaymentStatus 
                ? `${stats.weeklyPaymentStatus.paidAmount}/${stats.weeklyPaymentStatus.expectedAmount}৳`
                : 'Not Set'}
            </h3>
            <span className={`text-[10px] font-semibold flex items-center gap-1 mt-1 ${
              stats?.weeklyPaymentStatus?.status === 'paid' 
                ? 'text-emerald-400' 
                : stats?.weeklyPaymentStatus?.status === 'partial' 
                ? 'text-amber-400' 
                : 'text-zinc-500'
            }`}>
              <Wallet className="w-3 h-3" />
              {stats?.weeklyPaymentStatus?.status === 'paid' 
                ? 'This week paid ✓' 
                : stats?.weeklyPaymentStatus?.status === 'partial'
                ? 'Partial payment'
                : '500tk/week expected'}
            </span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ===== MY FINANCES SECTION ===== */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500" />
              My Finances — Utilities & Shared Bills
            </h3>
            <p className="text-xs text-zinc-400">Track house rent, electricity, WiFi, and servant fee payments across all members</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500">
              {stats?.utilities ? (
                <>
                  <span className="font-bold text-zinc-200">{stats.utilities.totalPaid}৳</span>
                  <span className="text-zinc-600"> / {stats.utilities.totalShare}৳</span>
                  <span className="text-zinc-600"> paid</span>
                </>
              ) : 'Loading...'}
            </span>
          </div>
        </div>

        {stats?.utilities ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Donut Chart + Overall Progress */}
            <div className="lg:col-span-5 space-y-6">
              {/* Donut Chart */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
                <div className="relative w-36 h-36 mb-3">
                  {/* Simple SVG Donut Chart */}
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="3"
                    />
                    {/* Paid portion */}
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${stats.utilities.overallPercentage}, ${100 - stats.utilities.overallPercentage}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-zinc-100">{stats.utilities.overallPercentage}%</span>
                    <span className="text-[10px] text-zinc-500">Paid</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-zinc-400">Paid: {stats.utilities.totalPaid}৳</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <span className="text-zinc-400">Due: {stats.utilities.totalShare - stats.utilities.totalPaid}৳</span>
                  </span>
                </div>
              </div>

              {/* Quick Payment Info */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-2">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Quick Summary</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Monthly Share</span>
                    <span className="font-bold text-zinc-200">{stats.utilities.totalShare}৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Paid</span>
                    <span className="font-bold text-emerald-400">{stats.utilities.totalPaid}৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Remaining</span>
                    <span className={`font-bold ${stats.utilities.totalShare - stats.utilities.totalPaid > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {stats.utilities.totalShare - stats.utilities.totalPaid}৳
                    </span>
                  </div>
                  <div className="border-t border-zinc-800 pt-1 mt-1 flex justify-between">
                    <span className="text-zinc-400">Your Meal Balance</span>
                    <span className={`font-bold ${(stats?.totalBalance || 0) < 0 ? 'text-red-400' : 'text-zinc-200'}`}>
                      {stats?.totalBalance.toFixed(0) || 0}৳
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Bill progress bars */}
            <div className="lg:col-span-7 space-y-5">
              {/* Rent */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                      <Home className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">House Rent</p>
                      <p className="text-[10px] text-zinc-500">Your share: {stats.utilities.rent.share}৳</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-zinc-100">{stats.utilities.rent.paid}৳</p>
                    <p className="text-[10px] text-zinc-500">/ {stats.utilities.rent.share}৳</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.utilities.rent.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${stats.utilities.rent.percentage >= 100 ? 'text-emerald-400' : stats.utilities.rent.percentage > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {stats.utilities.rent.percentage >= 100 ? '✓ Fully Paid' : stats.utilities.rent.percentage > 0 ? `${stats.utilities.rent.percentage}% Paid` : 'Not Paid'}
                  </span>
                  {stats.utilities.rent.percentage < 100 && (
                    <button
                      onClick={() => setPayAllocation({ type: 'rent', amount: String(stats.utilities.rent.share - stats.utilities.rent.paid) })}
                      className="text-[10px] px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Electricity */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Electricity Bill</p>
                      <p className="text-[10px] text-zinc-500">Your share: {stats.utilities.electricity.share}৳</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-zinc-100">{stats.utilities.electricity.paid}৳</p>
                    <p className="text-[10px] text-zinc-500">/ {stats.utilities.electricity.share}৳</p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.utilities.electricity.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${stats.utilities.electricity.percentage >= 100 ? 'text-emerald-400' : stats.utilities.electricity.percentage > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {stats.utilities.electricity.percentage >= 100 ? '✓ Fully Paid' : stats.utilities.electricity.percentage > 0 ? `${stats.utilities.electricity.percentage}% Paid` : 'Not Paid'}
                  </span>
                  {stats.utilities.electricity.percentage < 100 && (
                    <button
                      onClick={() => setPayAllocation({ type: 'electricity', amount: String(stats.utilities.electricity.share - stats.utilities.electricity.paid) })}
                      className="text-[10px] px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* WiFi */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Wifi className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">WiFi Bill</p>
                      <p className="text-[10px] text-zinc-500">Your share: {stats.utilities.wifi.share}৳</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-zinc-100">{stats.utilities.wifi.paid}৳</p>
                    <p className="text-[10px] text-zinc-500">/ {stats.utilities.wifi.share}৳</p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.utilities.wifi.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${stats.utilities.wifi.percentage >= 100 ? 'text-emerald-400' : stats.utilities.wifi.percentage > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {stats.utilities.wifi.percentage >= 100 ? '✓ Fully Paid' : stats.utilities.wifi.percentage > 0 ? `${stats.utilities.wifi.percentage}% Paid` : 'Not Paid'}
                  </span>
                  {stats.utilities.wifi.percentage < 100 && (
                    <button
                      onClick={() => setPayAllocation({ type: 'wifi', amount: String(stats.utilities.wifi.share - stats.utilities.wifi.paid) })}
                      className="text-[10px] px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Servant Fee */}
              <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <UserCheck className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">Servant Fee</p>
                      <p className="text-[10px] text-zinc-500">Your share: {stats.utilities.servantFee.share}৳</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-zinc-100">{stats.utilities.servantFee.paid}৳</p>
                    <p className="text-[10px] text-zinc-500">/ {stats.utilities.servantFee.share}৳</p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.utilities.servantFee.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold ${stats.utilities.servantFee.percentage >= 100 ? 'text-emerald-400' : stats.utilities.servantFee.percentage > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {stats.utilities.servantFee.percentage >= 100 ? '✓ Fully Paid' : stats.utilities.servantFee.percentage > 0 ? `${stats.utilities.servantFee.percentage}% Paid` : 'Not Paid'}
                  </span>
                  {stats.utilities.servantFee.percentage < 100 && (
                    <button
                      onClick={() => setPayAllocation({ type: 'servant_fee', amount: String(stats.utilities.servantFee.share - stats.utilities.servantFee.paid) })}
                      className="text-[10px] px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 text-sm">
            {utilitiesLoading ? 'Loading utility data...' : 'No utility bills configured for this month.'}
          </div>
        )}
      </div>

      {/* Payment Allocation Modal */}
      {payAllocation && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                Pay {payAllocation.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <button onClick={() => setPayAllocation(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {payError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}
              {payMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{payMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Amount (৳)</label>
                <input
                  type="number"
                  value={payAllocation.amount}
                  onChange={(e) => setPayAllocation({ ...payAllocation, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                This amount will be recorded as paid toward {payAllocation.type.replace('_', ' ')}. 
                Make sure you have sufficient balance in your deposits.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setPayAllocation(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBillPay(payAllocation.type)}
                  disabled={payLoading || !payAllocation.amount || Number(payAllocation.amount) <= 0}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {payLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>}

      {/* ===== DASHBOARD TAB (continued) ===== */}
      {activeTab === 'dashboard' && <>

      {/* Today's Bazaar Alert */}
      {todayBazaar && (
        <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100">Today is Your Bazaar Day!</h3>
              <p className="text-xs text-zinc-400 mt-1">Click below to submit your purchase details and receipt.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setBazaarAssignmentId(todayBazaar.id);
              setBazaarDate(todayBazaar.date);
              setBazaarFormOpen(true);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Enter Details
          </button>
        </div>
      )}

      {/* ===== ACTIVITY CALENDAR ===== */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-emerald-500" />
          <h3 className="font-display font-bold text-lg text-zinc-100">Activity Calendar</h3>
          <span className="ml-auto text-xs text-zinc-500">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="overflow-x-auto -mx-2 px-2 pb-1">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 min-w-[420px] sm:min-w-0">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Full Month Grid */}
        <div className="grid grid-cols-7 gap-1 min-w-[420px] sm:min-w-0">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {monthDates.map((date) => {
            const dayNum = new Date(date).getDate();
            const info = getDayInfo(date);
            const isPast = new Date(date) < new Date(new Date().toDateString());
            const isToday = date === new Date().toISOString().split('T')[0];
            const hasActivity = info.assignments.length > 0 || info.expenses.length > 0 || info.menus.length > 0 || (info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0));

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                className={`relative p-1.5 rounded-lg border text-left transition-all duration-200 min-h-[72px] cursor-pointer ${
                  isToday
                    ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : isPast && !hasActivity
                    ? 'bg-zinc-900/10 border-transparent opacity-30'
                    : 'bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/30 hover:bg-zinc-900/60'
                } ${selectedDate === date ? 'ring-2 ring-emerald-500/30' : ''} ${!hasActivity ? 'pointer-events-none' : ''}`}
              >
                <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {dayNum}
                </span>
                <div className="flex flex-col gap-px mt-0.5">
                  {info.assignments.length > 0 && (
                    <span className="text-[7px] text-emerald-400 font-bold leading-tight truncate">🛒 {info.assignments.length}</span>
                  )}
                  {info.totalSpent > 0 && (
                    <span className="text-[7px] text-amber-400 font-bold leading-tight truncate">
                      💰{info.totalSpent}৳{info.hasReceipt && '📎'}
                    </span>
                  )}
                  {info.menus.length > 0 && (
                    <span className="text-[7px] text-teal-400 font-bold leading-tight truncate">
                      🍽️ {info.menus.filter(m => m.mealType === 'lunch').length > 0 ? 'L' : ''}{info.menus.filter(m => m.mealType === 'lunch').length > 0 && info.menus.filter(m => m.mealType === 'dinner').length > 0 ? '+' : ''}{info.menus.filter(m => m.mealType === 'dinner').length > 0 ? 'D' : ''}
                    </span>
                  )}
                  {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                    <span className="text-[7px] text-purple-400 font-bold leading-tight truncate">
                      📊 {info.mealCounts.lunch > 0 ? info.mealCounts.lunch : ''}{info.mealCounts.lunch > 0 && info.mealCounts.dinner > 0 ? '/' : ''}{info.mealCounts.dinner > 0 ? info.mealCounts.dinner : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        </div>
      </div>
      </>}

      {/* ===== LEDGER TAB ===== */}
      {activeTab === 'ledger' && <>

      {/* ===== HOUSE LEDGER ===== */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Receipt className="w-5 h-5 text-amber-500" />
          <h3 className="font-display font-bold text-lg text-zinc-100">House Ledger — Monthly Overview</h3>
          <span className="ml-auto text-xs text-zinc-500">
            {ledgerData?.currentMonth.label || 'Loading...'}
          </span>
        </div>

        {ledgerLoading && !ledgerData ? (
          <div className="text-center py-8 text-zinc-500 text-sm">Loading ledger data...</div>
        ) : ledgerData ? (
          <div className="space-y-6">
            {/* Current Month Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Deposited</p>
                <p className="text-lg font-black text-emerald-400 mt-1">{ledgerData.currentMonth.totalDeposits.toFixed(0)}৳</p>
              </div>
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Meal Cost</p>
                <p className="text-lg font-black text-purple-400 mt-1">{ledgerData.currentMonth.totalMealCost.toFixed(0)}৳</p>
              </div>
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Bazaar + Refunds</p>
                <p className="text-lg font-black text-amber-400 mt-1">{ledgerData.currentMonth.totalBazaarExpenses.toFixed(0)}৳</p>
              </div>
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Net Balance</p>
                <p className={`text-lg font-black mt-1 ${ledgerData.currentMonth.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ledgerData.currentMonth.netBalance.toFixed(0)}৳
                </p>
              </div>
            </div>

            {/* Per-Member Deposit Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                Who Deposited This Month ({ledgerData.perMemberDeposits.length} member{ledgerData.perMemberDeposits.length !== 1 ? 's' : ''})
              </h4>
              {ledgerData.perMemberDeposits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                        <th className="pb-3 pl-2">Member</th>
                        <th className="pb-3 text-right">Deposit Count</th>
                        <th className="pb-3 text-right pr-2">Total Deposited</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {ledgerData.perMemberDeposits.map((m) => (
                        <tr key={m.userId} className="hover:bg-zinc-900/30">
                          <td className="py-3 pl-2 font-bold text-zinc-200">{m.name}</td>
                          <td className="py-3 text-right text-zinc-400">{m.depositCount} deposit{m.depositCount !== 1 ? 's' : ''}</td>
                          <td className="py-3 pr-2 text-right font-black text-emerald-400">{m.totalDeposited.toFixed(0)}৳</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-zinc-500 text-xs">
                  No approved deposits recorded this month yet.
                </div>
              )}
            </div>

            {/* Monthly History */}
            <div>
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                Monthly History ({ledgerData.monthlySnapshots.length} month{ledgerData.monthlySnapshots.length !== 1 ? 's' : ''})
              </h4>
              {ledgerData.monthlySnapshots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                        <th className="pb-3 pl-2">Month</th>
                        <th className="pb-3 text-right">Deposits</th>
                        <th className="pb-3 text-right">Meal Cost</th>
                        <th className="pb-3 text-right">Bazaar Exp.</th>
                        <th className="pb-3 text-right">Refunds</th>
                        <th className="pb-3 text-right pr-2">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {ledgerData.monthlySnapshots.map((m) => {
                        const isPositive = m.netBalance >= 0;
                        return (
                          <tr key={m.month} className="hover:bg-zinc-900/30">
                            <td className="py-3 pl-2 font-bold text-zinc-200">{m.label}</td>
                            <td className="py-3 text-right text-emerald-400 font-semibold">{m.deposits.toFixed(0)}৳</td>
                            <td className="py-3 text-right text-purple-400 font-semibold">{m.mealCost.toFixed(0)}৳</td>
                            <td className="py-3 text-right text-amber-400 font-semibold">{m.bazaarExpenses.toFixed(0)}৳</td>
                            <td className="py-3 text-right text-red-400 font-semibold">{m.refundsApproved.toFixed(0)}৳</td>
                            <td className={`py-3 pr-2 text-right font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}{m.netBalance.toFixed(0)}৳
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-zinc-500 text-xs">
                  No historical data available yet.
                </div>
              )}
            </div>            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500 text-sm">Unable to load ledger data.</div>
          )}
      </div>
      </>}

      {/* ===== DASHBOARD TAB (continued) ===== */}
      {activeTab === 'dashboard' && <>

      {/* 2. Interactive Calendar Bookings & Deposit Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Meal Booking Calendar Panel */}
        <div className="lg:col-span-7 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Meal Scheduler & Calendar
              </h3>
              <p className="text-xs text-zinc-400">Book, increase, or cancel your meals for current/upcoming menus</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md font-bold">
                Rate: {stats?.liveMealRate.toFixed(2) || mealRate}৳ / Meal
              </span>
            </div>
          </div>

          {sortedMenus.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {sortedMenus.map((menu) => {
                const booking = myRecords.find(r => r.date === menu.date && r.mealType === menu.mealType);
                const bookedCount = booking ? booking.count : 0;
                const isBooked = bookedCount > 0;
                const actionKey = `${menu.date}-${menu.mealType}`;
                const isToday = menu.date === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={menu.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isToday 
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/15' 
                        : 'bg-[#18181b] border-zinc-800'
                    }`}
                  >
                    {/* Header row: date, meal type, today badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-zinc-400">
                        {new Date(menu.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`capitalize text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        {menu.mealType}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded animate-pulse">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Menu items + Toggle row */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Menu items */}
                      <div className="flex flex-wrap items-center gap-1.5 flex-1">
                        <span className="text-xs font-semibold text-zinc-500">Menu:</span>
                        {menu.items.map((item, idx) => (
                          <span key={idx} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg shadow-2xs">
                            {item}
                          </span>
                        ))}
                      </div>

                      {/* Toggle switch */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className={`text-[11px] font-bold ${isBooked ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {isBooked ? `${bookedCount} Meal${bookedCount > 1 ? 's' : ''} (${(bookedCount * (stats?.liveMealRate || mealRate)).toFixed(0)}৳)` : 'Not booked'}
                          </p>
                          <p className="text-[9px] text-zinc-600">
                            {menu.mealType === 'lunch' ? 'Lunch' : 'Dinner'}
                          </p>
                        </div>

                        <button
                          id={`toggle-${actionKey}`}
                          disabled={bookingLoading === actionKey}
                          onClick={() => handleToggleMeal(menu.date, menu.mealType, isBooked)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isBooked 
                              ? 'bg-emerald-500' 
                              : 'bg-zinc-700 hover:bg-zinc-600'
                          }`}
                          role="switch"
                          aria-checked={isBooked}
                        >
                          <span
                            className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                              isBooked ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          >
                            {bookingLoading === actionKey ? (
                              <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            ) : isBooked ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <X className="w-3 h-3 text-zinc-400" />
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-350 font-semibold text-sm">No meal menus are published yet</p>
              <p className="text-zinc-500 text-xs mt-1">Check back later when the system Manager uploads the menus.</p>
            </div>
          )}
        </div>

        {/* Right Column: Deposit & Bazaar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Bazaar Pairs Rotation */}
          {bazaarPairData && bazaarPairData.pairs && bazaarPairData.pairs.length > 0 && (
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm mb-6">
              <h3 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-400" />
                Bazaar Pairs — Who Goes Next
              </h3>
              <div className="space-y-2">
                {bazaarPairData.pairs.map((pair: any, idx: number) => {
                  const isNext = idx === bazaarPairData.currentPairIndex;
                  return (
                    <div key={pair.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                      isNext ? 'bg-blue-500/15 border-blue-500/30' : 'bg-zinc-900/50 border-zinc-800'
                    }`}>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${isNext ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`} />
                      <span className={`text-xs font-bold ${isNext ? 'text-blue-400' : 'text-zinc-300'}`}>
                        {pair.member1Name} <span className="text-zinc-500">&</span> {pair.member2Name}
                      </span>
                      {isNext && <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded-full ml-auto">● NEXT</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meal Cancel Section */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                Cancel Meals
              </h3>
              <button
                onClick={() => setShowCancelForm(!showCancelForm)}
                className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
              >
                {showCancelForm ? 'Close' : 'Cancel Meals'}
              </button>
            </div>

            {showCancelForm && (
              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500">Select dates and meal types to cancel. You can cancel multiple at once.</p>
                
                {/* Multi-day selector */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Select Slots to Cancel</label>
                  <div className="max-h-[180px] overflow-y-auto space-y-1.5 border border-zinc-800 rounded-xl p-2 bg-zinc-900/30">
                    {sortedMenus.filter(m => m.date >= todayStr).slice(0, 14).map((menu) => {
                      const isBooked = myRecords.some(r => r.date === menu.date && r.mealType === menu.mealType && r.count > 0);
                      const isSelected = cancelSlots.some(s => s.date === menu.date && s.mealType === menu.mealType);
                      if (!isBooked) return null;
                      return (
                        <label
                          key={`${menu.id}-cancel`}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-red-500/15 border-red-500/30'
                              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setCancelSlots(prev =>
                                isSelected
                                  ? prev.filter(s => !(s.date === menu.date && s.mealType === menu.mealType))
                                  : [...prev, { date: menu.date, mealType: menu.mealType }]
                              );
                            }}
                            className="w-3.5 h-3.5 accent-red-500 cursor-pointer"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-xs text-zinc-300">
                              {new Date(menu.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`capitalize text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                            }`}>{menu.mealType}</span>
                          </div>
                        </label>
                      );
                    })}
                    {sortedMenus.filter(m => m.date >= todayStr).filter(m => myRecords.some(r => r.date === m.date && r.mealType === m.mealType && r.count > 0)).length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">No booked meals to cancel</p>
                    )}
                  </div>
                </div>

                {cancelSlots.length > 0 && (
                  <div className="flex items-center justify-between p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <span className="text-xs text-zinc-300">{cancelSlots.length} slot(s) selected</span>
                    <button
                      onClick={handleCancelMeals}
                      disabled={cancelLoading}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {cancelLoading ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><X className="w-3 h-3" /> Cancel {cancelSlots.length} Meal(s)</>
                      )}
                    </button>
                  </div>
                )}

                {cancelMsg && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{cancelMsg}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bazaar Calendar Quick View */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                My Bazaar Assignments
              </h3>
              <button
                onClick={() => setShowBazaarCalendar(!showBazaarCalendar)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
              >
                {showBazaarCalendar ? 'Hide' : `View All (${myAssignments.length})`}
              </button>
            </div>

            {upcomingAssignments.length > 0 && !showBazaarCalendar && (
              <div className="space-y-2">
                {upcomingAssignments.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-zinc-300 font-medium">
                        {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setBazaarAssignmentId(a.id);
                          setBazaarDate(a.date);
                          setBazaarFormOpen(true);
                        }}
                        className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setDelegateModal({ assignmentId: a.id, date: a.date });
                          fetchMembersForDelegation();
                        }}
                        className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"
                      >
                        Delegate
                      </button>
                    </div>
                  </div>
                ))}
                {upcomingAssignments.length > 3 && (
                  <p className="text-[10px] text-zinc-500 text-center">+{upcomingAssignments.length - 3} more assignments</p>
                )}
              </div>
            )}

            {showBazaarCalendar && (
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {myAssignments.length > 0 ? myAssignments.sort((a, b) => a.date.localeCompare(b.date)).map((a) => {
                  const expense = myExpenses.find(e => e.assignmentId === a.id);
                  const isPending = a.status === 'pending';
                  return (
                    <div key={a.id} className="p-2.5 bg-zinc-900/50 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-300">
                          {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          a.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                          a.status === 'submitted' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                          {a.shoppingList.slice(0, 2).join(', ')}{a.shoppingList.length > 2 ? '...' : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          {isPending && (
                            <button
                              onClick={() => {
                                setDelegateModal({ assignmentId: a.id, date: a.date });
                                fetchMembersForDelegation();
                              }}
                              className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 cursor-pointer"
                            >
                              Delegate
                            </button>
                          )}
                          {expense && (
                            <button
                              onClick={() => setSelectedBazaarDetail(expense.id)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-zinc-500 text-center py-4">No bazaar assignments yet</p>
                )}
              </div>
            )}
          </div>

          {/* Deposit Form */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                Submit Deposit Ticket
              </h3>
              <p className="text-xs text-zinc-400">Log payments to top-up your balance</p>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {depError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{depError}</span>
                </div>
              )}
              {depSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{depSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Amount (Taka)</label>
                <input
                  id="dep-amount"
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Method</label>
                  <select
                    id="dep-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Hand Cash</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Deposit Date</label>
                  <input
                    id="dep-date"
                    type="date"
                    required
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Transaction ID / Ref</label>
                <input
                  id="dep-trx"
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TRX102948"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Remarks / Reference Note</label>
                <textarea
                  id="dep-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Deposited for July meals"
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                id="btn-submit-deposit"
                type="submit"
                disabled={depLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {depLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Deposit Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Money-Back Request Form */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-500" />
                Request Money Back
              </h3>
              <p className="text-xs text-zinc-400">Withdraw surplus balance from your account</p>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              {refundError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{refundError}</span>
                </div>
              )}
              {refundSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{refundSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Amount (৳)</label>
                <input
                  id="refund-amount"
                  type="number"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max: ${stats?.totalBalance.toFixed(0) || 0}৳`}
                  max={stats?.totalBalance || 0}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[9px] text-zinc-600 mt-1">Available balance: {stats?.totalBalance.toFixed(0) || 0}৳</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Reason for Withdrawal</label>
                <textarea
                  id="refund-reason"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Excess balance, leaving the mess, etc."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <select
                    id="refund-method"
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Cash">Hand Cash</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input
                    id="refund-mobile"
                    type="text"
                    value={refundMobile}
                    onChange={(e) => setRefundMobile(e.target.value)}
                    placeholder="For mobile banking"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-refund"
                type="submit"
                disabled={refundLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {refundLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Money-Back Request</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Bazaar Delegation Modal */}
      {delegateModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setDelegateModal(null)}>
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                Delegate Bazaar — {delegateModal.date}
              </h3>
              <button onClick={() => setDelegateModal(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-400">
                Choose a member to take your bazaar duty on <strong className="text-zinc-200">{delegateModal.date}</strong>.
                Your profile will still record an extra bazaar date.
              </p>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Delegate To</label>
                <select
                  value={delegateUserId}
                  onChange={(e) => setDelegateUserId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select a member...</option>
                  {memberList.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-zinc-400">
                <p className="font-bold text-zinc-300">⚠️ Note:</p>
                <p>Both you and the delegated member will get +1 bazaar count. This helps ensure fair rotation tracking.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setDelegateModal(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelegateBazaar}
                  disabled={delegateLoading || !delegateUserId}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {delegateLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Delegate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bazaar Submission Modal */}
      {bazaarFormOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                Submit Bazaar Details
              </h3>
              <button onClick={() => setBazaarFormOpen(false)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBazaarSubmit} className="p-6 space-y-4">
              {bazaarError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{bazaarError}</span>
                </div>
              )}
              {bazaarMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{bazaarMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" required value={bazaarDate} onChange={(e) => setBazaarDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Items Purchased (comma separated)</label>
                <input type="text" required value={bazaarItems} onChange={(e) => setBazaarItems(e.target.value)} placeholder="e.g. Chicken 2kg, Rice 5kg, Onion 3kg" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Total Cost (৳)</label>
                <input type="number" required value={bazaarCost} onChange={(e) => setBazaarCost(e.target.value)} placeholder="e.g. 1550" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Remarks / Store Note</label>
                <textarea value={bazaarRemarks} onChange={(e) => setBazaarRemarks(e.target.value)} placeholder="Any details about the purchase..." rows={2} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm resize-none" />
              </div>

              {/* Receipt Image Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Receipt Image (optional)</label>
                
                {receiptPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
                      title="Remove receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-[10px] text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded-full">
                      {receiptFile?.name || 'Receipt'}
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 hover:border-emerald-500/40 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        Click to upload receipt image
                      </span>
                      <span className="text-[9px] text-zinc-600">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button type="submit" disabled={bazaarLoading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer">
                {bazaarLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Bazaar Expense
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bazaar Detail Popup */}
      {selectedBazaarDetail && selectedExpenseDetail && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedBazaarDetail(null)}>
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-100">Bazaar Purchase Details</h3>
              <button onClick={() => setSelectedBazaarDetail(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Date: {new Date(selectedExpenseDetail.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedExpenseDetail.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                  selectedExpenseDetail.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                  {selectedExpenseDetail.status}
                </span>
              </div>

              {selectedAssignment && selectedAssignment.shoppingList.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5">Requested Items</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAssignment.shoppingList.map((item, i) => (
                      <span key={i} className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Purchased Items</p>
                <div className="space-y-1.5">
                  {selectedExpenseDetail.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-zinc-300">{item.name}</span>
                      <span className="text-zinc-400 font-mono">{item.cost}৳</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-200">Total Cost</span>
                <span className="text-lg font-black text-emerald-400">{selectedExpenseDetail.totalCost}৳</span>
              </div>

              {selectedExpenseDetail.remarks && (
                <p className="text-xs text-zinc-500 italic">Note: {selectedExpenseDetail.remarks}</p>
              )}

              {selectedExpenseDetail.receiptImage && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Receipt Image</p>
                  <div
                    className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 cursor-pointer group relative"
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        win.document.write(`<img src="${selectedExpenseDetail.receiptImage}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                      }
                    }}
                  >
                    <img
                      src={selectedExpenseDetail.receiptImage}
                      alt="Receipt"
                      className="w-full h-36 object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1">Click to view full size</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Deposit ledger tracking statement history */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-zinc-800 pb-4 mb-5">
          <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Your Deposit History & Slips
          </h3>
          <p className="text-xs text-zinc-400">Track all cash inputs and authorization statuses in the system ledger</p>
        </div>

        {myDeposits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Reference Trx</th>
                  <th className="pb-3">Payment Gateway</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pl-4">Note / Remarks</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {myDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-zinc-900/35">
                    <td className="py-3.5 pl-2 font-medium text-zinc-350 font-sans">
                      {new Date(dep.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-zinc-200 font-semibold">{dep.transactionId}</td>
                    <td className="py-3.5">
                      <span className="bg-zinc-850 text-zinc-300 font-bold px-2 py-0.5 rounded text-xs">
                        {dep.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-zinc-100">{dep.amount}৳</td>
                    <td className="py-3.5 pl-4 text-xs text-zinc-400 max-w-[200px] truncate" title={dep.remarks}>
                      {dep.remarks || '--'}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        dep.status === 'approved' 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : dep.status === 'rejected' 
                          ? 'bg-red-500/15 text-red-400' 
                          : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dep.status === 'approved' 
                            ? 'bg-emerald-500' 
                            : dep.status === 'rejected' 
                            ? 'bg-red-500' 
                            : 'bg-amber-500 animate-pulse'
                        }`} />
                        <span className="capitalize">{dep.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm font-semibold">No deposits logged yet</p>
            <p className="text-xs text-zinc-500 mt-1">Top-up your wallet using the submission form on the right.</p>
          </div>
        )}
      </div>

      {/* Enlarged Receipt Modal */}
      {enlargedReceipt && (
        <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={() => setEnlargedReceipt(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setEnlargedReceipt(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-200 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={enlargedReceipt} alt="Receipt full size" className="w-full h-auto rounded-2xl shadow-2xl border border-zinc-800" />
          </div>
        </div>
      )}

      {/* Bazaar Detail Popup */}
      {selectedDate && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedDate(null)}>
          <div 
            className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <p className="text-xs text-zinc-500">Bazaar & Purchase Details</p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const info = getDayInfo(selectedDate);
                const hasActivity = info.assignments.length > 0 || info.expenses.length > 0 || info.menus.length > 0;
                
                if (!hasActivity) {
                  return (
                    <div className="text-center py-8">
                      <CalendarDays className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400 font-medium">No activity on this date</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Meal Booking Counts */}
                    {info.mealCounts && (info.mealCounts.lunch > 0 || info.mealCounts.dinner > 0) && (
                      <div className="p-4 bg-gradient-to-r from-purple-600/10 to-indigo-600/5 border border-purple-500/20 rounded-xl mb-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <Utensils className="w-4 h-4" /> Meal Bookings
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
                            <Sun className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-zinc-100">{info.mealCounts.lunch}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Lunch</p>
                          </div>
                          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
                            <Moon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-lg font-black text-zinc-100">{info.mealCounts.dinner}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Dinner</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Today's Menus */}
                    {info.menus.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                          <Utensils className="w-4 h-4" /> Daily Menus — Lunch & Dinner
                        </h4>
                        {info.menus.map((menu) => (
                          <div key={menu.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded ${menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'}`}>{menu.mealType}</span>
                              <span className="text-xs font-semibold text-emerald-400">Est: {menu.estimatedCost}৳</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {menu.items.map((item, i) => (
                                <span key={i} className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg">{item}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bazaar Assignments */}
                    {info.assignments.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" /> Bazaar Assignments
                        </h4>
                        {info.assignments.map((assignment) => (
                          <div key={assignment.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-zinc-200 text-sm">Assigned to: {assignment.userName || 'Member'}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                assignment.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                                assignment.status === 'submitted' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>{assignment.status}</span>
                            </div>
                            {assignment.shoppingList.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {assignment.shoppingList.map((item, i) => (
                                  <span key={i} className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-lg">{item}</span>
                                ))}
                              </div>
                            )}
                            {assignment.delegatedFrom && (
                              <p className="text-[10px] text-amber-400 mt-2">🔄 Delegated from original assignee</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expenses */}
                    {info.expenses.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Receipt className="w-4 h-4" /> Expenses ({info.totalSpent}৳ total)
                        </h4>
                        {info.expenses.map((expense) => (
                          <div key={expense.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-zinc-200 text-sm">Purchases by: {expense.userName || 'Member'}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-emerald-400">{expense.totalCost}৳</span>
                                {expense.receiptImage && (
                                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-blue-500/20" title="Receipt uploaded">
                                    <ImageIcon className="w-3 h-3" /> Receipt
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  expense.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                                  expense.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>{expense.status}</span>
                              </div>
                            </div>
                            {/* Itemized expense breakdown */}
                            <div className="space-y-1.5 mb-3">
                              {expense.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                  <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-zinc-200">{item.cost}৳</span>
                                </div>
                              ))}
                            </div>
                            {/* Receipt image */}
                            {expense.receiptImage && (
                              <div className="mt-2 pt-3 border-t border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5" /> Receipt
                                  </span>
                                  <button
                                    onClick={() => setEnlargedReceipt(expense.receiptImage!)}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                                  >
                                    View Full Size
                                  </button>
                                </div>
                                <div className="relative">
                                  <img
                                    src={expense.receiptImage}
                                    alt="Purchase receipt"
                                    className="w-full max-h-32 object-contain rounded-lg bg-zinc-900/70 border border-zinc-800 cursor-pointer"
                                    onClick={() => setEnlargedReceipt(expense.receiptImage!)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      </>}

    </div>
  );
}
