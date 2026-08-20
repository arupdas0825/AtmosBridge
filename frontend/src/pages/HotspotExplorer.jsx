import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import InteractiveMap from '../components/map/InteractiveMap';
import { getHotspots } from '../lib/api';
import { BRICS_COUNTRIES } from '../lib/constants';
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
  ArrowUpDown, 
  Sparkles, 
  Globe2,
  RefreshCw,
  Layers,
  LayoutGrid,
  Map as MapIcon,
  AlertCircle,
  FileCheck2,
  Radio,
  FileText
} from 'lucide-react';

export default function HotspotExplorer() {
  const { activeCountry, setActiveCountry, navigateTo, setActiveHotspotId } = useApp();

  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'recent' | 'pop_desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const fetchHotspotsData = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);
    setErrorMsg(null);

    try {
      const data = await getHotspots(activeCountry);
      setHotspots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Hotspot intelligence is temporarily unavailable.');
      setHotspots([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHotspotsData(false);
  }, [activeCountry]);

  // Filter & Search Logic against real records
  const filteredHotspots = hotspots.filter(h => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      h.title?.toLowerCase().includes(query) ||
      h.city?.toLowerCase().includes(query) ||
      h.country?.toLowerCase().includes(query) ||
      h.event_type?.toLowerCase().includes(query) ||
      h.summary?.toLowerCase().includes(query);
    
    const matchesSeverity = severityFilter === 'all' || h.severity?.toString() === severityFilter;
    const matchesStatus = statusFilter === 'all' || (h.status || 'active').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesSeverity && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'risk_desc') return (b.risk_score || 0) - (a.risk_score || 0);
    if (sortBy === 'pop_desc') return (b.affected_population_estimate || 0) - (a.affected_population_estimate || 0);
    if (sortBy === 'recent') {
      const tA = new Date(a.last_updated || a.first_detected || 0).getTime();
      const tB = new Date(b.last_updated || b.first_detected || 0).getTime();
      return tB - tA;
    }
    return 0;
  });

  const handleOpenEvent = (hotspotId) => {
    setActiveHotspotId(hotspotId);
    navigateTo('event-details', { hotspotId });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setActiveCountry('all');
  };

  if (loading) return <Loader text="Scanning available environmental signals..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* 1. Scientifically Honest Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-brand" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Hotspot Intelligence Catalog
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Prototype Hotspot Detection Engine
            </span>
            <ProvenanceTag type="inferred" size="xs" />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-4xl">
          Abnormal pollution events detected through multi-source correlation of citizen reports, verified environmental telemetry, and atmospheric boundary layer conditions.
        </p>
      </div>

      {/* 2. Airshed Selection Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <span className="text-ink-muted font-bold text-[11px] uppercase mr-1 flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-brand" />
            <span>Airshed:</span>
          </span>
          {BRICS_COUNTRIES.map((c) => {
            const isSelected = activeCountry === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCountry(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-ink-muted border border-slate-200'
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => fetchHotspotsData(true)}
          disabled={isRefreshing}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Scanning...' : 'Refresh'}</span>
        </button>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="card-surface p-4 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px] flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, event type, or keyword..."
            className="input-control text-xs !pl-10 pr-8 py-2 w-full placeholder:text-slate-400"
            style={{ paddingLeft: '2.5rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-ink font-semibold px-1"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
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

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-ink-muted font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-control text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-control text-xs"
            >
              <option value="risk_desc">Highest Risk Score</option>
              <option value="recent">Most Recent</option>
              <option value="pop_desc">Population Impact</option>
            </select>
          </div>

          {/* View Toggle */}
          {hotspots.length > 0 && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
                }`}
                title="Catalog Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'map' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
                }`}
                title="Spatial Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. Content Area: Error State, Empty States, Map, or Catalog Grid */}
      {errorMsg ? (
        <div className="card-surface p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-red-200">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-ink">Hotspot intelligence is temporarily unavailable</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
              Verified hotspot telemetry feeds could not be retrieved from the backend pipeline.
            </p>
          </div>
          <button
            onClick={() => fetchHotspotsData(true)}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : hotspots.length === 0 ? (
        /* Truthful Empty State when zero active hotspots exist in repository */
        <div className="card-surface p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-slate-200">
          <Flame className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-ink">No active pollution hotspots detected</h3>
            <p className="text-xs text-ink-muted max-w-lg mx-auto leading-relaxed">
              Hotspots appear when multiple verified observations, citizen reports, or environmental signals indicate an abnormal pollution event.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('report')}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Pollution Sighting</span>
            </button>
            <button
              onClick={() => fetchHotspotsData(true)}
              className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      ) : filteredHotspots.length === 0 ? (
        /* Empty State when filters produce no matches */
        <div className="card-surface p-8 text-center space-y-3 border border-slate-200">
          <Filter className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-ink">No hotspots match the selected filters</h3>
            <p className="text-xs text-ink-muted">
              {activeCountry !== 'all' 
                ? `No verified hotspot data available for ${activeCountry} under current filters.`
                : 'Try adjusting your search keywords or resetting your severity filters.'}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
          >
            <span>Reset Filters</span>
          </button>
        </div>
      ) : viewMode === 'map' ? (
        /* Interactive Geospatial Map View */
        <div className="space-y-3">
          <div className="card-surface p-3 overflow-hidden">
            <InteractiveMap height="520px" showHotspots={true} />
          </div>
          <p className="text-xs text-ink-muted text-center">
            Displaying {filteredHotspots.length} verified hotspot event(s) across active regional airsheds. Click any marker for intelligence dossier.
          </p>
        </div>
      ) : (
        /* High-Fidelity Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHotspots.map((hotspot) => {
            const pm25Val = hotspot.pollutants?.pm25?.value;
            const updatedTs = hotspot.last_updated 
              ? new Date(hotspot.last_updated).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recent';

            return (
              <div
                key={hotspot.id}
                onClick={() => handleOpenEvent(hotspot.id)}
                className="card-surface p-5 cursor-pointer hover:border-brand hover:shadow-card transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <SeverityBadge severity={hotspot.severity} size="sm" />
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-risk-high border border-slate-200">
                      Hotspot Score: {hotspot.risk_score}/100
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors">
                      {hotspot.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-0.5">
                      <MapPin className="w-3 h-3 text-brand flex-shrink-0" />
                      <span className="truncate">{hotspot.city}, {hotspot.country}</span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {hotspot.summary}
                  </p>
                </div>

                {/* Metrics & Supporting Evidence Ribbon */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface p-2 rounded-md text-center border border-slate-200/80">
                      <span className="text-[10px] text-ink-muted block font-medium">Supporting Reports</span>
                      <b className="font-mono text-ink text-sm">{hotspot.reports_count || 1}</b> <span className="text-[10px] text-ink-muted">sighting(s)</span>
                    </div>
                    <div className="bg-surface p-2 rounded-md text-center border border-slate-200/80">
                      <span className="text-[10px] text-ink-muted block font-medium">Ambient PM2.5</span>
                      {pm25Val !== undefined ? (
                        <div>
                          <b className="font-mono text-ink text-sm">{pm25Val}</b> <span className="text-[10px] font-mono">µg/m³</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink-muted font-mono">Unmetered</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-ink-muted pt-1">
                    <div className="flex items-center gap-1.5">
                      <ProvenanceTag type={hotspot.provenance || 'inferred'} size="xs" />
                      <span className="text-[10px] font-mono text-ink-muted">Updated {updatedTs}</span>
                    </div>
                    <span className="text-brand font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform flex-shrink-0">
                      View Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
