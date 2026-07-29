import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

export const NotificationsBtn: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);

  const toggleSubscription = async () => {
    setSubscribed(!subscribed);
  };

  return (
    <button
      onClick={toggleSubscription}
      className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
        subscribed
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
      }`}
    >
      {subscribed ? <Bell className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4 text-zinc-500" />}
      <span>{subscribed ? 'Notifications Enabled' : 'Enable Push Notifications'}</span>
    </button>
  );
};
