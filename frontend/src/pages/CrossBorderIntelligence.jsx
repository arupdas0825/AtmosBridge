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
  ArrowDown,
  Info,
  MapPin,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Radio,
  FileCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet Map Controller to fly to active scenario
function CrossBorderMapController({ activeScenario }) {
  const map = useMap();
  useEffect(() => {
    if (activeScenario && activeScenario.plume_polygon && activeScenario.plume_polygon.length > 0) {
      const bounds = L.latLngBounds(activeScenario.plume_polygon);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [activeScenario, map]);
  return null;
}

const sourceIcon = L.divIcon({
  className: 'source-pin',
  html: `<div style="background-color:#D9622B;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(217,98,43,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const targetIcon = L.divIcon({
  className: 'target-pin',
  html: `<div style="background-color:#7C3AED;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(124,58,237,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function CrossBorderIntelligence() {
  const { t, activeScenarioId, setActiveScenarioId } = useApp();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [advisorySent, setAdvisorySent] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getCrossBorderScenarios();
        setScenarios(data);
        if (data && data.length > 0) {
          const match = data.find(s => s.id === activeScenarioId) || data[0];
          setSelectedScenario(match);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeScenarioId]);

  const handleSelectScenario = (sc) => {
    setSelectedScenario(sc);
    setActiveScenarioId(sc.id);
  };

  const handleSendAdvisory = (scenarioId) => {
    setAdvisorySent(prev => ({ ...prev, [scenarioId]: true }));
  };

  if (loading) return <Loader text="Loading cross-border atmospheric transport models..." />;

  const current = selectedScenario || scenarios[0];
  const isSent = current && advisorySent[current.id];

  // Calculate midpoints for source/target marker placement
  const poly = current?.plume_polygon || [];
  const sourcePoint = poly.length > 0 ? poly[0] : [31.45, 74.20];
  const targetPoint = poly.length > 2 ? poly[Math.floor(poly.length / 2)] : [31.85, 75.10];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-brand" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Cross-Border Atmospheric Transport Intelligence
            </h1>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {scenarios.length > 0 ? 'ACTIVE CORRIDORS' : 'MONITORING ACTIVE'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Evaluate potential pollution transport pathways across regional and sovereign boundaries using meteorological wind vectors and boundary layer drift models.
        </p>
      </div>

      {scenarios.length === 0 ? (
        <div className="card-surface p-12 text-center space-y-3 border-dashed border-2 border-slate-200">
          <Globe2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-ink">No verified cross-border event currently detected.</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Atmospheric transport corridors are continuously evaluated against regional wind vectors and active emission sources. Bilateral alerts will trigger when trans-boundary drift is detected.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Corridor Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-slate-200">
            {scenarios.map((sc) => {
              const isSelected = current?.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-white text-ink-muted hover:text-ink border border-slate-200'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>{sc.country_source} → {sc.country_target.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

      {/* 4-STAGE STRUCTURED INTELLIGENCE PIPELINE (P1.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: SOURCE REGION */}
        <div className="card-surface p-4 space-y-2 border-t-3 border-t-risk-high">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">1. Source Region</span>
            <ProvenanceTag type="observed" size="xs" />
          </div>
          <div className="font-bold text-sm text-ink">
            {current?.source_region || 'Insufficient data for reliable estimate'}
          </div>
          <div className="text-[11px] text-ink-muted">
            Pollutant: <b className="text-ink">{current?.pollutant_type || 'Particulates'}</b>
          </div>
        </div>

        {/* Stage 2: ATMOSPHERIC TRANSPORT */}
        <div className="card-surface p-4 space-y-2 border-t-3 border-t-teal-600">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">2. Atmospheric Transport</span>
            <ProvenanceTag type="observed" size="xs" />
          </div>
          <div className="font-mono font-bold text-sm text-ink">
            {current?.wind_vector ? `${current.wind_vector.speed_kmh} km/h from ${current.wind_vector.direction}` : 'Insufficient data for reliable estimate'}
          </div>
          <div className="text-[11px] text-ink-muted">
            Vector: <b className="text-ink">{current?.wind_vector?.bearing_deg ? `${current.wind_vector.bearing_deg}° bearing` : 'Regional drift'}</b>
          </div>
        </div>

        {/* Stage 3: POTENTIAL DOWNWIND IMPACT */}
        <div className="card-surface p-4 space-y-2 border-t-3 border-t-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">3. Potential Downwind Impact</span>
            <ProvenanceTag type="predicted" size="xs" />
          </div>
          <div className="font-bold text-sm text-ink">
            {current?.target_region || 'Insufficient data for reliable estimate'}
          </div>
          <div className="text-[11px] text-ink-muted">
            Transit Window: <b className="text-ink font-mono">{current?.estimated_arrival_window || 'Insufficient data'}</b>
          </div>
        </div>

        {/* Stage 4: COORDINATED RESPONSE */}
        <div className="card-surface p-4 space-y-2 border-t-3 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">4. Coordinated Response</span>
            <ProvenanceTag type="inferred" size="xs" />
          </div>
          <div className="font-bold text-sm text-emerald-800">
            {isSent ? 'Advisory Dispatched' : 'Action Pending Review'}
          </div>
          <div className="text-[11px] text-ink-muted">
            Protocol: <b className="text-ink">Bilateral Notification</b>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Map Centerpiece + Corridor Dossier Card */}
      {current && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Visual Map Centerpiece (7 Cols) */}
          <div className="lg:col-span-7 card-surface p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand" />
                  <span>Modelled Dispersion Plume & Trajectory</span>
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Corridor trajectory polygon with downwind dispersion influence
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9622B]" /> Source
                </span>
                <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Downwind
                </span>
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="h-96 sm:h-[420px] rounded-card overflow-hidden border border-slate-200 relative">
              <MapContainer
                center={sourcePoint}
                zoom={7}
                style={{ height: '100%', width: '100%', backgroundColor: '#1A1D24' }}
                scrollWheelZoom={true}
              >
                <CrossBorderMapController activeScenario={current} />

                {/* CartoDB Dark Matter Cartographic Tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Plume Polygon */}
                {current.plume_polygon && current.plume_polygon.length > 0 && (
                  <Polygon
                    positions={current.plume_polygon}
                    pathOptions={{
                      color: '#D9622B',
                      weight: 2,
                      fillColor: '#D9622B',
                      fillOpacity: 0.35,
                      dashArray: '4, 4'
                    }}
                  >
                    <Popup>
                      <div className="text-xs font-sans">
                        <b>{current.title}</b>
                        <div className="text-slate-600 mt-1">Status: Modelled Trajectory</div>
                        <div className="text-slate-600">Pollutant: {current.pollutant_type}</div>
                      </div>
                    </Popup>
                  </Polygon>
                )}

                {/* Source Pin Marker */}
                <Marker position={sourcePoint} icon={sourceIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <b>Source Origin:</b>
                      <div>{current.source_region}</div>
                    </div>
                  </Popup>
                </Marker>

                {/* Downwind Target Pin Marker */}
                <Marker position={targetPoint} icon={targetIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <b>Downwind Receptor:</b>
                      <div>{current.target_region}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Model Architecture Note */}
            <div className="p-3 bg-surface rounded-card border border-slate-200 text-[11px] text-ink-muted flex items-start gap-2">
              <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <span>
                <b>Scientific Model:</b> Physics-Grounded Atmospheric Transport Engine (evaluated with boundary layer wind vectors and thermal mixing heights).
              </span>
            </div>
          </div>

          {/* Corridor Dossier Card & Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Potential Transport Pathway Card */}
            <div className="card-surface p-6 space-y-5 border-l-4 border-l-purple-600">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800">
                    POTENTIAL TRANSPORT PATHWAY
                  </span>
                  <ProvenanceTag type="predicted" size="xs" />
                </div>
                <h2 className="text-lg font-extrabold text-ink pt-1">
                  {current.title}
                </h2>
              </div>

              {/* Pathway Source & Downwind Attributes */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Source Region:</span>
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-risk-high" />
                    <span>{current.source_region || 'Insufficient data for reliable estimate'}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Downwind Receptor:</span>
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-700" />
                    <span>{current.target_region || 'Insufficient data for reliable estimate'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Pollutant:</span>
                    <div className="font-semibold text-ink truncate">{current.pollutant_type || 'Particulate Matter'}</div>
                  </div>

                  <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Transport Status:</span>
                    <div className="font-semibold text-brand">Predicted Plume</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Wind Observation:</span>
                    <div className="font-mono font-bold text-ink">
                      {current.wind_vector ? `${current.wind_vector.speed_kmh} km/h ${current.wind_vector.direction}` : 'Insufficient data for reliable estimate'}
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Estimated Window:</span>
                    <div className="font-mono font-bold text-ink">{current.estimated_arrival_window || 'Insufficient data for reliable estimate'}</div>
                  </div>
                </div>
              </div>

              {/* Recommended Action Protocol */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-brand" />
                  <span>Recommended Bilateral Coordination Protocol</span>
                </span>
                <p className="text-xs text-ink-muted leading-relaxed bg-brand-surface/40 p-3.5 rounded-card border border-brand/20">
                  {current.recommended_crossborder_action || 'Insufficient data for bilateral coordination recommendation.'}
                </p>
              </div>

              {/* Action Button: Trigger Advisory */}
              <div className="pt-2">
                {isSent ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-card text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Bilateral Advisory Dispatched & Logged in BRICS Airshed Network.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendAdvisory(current.id)}
                    className="btn-primary w-full text-xs py-3 font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Issue Bilateral Clean Air Advisory</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )}

    </div>
  );
}
