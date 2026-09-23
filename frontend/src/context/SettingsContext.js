import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { settingsAPI } from '../api';
import { useAuth } from './AuthContext';
import SettingsAuthModal from '../components/SettingsAuthModal/SettingsAuthModal';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // In-memory verification state (resets on browser refresh)
  const [isSettingsVerified, setIsSettingsVerified] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const successCbRef = useRef(null);
  const cancelCbRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const res = await settingsAPI.get();
      if (res && res.data) {
        setSettings(res.data);
        if (res.data.shopName) {
          document.title = res.data.shopName;
        }
        return res.data;
      }
    } catch (err) {
      console.error('Failed to load shop settings from MongoDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openSettingsModal = useCallback((onSuccess, onCancel) => {
    if (user?.role === 'admin') {
      setIsSettingsVerified(true);
      if (onSuccess) onSuccess();
      return;
    }
    successCbRef.current = onSuccess || null;
    cancelCbRef.current = onCancel || null;
    setIsAuthModalOpen(true);
  }, [user]);

  const closeSettingsModal = useCallback(() => {
    setIsAuthModalOpen(false);
    const onCancel = cancelCbRef.current;
    successCbRef.current = null;
    cancelCbRef.current = null;
    if (onCancel) onCancel();
  }, []);

  const onAuthSuccess = useCallback(() => {
    setIsSettingsVerified(true);
    setIsAuthModalOpen(false);
    const onSuccess = successCbRef.current;
    successCbRef.current = null;
    cancelCbRef.current = null;
    if (onSuccess) onSuccess();
  }, []);

  const resetSettingsVerification = useCallback(() => {
    setIsSettingsVerified(false);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        refresh,
        loading,
        isSettingsVerified,
        setIsSettingsVerified,
        resetSettingsVerification,
        openSettingsModal,
        closeSettingsModal,
      }}
    >
      {children}
      <SettingsAuthModal
        isOpen={isAuthModalOpen}
        onClose={closeSettingsModal}
        onSuccess={onAuthSuccess}
      />
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
