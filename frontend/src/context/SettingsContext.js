import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../api';

const DEFAULT = {
  shopName: 'Shri Ganesh Murti Bhandar',
  shopAddress: 'Ganesh Nagar, Near Main Temple, Nagpur, Maharashtra - 440001',
  mobile: '+91-9876543210', email: '', gstNumber: '', upiId: '',
  bankName: 'State Bank of India', shopLogo: '', lowStockThreshold: 5,
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT);

  const refresh = () =>
    settingsAPI.get().then(res => setSettings(res.data)).catch(() => {});

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, setSettings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
