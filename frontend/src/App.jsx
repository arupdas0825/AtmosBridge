import React from 'react';
import { useApp } from './state/AppContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import ProvenanceTag from './components/common/ProvenanceTag';

// 16 Screens per PRD and Design specs
import Landing from './pages/Landing';
import CitizenReport from './pages/CitizenReport';
import VoiceReport from './pages/VoiceReport';
import PhotoAnalysis from './pages/PhotoAnalysis';
import LocalIntelligence from './pages/LocalIntelligence';
import GlobalMap from './pages/GlobalMap';
import HotspotExplorer from './pages/HotspotExplorer';
import EventDetails from './pages/EventDetails';
import PredictionTimeline from './pages/PredictionTimeline';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AlertDetails from './pages/AlertDetails';
import CrossBorderIntelligence from './pages/CrossBorderIntelligence';
import Analytics from './pages/Analytics';
import DataSources from './pages/DataSources';
import Settings from './pages/Settings';
import About from './pages/About';

import { ShieldAlert, Globe2, Heart, Sparkles } from 'lucide-react';

import logoImg from './assets/logo.jpg';

export default function App() {
  const { currentScreen, navigateTo } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing />;
      case 'report':
        return <CitizenReport />;
      case 'voice':
        return <VoiceReport />;
      case 'analysis-result':
        return <PhotoAnalysis />;
      case 'local-intelligence':
        return <LocalIntelligence />;
      case 'map':
        return <GlobalMap />;
      case 'hotspots':
        return <HotspotExplorer />;
      case 'event-details':
        return <EventDetails />;
      case 'predictions':
        return <PredictionTimeline />;
      case 'authority':
        return <AuthorityDashboard />;
      case 'alert-details':
        return <AlertDetails />;
      case 'crossborder':
        return <CrossBorderIntelligence />;
      case 'analytics':
        return <Analytics />;
      case 'datasources':
        return <DataSources />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink font-sans">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Screen Content Viewport */}
      <main className="flex-1 pb-20 lg:pb-12">
        {renderScreen()}
      </main>

      {/* Responsive Bottom Tab Bar for Mobile Viewports (<768px) */}
      <BottomNav />

      {/* Global Command Center Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded overflow-hidden border border-slate-200 bg-brand flex items-center justify-center flex-shrink-0">
                <img 
                  src={logoImg} 
                  alt="AtmosBridge" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="font-bold text-ink font-sans text-sm">AtmosBridge</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand/10 text-brand">
                v1.0.0
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button onClick={() => navigateTo('map')} className="hover:text-brand">Live Map</button>
              <button onClick={() => navigateTo('report')} className="hover:text-brand">Report Sighting</button>
              <button onClick={() => navigateTo('authority')} className="hover:text-brand">Authority Queue</button>
              <button onClick={() => navigateTo('predictions')} className="hover:text-brand">Spike Forecast</button>
              <button onClick={() => navigateTo('crossborder')} className="hover:text-brand">Cross-Border</button>
              <button onClick={() => navigateTo('datasources')} className="hover:text-brand">Provenance Registry</button>
              <button onClick={() => navigateTo('about')} className="hover:text-brand">Responsible AI</button>
              <button onClick={() => navigateTo('settings')} className="hover:text-brand">Settings</button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4 text-[11px]">
            <p>
              Built for <b>Hack2Skill × Google Cloud — Build with AI: Code for Communities</b> (Track 2 Clean Air & BRICS Sustainability Theme).
            </p>
            <div className="flex items-center gap-2">
              <span>Telemetry:</span>
              <ProvenanceTag type="observed" size="xs" />
              <ProvenanceTag type="inferred" size="xs" />
              <ProvenanceTag type="predicted" size="xs" />
              <ProvenanceTag type="simulated" size="xs" />
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
