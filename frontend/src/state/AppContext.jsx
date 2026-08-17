import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../lib/i18n';
import { getAlerts, getHotspots } from '../lib/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [activeCountry, setActiveCountry] = useState('all');
  const [activeRole, setActiveRole] = useState('citizen'); // 'citizen' | 'authority' | 'analyst' | 'coordinator'
  const [currentScreen, setCurrentScreen] = useState('landing'); // Screen ID
  const [activeHotspotId, setActiveHotspotId] = useState('hotspot_ind_delhi_01');
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeAlertId, setActiveAlertId] = useState('alt_delhi_8812');
  const [activeScenarioId, setActiveScenarioId] = useState('xb_punjab_lahore_01');
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
  const [pendingAlertsCount, setPendingAlertsCount] = useState(1);
  const [hotspotsList, setHotspotsList] = useState([]);

  // Load initial alerts & hotspots
  const refreshData = async () => {
    try {
      const [alerts, hotspots] = await Promise.all([
        getAlerts('pending'),
        getHotspots(activeCountry)
      ]);
      setPendingAlertsCount(alerts.length);
      setHotspotsList(hotspots);
    } catch (e) {
      console.warn('Refresh data failed', e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [activeCountry]);

  const t = translations[language] || translations.en;

  const navigateTo = (screen, params = {}) => {
    if (params.hotspotId) setActiveHotspotId(params.hotspotId);
    if (params.alertId) setActiveAlertId(params.alertId);
    if (params.reportId) setActiveReportId(params.reportId);
    if (params.scenarioId) setActiveScenarioId(params.scenarioId);
    if (params.reportData) setLastSubmittedReport(params.reportData);
    
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
    hotspotsList,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
