import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { SEVERITY_CONFIG, BRICS_COUNTRIES } from '../../lib/constants';
import ProvenanceTag from '../common/ProvenanceTag';
import SeverityBadge from '../common/SeverityBadge';
import { 
  Layers, 
  Wind, 
  Flame, 
  Radio, 
  Compass, 
  ShieldAlert, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Info,
  ArrowUpRight
} from 'lucide-react';

export default function InteractiveMap({
  hotspots = [],
  sensors = [],
  crossborderScenarios = [],
  selectedHotspotId = null,
  onSelectHotspot = () => {},
  height = 'h-[540px]'
}) {
  const { activeCountry, setActiveCountry, navigateTo } = useApp();

  // Layer Visibility State
  const [layers, setLayers] = useState({
    hotspots: true,
    sensors: true,
    wind: true,
    plumes: true,
    satellite: true
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  // Map viewport center by selected country
  const currentCountryConfig = BRICS_COUNTRIES.find(c => c.id === activeCountry) || BRICS_COUNTRIES[0];

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Convert lat/lng to responsive visual percentages
  const projectCoordinates = (lat, lng) => {
    let minLat = -55, maxLat = 65, minLng = -80, maxLng = 140;

    if (activeCountry === 'India') {
      minLat = 8; maxLat = 36; minLng = 68; maxLng = 98;
    } else if (activeCountry === 'Brazil') {
      minLat = -34; maxLat = 6; minLng = -74; maxLng = -34;
    } else if (activeCountry === 'Russia') {
      minLat = 42; maxLat = 75; minLng = 25; maxLng = 160;
    } else if (activeCountry === 'China') {
      minLat = 18; maxLat = 54; minLng = 73; maxLng = 135;
    } else if (activeCountry === 'South Africa') {
      minLat = -35; maxLat = -22; minLng = 16; maxLng = 33;
    }

    const x = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.max(5, Math.min(95, ((maxLat - lat) / (maxLat - minLat)) * 100));
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className={`relative w-full ${height} bg-slate-950 rounded-card overflow-hidden border border-slate-800 shadow-card flex flex-col font-sans`}>
      
      {/* Map Header Controls */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Country Quick Selector */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full p-1 flex items-center gap-1 shadow-md">
          {BRICS_COUNTRIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCountry(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeCountry === c.id 
                  ? 'bg-brand text-white font-bold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.id === 'all' ? 'BRICS Overview' : c.name}
            </button>
          ))}
        </div>

        {/* Layer Toggle Bar */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full p-1 flex items-center gap-1 shadow-md text-xs text-slate-300">
          <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-brand-light" />
            <span>Layers:</span>
          </span>
          <button
            onClick={() => toggleLayer('hotspots')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.hotspots ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Flame className="w-3 h-3 text-risk-high" />
            <span>Hotspots ({hotspots.length})</span>
          </button>
          <button
            onClick={() => toggleLayer('sensors')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.sensors ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Radio className="w-3 h-3 text-sky-400" />
            <span>Sensors</span>
          </button>
          <button
            onClick={() => toggleLayer('wind')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.wind ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Wind className="w-3 h-3 text-teal-400" />
            <span>Winds</span>
          </button>
          <button
            onClick={() => toggleLayer('plumes')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.plumes ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Compass className="w-3 h-3 text-purple-400" />
            <span>Plumes</span>
          </button>
        </div>
      </div>

      {/* Main Geospatial Viewport */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0A1118]">
        
        {/* SVG Grid Background */}
        <svg className="w-full h-full opacity-30 absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Satellite Background Aerosol Haze Layer */}
        {layers.satellite && (
          <div className="absolute inset-0 pointer-events-none">
            {hotspots.map((h, i) => {
              const pos = projectCoordinates(h.latitude, h.longitude);
              return (
                <div 
                  key={`sat_${i}`}
                  className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-40 pointer-events-none"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    background: h.severity >= 3 ? 'radial-gradient(circle, rgba(217,98,43,0.4) 0%, rgba(179,37,31,0.15) 50%, transparent 70%)' : 'radial-gradient(circle, rgba(201,138,18,0.3) 0%, transparent 70%)'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Trans-Boundary Plume Drift Cones */}
        {layers.plumes && crossborderScenarios.map(sc => {
          return (
            <div 
              key={sc.id}
              className="absolute z-10 pointer-events-auto cursor-pointer group"
              style={{ left: '48%', top: '42%' }}
              onClick={() => navigateTo('crossborder', { scenarioId: sc.id })}
            >
              <div className="relative w-64 h-32 -translate-x-12 -translate-y-16">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                  <path 
                    d="M 20,50 Q 80,20 180,35 Q 160,80 20,50 Z" 
                    fill="rgba(217, 98, 43, 0.22)" 
                    stroke="rgba(217, 98, 43, 0.6)" 
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <line x1="20" y1="50" x2="160" y2="40" stroke="#F97316" strokeWidth="2" />
                </svg>
                <div className="absolute top-2 left-6 bg-slate-900/90 border border-risk-high/60 text-risk-high px-2 py-0.5 rounded-full text-[10px] font-mono shadow-md whitespace-nowrap flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{sc.title}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Wind Vector Overlays */}
        {layers.wind && (
          <div className="absolute inset-0 pointer-events-none opacity-60">
            {[
              { x: '25%', y: '30%', deg: 310, spd: '5.2 km/h' },
              { x: '52%', y: '40%', deg: 115, spd: '14.2 km/h' },
              { x: '70%', y: '25%', deg: 190, spd: '4.0 km/h' },
              { x: '35%', y: '75%', deg: 160, spd: '6.0 km/h' },
              { x: '65%', y: '80%', deg: 280, spd: '11.0 km/h' },
            ].map((w, idx) => (
              <div 
                key={`wind_${idx}`} 
                className="absolute flex items-center gap-1 -translate-x-1/2 -translate-y-1/2"
                style={{ left: w.x, top: w.y }}
              >
                <div 
                  className="w-8 h-0.5 bg-teal-400/80 rounded-full relative"
                  style={{ transform: `rotate(${w.deg}deg)` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-teal-400 rotate-45"></div>
                </div>
                <span className="text-[9px] font-mono text-teal-300/80">{w.spd}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ground Micro-Sensors Layer */}
        {layers.sensors && sensors.map((sensor) => {
          const pos = projectCoordinates(sensor.latitude, sensor.longitude);
          return (
            <div
              key={sensor.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group pointer-events-auto"
              style={{ left: pos.x, top: pos.y }}
              onMouseEnter={() => setHoveredItem({ type: 'sensor', data: sensor })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="w-4 h-4 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center shadow-glow-teal hover:scale-125 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
              </div>
            </div>
          );
        })}

        {/* Active Hotspots Layer */}
        {layers.hotspots && hotspots.map((hotspot) => {
          const pos = projectCoordinates(hotspot.latitude, hotspot.longitude);
          const isSelected = hotspot.id === selectedHotspotId;
          const severityNum = hotspot.severity || 3;
          const sevCfg = SEVERITY_CONFIG[severityNum] || SEVERITY_CONFIG[3];
          const isUnacknowledged = !hotspot.acknowledged && hotspot.status !== 'acknowledged' && hotspot.status !== 'resolved';

          return (
            <div
              key={hotspot.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto group"
              style={{ left: pos.x, top: pos.y }}
              onClick={() => onSelectHotspot(hotspot)}
              onMouseEnter={() => setHoveredItem({ type: 'hotspot', data: hotspot })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Soft Pulse for Unacknowledged Alert Hotspots */}
              {isUnacknowledged && (
                <div 
                  className="absolute inset-0 w-8 h-8 -translate-x-1.5 -translate-y-1.5 rounded-full animate-pulse-unack"
                  style={{ backgroundColor: `${sevCfg.color}55` }}
                />
              )}

              {/* Marker Icon Dot */}
              <div 
                className={`relative w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-lg transition-all duration-200 ${
                  isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-115'
                }`}
                style={{ backgroundColor: sevCfg.color }}
              >
                <Flame className="w-3.5 h-3.5" />
              </div>

              {/* Mini Label */}
              <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 text-white px-2 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
                <span>{hotspot.city}</span>
                <span className="text-amber-400 font-bold">{hotspot.risk_score}</span>
              </div>
            </div>
          );
        })}

        {/* Hover Tooltip Card */}
        {hoveredItem && (
          <div 
            className="absolute bottom-4 left-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-3.5 rounded-card shadow-modal max-w-xs animate-in fade-in duration-150"
          >
            {hoveredItem.type === 'hotspot' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white truncate">{hoveredItem.data.title}</span>
                  <SeverityBadge severity={hoveredItem.data.severity} size="xs" />
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">{hoveredItem.data.summary}</p>
                <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-800 pt-1.5 text-slate-400">
                  <span>PM2.5: <b className="text-white">{hoveredItem.data.pollutants?.pm25?.value} µg/m³</b></span>
                  <span className="text-brand-light font-semibold">Inspect →</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Radio className="w-3.5 h-3.5" />
                  <span>{hoveredItem.data.name}</span>
                </div>
                <p className="text-[11px] text-slate-300">Ground Monitoring Node ({hoveredItem.data.city})</p>
                <div className="text-[10px] font-mono text-slate-400">
                  PM2.5: <b className="text-white">{hoveredItem.data.pollutants?.pm25?.value} µg/m³</b> [Simulated]
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Map Footer Bar with Provenance Legend */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[11px] text-slate-500">PROVENANCE:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px]">Observed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="text-[11px]">Inferred (Gemini)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px]">Predicted (XGBoost)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-[11px]">Simulated</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Airshed: <span className="text-slate-300 font-semibold">{currentCountryConfig.name}</span>
        </div>
      </div>

    </div>
  );
}
