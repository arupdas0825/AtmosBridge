import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  MapPin, 
  ExternalLink, 
  Clock, 
  Activity,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';

// Controller to smoothly pan & zoom map view when country selection changes
function MapViewController({ activeCountry }) {
  const map = useMap();
  useEffect(() => {
    const country = BRICS_COUNTRIES.find(c => c.id === activeCountry) || BRICS_COUNTRIES[0];
    if (country && map) {
      map.flyTo([country.lat, country.lng], country.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [activeCountry, map]);
  return null;
}

// Leaflet DivIcons for Hotspots, Sensors, and Wind Vectors
const createHotspotIcon = (hotspot, isSelected) => {
  const sevColor = SEVERITY_CONFIG[hotspot.severity]?.color || '#D9622B';
  const isCritical = hotspot.severity >= 3;
  return L.divIcon({
    className: 'custom-hotspot-div-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${isCritical ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${sevColor}; opacity: 0.35; animation: pulse 2s infinite;"></div>` : ''}
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background-color: ${sevColor}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'}; transition: transform 0.2s ease;">
          🔥
        </div>
        <div style="position: absolute; top: 30px; left: 50%; transform: translateX(-50%); background-color: rgba(15, 23, 42, 0.95); border: 1px solid rgba(51, 65, 85, 0.8); color: white; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-family: monospace; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: flex; items-center; gap: 3px;">
          <span>${hotspot.city || 'Hotspot'}</span>
          <span style="color: #F59E0B; font-weight: bold;">${hotspot.risk_score || ''}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const createSensorIcon = (sensor) => {
  return L.divIcon({
    className: 'custom-sensor-div-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="width: 18px; height: 18px; border-radius: 50%; background-color: rgba(56, 189, 248, 0.25); border: 2px solid #38BDF8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #38BDF8;"></div>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
};

const createWindIcon = (wind) => {
  return L.divIcon({
    className: 'custom-wind-div-icon',
    html: `
      <div style="display: flex; align-items: center; gap: 4px; background-color: rgba(15, 23, 42, 0.85); border: 1px solid rgba(20, 184, 166, 0.5); color: #2DD4BF; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-family: monospace; box-shadow: 0 2px 6px rgba(0,0,0,0.5); white-space: nowrap;">
        <span style="display: inline-block; transform: rotate(${wind.bearing_deg || 0}deg); font-size: 11px;">⬆️</span>
        <span>${wind.speed_kmh} km/h ${wind.direction || ''}</span>
      </div>
    `,
    iconSize: [110, 24],
    iconAnchor: [55, 12]
  });
};

export default function InteractiveMap({
  hotspots = [],
  sensors = [],
  crossborderScenarios = [],
  selectedHotspotId = null,
  onSelectHotspot = () => {},
  timeFilter = 'realtime',
  height = 'h-[540px]'
}) {
  const { activeCountry, setActiveCountry, navigateTo } = useApp();

  // Layer Toggles State
  const [layers, setLayers] = useState({
    hotspots: true,
    sensors: true,
    wind: true,
    plumes: true
  });

  // Basemap style state: dark matter default
  const [basemapStyle, setBasemapStyle] = useState('dark'); // 'dark' | 'standard'

  const currentCountryConfig = BRICS_COUNTRIES.find(c => c.id === activeCountry) || BRICS_COUNTRIES[0];

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Helper for timeline filter
  const isWithinTimeFilter = (itemTimestamp, filter) => {
    if (!filter || filter === 'realtime') return true;
    if (!itemTimestamp) return true;
    try {
      const diffHours = (Date.now() - new Date(itemTimestamp).getTime()) / (1000 * 3600);
      if (filter === '6h') return diffHours <= 6 || isNaN(diffHours);
      if (filter === '24h') return diffHours <= 24 || isNaN(diffHours);
    } catch (e) {
      return true;
    }
    return true;
  };

  // Filter hotspots & sensors according to country tab selection & time filter
  const filteredHotspots = (activeCountry === 'all' 
    ? hotspots 
    : hotspots.filter(h => h.country?.toLowerCase() === activeCountry.toLowerCase())
  ).filter(h => isWithinTimeFilter(h.last_updated, timeFilter));

  const filteredSensors = (activeCountry === 'all' 
    ? sensors 
    : sensors.filter(s => s.country?.toLowerCase() === activeCountry.toLowerCase())
  ).filter(s => isWithinTimeFilter(s.last_updated, timeFilter));

  const filteredScenarios = (activeCountry === 'all'
    ? crossborderScenarios
    : crossborderScenarios.filter(sc => 
        sc.country_source?.toLowerCase().includes(activeCountry.toLowerCase()) || 
        sc.country_target?.toLowerCase().includes(activeCountry.toLowerCase())
      )
  ).filter(sc => isWithinTimeFilter(sc.last_updated, timeFilter));

  // Wind vectors derived from hotspots and regional sensors
  const windPoints = [];
  const baseHotspots = activeCountry === 'all' ? hotspots : filteredHotspots;
  baseHotspots.forEach(h => {
    windPoints.push({
      id: `wind_${h.id}`,
      lat: h.latitude + (h.weather?.wind_direction > 180 ? 0.35 : -0.35),
      lng: h.longitude + (h.weather?.wind_direction > 90 ? 0.45 : -0.45),
      speed_kmh: h.weather?.wind_speed ? (h.weather.wind_speed * 3.6).toFixed(1) : '14.2',
      bearing_deg: h.weather?.wind_direction || 115,
      direction: h.weather?.wind_direction ? `${Math.round(h.weather.wind_direction)}°` : 'ESE'
    });
  });
  if (windPoints.length < 3) {
    const baseSensors = activeCountry === 'all' ? sensors : filteredSensors;
    baseSensors.slice(0, 4).forEach(s => {
      windPoints.push({
        id: `wind_s_${s.id}`,
        lat: s.latitude + 0.25,
        lng: s.longitude - 0.35,
        speed_kmh: '12.5',
        bearing_deg: 130,
        direction: 'SE'
      });
    });
  }

  const tileUrl = basemapStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = basemapStyle === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const hasNoData = filteredHotspots.length === 0 && filteredSensors.length === 0 && filteredScenarios.length === 0;

  return (
    <div className={`relative w-full ${height} bg-slate-950 rounded-card overflow-hidden border border-slate-800 shadow-card flex flex-col font-sans`}>
      
      {/* Top Map Header Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Country Quick Selector */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-full p-1 flex items-center gap-1 shadow-lg overflow-x-auto max-w-full">
          {BRICS_COUNTRIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCountry(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCountry === c.id 
                  ? 'bg-brand text-white font-bold shadow-xs' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.id === 'all' ? 'BRICS Overview' : c.name}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Style Bar */}
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-full p-1 flex items-center gap-1 shadow-lg text-xs text-slate-300 flex-wrap">
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
            <span>Hotspots ({filteredHotspots.length})</span>
          </button>
          <button
            onClick={() => toggleLayer('sensors')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.sensors ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Radio className="w-3 h-3 text-sky-400" />
            <span>Sensors ({filteredSensors.length})</span>
          </button>
          <button
            onClick={() => toggleLayer('wind')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.wind ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Wind className="w-3 h-3 text-teal-400" />
            <span>Winds ({windPoints.length})</span>
          </button>
          <button
            onClick={() => toggleLayer('plumes')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
              layers.plumes ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'opacity-40 hover:opacity-80'
            }`}
          >
            <Compass className="w-3 h-3 text-purple-400" />
            <span>Plumes ({filteredScenarios.length})</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Map style toggle button */}
          <button
            onClick={() => setBasemapStyle(prev => prev === 'dark' ? 'standard' : 'dark')}
            className="px-2 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Cartographic Basemap Theme"
          >
            {basemapStyle === 'dark' ? '🌙 Dark Map' : '☀️ Light Map'}
          </button>
        </div>

      </div>

      {/* Main Leaflet Map Viewport */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={[currentCountryConfig.lat, currentCountryConfig.lng]}
          zoom={currentCountryConfig.zoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', backgroundColor: '#090D14' }}
          zoomControl={false}
        >
          {/* Bottom-right Zoom Controls to avoid overlapping top bars */}
          <ZoomControl position="bottomright" />

          {/* Programmatic view controller for active country transitions */}
          <MapViewController activeCountry={activeCountry} />

          {/* Cartographic Map Tile Layer */}
          <TileLayer
            url={tileUrl}
            attribution={tileAttribution}
            maxZoom={19}
            subdomains={['a', 'b', 'c', 'd']}
          />

          {/* Trans-Boundary Pollution Plume Polygons */}
          {layers.plumes && filteredScenarios.map(sc => {
            if (!sc.plume_polygon || sc.plume_polygon.length === 0) return null;
            return (
              <React.Fragment key={sc.id}>
                <Polygon
                  positions={sc.plume_polygon}
                  pathOptions={{
                    color: '#D9622B',
                    fillColor: '#D9622B',
                    fillOpacity: 0.28,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                  eventHandlers={{
                    click: () => navigateTo('crossborder', { scenarioId: sc.id })
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-3 space-y-2.5 max-w-xs font-sans text-slate-100">
                      <div className="flex items-center gap-1.5 text-risk-high font-bold text-xs border-b border-slate-800 pb-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>{sc.title}</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1">
                        <div><b>Source Region:</b> {sc.source_region}</div>
                        <div><b>Target Impact:</b> {sc.target_region}</div>
                        <div><b>Pollutant:</b> {sc.pollutant_type}</div>
                      </div>
                      <div className="text-[11px] font-mono bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <b className="text-amber-400">Predicted Dispersion</b>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind Corridor:</span>
                          <b>{sc.wind_vector?.speed_kmh} km/h {sc.wind_vector?.direction}</b>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1 text-[10px]">
                          <span>Provenance:</span>
                          <span className="text-amber-300 font-semibold">{sc.provenance || 'predicted'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigateTo('crossborder', { scenarioId: sc.id })}
                        className="btn-primary py-1.5 px-3 text-xs w-full justify-center"
                      >
                        Inspect Cross-Border Dossier →
                      </button>
                    </div>
                  </Popup>
                </Polygon>

                {/* Direct vector corridor line */}
                {sc.plume_polygon.length >= 2 && (
                  <Polyline
                    positions={[sc.plume_polygon[0], sc.plume_polygon[Math.floor(sc.plume_polygon.length / 2)]]}
                    pathOptions={{ color: '#F97316', weight: 3 }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Wind Vector Markers Layer */}
          {layers.wind && windPoints.map(w => (
            <Marker
              key={w.id}
              position={[w.lat, w.lng]}
              icon={createWindIcon(w)}
              interactive={false}
            />
          ))}

          {/* Ground Micro-Sensors Layer */}
          {layers.sensors && filteredSensors.map(sensor => (
            <Marker
              key={sensor.id}
              position={[sensor.latitude, sensor.longitude]}
              icon={createSensorIcon(sensor)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 space-y-2 font-sans max-w-xs text-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                      <Radio className="w-4 h-4" />
                      <span>{sensor.name}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-sky-950 border border-sky-800 text-sky-300 px-1.5 py-0.5 rounded">
                      Sensor
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div><b>Location:</b> {sensor.city}, {sensor.country}</div>
                    <div><b>Coordinates:</b> <code className="text-[10px] bg-slate-900 px-1 py-0.5 rounded text-slate-300">{sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}</code></div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>PM2.5:</span>
                      <b className="text-sky-300">{sensor.pollutants?.pm25?.value} µg/m³</b>
                    </div>
                    {sensor.pollutants?.pm10 && (
                      <div className="flex justify-between text-slate-300">
                        <span>PM10:</span>
                        <b className="text-sky-300">{sensor.pollutants?.pm10?.value} µg/m³</b>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-800 pt-1 text-slate-400">
                    <span>Provenance:</span>
                    <span className="text-slate-300 font-semibold">{sensor.pollutants?.pm25?.provenance || 'simulated'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active Hotspots Layer */}
          {layers.hotspots && filteredHotspots.map(hotspot => {
            const isSelected = hotspot.id === selectedHotspotId;
            return (
              <Marker
                key={hotspot.id}
                position={[hotspot.latitude, hotspot.longitude]}
                icon={createHotspotIcon(hotspot, isSelected)}
                eventHandlers={{
                  click: () => onSelectHotspot(hotspot)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 space-y-2.5 font-sans max-w-xs text-slate-100">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-xs text-slate-100 leading-tight">{hotspot.title}</span>
                      <SeverityBadge severity={hotspot.severity} size="xs" />
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div><b>Location:</b> {hotspot.city}, {hotspot.country}</div>
                      <div><b>Coords:</b> <code className="text-[10px] bg-slate-900 text-slate-300 px-1 py-0.5 rounded">{hotspot.latitude.toFixed(4)}, {hotspot.longitude.toFixed(4)}</code></div>
                      <div><b>Risk Index:</b> <b className="text-risk-high">{hotspot.risk_score}/100</b></div>
                      {hotspot.affected_population_estimate && (
                        <div><b>Pop. Est:</b> {hotspot.affected_population_estimate.toLocaleString()}</div>
                      )}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-2 rounded text-xs space-y-1 font-mono">
                      <div className="font-semibold text-slate-400 font-sans text-[11px]">Pollutant Telemetry:</div>
                      <div className="flex justify-between text-[11px]">
                        <span>PM2.5:</span>
                        <b className="text-slate-100">{hotspot.pollutants?.pm25?.value} µg/m³</b>
                      </div>
                      {hotspot.pollutants?.pm10 && (
                        <div className="flex justify-between text-[11px]">
                          <span>PM10:</span>
                          <b className="text-slate-100">{hotspot.pollutants?.pm10?.value} µg/m³</b>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed italic bg-amber-950/40 border border-amber-900/40 p-2 rounded">
                      "{hotspot.summary}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <ProvenanceTag type={hotspot.pollutants?.pm25?.provenance || 'inferred'} size="xs" />
                      <button
                        onClick={() => {
                          onSelectHotspot(hotspot);
                          navigateTo('event-details', { hotspotId: hotspot.id });
                        }}
                        className="btn-primary py-1 px-3 text-xs"
                      >
                        Inspect Dossier →
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>

        {/* Empty State Banner Overlay if 0 items match current filters */}
        {hasNoData && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span>No active environmental anomalies match current filters in {currentCountryConfig.name}.</span>
          </div>
        )}
      </div>

      {/* Map Footer Bar with Provenance Legend & Status */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 z-[1000]">
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
            <span className="text-[11px]">Predicted (Physics-Grounded)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-[11px]">Simulated / Prototype</span>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-500">
          Selected Airshed: <span className="text-slate-200 font-semibold">{currentCountryConfig.name}</span>
        </div>
      </div>

    </div>
  );
}
