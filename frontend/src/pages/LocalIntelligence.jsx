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
  RefreshCw,
  Cpu,
  Database
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
  const { t, activeCountry } = useApp();
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
        setErrorMsg('Verified data could not be retrieved for this location.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Verified data could not be retrieved for this location.');
      setAirData({ is_live: false, status: 'unavailable', pollutants: {}, provenance: 'modelled' });
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

  const handleChooseAnother = () => {
    const fallback = PRESET_LOCATIONS[0];
    setSelectedLoc(fallback);
    fetchAirQuality(fallback, false);
  };

  if (loading) return <Loader text="Retrieving verified public environmental data..." />;

  const isLive = airData && airData.is_live && airData.status === 'active';
  const pollutants = airData?.pollutants || {};
  const pm25 = pollutants.pm25?.value;
  const pm10 = pollutants.pm10?.value;
  const no2 = pollutants.no2?.value;
  const so2 = pollutants.so2?.value;
  const co = pollutants.co?.value;
  const o3 = pollutants.o3?.value;

  // Determine AQI and whether it is Reported or Calculated
  const hasReportedAqi = airData?.us_aqi !== undefined && airData?.us_aqi !== null;
  const aqi = hasReportedAqi ? airData.us_aqi : (pm25 !== undefined ? Math.round(pm25 * 2.1) : null);
  const aqiLabel = hasReportedAqi ? 'Reported AQI' : 'Calculated AQI';
  const aqiSubtitle = hasReportedAqi 
    ? 'Reported directly by public atmospheric service (US EPA standard)'
    : 'Derived from available PM2.5 concentration data';

  const severity = aqi !== null ? (aqi > 200 ? 4 : aqi > 150 ? 3 : aqi > 100 ? 2 : 1) : null;
  const whoRatio = pm25 !== undefined ? (pm25 / 15.0).toFixed(1) : null;

  // Format timestamp strictly from source
  const formattedTimestamp = airData?.timestamp 
    ? new Date(airData.timestamp).toLocaleString(undefined, { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short' 
      })
    : 'Time unavailable';

  const provenanceType = airData?.provenance || 'modelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* 1. Header with Scientifically Honest Nomenclature */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {t.localTitle || 'Hyperlocal Air Quality Intelligence'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>ENVIRONMENTAL DATA ACTIVE</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                DATA UNAVAILABLE
              </span>
            )}
            <ProvenanceTag type={provenanceType} size="xs" />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Real-time environmental conditions and air-quality indicators from available verified public data sources.
        </p>
      </div>

      {/* 2. Location Selector Tabs & Refresh Trigger */}
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

      {/* 3. Main AQI Summary Box or Honest Empty / Error State */}
      {!isLive ? (
        <div className="card-surface p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-slate-200">
          <Activity className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-ink">Environmental data unavailable</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
              Verified data could not be retrieved for {selectedLoc.name} ({selectedLoc.lat}, {selectedLoc.lon}). No simulated or invented values are displayed.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={handleChooseAnother}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <span>Choose another location</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Main Grid: AQI Tile + Ground Chemical Composition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* AQI Tile with Precise Origin Labeling */}
            <div className="card-surface p-6 flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/20 border-slate-200/90 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{aqiLabel}</span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    US EPA Scale
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-5xl font-extrabold font-mono text-ink">{aqi ?? '—'}</span>
                  <span className="text-xs font-mono font-medium text-ink-muted">AQI</span>
                </div>

                <div className="mt-2.5">
                  {severity !== null ? (
                    <SeverityBadge severity={severity} size="sm" />
                  ) : (
                    <span className="text-xs text-ink-muted font-mono">Index Available</span>
                  )}
                </div>

                <p className="text-[11px] text-ink-muted mt-2 leading-relaxed">
                  {aqiSubtitle}
                </p>
              </div>

              <div className="text-[11px] text-ink-muted border-t border-slate-200/80 pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-ink font-medium truncate max-w-[150px]">{selectedLoc.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                    {airData.source || 'Open-Meteo Air Quality'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="font-mono text-slate-600 truncate max-w-[150px]">
                    {formattedTimestamp}
                  </span>
                </div>
              </div>
            </div>

            {/* Pollutants Breakdown (Only shows parameters that actually exist) */}
            <div className="md:col-span-2 card-surface p-6 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-ink">Pollutant Concentrations</h3>
                  <p className="text-[11px] text-ink-muted">
                    Atmospheric parameter concentrations from verified model telemetry.
                  </p>
                </div>
                <ProvenanceTag type={provenanceType} size="xs" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pm25 !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>PM2.5</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.pm25.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{pm25.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.pm25.unit} (WHO: 15)</div>
                  </div>
                )}

                {pm10 !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>PM10</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.pm10.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{pm10.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.pm10.unit} (WHO: 45)</div>
                  </div>
                )}

                {no2 !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>NO₂</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.no2.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{no2.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.no2.unit} (WHO: 25)</div>
                  </div>
                )}

                {so2 !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>SO₂</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.so2.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{so2.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.so2.unit} (WHO: 40)</div>
                  </div>
                )}

                {co !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>CO</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.co.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{co.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.co.unit}</div>
                  </div>
                )}

                {o3 !== undefined && (
                  <div className="bg-surface p-3 rounded-card border border-slate-200/80 text-center space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-ink-muted font-semibold">
                      <span>Ozone (O₃)</span>
                      <span className="font-mono text-[9px] text-cyan-700 bg-cyan-50 px-1 rounded">
                        {pollutants.o3.provenance === 'observed' ? 'Observed' : 'Modelled'}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-ink">{o3.toFixed(1)}</div>
                    <div className="text-[10px] text-ink-muted font-mono">{pollutants.o3.unit} (WHO: 100)</div>
                  </div>
                )}
              </div>

              {whoRatio && (
                <p className="text-xs text-ink-muted leading-relaxed border-t border-slate-100 pt-2">
                  Fine particulate matter (PM2.5) at this location is <b className="text-ink">{whoRatio}×</b> the WHO 24-hour guideline (15 µg/m³).
                </p>
              )}
            </div>

          </div>

          {/* 4. Compact Scientific Data Provenance Block */}
          <div className="card-surface p-5 space-y-3 border-l-4 border-l-brand">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand" />
                <span>DATA PROVENANCE & TRANSPARENCY</span>
              </span>
              <span className="text-[10px] font-mono text-ink-muted bg-slate-100 px-2 py-0.5 rounded">
                Verified Public Ingestion
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-ink-muted uppercase block">Data Source</span>
                <span className="font-semibold text-ink">{airData.source || 'Open-Meteo Air Quality'}</span>
              </div>

              {airData.atmospheric_source && (
                <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-ink-muted uppercase block">Atmospheric Source</span>
                  <span className="font-semibold text-ink">{airData.atmospheric_source}</span>
                </div>
              )}

              <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-ink-muted uppercase block">Data Type</span>
                <span className="font-semibold text-ink flex items-center gap-1">
                  <ProvenanceTag type={provenanceType} size="xs" />
                </span>
              </div>

              <div className="bg-surface p-2.5 rounded border border-slate-200/80 space-y-0.5">
                <span className="text-[10px] font-bold text-ink-muted uppercase block">Updated</span>
                <span className="font-mono text-slate-700 text-[11px] block truncate" title={formattedTimestamp}>
                  {formattedTimestamp}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Public Health Protective Advisories (Rendered Only When Data Exists) */}
          {aqi !== null && (
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-brand" />
                <h2 className="text-base font-bold text-ink">
                  {t.healthAdvisoryTitle || 'Community Health Protective Advisories'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    😷
                  </div>
                  <h4 className="font-semibold text-xs text-ink">{t.maskAdvisory || 'N95 Respirator Guidance'}</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    {severity >= 3 
                      ? 'Ambient particulate levels exceed healthy limits. Certified N95/KN95 respirators reduce particulate inhalation during outdoor exposure.' 
                      : 'Ambient particulate matter levels are currently within moderate thresholds. Sensitive individuals may consider masks near heavy traffic.'}
                  </p>
                </div>

                <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                    🚸
                  </div>
                  <h4 className="font-semibold text-xs text-ink">{t.childrenAdvisory || 'Sensitive Groups'}</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    {severity >= 3
                      ? 'Children, elderly individuals, and those with respiratory conditions should limit prolonged outdoor physical exertion.'
                      : 'Normal outdoor activities are generally acceptable for healthy individuals. Monitor air trends during inversion hours.'}
                  </p>
                </div>

                <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    🏠
                  </div>
                  <h4 className="font-semibold text-xs text-ink">{t.indoorAdvisory || 'Indoor Air Safety'}</h4>
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    Keep windows closed during peak stagnation hours. Utilize HEPA filtration units where available to maintain indoor air quality.
                  </p>
                </div>
              </div>

              {/* Scientifically Honest Public Health Disclaimer */}
              <div className="bg-slate-50 p-3 rounded-md text-[11px] text-ink-muted border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p>
                  <b>Public Health Notice:</b> AtmosBridge provides community environmental intelligence derived from public atmospheric data feeds. This does not constitute individualized clinical medical advice.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
