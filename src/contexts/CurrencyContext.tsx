import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../types';

interface CurrencyContextType {
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  updateCurrency: (currency: string, symbol: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
  userProfile?: UserProfile | null;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children, userProfile }) => {
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Update currency when userProfile changes
  useEffect(() => {
    if (userProfile?.currency && userProfile?.currencySymbol) {
      setCurrency(userProfile.currency);
      setCurrencySymbol(userProfile.currencySymbol);
    }
  }, [userProfile]);

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return `${currencySymbol}0.00`;
    
    // For most currencies, format with 2 decimal places
    if (currency === 'JPY' || currency === 'KRW') {
      // Japanese Yen and Korean Won don't use decimal places
      return `${currencySymbol}${Math.round(amount).toLocaleString()}`;
    }
    
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const updateCurrency = (newCurrency: string, newSymbol: string) => {
    setCurrency(newCurrency);
    setCurrencySymbol(newSymbol);
  };

  const value = {
    currency,
    currencySymbol,
    formatCurrency,
    updateCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

