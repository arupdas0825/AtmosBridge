import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { getAlerts, updateAlert } from '../lib/api';
import { 
  Building2, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  MapPin, 
  Filter, 
  ShieldAlert, 
  ArrowRight, 
  FileText, 
  Radio, 
  ChevronDown, 
  History, 
  Camera, 
  RefreshCw, 
  Activity, 
  UserCheck, 
  Loader2, 
  ListChecks, 
  Layers, 
  ExternalLink,
  Shield
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function IncidentMapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.setView(coords, 14, { animate: true });
    }
  }, [coords, map]);
  return null;
}

const incidentPinIcon = L.divIcon({
  className: 'incident-pin',
  html: `<div style="background-color:#B3251F;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(179,37,31,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function AuthorityDashboard() {
  const { t, activeAlertId, setActiveAlertId, navigateTo, setPendingAlertsCount } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [showEvidencePhoto, setShowEvidencePhoto] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await getAlerts('all');
      setAlerts(data || []);
      setPendingAlertsCount((data || []).filter(a => a.status === 'pending').length);
      
      if (data && data.length > 0) {
        const found = data.find(a => a.id === activeAlertId) || data[0];
        setSelectedIncident(found);
      } else {
        setSelectedIncident(null);
      }
    } catch (err) {
      console.error(err);
      setAlerts([]);
      setSelectedIncident(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeAlertId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSelectIncident = (alert) => {
    setSelectedIncident(alert);
    setActiveAlertId(alert.id);
    setActionNotes('');
  };

  const handleAction = async (actionType) => {
    if (!selectedIncident) return;
    setActionLoading(true);
    try {
      const updated = await updateAlert(
        selectedIncident.id, 
        actionType, 
        'Municipal Officer', 
        actionNotes || `Operational status transitioned to ${actionType}.`
      );
      
      const newAlerts = alerts.map(a => a.id === updated.id ? updated : a);
      setAlerts(newAlerts);
      setSelectedIncident(updated);
      setPendingAlertsCount(newAlerts.filter(a => a.status === 'pending').length);
      setActionNotes('');
    } catch (err) {
      console.error('Failed to update incident', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading operational command queue and telemetry records..." />;

  // Filtered queue
  const filteredAlerts = alerts.filter(a => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'critical') return a.severity === 'critical' || a.severity === 4;
    return a.status === statusFilter;
  });

  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 4 || a.severity === 'high' || a.severity === 3).length;
  const dispatchCount = alerts.filter(a => a.status === 'escalated').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const corridorsCount = alerts.filter(a => a.cross_border_risk).length;

  const currentCoords = selectedIncident && selectedIncident.latitude && selectedIncident.longitude
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : [28.5355, 77.2690];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* 1. Header Ribbon */}
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
              <span>OPERATIONAL COMMAND QUEUE</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Human-controlled incident triage, multimodal evidence verification, and multi-agency response coordination.
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
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Pending Review</span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-risk-critical">{pendingCount}</div>
        </div>

        <div className="card-surface p-3 text-center space-y-0.5 border-l-3 border-l-amber-500">
          <span className="text-[10px] text-ink-muted font-bold uppercase tracking-wider">Critical/High Risk</span>
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
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-700">{corridorsCount}</div>
        </div>
      </div>

      {/* 3. OPERATIONAL WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUMN 1: PRIORITY INCIDENT QUEUE (4 / 12 Cols) */}
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
              <div className="p-8 text-center text-xs text-ink-muted bg-surface rounded-card border border-dashed border-slate-200 space-y-1.5">
                <Shield className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="font-semibold text-ink">No active incidents in queue</p>
                <p className="text-[11px]">Real citizen reports and physical monitoring triggers will appear here.</p>
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
                        Score {Math.round(al.risk_score || 50)}
                      </span>
                    </div>

                    <div className="font-bold text-ink text-xs truncate">{al.title}</div>
                    
                    <div className="text-[10px] text-ink-muted flex items-center justify-between">
                      <span className="truncate">{al.location_name || 'Location recorded'}</span>
                      <span className="font-mono text-slate-400">
                        {al.created_at ? new Date(al.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2 & 3: INCIDENT INTELLIGENCE WORKSPACE */}
        {!selectedIncident ? (
          <div className="lg:col-span-8 card-surface p-12 text-center space-y-3 border-dashed border-2 border-slate-200">
            <Shield className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-ink">Incident Queue Nominal</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              There are currently no uncontained pollution alerts requiring municipal review. Real citizen reports and physical monitoring triggers will appear in the queue for verification.
            </p>
          </div>
        ) : (
          <>
            {/* COLUMN 2: INCIDENT INTELLIGENCE WORKSPACE (5 / 12 Cols) */}
            <div className="lg:col-span-5 space-y-4">
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
                  </div>
                  <div className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded">
                    Score: {Math.round(selectedIncident.risk_score || 50)}
                  </div>
                </div>

                {/* Ground Sensor & Environmental Telemetry Cluster */}
                <div className="p-3 bg-surface rounded-card border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-ink text-[11px] uppercase tracking-wider block">Physical Environmental Context</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] text-ink-muted block">Location:</span>
                      <span className="font-semibold text-ink text-[11px] truncate block">{selectedIncident.location_name || 'Designated Zone'}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200/80">
                      <span className="text-[10px] text-ink-muted block">Time Logged:</span>
                      <span className="font-mono text-slate-700 text-[11px] block">
                        {selectedIncident.created_at ? new Date(selectedIncident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gemini Multimodal Vision Synthesis */}
                <div className="p-3.5 bg-brand-surface/40 rounded-card border border-brand/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    <span>Gemini Multimodal Triage Synthesis</span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed">
                    {selectedIncident.gemini_summary || 'Citizen report recorded with structured analysis.'}
                  </p>
                </div>

                {/* Recommended Interventions Checklist */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-ink text-[11px] uppercase tracking-wider block">Recommended Interventions</span>
                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-card text-[11px] text-amber-900 leading-relaxed whitespace-pre-line">
                    {selectedIncident.recommended_intervention || '1. Dispatch municipal inspector to verify reported emission.\n2. Cross-reference local monitoring stations.'}
                  </div>
                </div>

              </div>
            </div>

            {/* COLUMN 3: HUMAN GOVERNANCE ACTIONS (3 / 12 Cols) */}
            <div className="lg:col-span-3 card-surface p-4 space-y-4">
              <span className="text-xs font-bold text-ink uppercase tracking-wider block border-b border-slate-100 pb-2">
                Human Governance Actions
              </span>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-ink block">Action Notes / Directive:</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Record field notes or dispatch instructions..."
                  rows={3}
                  className="w-full text-xs p-2 rounded-card border border-slate-200 focus:ring-1 focus:ring-brand focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                {selectedIncident.status === 'pending' && (
                  <button
                    onClick={() => handleAction('acknowledge')}
                    disabled={actionLoading}
                    className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge Incident</span>
                  </button>
                )}

                {selectedIncident.status !== 'escalated' && selectedIncident.status !== 'resolved' && (
                  <button
                    onClick={() => handleAction('dispatch')}
                    disabled={actionLoading}
                    className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
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

                <button
                  onClick={() => navigateTo('alert-details', { alertId: selectedIncident.id })}
                  className="btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-1"
                >
                  <span>Full Incident Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand" />
                </button>
              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}
