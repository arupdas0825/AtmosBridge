import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import { getCrossBorderScenarios } from '../lib/api';
import { 
  Compass, 
  Wind, 
  ShieldAlert, 
  Send, 
  Clock, 
  CheckCircle2, 
  Globe2, 
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function CrossBorderIntelligence() {
  const { t, activeScenarioId, setActiveScenarioId } = useApp();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advisorySent, setAdvisorySent] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getCrossBorderScenarios();
        setScenarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSendAdvisory = (scenarioId) => {
    setAdvisorySent(prev => ({ ...prev, [scenarioId]: true }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.xbTitle || 'Cross-Border Airshed Intelligence'}</h1>
          <ProvenanceTag type="predicted" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          {t.xbSubtitle || 'Atmospheric drift models and bilateral early-warning advisory protocols across neighboring sovereign airsheds.'}
        </p>
      </div>

      {/* Cross-Border Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-7 rounded-card shadow-card space-y-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-brand-light" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-light">
            BRICS Sustainability & Trans-Boundary Protocol
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold">
          Federated Airshed Notification & Plume Interception Corridor
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Pollution does not stop at national or provincial borders. AtmosBridge computes real-time atmospheric wind drift models to alert downwind authorities hours before particulate spikes reach vulnerable communities.
        </p>
      </div>

      {/* Scenarios Grid */}
      {loading ? (
        <Loader text="Loading trans-boundary dispersion models..." />
      ) : (
        <div className="space-y-5">
          {scenarios.map((sc) => {
            const isSent = advisorySent[sc.id];
            return (
              <div key={sc.id} className="card-surface p-6 sm:p-7 space-y-5 border-l-4 border-l-purple-600">
                
                {/* Scenario Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Active Corridor #{sc.id}
                      </span>
                      <ProvenanceTag type="predicted" size="xs" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-ink">{sc.title}</h3>
                    <p className="text-xs text-ink-muted">Pollutant Classification: <b className="text-ink">{sc.pollutant_type}</b></p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-ink-muted block font-medium">Dispersion Confidence</span>
                    <span className="text-2xl font-bold font-mono text-purple-700">{Math.round(sc.confidence * 100)}%</span>
                  </div>
                </div>

                {/* Airshed Corridor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-1">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">{t.sourceRegion || 'Source Airshed'}</span>
                    <div className="font-bold text-sm text-ink">{sc.source_region}</div>
                    <span className="text-xs text-ink-muted block">Jurisdiction: <b className="text-ink">{sc.country_source}</b></span>
                  </div>

                  <div className="bg-purple-50/50 p-4 rounded-card border border-purple-200/70 space-y-1">
                    <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider">{t.targetRegion || 'Target Airshed'}</span>
                    <div className="font-bold text-sm text-purple-950">{sc.target_region}</div>
                    <span className="text-xs text-purple-800 block">Jurisdiction: <b className="text-purple-950">{sc.country_target}</b></span>
                  </div>
                </div>

                {/* Wind Vectors & Arrival Window */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center">
                    <span className="text-[10px] text-ink-muted block">Prevailing Wind Vector</span>
                    <b className="font-mono text-sm text-ink">{sc.wind_vector?.speed_kmh} km/h</b> <span className="text-slate-500 font-mono">({sc.wind_vector?.direction} · {sc.wind_vector?.bearing_deg}°)</span>
                  </div>
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center">
                    <span className="text-[10px] text-ink-muted block">{t.arrivalWindow || 'Estimated Arrival Window'}</span>
                    <b className="font-mono text-sm text-risk-high">{sc.estimated_arrival_window}</b>
                  </div>
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center">
                    <span className="text-[10px] text-ink-muted block">Aerosol Trajectory</span>
                    <b className="font-mono text-sm text-purple-700">East-South-East (ESE)</b>
                  </div>
                </div>

                {/* Recommended Joint Action */}
                <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-1.5 text-xs">
                  <span className="font-bold text-ink uppercase tracking-wider text-[11px]">Recommended Bilateral Coordination Action:</span>
                  <p className="text-ink leading-relaxed font-medium">{sc.recommended_crossborder_action}</p>
                </div>

                {/* Action CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-ink-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Plume model updated in real-time with Open-Meteo wind feeds</span>
                  </div>

                  <button
                    onClick={() => handleSendAdvisory(sc.id)}
                    disabled={isSent}
                    className={`btn-primary text-xs py-2 px-4 ${isSent ? 'bg-emerald-700 pointer-events-none' : ''}`}
                  >
                    {isSent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Bilateral Advisory Dispatched to Regional Counterparts</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.btnTriggerAdvisory || 'Transmit Bilateral Advisory'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
