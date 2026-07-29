'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PushNotificationContextType {
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    setIsSubscribed(true);
  };

  const unsubscribe = async () => {
    setIsSubscribed(false);
  };

  return (
    <PushNotificationContext.Provider value={{ isSubscribed, subscribe, unsubscribe }}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotification = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider');
  }
  return context;
};
