import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import InteractiveMap from '../components/map/InteractiveMap';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { getHotspots, getSensors, getCrossBorderScenarios } from '../lib/api';
import { 
  Map as MapIcon, 
  Flame, 
  Radio, 
  Wind, 
  Compass, 
  ChevronRight, 
  ExternalLink, 
  Filter, 
  Clock,
  Layers
} from 'lucide-react';

export default function GlobalMap() {
  const { t, activeCountry, setActiveCountry, navigateTo, activeHotspotId, setActiveHotspotId } = useApp();

  const [hotspots, setHotspots] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [crossborderScenarios, setCrossborderScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('realtime'); // 'realtime' | '6h' | '24h'

  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      try {
        const [hData, sData, xbData] = await Promise.all([
          getHotspots('all'),
          getSensors('all'),
          getCrossBorderScenarios()
        ]);
        setHotspots(hData);
        setSensors(sData);
        setCrossborderScenarios(xbData);
      } catch (err) {
        console.error('[GlobalMap loadMapData error]', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const filteredQuickHotspots = activeCountry === 'all' 
    ? hotspots 
    : hotspots.filter(h => h.country?.toLowerCase() === activeCountry.toLowerCase());

  const handleSelectHotspot = (hotspot) => {
    setActiveHotspotId(hotspot.id);
    navigateTo('event-details', { hotspotId: hotspot.id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.mapTitle || 'BRICS Situational Awareness Map'}</h1>
            <ProvenanceTag type="observed" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Federated real-time multi-source situational awareness across BRICS clean-air networks.
          </p>
        </div>

        {/* Timeline Playback / Filter Scrubber */}
        <div className="flex items-center bg-surface border border-slate-200 rounded-full p-0.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-brand ml-2 mr-1" />
          <button
            onClick={() => setTimeFilter('realtime')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              timeFilter === 'realtime' ? 'bg-white font-bold text-brand shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Live Current
          </button>
          <button
            onClick={() => setTimeFilter('6h')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              timeFilter === '6h' ? 'bg-white font-bold text-brand shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            -6h History
          </button>
          <button
            onClick={() => setTimeFilter('24h')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              timeFilter === '24h' ? 'bg-white font-bold text-brand shadow-xs' : 'text-ink-muted hover:text-ink'
            }`}
          >
            -24h Cycle
          </button>
        </div>
      </div>

      {/* Interactive Map Core */}
      <InteractiveMap
        hotspots={hotspots}
        sensors={sensors}
        crossborderScenarios={crossborderScenarios}
        selectedHotspotId={activeHotspotId}
        onSelectHotspot={handleSelectHotspot}
        timeFilter={timeFilter}
        height="h-[520px]"
      />

      {/* Hotspots Quick Grid Under Map */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink flex items-center gap-2">
            <Flame className="w-4 h-4 text-risk-high" />
            <span>Active Hotspots in Current Airshed ({filteredQuickHotspots.length})</span>
          </h3>
          <button
            onClick={() => navigateTo('hotspots')}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>View Filterable Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredQuickHotspots.slice(0, 3).map((h) => (
            <div
              key={h.id}
              onClick={() => handleSelectHotspot(h)}
              className="card-surface p-4 cursor-pointer hover:border-brand hover:shadow-card transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs text-ink group-hover:text-brand transition-colors line-clamp-1">{h.title}</span>
                <SeverityBadge severity={h.severity} size="xs" />
              </div>
              <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">{h.summary}</p>
              <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 pt-2 text-ink-muted">
                <span>Risk: <b className="text-risk-high">{h.risk_score}</b></span>
                <span>Pop: <b className="text-ink">{h.affected_population_estimate?.toLocaleString()}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
