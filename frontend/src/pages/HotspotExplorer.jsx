import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { getHotspots } from '../lib/api';
import { 
  Flame, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Wind, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

export default function HotspotExplorer() {
  const { activeCountry, setActiveCountry, navigateTo, setActiveHotspotId } = useApp();

  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'pop_desc'

  useEffect(() => {
    async function fetchHotspots() {
      setLoading(true);
      try {
        const data = await getHotspots(activeCountry);
        setHotspots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHotspots();
  }, [activeCountry]);

  // Filter & search
  const filteredHotspots = hotspots.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || h.severity.toString() === severityFilter;
    return matchesSearch && matchesSeverity;
  }).sort((a, b) => {
    if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
    if (sortBy === 'pop_desc') return b.affected_population_estimate - a.affected_population_estimate;
    return 0;
  });

  const handleOpenEvent = (hotspotId) => {
    setActiveHotspotId(hotspotId);
    navigateTo('event-details', { hotspotId });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Hotspot Intelligence Catalog</h1>
          <ProvenanceTag type="inferred" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Active acute pollution hotspots scored by multi-source fusion of citizen sightings, sensors, and dispersion models.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card-surface p-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, source, or city..."
            className="input-control text-xs pl-9"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-ink-muted font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="select-control text-xs"
          >
            <option value="all">All Levels</option>
            <option value="4">Critical (Level 4)</option>
            <option value="3">High (Level 3)</option>
            <option value="2">Watch (Level 2)</option>
            <option value="1">Safe (Level 1)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-control text-xs"
          >
            <option value="risk_desc">Highest Risk Score</option>
            <option value="pop_desc">Most Population Impacted</option>
          </select>
        </div>

      </div>

      {/* Hotspots Grid */}
      {loading ? (
        <Loader text="Loading active hotspot catalog..." />
      ) : filteredHotspots.length === 0 ? (
        <EmptyState
          title="No hotspots matched your query"
          description="Try selecting another BRICS country airshed or adjusting your search filters."
          actionText="Reset Filters"
          onAction={() => { setSearchQuery(''); setSeverityFilter('all'); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => handleOpenEvent(hotspot.id)}
              className="card-surface p-5 cursor-pointer hover:border-brand hover:shadow-card transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <SeverityBadge severity={hotspot.severity} size="sm" />
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-risk-high border border-slate-200">
                    Risk {hotspot.risk_score}/100
                  </span>
                </div>

                <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors">
                  {hotspot.title}
                </h3>

                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  {hotspot.summary}
                </p>
              </div>

              {/* Metrics bar */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-surface p-2 rounded-md text-center border border-slate-200/80">
                    <span className="text-[10px] text-ink-muted block">PM2.5 Sensor</span>
                    <b className="font-mono text-ink text-sm">{hotspot.pollutants?.pm25?.value}</b> <span className="font-mono text-[10px]">µg/m³</span>
                  </div>
                  <div className="bg-surface p-2 rounded-md text-center border border-slate-200/80">
                    <span className="text-[10px] text-ink-muted block">Affected Population</span>
                    <b className="font-mono text-ink text-sm">{hotspot.affected_population_estimate?.toLocaleString()}</b>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span className="truncate">{hotspot.city} ({hotspot.country})</span>
                  </span>
                  <span className="text-brand font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform flex-shrink-0">
                    Dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
