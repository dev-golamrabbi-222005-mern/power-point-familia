import React, { useState, useEffect } from 'react';
import { User, MealMenu, MealRecord, Deposit, DashboardStats } from '../types.js';
import { ChefHat, Plus, Trash2, Edit3, ClipboardList, Check, X, Calendar, DollarSign, Users, RefreshCw, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';

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

  // Menu form state
  const [menuId, setMenuId] = useState('');
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [menuType, setMenuType] = useState<'lunch' | 'dinner'>('lunch');
  const [menuItemsText, setMenuItemsText] = useState('');
  const [menuCost, setMenuCost] = useState('50');
  const [menuError, setMenuError] = useState('');
  const [menuSuccess, setMenuSuccess] = useState('');
  const [menuLoading, setMenuLoading] = useState(false);

  // Active view filters
  const [depositFilter, setDepositFilter] = useState<'pending' | 'all'>('pending');

  const fetchManagerData = async () => {
    try {
      // 1. System statistics
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setManagerStats(statsData.managerStats);
      }

      // 2. System meal records
      const recordsRes = await fetch('/api/records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();
      if (recordsRes.ok) {
        setAllRecords(recordsData);
      }

      // 3. System deposits
      const depositsRes = await fetch('/api/deposits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const depositsData = await depositsRes.json();
      if (depositsRes.ok) {
        setAllDeposits(depositsData);
      }

      // 4. Fetch all users (to bind names/emails in rosters)
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

  useEffect(() => {
    fetchManagerData();
  }, [token, menus]);

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuError('');
    setMenuSuccess('');
    setMenuLoading(true);

    const items = menuItemsText
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save menu.');
      }

      setMenuSuccess(menuId ? 'Menu updated successfully!' : 'Daily menu published successfully!');
      
      // Clear form
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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Status update failed.');
      }

      fetchManagerData();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Kitchen list calculation: group total meal plates needed for Today (and future)
  const todayString = new Date().toISOString().split('T')[0];
  const activeBookingsByDateAndType = allRecords.reduce((acc: Record<string, number>, rec) => {
    const key = `${rec.date}::${rec.mealType}`;
    acc[key] = (acc[key] || 0) + rec.count;
    return acc;
  }, {});

  const displayedDeposits = allDeposits.filter(d => 
    depositFilter === 'all' ? true : d.status === 'pending'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. System Statistics Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* System Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-500/20 rounded-2xl p-5 shadow-lg text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider font-mono">System Pool Balance</p>
              <h3 className="text-2xl font-black text-white mt-1">
                {managerStats ? `${managerStats.totalSystemBalance}৳` : '--'}
              </h3>
              <p className="text-[10px] text-emerald-200 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> System in active solvency
              </p>
            </div>
            <span className="p-2.5 bg-emerald-700 text-emerald-100 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Total System Deposits */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">System Deposits</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {managerStats ? `${managerStats.totalSystemDeposits}৳` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Accumulated member topups</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Total Plates cooked */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Accumulated Meals</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {managerStats ? `${managerStats.totalSystemMealsCount} Plates` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 mt-1 block">Total meals delivered to members</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        {/* Active Members Count */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Members</p>
            <h3 className="text-2xl font-black text-zinc-100 mt-1">
              {managerStats ? `${managerStats.membersCount} Users` : '--'}
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium mt-1 block">Standard members rostered</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Menu Publisher & Kitchen planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Menu Form & Management */}
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
              <button
                onClick={() => {
                  setMenuId('');
                  setMenuItemsText('');
                  setMenuCost('50');
                }}
                className="text-xs text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleMenuSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {menuError && (
              <div className="md:col-span-12 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{menuError}</span>
              </div>
            )}
            {menuSuccess && (
              <div className="md:col-span-12 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{menuSuccess}</span>
              </div>
            )}

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input
                id="menu-date"
                type="date"
                required
                value={menuDate}
                onChange={(e) => setMenuDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Meal Slot
              </label>
              <select
                id="menu-type"
                value={menuType}
                onChange={(e) => setMenuType(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="lunch">Lunch Slot</option>
                <option value="dinner">Dinner Slot</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Est. Cost (৳)
              </label>
              <input
                id="menu-cost"
                type="number"
                required
                value={menuCost}
                onChange={(e) => setMenuCost(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-12">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Food items (Comma Separated)</span>
                <span className="text-[10px] text-zinc-500 capitalize font-mono">Will be split on commas</span>
              </label>
              <input
                id="menu-items"
                type="text"
                required
                value={menuItemsText}
                onChange={(e) => setMenuItemsText(e.target.value)}
                placeholder="e.g. Steamed Rice, Chicken Bhuna, Red Lentils, Onion Salad"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-12 flex justify-end pt-2">
              <button
                id="btn-submit-menu"
                type="submit"
                disabled={menuLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {menuLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{menuId ? 'Save Menu Changes' : 'Publish Menu'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Menus published directory list */}
          <div className="border-t border-zinc-800 pt-6">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Published Menu Directory</h4>
            {menus.length > 0 ? (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {[...menus].sort((a,b) => b.date.localeCompare(a.date)).map(menu => (
                  <div key={menu.id} className="p-3.5 bg-[#18181b] rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-300">{menu.date}</span>
                        <span className={`capitalize text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {menu.mealType}
                        </span>
                        <span className="text-xs font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-lg">
                          Est: {menu.estimatedCost}৳
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-2 flex flex-wrap gap-1.5">
                        {menu.items.map((item, i) => (
                          <span key={i} className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-300">{item}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`btn-edit-menu-${menu.id}`}
                        onClick={() => handleEditMenu(menu)}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300 border border-zinc-800 transition-colors cursor-pointer animate-none"
                        title="Edit Menu"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-menu-${menu.id}`}
                        onClick={() => handleDeleteMenu(menu.id)}
                        className="p-1.5 bg-zinc-900 hover:bg-red-500/10 rounded-lg text-red-400 border border-zinc-800 hover:border-red-500/20 transition-colors cursor-pointer animate-none"
                        title="Delete Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-zinc-550">No active meal menus published.</div>
            )}
          </div>
        </div>

        {/* Kitchen Planner & Plates Tracker */}
        <div className="lg:col-span-5 bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Kitchen Plates Cook Book
            </h3>
            <p className="text-xs text-zinc-400">Live plate tallies required based on member bookings</p>
          </div>

          <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
            {menus.length > 0 ? (
              [...menus]
                .sort((a,b) => b.date.localeCompare(a.date))
                .slice(0, 5) // Show top 5 dates
                .map(menu => {
                  const key = `${menu.date}::${menu.mealType}`;
                  const platesNeeded = activeBookingsByDateAndType[key] || 0;
                  const isToday = menu.date === todayString;

                  return (
                    <div 
                      key={menu.id} 
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isToday 
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' 
                          : 'bg-[#18181b]/80 border-zinc-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-300">{menu.date}</span>
                          <span className={`capitalize text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            menu.mealType === 'lunch' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-500/20 text-teal-400'
                          }`}>
                            {menu.mealType}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-[180px]">
                          {menu.items.join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-3xs">
                          <span className="text-sm font-black text-zinc-100">{platesNeeded}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-bold">Plates</span>
                        </div>
                        {isToday && (
                          <span className="text-[9px] text-red-400 font-bold block mt-1 animate-pulse">Live plates needed today</span>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-12 text-xs text-zinc-500">
                Publish a menu to track active kitchen bookings.
              </div>
            )}
          </div>
          
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 text-xs flex gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <span>This list counts actual plates booked by Members, helping prevent excessive cooking and grocery waste!</span>
          </div>
        </div>

      </div>

      {/* 3. Deposits Audit Desk */}
      <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Member Deposits Audit Desk
            </h3>
            <p className="text-xs text-zinc-400">Authorize or reject payment vouchers submitted by Familia members</p>
          </div>

          <div className="flex gap-1.5 bg-zinc-900 p-1 rounded-lg self-start sm:self-auto border border-zinc-800/80">
            <button
              onClick={() => setDepositFilter('pending')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${
                depositFilter === 'pending' 
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200 border-transparent'
              }`}
            >
              Pending Only
            </button>
            <button
              onClick={() => setDepositFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer border ${
                depositFilter === 'all' 
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700/50 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200 border-transparent'
              }`}
            >
              All Deposits
            </button>
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
                        <p className="text-[10px] text-zinc-500 font-mono font-medium">{submitter ? submitter.email : (dep.userEmail || '')}</p>
                      </td>
                      <td className="py-3.5 text-zinc-400 font-medium text-xs">
                        {new Date(dep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5">
                        <span className="bg-zinc-850 text-zinc-300 font-bold px-2 py-0.5 rounded text-[11px]">
                          {dep.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs text-zinc-250 font-semibold">{dep.transactionId}</td>
                      <td className="py-3.5 text-right font-black text-zinc-100">{dep.amount}৳</td>
                      <td className="py-3.5 pl-4 text-xs text-zinc-400 max-w-[150px] truncate" title={dep.remarks}>
                        {dep.remarks || '--'}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dep.status === 'approved' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : dep.status === 'rejected' 
                            ? 'bg-red-500/15 text-red-400' 
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            dep.status === 'approved' 
                              ? 'bg-emerald-500' 
                              : dep.status === 'rejected' 
                              ? 'bg-red-500' 
                              : 'bg-amber-500 animate-pulse'
                          }`} />
                          <span className="capitalize">{dep.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        {dep.status === 'pending' ? (
                          <div className="inline-flex gap-1">
                            <button
                              id={`btn-approve-dep-${dep.id}`}
                              onClick={() => handleUpdateDepositStatus(dep.id, 'approved')}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-all cursor-pointer"
                              title="Approve Deposit"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-reject-dep-${dep.id}`}
                              onClick={() => handleUpdateDepositStatus(dep.id, 'rejected')}
                              className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                              title="Reject Deposit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs font-mono font-medium select-none">Audited</span>
                        )}
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

    </div>
  );
}
