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
  ChevronDown,
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
  html: `<div style="background-color:#B3251F;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(179,37,31,0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function AuthorityDashboard() {
  const { 
    t, 
    navigateTo, 
    setActiveAlertId, 
    refreshData, 
    alertsList, 
    setAlertsList 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Progressive Disclosure Accordions
  const [showMap, setShowMap] = useState(false);
  const [showEvidencePhoto, setShowEvidencePhoto] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

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
        'Officer Sharma (Municipal Lead)',
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
            actor: 'Officer Sharma (Municipal Lead)',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      
      {/* 1. Header & Live Operational Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-teal-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
              Environmental Operations Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE TELEMETRY ACTIVE</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Human-approved incident verification, multimodal triage, and multi-agency response dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Operational KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-rose-500">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Awaiting Review</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-risk-critical">{pendingCount}</div>
        </div>

        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-amber-500">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Critical Risk</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-risk-high">{criticalCount}</div>
        </div>

        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-teal-500">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Dispatched Units</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-teal-700">{dispatchCount}</div>
        </div>

        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-emerald-500">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Resolved Today</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700">{resolvedCount}</div>
        </div>

        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-purple-600 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Corridors Active</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-700">5</div>
        </div>
      </div>

      {/* 3. THREE-COLUMN OPERATIONAL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ============================================================ */}
        {/* COLUMN 1: PRIORITY INCIDENT QUEUE (Left - 4 / 12 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 card-surface p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand" />
              <span>Priority Incident Queue</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {filteredAlerts.length}
            </span>
          </div>

          {/* Quick Filter Buttons */}
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
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
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
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-ink-muted bg-surface rounded-card border border-dashed border-slate-200">
                No incidents match filter.
              </div>
            ) : (
              filteredAlerts.map((al) => {
                const isSelected = selectedIncident?.id === al.id;
                return (
                  <div
                    key={al.id}
                    onClick={() => handleSelectIncident(al)}
                    className={`p-2.5 rounded-card border text-xs cursor-pointer transition-all space-y-1 ${
                      isSelected
                        ? 'bg-brand-surface/70 border-brand shadow-xs ring-1 ring-brand'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={al.severity} size="xs" />
                        <span className="font-mono text-[10px] font-bold text-ink">#{al.id}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-ink">
                        Risk {Math.round(al.risk_score)}
                      </span>
                    </div>

                    <div className="font-bold text-ink text-xs truncate">{al.title}</div>
                    
                    <div className="text-[10px] text-ink-muted flex items-center justify-between">
                      <span className="truncate">{al.location_name}</span>
                      <span className="font-mono text-slate-400">
                        {new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUMN 2: INCIDENT INTELLIGENCE WORKSPACE (Center - 5 / 12 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIncident ? (
            <div className="card-surface p-4 space-y-3.5">
              
              {/* Incident Header Ribbon */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <SeverityBadge severity={selectedIncident.severity} size="xs" />
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 uppercase border border-slate-200">
                      {selectedIncident.status}
                    </span>
                    <ProvenanceTag type="inferred" size="xs" />
                  </div>
                  <h2 className="text-base font-extrabold text-ink leading-tight">
                    {selectedIncident.title}
                  </h2>
                  <div className="text-[11px] text-ink-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand" />
                    <b>{selectedIncident.location_name}</b>, {selectedIncident.country}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-ink-muted uppercase font-bold tracking-wider block">Assessed Risk</span>
                  <div className="text-xl font-extrabold font-mono text-risk-critical">
                    {Math.round(selectedIncident.risk_score)}<span className="text-[10px] font-normal text-ink-muted">/100</span>
                  </div>
                </div>
              </div>

              {/* Multi-Source Ground Evidence Pill */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-surface p-2.5 rounded-card border border-slate-200">
                <div>
                  <span className="text-[9px] text-ink-muted uppercase block font-bold">Sightings</span>
                  <span className="font-mono font-bold text-ink text-sm">{evidence.citizen_reports || 1}</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[9px] text-ink-muted uppercase block font-bold">Photos</span>
                  <span className="font-mono font-bold text-amber-600 text-sm">{evidence.photos || 1}</span>
                </div>
                <div>
                  <span className="text-[9px] text-ink-muted uppercase block font-bold">Sensors</span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">{evidence.sensor_anomalies || 1}</span>
                </div>
              </div>

              {/* Grounded AI Triage Synthesis */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand" />
                  <span>AI Triage Synthesis</span>
                </span>
                <p className="text-xs text-ink leading-relaxed bg-brand-surface/40 p-3 rounded-card border border-brand/20">
                  {selectedIncident.gemini_summary}
                </p>
              </div>

              {/* Progressive Disclosure: Geospatial Pinpoint Map Accordion */}
              <div className="border border-slate-200 rounded-card overflow-hidden">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-ink transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span>Geospatial Pinpoint ({selectedIncident.latitude?.toFixed(3)}, {selectedIncident.longitude?.toFixed(3)})</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform ${showMap ? 'rotate-180' : ''}`} />
                </button>
                {showMap && (
                  <div className="h-44 relative">
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
                            <div>{selectedIncident.location_name}</div>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>

              {/* Progressive Disclosure: Photo Evidence Accordion */}
              {selectedIncident.evidence_photo_url && (
                <div className="border border-slate-200 rounded-card overflow-hidden">
                  <button
                    onClick={() => setShowEvidencePhoto(!showEvidencePhoto)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-ink transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-brand" />
                      <span>Submitted Photographic Evidence</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform ${showEvidencePhoto ? 'rotate-180' : ''}`} />
                  </button>
                  {showEvidencePhoto && (
                    <div className="p-2 bg-slate-900 flex items-center justify-center">
                      <img 
                        src={selectedIncident.evidence_photo_url} 
                        alt="Evidence" 
                        className="max-h-48 rounded object-cover" 
                      />
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <EmptyState
              title="No incident selected"
              description="Select an alert from the priority queue to inspect intelligence and response actions."
            />
          )}
        </div>

        {/* ============================================================ */}
        {/* COLUMN 3: RESPONSE DECISION & ACTION PANEL (Right - 3 / 12 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {selectedIncident && (
            <div className="card-surface p-4 space-y-3.5 border-t-3 border-t-brand">
              
              {/* Response Protocol Points */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                  <ListChecks className="w-3 h-3 text-brand" />
                  <span>Recommended Action</span>
                </span>
                <div className="text-xs text-ink space-y-1 bg-surface p-2.5 rounded-card border border-slate-200">
                  {selectedIncident.recommended_intervention?.split('\n').map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                      <span className="font-bold text-brand">{idx + 1}.</span>
                      <span>{step.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Log Notes Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">
                  Officer Decision Log:
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record mitigation orders, inspection results..."
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
                    className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Field Unit</span>
                  </button>
                )}

                {selectedIncident.status !== 'resolved' && (
                  <button
                    onClick={() => handleAction('resolve')}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Contained & Resolved</span>
                  </button>
                )}

                {selectedIncident.status === 'resolved' && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Incident Resolved</span>
                  </div>
                )}

                {/* Open Full Dossier Link */}
                <button
                  onClick={() => navigateTo('alert-details', { alertId: selectedIncident.id })}
                  className="btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <span>Full Incident Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand" />
                </button>
              </div>

              {/* Progressive Disclosure: Audit Trail Accordion */}
              <div className="border border-slate-200 rounded-card overflow-hidden pt-1">
                <button
                  onClick={() => setShowAuditTrail(!showAuditTrail)}
                  className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-ink transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <History className="w-3 h-3 text-brand" />
                    <span>Audit Timeline ({selectedIncident.action_log?.length || 0})</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${showAuditTrail ? 'rotate-180' : ''}`} />
                </button>
                {showAuditTrail && (
                  <div className="p-2 space-y-1.5 max-h-36 overflow-y-auto text-[10px] bg-surface">
                    {selectedIncident.action_log?.map((log, idx) => (
                      <div key={idx} className="p-1.5 bg-white rounded border border-slate-200 space-y-0.5">
                        <div className="font-semibold text-ink capitalize flex justify-between">
                          <span>{log.action.replace('_', ' ')}</span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-brand font-medium">{log.actor}</div>
                        <div className="text-ink-muted">{log.notes}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
