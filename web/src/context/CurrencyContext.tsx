'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Conversion rate relative to USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', rate: 83.5 },
  USD: { code: 'USD', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78 }
};

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountUSD: number) => string;
  formatShort: (amountUSD: number) => string;
  convertPrice: (amountUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');

  useEffect(() => {
    const saved = localStorage.getItem('career_ops_currency');
    if (saved && (saved in CURRENCIES)) {
      setCurrencyState(saved as CurrencyCode);
    } else {
      // Ensure default is INR if none is saved
      setCurrencyState('INR');
      localStorage.setItem('career_ops_currency', 'INR');
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('career_ops_currency', code);
    window.dispatchEvent(new Event('currencychange'));
  };

  const symbol = CURRENCIES[currency].symbol;

  const convertPrice = (amountUSD: number) => {
    return amountUSD * CURRENCIES[currency].rate;
  };

  const formatPrice = (amountUSD: number) => {
    const converted = convertPrice(amountUSD);
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const formatShort = (amountUSD: number) => {
    const converted = convertPrice(amountUSD);
    if (currency === 'INR') {
      const lakhs = converted / 100000;
      if (lakhs >= 100) {
        return `${symbol}${(lakhs / 100).toFixed(1)}Cr`;
      }
      return `${symbol}${Math.round(lakhs)}L`;
    } else {
      return `${symbol}${Math.round(converted / 1000)}K`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, formatPrice, formatShort, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
