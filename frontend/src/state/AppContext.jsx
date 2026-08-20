import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/i18n';
import { getAlerts, getHotspots } from '../lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [activeCountry, setActiveCountry] = useState('all');
  
  // Dual-Surface State: Strictly 'citizen' | 'authority'
  const [activeRole, setActiveRoleState] = useState(() => {
    return localStorage.getItem('atmosbridge_role') || 'citizen';
  });

  const [currentScreen, setCurrentScreen] = useState('landing'); // Screen ID
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
  const [pendingAlertsCount, setPendingAlertsCount] = useState(0);
  const [alertsList, setAlertsList] = useState([]);
  const [hotspotsList, setHotspotsList] = useState([]);
  const [surfaceToast, setSurfaceToast] = useState(null);

  // Load initial alerts & hotspots
  const refreshData = async () => {
    try {
      const [alerts, hotspots] = await Promise.all([
        getAlerts('all'),
        getHotspots(activeCountry)
      ]);
      setAlertsList(alerts);
      setPendingAlertsCount(alerts.filter(a => a.status === 'pending').length);
      setHotspotsList(hotspots);
    } catch (e) {
      console.warn('[AppContext refreshData fallback]', e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [activeCountry]);

  // Switch Active Surface with Deterministic Mode Navigation (P0.5)
  const setActiveRole = (newRole) => {
    if (newRole !== 'citizen' && newRole !== 'authority') return;
    
    setActiveRoleState(newRole);
    localStorage.setItem('atmosbridge_role', newRole);

    if (newRole === 'authority') {
      setSurfaceToast('Transitioning to Authority Command Center...');
      setCurrentScreen('authority');
    } else {
      setSurfaceToast('Transitioning to Citizen Public Portal...');
      setCurrentScreen('landing');
    }

    setTimeout(() => {
      setSurfaceToast(null);
    }, 2400);
  };

  const t = translations[language] || translations.en;

  const navigateTo = (screen, params = {}) => {
    if (params.hotspotId) setActiveHotspotId(params.hotspotId);
    if (params.alertId) setActiveAlertId(params.alertId);
    if (params.reportId) setActiveReportId(params.reportId);
    if (params.scenarioId) setActiveScenarioId(params.scenarioId);
    if (params.reportData) {
      setLastSubmittedReport(params.reportData);
      // The backend risk_engine creates the real authority alert during report submission.
      // refreshData() (called in CitizenReport/VoiceReport after submitReport) syncs the real alert.
      // Do NOT construct a local fake alert here — it would inject fabricated values.
    }
    
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const value = {
    language,
    setLanguage,
    t,
    activeCountry,
    setActiveCountry,
    activeRole,
    setActiveRole,
    currentScreen,
    navigateTo,
    activeHotspotId,
    setActiveHotspotId,
    activeReportId,
    setActiveReportId,
    activeAlertId,
    setActiveAlertId,
    activeScenarioId,
    setActiveScenarioId,
    lastSubmittedReport,
    setLastSubmittedReport,
    pendingAlertsCount,
    setPendingAlertsCount,
    alertsList,
    setAlertsList,
    hotspotsList,
    refreshData,
    surfaceToast
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
