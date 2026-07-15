import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CURRENCIES } from '../config/currency';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState('EGP');

  useEffect(() => {
    const docRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency && CURRENCIES[data.currency]) {
          setCurrencyCode(data.currency);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.EGP;

  const value = {
    currencyCode,
    currencySymbol: currentCurrency.symbol,
    currencyName: currentCurrency.name,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
