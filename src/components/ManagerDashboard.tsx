import React, { useState, useEffect } from 'react';
import { User, MealMenu, MealRecord, Deposit, DashboardStats, BazaarAssignment, BazaarExpense, RefundRequest } from '../types';
import { ChefHat, Plus, Trash2, Edit3, ClipboardList, Check, X, Calendar, CalendarDays, DollarSign, Users, RefreshCw, AlertCircle, TrendingUp, HelpCircle, ShoppingCart, CalendarRange, AlertTriangle, Bell, Send, Eye, UserCheck, CheckCircle2, Search, UserX, Sun, Moon, Image as ImageIcon, Receipt, Utensils, Wallet } from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  token: string;
  menus: MealMenu[];
  mealRate: number;
  onRefreshMenus: () => void;
}

export default function ManagerDashboard({ user, token, menus, mealRate, onRefreshMenus }: ManagerDashboardProps) {
  const [managerStats, setManagerStats] = useState<DashboardStats['managerStats'] | null>(null);
  const [allRecords, setAllRecords] = useState<MealRecord[]>([]);
  const [allDeposits, setAllDeposits] = useState<(Deposit & { userEmail?: string })[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);

  // Refund requests
  const [refundRequests, setRefundRequests] = useState<(RefundRequest)[]>([]);

  // Bazaar state
  const [bazaarAssignments, setBazaarAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [bazaarExpenses, setBazaarExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);

  // Menu form state
  const [menuId, setMenuId] = useState('');
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuType, setMenuType] = useState<'lunch' | 'dinner'>('lunch');
  const [menuItemsText, setMenuItemsText] = useState('');
  const [menuCost, setMenuCost] = useState('50');
  const [menuError, setMenuError] = useState('');
  const [menuSuccess, setMenuSuccess] = useState('');
  const [menuLoading, setMenuLoading] = useState(false);

  // Auto-book toggle state
  const [autoBookEnabled, setAutoBookEnabled] = useState(true);
  const [autoBookLoading, setAutoBookLoading] = useState(false);

  // Meal refund state
  const [mealRefundUserId, setMealRefundUserId] = useState('');
  const [mealRefundAmount, setMealRefundAmount] = useState('');
  const [mealRefundReason, setMealRefundReason] = useState('');
  const [mealRefundError, setMealRefundError] = useState('');
  const [mealRefundSuccess, setMealRefundSuccess] = useState('');
  const [mealRefundLoading, setMealRefundLoading] = useState(false);
  const [showMealRefundForm, setShowMealRefundForm] = useState(false);

  // Manager meal cancel state
  const [managerCancelUserId, setManagerCancelUserId] = useState('');
  const [managerCancelDate, setManagerCancelDate] = useState('');
  const [managerCancelMealType, setManagerCancelMealType] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [managerCancelLoading, setManagerCancelLoading] = useState(false);
  const [managerCancelMsg, setManagerCancelMsg] = useState('');

  // Bazaar pairs state
  const [pairData, setPairData] = useState<any>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [pairFormOpen, setPairFormOpen] = useState(false);
  const [pairMember1, setPairMember1] = useState('');
  const [pairMember2, setPairMember2] = useState('');
  const [pairError, setPairError] = useState('');
  const [pairSuccess, setPairSuccess] = useState('');
  const [pairCreating, setPairCreating] = useState(false);

  // Bazaar assignment form
  const [bazaarUserId, setBazaarUserId] = useState('');
  const [bazaarDate, setBazaarDate] = useState('');
  const [bazaarShoppingList, setBazaarShoppingList] = useState('');
  const [bazaarAssignError, setBazaarAssignError] = useState('');
  const [bazaarAssignSuccess, setBazaarAssignSuccess] = useState('');
  const [bazaarAssignLoading, setBazaarAssignLoading] = useState(false);
  const [showBazaarForm, setShowBazaarForm] = useState(false);
  const [selectedBazaarDetail, setSelectedBazaarDetail] = useState<string | null>(null);

  // Public calendar data for the Activity Calendar
  const [publicAssignments, setPublicAssignments] = useState<(BazaarAssignment & { userName?: string })[]>([]);
  const [publicExpenses, setPublicExpenses] = useState<(BazaarExpense & { userName?: string })[]>([]);
  const [mealSummary, setMealSummary] = useState<{ date: string; lunch: number; dinner: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [enlargedReceipt, setEnlargedReceipt] = useState<string | null>(null);

  // Active view filters
  const [depositFilter, setDepositFilter] = useState<'pending' | 'all'>('pending');
  const [refundFilter, setRefundFilter] = useState<'pending' | 'all'>('pending');
  const [refundPage, setRefundPage] = useState(1);
  const [refundSearch, setRefundSearch] = useState('');
  const [refundDateFrom, setRefundDateFrom] = useState('');
  const [refundDateTo, setRefundDateTo] = useState('');
  const REFUND_PAGE_SIZE = 20;
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'bazaar' | 'finances' | 'history'>('overview');

  const fetchManagerData = async () => {
    try {
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setManagerStats(statsData.managerStats);
      }

      const recordsRes = await fetch('/api/records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();
      if (recordsRes.ok) {
        setAllRecords(recordsData);
      }

      const depositsRes = await fetch('/api/deposits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const depositsData = await depositsRes.json();
      if (depositsRes.ok) {
        setAllDeposits(depositsData);
      }

      const usersRes = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setSystemUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching manager details', error);
    }
  };

  const fetchRefundRequests = async () => {
    try {
      const res = await fetch('/api/refunds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRefundRequests(await res.json());
    } catch (e) {
      console.error('Refund fetch error', e);
    }
  };

  const handleRefundStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/refunds/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const refundStatusText = await res.text();
      let refundStatusData;
      try { refundStatusData = JSON.parse(refundStatusText); } catch { refundStatusData = {}; }
      if (!res.ok) throw new Error(refundStatusData.message || 'Status update failed.');
      fetchRefundRequests();
      fetchManagerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchBazaarData = async () => {
    try {
      const assignRes = await fetch('/api/bazaar/assign', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assignRes.ok) setBazaarAssignments(await assignRes.json());

      const expRes = await fetch('/api/bazaar/expense', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (expRes.ok) setBazaarExpenses(await expRes.json());
    } catch (e) {
      console.error('Bazaar fetch error', e);
    }
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

  const fetchPairData = async () => {
    try {
      const res = await fetch('/api/bazaar/pairs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPairData(await res.json());
    } catch (e) {
      console.error('Pair fetch error', e);
    }
  };

  const handleCreatePair = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairError('');
    setPairSuccess('');
    setPairCreating(true);
    if (!pairMember1 || !pairMember2) {
      setPairError('Select both members.');
      setPairCreating(false);
      return;
    }
    try {
      const res = await fetch('/api/bazaar/pairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ member1Id: pairMember1, member2Id: pairMember2 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create pair.');
      setPairSuccess(data.message);
      setPairFormOpen(false);
      setPairMember1('');
      setPairMember2('');
      fetchPairData();
      fetchBazaarData();
    } catch (err: any) {
      setPairError(err.message);
    } finally {
      setPairCreating(false);
    }
  };

  const handleDeletePair = async (pairId: string) => {
    if (!window.confirm('Remove this pair?')) return;
    try {
      await fetch(`/api/bazaar/pairs?id=${pairId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPairData();
    } catch (e) {
      console.error('Delete pair error', e);
    }
  };

  const handleAdvancePair = async () => {
    setAdvanceLoading(true);
    try {
      const res = await fetch('/api/bazaar/pairs/advance', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPairData();
        fetchBazaarData();
      } else {
        alert(data.message || 'Advance failed.');
      }
    } catch (e) {
      console.error('Advance error', e);
    } finally {
      setAdvanceLoading(false);
    }
  };

  const handleToggleAutoBook = async () => {
    setAutoBookLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ autoBookMeals: !autoBookEnabled })
      });
      if (res.ok) {
        setAutoBookEnabled(!autoBookEnabled);
      }
    } catch (e) {
      console.error('Auto-book toggle error', e);
    } finally {
      setAutoBookLoading(false);
    }
  };

  // Handle manager-initiated meal cancellation
  const handleManagerCancelMeal = async () => {
    if (!managerCancelUserId || !managerCancelDate) return;
    setManagerCancelLoading(true);
    setManagerCancelMsg('');
    try {
      const slots = managerCancelMealType === 'both'
        ? [{ date: managerCancelDate, mealType: 'lunch' as const }, { date: managerCancelDate, mealType: 'dinner' as const }]
        : [{ date: managerCancelDate, mealType: managerCancelMealType }];

      const res = await fetch('/api/records/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slots, targetUserId: managerCancelUserId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cancel failed.');
      setManagerCancelMsg(data.message);
      fetchManagerData();
      setManagerCancelDate('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setManagerCancelLoading(false);
    }
  };

  // Submit meal refund
  const handleMealRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMealRefundError('');
    setMealRefundSuccess('');
    setMealRefundLoading(true);
    try {
      const res = await fetch('/api/refunds/meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: mealRefundUserId,
          amount: Number(mealRefundAmount),
          reason: mealRefundReason || 'Manager-initiated meal refund',
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Refund failed.');
      setMealRefundSuccess(data.message);
      fetchManagerData();
      setShowMealRefundForm(false);
      setMealRefundAmount('');
      setMealRefundReason('');
    } catch (err: any) {
      setMealRefundError(err.message);
    } finally {
      setMealRefundLoading(false);
    }
  };

  const [initiateResetLoading, setInitiateResetLoading] = useState(false);
  const [resetStatusMsg, setResetStatusMsg] = useState('');

  const handleInitiateMonthEnd = async () => {
    if (!window.confirm('Are you sure you want to initiate Month-End Reset? This will calculate total month bazaar expenses, live meal rate, and carry-forward balances, sending the reset request to Admin for approval.')) return;
    setInitiateResetLoading(true);
    setResetStatusMsg('');
    try {
      const res = await fetch('/api/month-end', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setResetStatusMsg(data.message);
        fetchManagerData();
      } else {
        alert(data.message || 'Failed to initiate month-end reset.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred.');
    } finally {
      setInitiateResetLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
    fetchBazaarData();
    fetchRefundRequests();
    fetchPairData();
    fetchPublicCalendar();
  }, [token, menus]);

  useEffect(() => {
    if (managerStats) {
      setAutoBookEnabled(managerStats.autoBookEnabled);
    }
  }, [managerStats?.autoBookEnabled]);

  // Reset refund page when search/filter changes
  useEffect(() => {
    setRefundPage(1);
  }, [refundSearch, refundDateFrom, refundDateTo, refundFilter]);

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuError('');
    setMenuSuccess('');
    setMenuLoading(true);

    const items = menuItemsText.split(',').map(item => item.trim()).filter(item => item.length > 0);
    if (items.length === 0) {
      setMenuError('Specify at least one menu food item.');
      setMenuLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...(menuId ? { id: menuId } : {}),
          date: menuDate,
          mealType: menuType,
          items,
          estimatedCost: Number(menuCost)
        })
      });

      const menuSubmitText = await response.text();
      let menuSubmitData;
      try { menuSubmitData = JSON.parse(menuSubmitText); } catch { menuSubmitData = {}; }
      if (!response.ok) throw new Error(menuSubmitData.message || 'Failed to save menu.');

      setMenuSuccess(menuId ? 'Menu updated successfully!' : 'Daily menu published successfully!');
      setMenuId('');
      setMenuItemsText('');
      setMenuCost('50');
      onRefreshMenus();
      fetchManagerData();
    } catch (err: any) {
      setMenuError(err.message || 'Error occurred.');
    } finally {
      setMenuLoading(false);
    }
  };

  const handleEditMenu = (menu: MealMenu) => {
    setMenuId(menu.id);
    setMenuDate(menu.date);
    setMenuType(menu.mealType);
    setMenuItemsText(menu.items.join(', '));
    setMenuCost(menu.estimatedCost.toString());
    setMenuError('');
    setMenuSuccess('');
    setActiveTab('overview');
  };

  const handleDeleteMenu = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        onRefreshMenus();
        fetchManagerData();
      } else {
        const d = await response.json();
        alert(d.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDepositStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/deposits/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const depStatusText = await response.text();
      let depStatusData;
      try { depStatusData = JSON.parse(depStatusText); } catch { depStatusData = {}; }
      if (!response.ok) throw new Error(depStatusData.message || 'Status update failed.');
      fetchManagerData();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleBazaarAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setBazaarAssignError('');
    setBazaarAssignSuccess('');
    setBazaarAssignLoading(true);

    if (!bazaarUserId || !bazaarDate) {
      setBazaarAssignError('Select a member and date.');
      setBazaarAssignLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bazaar/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: bazaarUserId,
          date: bazaarDate,
          shoppingList: bazaarShoppingList.split(',').map(i => i.trim()).filter(i => i)
        })
      });
      const assignText = await response.text();
      let assignData;
      try { assignData = JSON.parse(assignText); } catch { assignData = {}; }
      if (!response.ok) throw new Error(assignData.message || 'Assignment failed.');
      setBazaarAssignSuccess('Bazaar assigned successfully!');
      fetchBazaarData();
      setShowBazaarForm(false);
      setBazaarDate('');
      setBazaarShoppingList('');
    } catch (err: any) {
      setBazaarAssignError(err.message);
    } finally {
      setBazaarAssignLoading(false);
    }
  };

  const handleDeleteBazaarAssignment = async (id: string) => {
    if (!window.confirm('Delete this bazaar assignment?')) return;
    try {
      await fetch(`/api/bazaar/assign/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBazaarData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBazaarExpenseStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/bazaar/expense/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.message || 'Update failed.');
      }
      fetchBazaarData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Skip a bazaar member (mark as skipped — absent/on leave)
  const handleSkipBazaarMember = async (id: string, userName: string) => {
    if (!window.confirm(`Mark ${userName} as skipped for this bazaar? This will count as completed for rotation purposes.`)) return;
    try {
      const response = await fetch(`/api/bazaar/assign/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'skipped' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to skip member.');
      }
      if (data.autoAdvanced) {
        alert(data.message);
      }
      fetchBazaarData();
      fetchPairData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const todayString = new Date().toISOString().split('T')[0];
  const activeBookingsByDateAndType = allRecords.reduce((acc: Record<string, number>, rec) => {
    const key = `${rec.date}::${rec.mealType}`;
    acc[key] = (acc[key] || 0) + rec.count;
    return acc;
  }, {});

  const displayedDeposits = allDeposits.filter(d => 
    depositFilter === 'all' ? true : d.status === 'pending'
  );

  // Get members only for assignment dropdown
  const memberList = systemUsers.filter(u => u.role === 'member' && u.status === 'approved');

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'requests', label: 'Requests', icon: ClipboardList },
    { id: 'bazaar', label: 'Bazaar', icon: ShoppingCart },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'history', label: 'History', icon: Calendar },
  ] as const;

  // Filter refund requests — search + date range
  const filteredRefunds = refundRequests.filter(r => {
    const matchesSearch = !refundSearch || (r.userName && r.userName.toLowerCase().includes(refundSearch.toLowerCase()));
    const matchesDateFrom = !refundDateFrom || new Date(r.createdAt) >= new Date(refundDateFrom + 'T00:00:00');
    const matchesDateTo = !refundDateTo || new Date(r.createdAt) <= new Date(refundDateTo + 'T23:59:59');
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });
  const filteredPendingCount = filteredRefunds.filter(r => r.status === 'pending').length;
  const displayedRefunds = refundFilter === 'all'
    ? [...filteredRefunds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : filteredRefunds.filter(r => r.status === 'pending');
  const refundTotalPages = Math.max(1, Math.ceil(displayedRefunds.length / REFUND_PAGE_SIZE));
  const safeRefundPage = Math.min(refundPage, refundTotalPages);
  const refundStartIndex = (safeRefundPage - 1) * REFUND_PAGE_SIZE;
  const paginatedRefunds = displayedRefunds.slice(refundStartIndex, refundStartIndex + REFUND_PAGE_SIZE);

  const selectedExpenseDetail = selectedBazaarDetail 
    ? bazaarExpenses.find(e => e.id === selectedBazaarDetail) 
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

  // Monthly history computation
  interface MonthlySnapshot {
    month: string;
    label: string;
    deposits: number;
    mealsCount: number;
    mealCost: number;
    bazaarExpenses: number;
    refundsApproved: number;
    netBalance: number;
    memberCount: number;
  }
  const computeMonthlyData = (): MonthlySnapshot[] => {
    const monthMap = new Map<string, {
      deposits: number;
      mealsCount: number;
      bazaarExpenses: number;
      refundsApproved: number;
      members: Set<string>;
    }>();

    const addToMonth = (dateStr: string, cb: (entry: { deposits: number; mealsCount: number; bazaarExpenses: number; refundsApproved: number; members: Set<string> }) => void) => {
      const month = dateStr.slice(0, 7);
      if (!monthMap.has(month)) {
        monthMap.set(month, { deposits: 0, mealsCount: 0, bazaarExpenses: 0, refundsApproved: 0, members: new Set() });
      }
      cb(monthMap.get(month)!);
    };

    allDeposits.filter(d => d.status === 'approved').forEach(d => {
      addToMonth(d.date, e => { e.deposits += d.amount; if (d.userId) e.members.add(d.userId); });
    });

    allRecords.forEach(r => {
      addToMonth(r.date, e => { e.mealsCount += r.count; if (r.userId) e.members.add(r.userId); });
    });

    bazaarExpenses.filter(e => e.status === 'approved').forEach(e => {
      addToMonth(e.date, entry => { entry.bazaarExpenses += e.totalCost; });
    });

    refundRequests.filter(r => r.status === 'approved').forEach(r => {
      addToMonth(r.createdAt, e => { e.refundsApproved += r.amount; });
    });

    const rate = managerStats?.liveMealRate || mealRate;
    const months = Array.from(monthMap.entries()).sort(([a], [b]) => b.localeCompare(a));

    return months.map(([month, data]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      deposits: data.deposits,
      mealsCount: data.mealsCount,
      mealCost: Math.round(data.mealsCount * rate * 100) / 100,
      bazaarExpenses: data.bazaarExpenses,
      refundsApproved: data.refundsApproved,
      netBalance: Math.round((data.deposits - (data.mealsCount * rate) - data.bazaarExpenses - data.refundsApproved) * 100) / 100,
      memberCount: data.members.size,
    }));
  };

  const monthlyData = computeMonthlyData();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Permanent Month-End Reset Control Banner (For Testing & Operations) */}
      <div className="bg-gradient-to-r from-purple-900/30 via-zinc-900 to-amber-900/20 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <RefreshCw className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2">
              Month-End Reset & Carry-Forward Engine
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">Manager Action</span>
            </h4>
            <p className="text-xs text-zinc-400">
              {managerStats?.pendingResetRequest
                ? '⚠️ A Month-End Reset request is currently PENDING Admin approval.'
                : 'Calculate total month expenses, live meal rate, member carry-forward balances, and send request to Admin.'}
            </p>
            {resetStatusMsg && <p className="text-xs text-emerald-400 font-bold mt-1">{resetStatusMsg}</p>}
          </div>
        </div>
        <button
          onClick={handleInitiateMonthEnd}
          disabled={initiateResetLoading || !!managerStats?.pendingResetRequest}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${initiateResetLoading ? 'animate-spin' : ''}`} />
          {managerStats?.pendingResetRequest ? 'Reset Request Pending Approval' : 'Initiate Month-End Reset'}
        </button>
      </div>

      {/* Live Rate Banner + Auto-Book Toggle */}
      <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-teal-600/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Meal Rate (Dynamic)</p>
            <p className="text-xl font-black text-zinc-100">
              {managerStats ? `${managerStats.liveMealRate.toFixed(2)}৳` : '--'} 
              <span className="text-xs font-normal text-zinc-400 ml-2">
                Total Cost: {managerStats?.totalSystemMealCost.toFixed(0) || 0}৳ / {managerStats?.totalSystemMealsCount || 0} Meals
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-Book Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 rounded-xl border border-zinc-700/50">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Auto-Book</span>
            <button
              onClick={handleToggleAutoBook}
              disabled={autoBookLoading}
              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-all duration-200 cursor-pointer focus:outline-hidden disabled:opacity-50 ${
                autoBookEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                autoBookEnabled ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {managerStats?.deficitMembers && managerStats.deficitMembers.length > 0 && (
            <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {managerStats.deficitMembers.length} in deficit
            </span>
          )}
        </div>
      </div>

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

      {/* Tab Navigation */}
      <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <>
          {/* System Stats / Manager KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500/20 rounded-2xl p-5 shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider font-mono">Total Cash in Hand</p>
                  <h3 className="text-2xl font-black text-white mt-1">{managerStats ? `${(managerStats.totalCashInHand ?? 0).toFixed(0)}৳` : '--'}</h3>
                  <p className="text-[10px] text-emerald-200 font-semibold mt-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Physical Cash held by Manager</p>
                </div>
                <span className="p-2.5 bg-emerald-700 text-emerald-100 rounded-xl"><DollarSign className="w-5 h-5" /></span>
              </div>
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Collected Fund</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{managerStats ? `${managerStats.totalSystemDeposits}৳` : '--'}</h3>
                <span className="text-[10px] text-zinc-400 mt-1 block">Sum of all approved member deposits</span>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><ClipboardList className="w-6 h-6" /></div>
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Expense So Far</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{managerStats ? `${(managerStats.totalBazaarExpenses ?? 0).toFixed(0)}৳` : '--'}</h3>
                <span className="text-[10px] text-zinc-400 mt-1 block">Sum of all approved bazaar expenses</span>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><ShoppingCart className="w-6 h-6" /></div>
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Members</p>
                <h3 className="text-2xl font-black text-zinc-100 mt-1">{managerStats ? `${managerStats.membersCount} Users` : '--'}</h3>
                <span className="text-[10px] text-zinc-400 font-medium mt-1 block">Standard members rostered</span>
              </div>
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl"><Users className="w-6 h-6" /></div>
            </div>
          </div>

          {/* Menu Publisher & Kitchen Planner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-emerald-500" />
                    {menuId ? 'Edit Published Menu' : 'Publish Daily Meal Menu'}
                  </h3>
                  <p className="text-xs text-zinc-400">Manage plates, food items, and meal budgets for the Familia</p>
                </div>
                {menuId && (
                  <button onClick={() => { setMenuId(''); setMenuItemsText(''); setMenuCost('50'); }} className="text-xs text-emerald-400 hover:underline font-bold cursor-pointer">
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleMenuSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {menuError && <div className="md:col-span-12 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{menuError}</span></div>}
                {menuSuccess && <div className="md:col-span-12 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /><span>{menuSuccess}</span></div>}

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Target Date</label>
                  <input type="date" required value={menuDate} onChange={(e) => setMenuDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Meal Slot</label>
                  <select value={menuType} onChange={(e) => setMenuType(e.target.value as any)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm">
                    <option value="lunch">Lunch Slot</option>
                    <option value="dinner">Dinner Slot</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Est. Cost (৳)</label>
                  <input type="number" required value={menuCost} onChange={(e) => setMenuCost(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm" />
                </div>
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Food items (Comma Separated)</span>
                    <span className="text-[10px] text-zinc-500 capitalize font-mono">Will be split on commas</span>
                  </label>
                  <input type="text" required value={menuItemsText} onChange={(e) => setMenuItemsText(e.target.value)} placeholder="e.g. Steamed Rice, Chicken Bhuna, Red Lentils, Onion Salad" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm" />
                </div>
                <div className="md:col-span-12 flex justify-end pt-2">
                  <button type="submit" disabled={menuLoading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer">
                    {menuLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /><span>{menuId ? 'Save Menu Changes' : 'Publish Menu'}</span></>}
                  </button>
                </div>
              </form>

              <div className="border-t border-zinc-800 pt-6">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Published Menu Directory</h4>
                {menus.length > 0 ? (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                    {[...menus].sort((a,b) => b.date.localeCompare(a.date)).map(menu => (
                      <div key={menu.id} className="p-3.5 bg-[#18181b] rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-zinc-300">{menu.date}</span>
                            <span className={`capitalize text-[10px] font-extrabold px-1.5 py-0.5 rounded ${menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'}`}>{menu.mealType}</span>
                            <span className="text-xs font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-lg">Est: {menu.estimatedCost}৳</span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-2 flex flex-wrap gap-1.5">
                            {menu.items.map((item, i) => <span key={i} className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-300">{item}</span>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEditMenu(menu)} className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteMenu(menu.id)} className="p-1.5 bg-zinc-900 hover:bg-red-500/10 rounded-lg text-red-400 border border-zinc-800 hover:border-red-500/20 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-6 text-xs text-zinc-550">No active meal menus published.</div>}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-500" /> Kitchen Plates Cook Book</h3>
                <p className="text-xs text-zinc-400">Live plate tallies required based on member bookings</p>
              </div>
              <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
                {menus.length > 0 ? [...menus].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5).map(menu => {
                  const key = `${menu.date}::${menu.mealType}`;
                  const platesNeeded = activeBookingsByDateAndType[key] || 0;
                  const isToday = menu.date === todayString;
                  return (
                    <div key={menu.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isToday ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' : 'bg-[#18181b]/80 border-zinc-800'}`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-300">{menu.date}</span>
                          <span className={`capitalize text-[9px] font-extrabold px-1.5 py-0.2 rounded ${menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'}`}>{menu.mealType}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-[180px]">{menu.items.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                          <span className="text-sm font-black text-zinc-100">{platesNeeded}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">Plates</span>
                        </div>
                        {isToday && <span className="text-[9px] text-red-400 font-bold block mt-1 animate-pulse">Live plates needed today</span>}
                      </div>
                    </div>
                  );
                }) : <div className="text-center py-12 text-xs text-zinc-500">Publish a menu to track active kitchen bookings.</div>}
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-xs flex gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <span>This list counts actual plates booked by Members, helping prevent excessive cooking and grocery waste!</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* === REQUESTS TAB === */}
      {activeTab === 'requests' && (
        <>
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Member Deposits Audit Desk
              </h3>
              <p className="text-xs text-zinc-400">Authorize or reject payment vouchers submitted by Familia members</p>
            </div>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg self-start sm:self-auto border border-zinc-800/80">
              <button onClick={() => setDepositFilter('pending')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${depositFilter === 'pending' ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' : 'text-zinc-400 hover:text-zinc-200 border-transparent'}`}>Pending Only</button>
              <button onClick={() => setDepositFilter('all')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${depositFilter === 'all' ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' : 'text-zinc-400 hover:text-zinc-200 border-transparent'}`}>All Deposits</button>
            </div>
          </div>

          {displayedDeposits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pl-2">User / Email</th>
                    <th className="pb-3">Submitted</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Transaction Reference</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 pl-4">Remarks</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {displayedDeposits.map((dep) => {
                    const submitter = systemUsers.find(u => u.id === dep.userId);
                    return (
                      <tr key={dep.id} className="hover:bg-zinc-900/30">
                        <td className="py-3.5 pl-2">
                          <p className="font-bold text-zinc-150">{submitter ? submitter.name : (dep.userName || 'Unknown')}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{submitter ? submitter.email : (dep.userEmail || '')}</p>
                        </td>
                        <td className="py-3.5 text-zinc-400 font-medium text-xs">{new Date(dep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3.5"><span className="bg-zinc-850 text-zinc-300 font-bold px-2 py-0.5 rounded text-[11px]">{dep.paymentMethod}</span></td>
                        <td className="py-3.5 font-mono text-xs text-zinc-250 font-semibold">{dep.transactionId}</td>
                        <td className="py-3.5 text-right font-black text-zinc-100">{dep.amount}৳</td>
                        <td className="py-3.5 pl-4 text-xs text-zinc-400 max-w-[150px] truncate" title={dep.remarks}>{dep.remarks || '--'}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${dep.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : dep.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                            <span className={`w-1 h-1 rounded-full ${dep.status === 'approved' ? 'bg-emerald-500' : dep.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="capitalize">{dep.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          {dep.status === 'pending' ? (
                            <div className="inline-flex gap-1">
                              <button onClick={() => handleUpdateDepositStatus(dep.id, 'approved')} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all cursor-pointer" title="Approve"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleUpdateDepositStatus(dep.id, 'rejected')} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer" title="Reject"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ) : <span className="text-zinc-600 text-xs font-mono select-none">Audited</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-850 text-zinc-500 text-xs">
              No deposits found under the chosen filter.
            </div>
          )}
        </div>

        {/* Initiate Meal Refund Section */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                Initiate Meal Refund (Manager)
              </h3>
              <p className="text-xs text-zinc-400">Directly refund money to a member's balance</p>
            </div>
            <button
              onClick={() => setShowMealRefundForm(!showMealRefundForm)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {showMealRefundForm ? 'Cancel' : '+ New Refund'}
            </button>
          </div>

          {showMealRefundForm && (
            <form onSubmit={handleMealRefundSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 pb-4 border-b border-zinc-800">
              {mealRefundError && <div className="md:col-span-12 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{mealRefundError}</span></div>}
              {mealRefundSuccess && <div className="md:col-span-12 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /><span>{mealRefundSuccess}</span></div>}

              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Member</label>
                <select required value={mealRefundUserId} onChange={(e) => setMealRefundUserId(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm">
                  <option value="">Select member...</option>
                  {memberList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Amount (৳)</label>
                <input type="number" required value={mealRefundAmount} onChange={(e) => setMealRefundAmount(e.target.value)} placeholder="e.g. 500" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
              </div>
              <div className="md:col-span-12">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Reason</label>
                <input type="text" value={mealRefundReason} onChange={(e) => setMealRefundReason(e.target.value)} placeholder="e.g. Excess meal deduction refund" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
              </div>
              <div className="md:col-span-12 flex justify-end">
                <button type="submit" disabled={mealRefundLoading || !mealRefundUserId || !mealRefundAmount} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                  {mealRefundLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Process Refund</>}
                </button>
              </div>
            </form>
          )}

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] text-zinc-400">
            <p className="font-bold text-zinc-300">💡 Note:</p>
            <p>This refund will be deducted from the member's available balance. The member can also request refunds themselves via their dashboard.</p>
          </div>
        </div>

        {/* Manager Meal Cancel Section */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Cancel Member Meals (Manager)
              </h3>
              <p className="text-xs text-zinc-400">Cancel meals for any member for specific dates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Member</label>
              <select
                value={managerCancelUserId}
                onChange={(e) => setManagerCancelUserId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm"
              >
                <option value="">Select member...</option>
                {memberList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={managerCancelDate}
                onChange={(e) => setManagerCancelDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Meal Type</label>
              <select
                value={managerCancelMealType}
                onChange={(e) => setManagerCancelMealType(e.target.value as 'lunch' | 'dinner')}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm"
              >
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="md:col-span-12 flex justify-end">
              <button
                onClick={handleManagerCancelMeal}
                disabled={managerCancelLoading || !managerCancelUserId || !managerCancelDate}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {managerCancelLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><X className="w-3.5 h-3.5" /> Cancel Meal</>
                )}
              </button>
            </div>
            {managerCancelMsg && (
              <div className="md:col-span-12 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{managerCancelMsg}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[11px] text-zinc-400">
            <p className="font-bold text-zinc-300">💡 Note:</p>
            <p>This will remove the meal booking for the selected member. The amount will not be deducted from their balance.</p>
          </div>
        </div>

        {/* Money-Back Requests Section */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-5">
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Money-Back Requests
              </h3>
              <p className="text-xs text-zinc-400">Authorize or reject member withdrawal requests</p>
            </div>
            <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg self-start sm:self-auto border border-zinc-800/80">
              <button onClick={() => { setRefundFilter('pending'); setRefundPage(1); }} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${refundFilter === 'pending' ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' : 'text-zinc-400 hover:text-zinc-200 border-transparent'}`}>Pending ({filteredPendingCount})</button>
              <button onClick={() => { setRefundFilter('all'); setRefundPage(1); }} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${refundFilter === 'all' ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' : 'text-zinc-400 hover:text-zinc-200 border-transparent'}`}>All History</button>
            </div>

            {/* Search & Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={refundSearch}
                  onChange={(e) => setRefundSearch(e.target.value)}
                  placeholder="Search by member name..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-xs placeholder:text-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {refundSearch && (
                  <button onClick={() => setRefundSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="date"
                    value={refundDateFrom}
                    onChange={(e) => setRefundDateFrom(e.target.value)}
                    placeholder="From"
                    className="w-[130px] pl-8 pr-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-[11px] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="date"
                    value={refundDateTo}
                    onChange={(e) => setRefundDateTo(e.target.value)}
                    placeholder="To"
                    className="w-[130px] pl-8 pr-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-[11px] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(refundSearch || refundDateFrom || refundDateTo) && (
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-medium">Filters active:</span>
                {refundSearch && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                    Name: "{refundSearch}"
                    <button onClick={() => setRefundSearch('')} className="hover:text-emerald-200 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {refundDateFrom && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                    From: {refundDateFrom}
                    <button onClick={() => setRefundDateFrom('')} className="hover:text-blue-200 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {refundDateTo && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                    To: {refundDateTo}
                    <button onClick={() => setRefundDateTo('')} className="hover:text-blue-200 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

          </div>

          {displayedRefunds.length > 0 ? (
            <div className="space-y-3">
              {paginatedRefunds.map((ref) => (
                <div key={ref.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  ref.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/15' :
                  ref.status === 'rejected' ? 'bg-red-500/5 border-red-500/15' :
                  'bg-zinc-900/50 border-zinc-800'
                }`}>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-200 text-sm">{ref.userName || 'Unknown'}</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full">{ref.paymentMethod}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ref.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                        ref.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          ref.status === 'approved' ? 'bg-emerald-500' :
                          ref.status === 'rejected' ? 'bg-red-500' :
                          'bg-amber-500 animate-pulse'
                        }`} />
                        <span className="capitalize">{ref.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Amount: <span className={`font-black ${ref.status === 'approved' ? 'text-emerald-400' : 'text-zinc-200'}`}>{ref.amount}৳</span>
                    </p>
                    <p className="text-xs text-zinc-500">Reason: {ref.reason}</p>
                    {ref.mobileNumber && <p className="text-xs text-zinc-500">Mobile: {ref.mobileNumber}</p>}
                    <p className="text-[10px] text-zinc-600">Requested: {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {ref.status !== 'pending' && ref.processedAt && (
                      <p className="text-[10px] text-zinc-600">
                        Processed: {new Date(ref.processedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {ref.remarks ? ` — Note: ${ref.remarks}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {ref.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleRefundStatus(ref.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRefundStatus(ref.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        ref.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {ref.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {refundTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-2">
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Showing {refundStartIndex + 1}–{Math.min(refundStartIndex + REFUND_PAGE_SIZE, displayedRefunds.length)} of {displayedRefunds.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRefundPage(p => Math.max(1, p - 1))}
                      disabled={safeRefundPage <= 1}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg transition-all border cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:hover:bg-zinc-900"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(refundTotalPages, 5) }, (_, i) => {
                      const startPage = Math.max(1, safeRefundPage - 2);
                      const page = startPage + i;
                      if (page > refundTotalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setRefundPage(page)}
                          className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            safeRefundPage === page
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setRefundPage(p => Math.min(refundTotalPages, p + 1))}
                      disabled={safeRefundPage >= refundTotalPages}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg transition-all border cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 disabled:hover:bg-zinc-900"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-850 text-zinc-500 text-xs">
              {refundFilter === 'pending' 
                ? 'No pending money-back requests at this time.'
                : 'No refund request history found.'}
            </div>
          )}
        </div>
        </>
      )}

      {/* === BAZAAR TAB === */}
      {activeTab === 'bazaar' && (
        <div className="space-y-6">
          {/* Bazaar Assignment Form */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-5">
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-500" />
                  Bazaar Assignment & Management
                </h3>
                <p className="text-xs text-zinc-400">Assign bazaar dates to members and verify submitted expenses</p>
              </div>
              <button
                onClick={() => setShowBazaarForm(!showBazaarForm)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showBazaarForm ? 'Cancel' : 'Assign Bazaar'}
              </button>
            </div>

            {showBazaarForm && (
              <form onSubmit={handleBazaarAssign} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 pb-6 border-b border-zinc-800">
                {bazaarAssignError && <div className="md:col-span-12 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs"><AlertCircle className="w-4 h-4 inline mr-1" />{bazaarAssignError}</div>}
                {bazaarAssignSuccess && <div className="md:col-span-12 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs"><Check className="w-4 h-4 inline mr-1" />{bazaarAssignSuccess}</div>}

                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Member</label>
                  <select required value={bazaarUserId} onChange={(e) => setBazaarUserId(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm">
                    <option value="">Select a member...</option>
                    {memberList.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Bazaar Date</label>
                  <input type="date" required value={bazaarDate} onChange={(e) => setBazaarDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
                </div>
                <div className="md:col-span-4 flex items-end">
                  <button type="submit" disabled={bazaarAssignLoading} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                    {bazaarAssignLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CalendarRange className="w-3.5 h-3.5" /> Assign Bazaar</>}
                  </button>
                </div>
                <div className="md:col-span-12">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Shopping List (comma separated)</label>
                  <input type="text" value={bazaarShoppingList} onChange={(e) => setBazaarShoppingList(e.target.value)} placeholder="e.g. Rice 5kg, Chicken 2kg, Vegetables, Cooking Oil" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl text-sm" />
                </div>
              </form>
            )}

            {/* Bazaar Pairs Panel */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-blue-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" /> Bazaar Pairs — Rotation List
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPairFormOpen(!pairFormOpen)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {pairFormOpen ? 'Cancel' : 'Add Pair'}
                  </button>
                  <button
                    onClick={handleAdvancePair}
                    disabled={advanceLoading}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {advanceLoading ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span className="text-sm">⏭</span> Skip Pair</>}
                  </button>
                </div>
              </div>

              {/* Pair creation form */}
              {pairFormOpen && (
                <form onSubmit={handleCreatePair} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 pb-4 border-b border-blue-500/20">
                  {pairError && <div className="md:col-span-12 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">{pairError}</div>}
                  {pairSuccess && <div className="md:col-span-12 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs">{pairSuccess}</div>}
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Member 1</label>
                    <select required value={pairMember1} onChange={e => setPairMember1(e.target.value)} className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs">
                      <option value="">Select...</option>
                      {memberList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Member 2</label>
                    <select required value={pairMember2} onChange={e => setPairMember2(e.target.value)} className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-lg text-xs">
                      <option value="">Select...</option>
                      {memberList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <button type="submit" disabled={pairCreating} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold rounded-lg text-xs cursor-pointer">
                      {pairCreating ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Create'}
                    </button>
                  </div>
                </form>
              )}

              {/* Pairs list with next dot indicator */}
              {pairData && pairData.pairs && pairData.pairs.length > 0 ? (
                <div className="space-y-2">
                  {pairData.pairs.map((pair: any, idx: number) => {
                    const isNext = idx === pairData.currentPairIndex;
                    return (
                      <div
                        key={pair.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isNext 
                            ? 'bg-blue-500/15 border-blue-500/40 ring-1 ring-blue-500/30' 
                            : 'bg-zinc-900/50 border-zinc-800'
                        }`}
                      >
                        {/* Dot indicator */}
                        <div className={`w-4 h-4 rounded-full shrink-0 ${isNext ? 'bg-blue-500 shadow-sm shadow-blue-500/50 animate-pulse' : 'bg-zinc-700'}`} />
                        {/* Pair info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-500">Pair #{idx + 1}</span>
                            {isNext && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded-full">● NEXT</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-zinc-200">{pair.member1Name}</span>
                            <span className="text-[10px] text-zinc-500">&</span>
                            <span className="text-xs font-bold text-zinc-200">{pair.member2Name}</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <button
                          onClick={() => handleDeletePair(pair.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove pair"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-zinc-500 text-center pt-2">
                    {pairData.totalPairs} pair{pairData.totalPairs !== 1 ? 's' : ''} • When both members complete bazaar, next pair auto-advances
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                  <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">No pairs created yet</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Create pairs of members who will go to bazaar together. The dot shows which pair is next.</p>
                </div>
              )}
            </div>

            {/* Assignments List */}
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">All Bazaar Assignments</h4>
            {bazaarAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                      <th className="pb-3 pl-2">Member</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Shopping List</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {bazaarAssignments.sort((a, b) => b.date.localeCompare(a.date)).map((a) => {
                      const expense = bazaarExpenses.find(e => e.assignmentId === a.id);
                      return (
                        <tr key={a.id} className="hover:bg-zinc-900/30">
                          <td className="py-3 pl-2 font-bold text-zinc-200 text-xs">{a.userName || 'Unknown'}</td>
                          <td className="py-3 text-zinc-300 text-xs">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {a.shoppingList.length > 0 ? a.shoppingList.map((item, i) => (
                                <span key={i} className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">{item}</span>
                              )) : <span className="text-xs text-zinc-500">No list</span>}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              a.status === 'verified' ? 'bg-emerald-500/15 text-emerald-400' :
                              a.status === 'submitted' ? 'bg-amber-500/15 text-amber-400' :
                              'bg-zinc-800 text-zinc-400'
                            }`}>{a.status}</span>
                          </td>
                          <td className="py-3 text-right pr-2">
                            <div className="inline-flex gap-1">
                              {expense && expense.status === 'pending' && (
                                <>
                                  <button onClick={() => handleUpdateBazaarExpenseStatus(expense.id, 'approved')} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleUpdateBazaarExpenseStatus(expense.id, 'rejected')} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                              {expense && (
                                <button onClick={() => setSelectedBazaarDetail(expense.id)} className="p-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                              )}
                              {a.status === 'pending' && (
                                <button onClick={() => handleSkipBazaarMember(a.id, a.userName || 'this member')} className="p-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg cursor-pointer" title="Skip member"><UserX className="w-3.5 h-3.5" /></button>
                              )}
                              {!expense && a.status === 'pending' && (
                                <button onClick={() => handleDeleteBazaarAssignment(a.id)} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
                <ShoppingCart className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">No bazaar assignments created yet</p>
                <p className="text-xs text-zinc-500 mt-1">Click "Assign Bazaar" above to assign bazaar duties to members.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === FINANCES TAB === */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* Financial Health & Deficit Members */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-zinc-800 pb-4 mb-5">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Financial Health Overview
              </h3>
              <p className="text-xs text-zinc-400">Weekly meal balance check — see who paid and who hasn't</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Meal Balance</p>
                <p className="text-xl font-black text-zinc-100 mt-1">{managerStats?.totalSystemBalance.toFixed(0) || 0}৳</p>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Bazaar Expenses</p>
                <p className="text-xl font-black text-zinc-100 mt-1">{managerStats?.totalBazaarExpenses || 0}৳</p>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Pending Verifications</p>
                <p className="text-xl font-black text-amber-400 mt-1">{managerStats?.pendingBazaarCount || 0} Items</p>
              </div>
            </div>

            {/* Deficit Members */}
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Members In Deficit (Balance &lt; 0)
            </h4>

            {managerStats?.deficitMembers && managerStats.deficitMembers.length > 0 ? (
              <div className="space-y-2">
                {managerStats.deficitMembers.map((dm) => (
                  <div key={dm.userId} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <UserCheck className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{dm.name}</p>
                        <p className="text-xs text-zinc-500">Balance: <span className="font-bold text-red-400">{dm.balance.toFixed(0)}৳</span></p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        // Send reminder via alert (in real app this would email/notify)
                        const msg = prompt(`Send payment reminder to ${dm.name}:`, `Dear ${dm.name}, your meal balance is ${dm.balance.toFixed(0)}৳ (deficit). Please deposit funds soon.`);
                        if (msg) {
                          alert(`Reminder sent to ${dm.name}! (In production, this would send an email/notification.)`);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Send Reminder
                    </button>
                  </div>
                ))}
                <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl text-[11px] text-zinc-500 flex items-center gap-2 mt-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Payment reminders are currently displayed as alerts. Email/SMS integration coming soon.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm font-semibold">All members are in good standing!</p>
                <p className="text-xs text-zinc-500 mt-1">No deficit members found. Everyone's balance is positive.</p>
              </div>
            )}
          </div>

          {/* Weekly Payment Status Table */}
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-teal-500" />
              Weekly Payment Status — Who Paid & Who Didn't
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pl-2">Member</th>
                    <th className="pb-3">Weekly Expected</th>
                    <th className="pb-3">Paid Amount</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-2">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {memberList.map((m) => {
                    const memberDeposits = allDeposits
                      .filter(d => d.userId === m.id && d.status === 'approved')
                      .reduce((sum, d) => sum + d.amount, 0);
                    const memberMeals = allRecords
                      .filter(r => r.userId === m.id)
                      .reduce((sum, r) => sum + r.count, 0);
                    const memberCost = Math.round(memberMeals * (managerStats?.liveMealRate || mealRate) * 100) / 100;
                    const balance = Math.round((memberDeposits - memberCost) * 100) / 100;
                    const weeklyExpected = 500;
                    const weeklyPaid = memberDeposits >= weeklyExpected ? weeklyExpected : memberDeposits;

                    return (
                      <tr key={m.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pl-2 font-bold text-zinc-200 text-xs">{m.name}</td>
                        <td className="py-3 text-xs text-zinc-400">{weeklyExpected}৳/week</td>
                        <td className="py-3 text-xs font-semibold text-zinc-300">{weeklyPaid}৳</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            weeklyPaid >= weeklyExpected 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : weeklyPaid > 0 
                              ? 'bg-amber-500/15 text-amber-400' 
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {weeklyPaid >= weeklyExpected ? '✓ Paid' : weeklyPaid > 0 ? 'Partial' : 'Not Paid'}
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <span className={`text-xs font-bold ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {balance.toFixed(0)}৳
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {memberList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-xs text-zinc-500">No approved members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === HISTORY TAB === */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-zinc-800 pb-4 mb-5">
              <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" />
                Monthly Balance, Expenses & Spent History
              </h3>
              <p className="text-xs text-zinc-400">Per-month breakdown of deposits, meal costs, bazaar expenses, and refunds</p>
            </div>

            {monthlyData.length > 0 ? (
              <div className="space-y-4">
                {monthlyData.map((m) => {
                  const isPositive = m.netBalance >= 0;
                  return (
                    <div key={m.month} className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                      {/* Month Header */}
                      <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900/60 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-teal-500/10 rounded-lg">
                            <Calendar className="w-4 h-4 text-teal-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-100 text-sm">{m.label}</h4>
                            <p className="text-[10px] text-zinc-500">{m.memberCount} active member{m.memberCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{m.netBalance.toFixed(0)}৳
                          </p>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Net Balance</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/50">
                        <div className="bg-[#111111] p-4">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Deposits</p>
                          <p className="text-base font-black text-emerald-400">{m.deposits.toFixed(0)}৳</p>
                          <p className="text-[9px] text-zinc-600">Member top-ups</p>
                        </div>
                        <div className="bg-[#111111] p-4">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Meal Cost</p>
                          <p className="text-base font-black text-amber-400">{m.mealCost.toFixed(0)}৳</p>
                          <p className="text-[9px] text-zinc-600">{m.mealsCount} meals × {managerStats?.liveMealRate.toFixed(2) || mealRate.toFixed(2)}৳</p>
                        </div>
                        <div className="bg-[#111111] p-4">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Bazaar Expenses</p>
                          <p className="text-base font-black text-rose-400">{m.bazaarExpenses.toFixed(0)}৳</p>
                          <p className="text-[9px] text-zinc-600">Approved shopping</p>
                        </div>
                        <div className="bg-[#111111] p-4">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Refunds</p>
                          <p className="text-base font-black text-purple-400">{m.refundsApproved.toFixed(0)}৳</p>
                          <p className="text-[9px] text-zinc-600">Money-back approved</p>
                        </div>
                      </div>

                      {/* Mini Balance Bar */}
                      <div className="px-5 py-3 bg-zinc-900/40 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">Breakdown:</span>
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500/60"
                              style={{ width: `${Math.min(100, (m.deposits / Math.max(1, m.deposits + m.mealCost + m.bazaarExpenses + m.refundsApproved)) * 100)}%` }}
                              title="Deposits"
                            />
                            <div
                              className="h-full bg-amber-500/60"
                              style={{ width: `${Math.min(100, (m.mealCost / Math.max(1, m.deposits + m.mealCost + m.bazaarExpenses + m.refundsApproved)) * 100)}%` }}
                              title="Meal Cost"
                            />
                            <div
                              className="h-full bg-rose-500/60"
                              style={{ width: `${Math.min(100, (m.bazaarExpenses / Math.max(1, m.deposits + m.mealCost + m.bazaarExpenses + m.refundsApproved)) * 100)}%` }}
                              title="Bazaar"
                            />
                            <div
                              className="h-full bg-purple-500/60"
                              style={{ width: `${Math.min(100, (m.refundsApproved / Math.max(1, m.deposits + m.mealCost + m.bazaarExpenses + m.refundsApproved)) * 100)}%` }}
                              title="Refunds"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" /> In</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" /> Meals</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500/60" /> Shop</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500/60" /> Refund</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-850">
                <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm font-semibold">No historical data yet</p>
                <p className="text-xs text-zinc-500 mt-1">Monthly records will appear here once members start booking meals and making deposits.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bazaar Expense Detail Modal */}
      {selectedBazaarDetail && selectedExpenseDetail && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedBazaarDetail(null)}>
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <h3 className="font-display font-bold text-lg text-zinc-100">Bazaar Expense Details</h3>
              <button onClick={() => setSelectedBazaarDetail(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-xs text-zinc-400">Submitted by: <span className="font-bold text-zinc-200">{selectedExpenseDetail.userName}</span></span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedExpenseDetail.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                  selectedExpenseDetail.status === 'rejected' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                }`}>{selectedExpenseDetail.status}</span>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Items Purchased</p>
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
              {selectedExpenseDetail.remarks && <p className="text-xs text-zinc-500 italic">Note: {selectedExpenseDetail.remarks}</p>}
              <div className="flex gap-2 pt-2">
                {selectedExpenseDetail.status === 'pending' && (
                  <>
                    <button onClick={() => { handleUpdateBazaarExpenseStatus(selectedExpenseDetail.id, 'approved'); setSelectedBazaarDetail(null); }} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer">Approve Expense</button>
                    <button onClick={() => { handleUpdateBazaarExpenseStatus(selectedExpenseDetail.id, 'rejected'); setSelectedBazaarDetail(null); }} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer">Reject Expense</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

    </div>
  );
}
