'use client';

import React, { createContext, useContext, useState } from 'react';

interface ManagerRoleContextType {
  isManagerControlMode: boolean;
  setManagerControlMode: (mode: boolean) => void;
  toggleManagerControlMode: () => void;
}

const ManagerRoleContext = createContext<ManagerRoleContextType | undefined>(undefined);

export const ManagerRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isManagerControlMode, setManagerControlMode] = useState(true);

  const toggleManagerControlMode = () => {
    setManagerControlMode((prev) => !prev);
  };

  return (
    <ManagerRoleContext.Provider
      value={{
        isManagerControlMode,
        setManagerControlMode,
        toggleManagerControlMode,
      }}
    >
      {children}
    </ManagerRoleContext.Provider>
  );
};

export const useManagerRole = () => {
  const context = useContext(ManagerRoleContext);
  if (!context) {
    throw new Error('useManagerRole must be used within a ManagerRoleProvider');
  }
  return context;
};
