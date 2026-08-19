import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { getAlerts, updateAlert } from '../lib/api';
import { 
  Building2, 
  ShieldAlert, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  Filter, 
  Activity, 
  Flame, 
  Radio, 
  Camera, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  ArrowRight, 
  AlertTriangle, 
  Loader2, 
  History, 
  ListChecks, 
  UserCheck, 
  Globe2 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Leaflet Map Controller to fly to active incident coordinates
function IncidentMapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, 13, { duration: 0.8 });
    }
  }, [coords, map]);
  return null;
}

const incidentPinIcon = L.divIcon({
  className: 'authority-incident-pin',
  html: `<div style="background-color:#B3251F;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(179,37,31,0.8);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function AuthorityDashboard() {
  const { 
    t, 
    navigateTo, 
    setActiveAlertId, 
    refreshData, 
    hotspotsList, 
    alertsList, 
    setAlertsList 
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync selected incident when alerts change or on mount
  useEffect(() => {
    if (alertsList && alertsList.length > 0) {
      if (!selectedIncident || !alertsList.some(a => a.id === selectedIncident.id)) {
        setSelectedIncident(alertsList[0]);
      } else {
        const updated = alertsList.find(a => a.id === selectedIncident.id);
        if (updated) setSelectedIncident(updated);
      }
    }
  }, [alertsList]);

  // Filter alerts by status / severity
  const filteredAlerts = alertsList.filter((a) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'critical') return a.severity === 'critical';
    if (statusFilter === 'high') return a.severity === 'high';
    return a.status === statusFilter;
  });

  const handleSelectIncident = (alert) => {
    setSelectedIncident(alert);
    setActiveAlertId(alert.id);
  };

  const handleAction = async (actionType) => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const updated = await updateAlert(
        selectedIncident.id,
        actionType,
        'Officer Sharma (Municipal EPC Lead)',
        officerNotes || `Operational action ${actionType} recorded in compliance log.`
      );
      
      const newStatusMap = {
        acknowledge: 'acknowledged',
        dispatch: 'escalated',
        resolve: 'resolved'
      };

      const finalAlert = updated || {
        ...selectedIncident,
        status: newStatusMap[actionType] || 'acknowledged',
        action_log: [
          ...(selectedIncident.action_log || []),
          {
            action: actionType,
            actor: 'Officer Sharma (Municipal EPC Lead)',
            timestamp: new Date().toISOString(),
            notes: officerNotes || `Operational action ${actionType} recorded in compliance log.`
          }
        ]
      };

      setAlertsList(prev => prev.map(a => a.id === finalAlert.id ? finalAlert : a));
      setSelectedIncident(finalAlert);
      setOfficerNotes('');
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Operational metrics
  const pendingCount = alertsList.filter(a => a.status === 'pending').length;
  const criticalCount = alertsList.filter(a => a.severity === 'critical').length;
  const dispatchCount = alertsList.filter(a => a.status === 'escalated').length;
  const resolvedCount = alertsList.filter(a => a.status === 'resolved').length;

  const currentCoords = selectedIncident?.latitude && selectedIncident?.longitude 
    ? [selectedIncident.latitude, selectedIncident.longitude] 
    : [28.5355, 77.2690];

  const evidence = selectedIncident?.evidence_count || {
    citizen_reports: 6,
    photos: 1,
    sensor_anomalies: 1
  };

  // Stepper state computation
  const getStepState = (step) => {
    if (!selectedIncident) return 'pending';
    if (step === 'received') return 'completed';
    if (step === 'triage') return 'completed';
    if (step === 'review') {
      return selectedIncident.status !== 'pending' ? 'completed' : 'current';
    }
    if (step === 'dispatch') {
      if (selectedIncident.status === 'resolved') return 'completed';
      if (selectedIncident.status === 'escalated') return 'current';
      return 'pending';
    }
    if (step === 'resolve') {
      return selectedIncident.status === 'resolved' ? 'completed' : 'pending';
    }
    return 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* 1. Header & Live Intelligence Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Environmental Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Intelligence Systems Operational</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Human-approved environmental incident triage, intelligence and response. 
            <span className="text-brand font-medium ml-1">One Environmental Intelligence Layer. Two Action Surfaces.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Demo operational data
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Intelligence</span>
          </button>
        </div>
      </div>

      {/* 2. Top Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="card-surface p-3.5 sm:p-4 text-center space-y-0.5 border-t-2 border-t-rose-500">
          <span className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Active Alerts</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-critical">
            {pendingCount}
          </div>
          <span className="text-[10px] text-ink-muted">Awaiting Triage</span>
        </div>

        <div className="card-surface p-3.5 sm:p-4 text-center space-y-0.5 border-t-2 border-t-amber-500">
          <span className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Critical Risk</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-high">
            {criticalCount}
          </div>
          <span className="text-[10px] text-ink-muted">Immediate Danger</span>
        </div>

        <div className="card-surface p-3.5 sm:p-4 text-center space-y-0.5 border-t-2 border-t-teal-500">
          <span className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Field Response</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">
            {dispatchCount}
          </div>
          <span className="text-[10px] text-ink-muted">Units Dispatched</span>
        </div>

        <div className="card-surface p-3.5 sm:p-4 text-center space-y-0.5 border-t-2 border-t-emerald-500">
          <span className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Resolved Today</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
            {resolvedCount}
          </div>
          <span className="text-[10px] text-ink-muted">Incidents Contained</span>
        </div>

        <div className="card-surface p-3.5 sm:p-4 text-center space-y-0.5 border-t-2 border-t-purple-600 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-ink-muted font-bold uppercase tracking-wider">Cross-Border Watch</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-700">5</div>
          <span className="text-[10px] text-ink-muted">Plume Corridors</span>
        </div>
      </div>

      {/* 3. THREE-ZONE COMMAND CENTER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* ZONE 1 (LEFT - 3.5 Cols): ALERT FILTERS & INCIDENT QUEUE */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 card-surface p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand" />
              <span>Priority Incident Queue</span>
            </span>
            <span className="text-[11px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {filteredAlerts.length} Total
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'critical', label: '🚨 Critical' },
              { id: 'pending', label: 'Pending' },
              { id: 'escalated', label: 'Dispatched' },
              { id: 'resolved', label: 'Resolved' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-surface hover:bg-slate-200 text-ink-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Incident Queue List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted bg-surface rounded-card border border-dashed border-slate-200">
                No incidents match filter criteria.
              </div>
            ) : (
              filteredAlerts.map((al) => {
                const isSelected = selectedIncident?.id === al.id;
                return (
                  <div
                    key={al.id}
                    onClick={() => handleSelectIncident(al)}
                    className={`p-3 rounded-card border text-xs cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-brand-surface/70 border-brand shadow-xs ring-1 ring-brand'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={al.severity} size="xs" />
                        <span className="font-mono text-[10px] text-ink-muted">#{al.id}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-ink">
                        Risk {Math.round(al.risk_score)}
                      </span>
                    </div>

                    <div className="font-bold text-ink truncate">{al.title}</div>
                    
                    <div className="text-[11px] text-ink-muted flex items-center justify-between">
                      <span className="truncate">{al.location_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-ink-muted">
                      <span className="capitalize font-semibold text-brand">{al.status}</span>
                      <span>{al.evidence_count?.citizen_reports || 1} sightings • {al.evidence_count?.photos || 0} photo</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* ZONE 2 (CENTER - 5 Cols): SELECTED INCIDENT WORKSPACE */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-5">
          {selectedIncident ? (
            <div className="card-surface p-5 space-y-4">
              
              {/* Incident Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={selectedIncident.severity} size="sm" />
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 uppercase border border-slate-200">
                      {selectedIncident.status}
                    </span>
                    <ProvenanceTag type="inferred" size="xs" />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-ink">
                    {selectedIncident.title}
                  </h2>
                  <div className="text-xs text-ink-muted flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <b>{selectedIncident.location_name}</b>, {selectedIncident.country}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider block">Assessed Risk</span>
                  <div className="text-2xl font-extrabold font-mono text-risk-critical">
                    {Math.round(selectedIncident.risk_score)} <span className="text-xs font-normal text-ink-muted">/100</span>
                  </div>
                </div>
              </div>

              {/* Multi-Source Evidence Context */}
              <div className="bg-surface p-3 rounded-card border border-slate-200 grid grid-cols-3 gap-2 text-xs text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-ink-muted uppercase block">Sightings</span>
                  <div className="font-mono font-bold text-ink text-sm">
                    {evidence.citizen_reports || 6}
                  </div>
                </div>
                <div className="space-y-0.5 border-x border-slate-200">
                  <span className="text-[10px] text-ink-muted uppercase block">Photos</span>
                  <div className="font-mono font-bold text-amber-600 text-sm">
                    {evidence.photos || 1}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-ink-muted uppercase block">Sensors</span>
                  <div className="font-mono font-bold text-indigo-600 text-sm">
                    {evidence.sensor_anomalies || 1}
                  </div>
                </div>
              </div>

              {/* "Why this alert?" - Gemini AI Structured Synthesis */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  <span>Why this alert? — Grounded AI Synthesis</span>
                </span>
                <p className="text-xs text-ink leading-relaxed bg-brand-surface/40 p-3.5 rounded-card border border-brand/20">
                  {selectedIncident.gemini_summary}
                </p>
              </div>

              {/* Mini Geospatial Pinpoint Map */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  <span>Geospatial Pinpoint ({selectedIncident.latitude?.toFixed(4)}, {selectedIncident.longitude?.toFixed(4)})</span>
                </span>
                <div className="h-44 rounded-card overflow-hidden border border-slate-200 relative">
                  <MapContainer
                    center={currentCoords}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <IncidentMapController coords={currentCoords} />
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={currentCoords} icon={incidentPinIcon}>
                      <Popup>
                        <div className="text-xs font-sans">
                          <b>{selectedIncident.title}</b>
                          <div className="text-slate-600">{selectedIncident.location_name}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>

              {/* Photo Evidence Preview (if attached) */}
              {selectedIncident.evidence_photo_url && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-brand" />
                    <span>Submitted Photographic Evidence</span>
                  </span>
                  <div className="rounded-card overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                    <img 
                      src={selectedIncident.evidence_photo_url} 
                      alt="Evidence" 
                      className="max-h-48 w-full object-cover" 
                    />
                  </div>
                </div>
              )}

            </div>
          ) : (
            <EmptyState
              title="No incident selected"
              description="Select an alert from the priority queue on the left to inspect multi-source evidence and dispatch actions."
            />
          )}
        </div>

        {/* ============================================================ */}
        {/* ZONE 3 (RIGHT - 3.5 Cols): DECISION CENTER & ACTION FLOW */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-5">
          {selectedIncident && (
            <div className="card-surface p-5 space-y-4 border-t-4 border-t-brand">
              
              {/* Operational Action Flow Stepper */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
                  Action Flow Status
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span className="text-ink font-medium">1. Report Received</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span className="text-ink font-medium">2. AI Triage & Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      getStepState('review') === 'completed' ? 'bg-emerald-600' : 'bg-brand animate-pulse'
                    }`} />
                    <span className="text-ink font-medium">3. Human Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      getStepState('dispatch') === 'completed' ? 'bg-emerald-600' : getStepState('dispatch') === 'current' ? 'bg-teal-600 animate-pulse' : 'bg-slate-300'
                    }`} />
                    <span className={getStepState('dispatch') !== 'pending' ? 'text-ink font-medium' : 'text-slate-400'}>
                      4. Field Response
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      getStepState('resolve') === 'completed' ? 'bg-emerald-600' : 'bg-slate-300'
                    }`} />
                    <span className={getStepState('resolve') === 'completed' ? 'text-ink font-medium' : 'text-slate-400'}>
                      5. Containment & Resolution
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Municipal Response Protocol */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-brand" />
                  <span>Recommended Response</span>
                </span>
                <div className="text-xs text-ink space-y-1.5 bg-surface p-3 rounded-card border border-slate-200">
                  {selectedIncident.recommended_intervention?.split('\n').map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                      <span className="font-bold text-brand">{idx + 1}.</span>
                      <span>{step.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Notes Textbox */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">
                  Officer Operational Log:
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record dispatch orders, fine notices, or field verification notes..."
                  rows={2}
                  className="input-control text-xs"
                />
              </div>

              {/* Consequential Human-Controlled Buttons */}
              <div className="space-y-2 pt-1">
                {selectedIncident.status === 'pending' && (
                  <button
                    onClick={() => handleAction('acknowledge')}
                    disabled={actionLoading}
                    className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Acknowledge Incident</span>
                  </button>
                )}

                {selectedIncident.status !== 'resolved' && (
                  <button
                    onClick={() => handleAction('dispatch')}
                    disabled={actionLoading || selectedIncident.status === 'escalated'}
                    className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Field Unit</span>
                  </button>
                )}

                {selectedIncident.status !== 'resolved' && (
                  <button
                    onClick={() => handleAction('resolve')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Contained & Resolved</span>
                  </button>
                )}

                {selectedIncident.status === 'resolved' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Incident Resolved & Closed</span>
                  </div>
                )}

                {/* View Full Incident Dossier Link */}
                <button
                  onClick={() => navigateTo('alert-details', { alertId: selectedIncident.id })}
                  className="btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <span>Open Full Incident Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand" />
                </button>
              </div>

              {/* Response Timeline History */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-brand" />
                  <span>Audit Timeline</span>
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto text-[11px] pr-1">
                  {selectedIncident.action_log?.map((log, idx) => (
                    <div key={idx} className="p-2 bg-surface rounded border border-slate-200 space-y-0.5">
                      <div className="font-semibold text-ink capitalize flex justify-between">
                        <span>{log.action.replace('_', ' ')}</span>
                        <span className="font-mono text-[9px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[10px] text-brand">{log.actor}</div>
                      <div className="text-[10px] text-ink-muted">{log.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
