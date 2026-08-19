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
  const [activeHotspotId, setActiveHotspotId] = useState('hotspot_ind_delhi_01');
  const [activeReportId, setActiveReportId] = useState(null);
  const [activeAlertId, setActiveAlertId] = useState('alt_delhi_8812');
  const [activeScenarioId, setActiveScenarioId] = useState('xb_punjab_lahore_01');
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
  const [pendingAlertsCount, setPendingAlertsCount] = useState(1);
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

  // Switch Active Surface with Mode Navigation
  const setActiveRole = (newRole) => {
    if (newRole !== 'citizen' && newRole !== 'authority') return;
    
    setActiveRoleState(newRole);
    localStorage.setItem('atmosbridge_role', newRole);

    if (newRole === 'authority') {
      setSurfaceToast('Transitioning to Authority Command Center...');
      if (['landing', 'report', 'voice', 'analysis-result', 'local-intelligence'].includes(currentScreen)) {
        setCurrentScreen('authority');
      }
    } else {
      setSurfaceToast('Transitioning to Citizen Public Portal...');
      if (['authority', 'alert-details'].includes(currentScreen)) {
        setCurrentScreen('landing');
      }
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
      
      // Push citizen submission into active alerts list so Authority sees it immediately
      const newAlert = {
        id: `alt_${Date.now().toString().slice(-6)}`,
        hotspot_id: activeHotspotId || 'hotspot_ind_delhi_01',
        title: `Citizen Sighting: ${params.reportData.pollution_source || 'Unverified Local Emission'}`,
        pollution_type: params.reportData.pollution_source || 'Citizen Reported Emission',
        severity: params.reportData.severity >= 3 ? 'critical' : 'high',
        risk_score: (params.reportData.severity || 3) * 22.5,
        status: 'pending',
        created_at: new Date().toISOString(),
        affected_population: 35000,
        evidence_count: {
          citizen_reports: 1,
          photos: params.reportData.photo_attached ? 1 : 0,
          sensor_anomalies: 1
        },
        gemini_summary: params.reportData.explanation || 'New citizen sighting logged with structured multimodal analysis.',
        recommended_intervention: '1. Review submitted photographic and textual evidence.\n2. Acknowledge and dispatch field inspection squad if validated.',
        action_log: [
          {
            action: 'report_received',
            actor: 'Citizen Observer',
            timestamp: new Date().toISOString(),
            notes: 'Field evidence submitted via Citizen Portal.'
          },
          {
            action: 'ai_triage',
            actor: 'Google Gemini Multimodal AI',
            timestamp: new Date().toISOString(),
            notes: 'Multimodal extraction confirmed particulate signature.'
          }
        ],
        location_name: params.reportData.location_name || 'Detected Location',
        country: 'India',
        latitude: params.reportData.latitude || 28.5355,
        longitude: params.reportData.longitude || 77.2690,
        evidence_photo_url: params.reportData.photo_url || null
      };

      setAlertsList(prev => [newAlert, ...prev]);
      setPendingAlertsCount(prev => prev + 1);
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
