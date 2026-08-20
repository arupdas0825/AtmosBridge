import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import SeverityBadge from '../components/common/SeverityBadge';
import Loader from '../components/common/Loader';
import { getLiveAirQuality } from '../lib/api';
import { 
  HeartHandshake, 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Home, 
  Baby, 
  ArrowRight,
  TrendingDown,
  Info,
  Radio,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';

const PRESET_LOCATIONS = [
  { id: 'delhi', name: 'New Delhi (Central)', country: 'India', lat: 28.6139, lon: 77.2090 },
  { id: 'delhi_east', name: 'Delhi (Anand Vihar)', country: 'India', lat: 28.6500, lon: 77.3150 },
  { id: 'delhi_south', name: 'Delhi (Okhla)', country: 'India', lat: 28.5355, lon: 77.2690 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
  { id: 'moscow', name: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 }
];

export default function LocalIntelligence() {
  const { t, activeCountry, navigateTo } = useApp();
  const [selectedLoc, setSelectedLoc] = useState(PRESET_LOCATIONS[0]);
  const [airData, setAirData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filter locations based on activeCountry if set
  const visibleLocations = activeCountry && activeCountry !== 'all'
    ? PRESET_LOCATIONS.filter(l => l.country.toLowerCase() === activeCountry.toLowerCase())
    : PRESET_LOCATIONS;

  const activeLoc = visibleLocations.find(l => l.id === selectedLoc.id) || visibleLocations[0] || PRESET_LOCATIONS[0];

  const fetchAirQuality = async (loc, force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);

    try {
      const data = await getLiveAirQuality(loc.lat, loc.lon, force);
      setAirData(data);
      if (!data || !data.is_live) {
        setErrorMsg('Live observations are currently unavailable for this coordinate.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to connect to live public air quality services.');
      setAirData({ is_live: false, status: 'unavailable', pollutants: {} });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setSelectedLoc(activeLoc);
    fetchAirQuality(activeLoc, false);
  }, [activeCountry]);

  const handleSelectLoc = (loc) => {
    setSelectedLoc(loc);
    fetchAirQuality(loc, false);
  };

  const handleRefresh = () => {
    fetchAirQuality(selectedLoc, true);
  };

  if (loading) return <Loader text="Connecting to verified public air quality telemetry feeds..." />;

  const isLive = airData && airData.is_live && airData.status === 'active';
  const pollutants = airData?.pollutants || {};
  const pm25 = pollutants.pm25?.value;
  const pm10 = pollutants.pm10?.value;
  const no2 = pollutants.no2?.value;
  const so2 = pollutants.so2?.value;
  const co = pollutants.co?.value;
  const o3 = pollutants.o3?.value;

  const aqi = airData?.us_aqi || (pm25 ? Math.round(pm25 * 2.1) : null);
  const severity = aqi ? (aqi > 200 ? 4 : aqi > 150 ? 3 : aqi > 100 ? 2 : 1) : 1;
  const whoRatio = pm25 ? (pm25 / 15.0).toFixed(1) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.localTitle || 'Hyperlocal Air Quality Intelligence'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE TELEMETRY ACTIVE</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                DATA UNAVAILABLE
              </span>
            )}
            <ProvenanceTag type="observed" size="xs" />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Real-time ground and atmospheric telemetry ingested directly from verified public observation networks (Open-Meteo, Copernicus, OpenAQ).
        </p>
      </div>

      {/* Location Selector Tabs & Live Refresh Trigger */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase whitespace-nowrap">Airshed:</span>
          {visibleLocations.map((loc) => {
            const isSelected = selectedLoc.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => handleSelectLoc(loc)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white text-ink-muted hover:text-ink border border-slate-200'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Updating...' : 'Refetch'}</span>
        </button>
      </div>

      {/* Main AQI Summary Box or Clean Empty State */}
      {!isLive ? (
        <div className="card-surface p-8 text-center space-y-3 border-dashed border-2 border-slate-200">
          <Activity className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-ink">No current observations available</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Live public telemetry could not be retrieved for {selectedLoc.name} ({selectedLoc.lat}, {selectedLoc.lon}) at this moment.
          </p>
          <button
            onClick={handleRefresh}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* AQI Tile */}
          <div className="card-surface p-6 flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/20 border-slate-200/90 space-y-4">
            <div>
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.currentAqi || 'Current Observed AQI'}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold font-mono text-ink">{aqi ?? '—'}</span>
                <span className="text-xs font-mono font-medium text-ink-muted">US AQI</span>
              </div>
              <div className="mt-2.5">
                {aqi ? <SeverityBadge severity={severity} size="sm" /> : <span className="text-xs text-ink-muted">Standard Index</span>}
              </div>
            </div>

            <div className="text-[11px] text-ink-muted border-t border-slate-200/80 pt-3 space-y-1.5">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="text-ink font-medium truncate max-w-[150px]">{selectedLoc.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Source:</span>
                <span className="font-mono font-semibold text-slate-700">{airData.source || 'Open-Meteo Public API'}</span>
              </div>
              <div className="flex justify-between">
                <span>Observed Time:</span>
                <span className="font-mono text-slate-500">
                  {airData.timestamp ? new Date(airData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* Pollutants Breakdown */}
          <div className="md:col-span-2 card-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink">Ground Chemical Composition</h3>
              <ProvenanceTag type="observed" size="xs" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {pm25 !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">PM2.5</span>
                  <span className="text-lg font-bold font-mono text-ink">{pm25.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 15)</span>
                </div>
              )}
              {pm10 !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">PM10</span>
                  <span className="text-lg font-bold font-mono text-ink">{pm10.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 45)</span>
                </div>
              )}
              {no2 !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">NO2</span>
                  <span className="text-lg font-bold font-mono text-ink">{no2.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 25)</span>
                </div>
              )}
              {so2 !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">SO2</span>
                  <span className="text-lg font-bold font-mono text-ink">{so2.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 40)</span>
                </div>
              )}
              {co !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">CO</span>
                  <span className="text-lg font-bold font-mono text-ink">{co.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³</span>
                </div>
              )}
              {o3 !== undefined && (
                <div className="bg-surface p-3 rounded-card border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-ink-muted block">Ozone (O3)</span>
                  <span className="text-lg font-bold font-mono text-ink">{o3.toFixed(1)}</span>
                  <span className="text-[10px] text-ink-muted block font-mono">µg/m³ (WHO: 100)</span>
                </div>
              )}
            </div>

            {whoRatio && (
              <p className="text-xs text-ink-muted leading-relaxed">
                Fine particulate matter (PM2.5) at this coordinate is <b className="text-ink">{whoRatio}×</b> the WHO 24-hour guideline (15 µg/m³).
              </p>
            )}
          </div>

        </div>
      )}

      {/* Public Health Protective Advisories */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-brand" />
          <h2 className="text-base font-bold text-ink">{t.healthAdvisoryTitle || 'Community Health Protective Advisories'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              😷
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.maskAdvisory || 'N95 Respirator Guidance'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              When ambient PM2.5 exceeds WHO thresholds, certified N95/KN95 respirators reduce inhalation of fine particulate matter.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
              🚸
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.childrenAdvisory || 'Sensitive Groups'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Children, elderly individuals, and those with pre-existing cardiopulmonary conditions should reduce strenuous outdoor exertion during high pollution intervals.
            </p>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              🏠
            </div>
            <h4 className="font-semibold text-xs text-ink">{t.indoorAdvisory || 'Indoor Air Safety'}</h4>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Operate HEPA filtration units where available and seal building perimeters during stagnant morning and night inversion hours.
            </p>
          </div>
        </div>

        {/* Disclaimer per PRD §13 */}
        <div className="bg-slate-50 p-3 rounded-md text-[11px] text-ink-muted border border-slate-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            <b>Public Health Disclaimer:</b> AtmosBridge provides community environmental intelligence derived from public air quality telemetry. This does not constitute individualized clinical medical advice.
          </p>
        </div>
      </div>

    </div>
  );
}
