import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import { getAlertById, updateAlert } from '../lib/api';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  FileText, 
  ListChecks, 
  History, 
  UserCheck,
  Camera,
  Radio,
  Flame,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customPinIcon = L.divIcon({
  className: 'custom-alert-pin',
  html: `<div style="background-color:#B3251F;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(179,37,31,0.6);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function AlertDetails() {
  const { activeAlertId, navigateTo, refreshData, t } = useApp();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadAlert() {
      if (!activeAlertId) return;
      setLoading(true);
      try {
        const data = await getAlertById(activeAlertId);
        setAlert(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAlert();
  }, [activeAlertId]);

  const handleAction = async (actionType) => {
    if (!alert) return;
    setActionLoading(true);
    try {
      const updated = await updateAlert(
        alert.id,
        actionType,
        'Officer Sharma (Municipal EPC Lead)',
        actionNotes || `Operational action ${actionType} recorded in municipal audit trail.`
      );
      if (updated) {
        setAlert(updated);
        setActionNotes('');
        refreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading incident triage dossier..." />;
  if (!alert) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center font-sans">
        <p className="text-sm text-ink-muted">Alert record not found.</p>
        <button onClick={() => navigateTo('authority')} className="btn-primary mt-4">
          Return to Authority Dashboard
        </button>
      </div>
    );
  }

  const evidence = alert.evidence_count || {
    citizen_reports: 6,
    photos: 1,
    sensor_anomalies: 1
  };

  const hasCoords = alert.latitude && alert.longitude;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Back Link */}
      <button 
        onClick={() => navigateTo('authority')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Authority Alert Queue</span>
      </button>

      {/* Header Alert Dossier */}
      <div className="card-surface p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={alert.severity} size="sm" />
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 uppercase border border-slate-200">
                Status: {alert.status}
              </span>
              <span className="font-mono text-xs text-ink-muted">Incident #{alert.id}</span>
              <ProvenanceTag type="inferred" size="xs" />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-ink">
              {alert.title}
            </h1>

            <p className="text-xs text-ink-muted">
              Pollution Classification: <b className="text-brand font-semibold">{alert.pollution_type || 'Industrial Combustion'}</b>
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-ink-muted">Assessed Risk Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-critical">
              {Math.round(alert.risk_score)} <span className="text-xs font-normal text-ink-muted">/ 100</span>
            </div>
            <div className="text-[11px] text-ink-muted font-mono mt-0.5">
              Logged: {new Date(alert.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
        </div>

        {/* Location & Population Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
            <div>
              <span className="block text-[11px] text-ink-muted">Incident Location</span>
              <b className="text-ink">{alert.location_name}</b>, {alert.country}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand flex-shrink-0" />
            <div>
              <span className="block text-[11px] text-ink-muted">Estimated Population Exposed</span>
              <b className="text-ink font-mono">{alert.affected_population?.toLocaleString()} residents</b>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand flex-shrink-0" />
            <div>
              <span className="block text-[11px] text-ink-muted">GPS Coordinates</span>
              <b className="text-ink font-mono">{alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: AI Synthesis, Recommended Interventions, Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Gemini AI Incident Analysis */}
          <div className="card-surface p-6 space-y-3">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand" />
              <span>Google Gemini AI Structured Synthesis</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink leading-relaxed bg-surface p-4 rounded-card border border-slate-200">
              {alert.gemini_summary}
            </p>
          </div>

          {/* Recommended Municipal Interventions */}
          <div className="card-surface p-6 space-y-3">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-brand" />
              <span>Recommended Authority Protocol</span>
            </h3>
            <div className="text-xs text-ink space-y-2 bg-brand-surface/40 p-4 rounded-card border border-brand/20">
              {alert.recommended_intervention?.split('\n').map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Geospatial Map Pinpoint */}
          {hasCoords && (
            <div className="card-surface p-6 space-y-3">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand" />
                <span>Geospatial Pinpoint Location</span>
              </h3>
              <div className="h-56 rounded-card overflow-hidden border border-slate-200">
                <MapContainer
                  center={[alert.latitude, alert.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[alert.latitude, alert.longitude]} icon={customPinIcon}>
                    <Popup>
                      <div className="text-xs font-sans">
                        <b>{alert.title}</b>
                        <div className="text-slate-600 mt-1">{alert.location_name}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Photo Evidence Gallery */}
          {alert.evidence_photo_url && (
            <div className="card-surface p-6 space-y-3">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand" />
                <span>Submitted Photo Evidence</span>
              </h3>
              <div className="rounded-card overflow-hidden border border-slate-200 max-h-72 bg-slate-900 flex items-center justify-center">
                <img 
                  src={alert.evidence_photo_url} 
                  alt="Incident evidence photo" 
                  className="max-h-72 w-full object-cover" 
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Governance Actions & Audit Trail (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Decision Center */}
          <div className="card-surface p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand" />
              <span>Human-in-the-Loop Decision</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-ink uppercase tracking-wider">
                Officer Operational Notes:
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Log dispatch orders, fine notices, or containment instructions..."
                rows={3}
                className="input-control text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAction('acknowledge')}
                disabled={actionLoading || alert.status === 'acknowledged' || alert.status === 'resolved'}
                className="btn-secondary text-xs py-2 justify-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Acknowledge</span>
              </button>

              <button
                onClick={() => handleAction('dispatch')}
                disabled={actionLoading || alert.status === 'escalated' || alert.status === 'resolved'}
                className="px-3 py-2 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Unit</span>
              </button>

              <button
                onClick={() => handleAction('resolve')}
                disabled={actionLoading || alert.status === 'resolved'}
                className="col-span-2 px-3 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Mark Incident Contained & Resolved</span>
              </button>
            </div>
          </div>

          {/* Response Timeline & Audit Trail */}
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-brand" />
                <span>Response Timeline</span>
              </h3>
              <span className="text-[10px] text-ink-muted">Simulated / Logged</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Initial Report Entry */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold">
                  1
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-semibold text-ink">Citizen Observation Received</div>
                  <div className="text-[11px] text-ink-muted font-mono">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <p className="text-ink-muted text-[11px]">Geo-tagged report submitted by field observers.</p>
                </div>
              </div>

              {/* Action Log Entries */}
              {alert.action_log?.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold">
                    {idx + 2}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-semibold text-ink capitalize">{log.action.replace('_', ' ')}</div>
                    <div className="text-[11px] text-brand font-medium">By: {log.actor}</div>
                    <div className="text-[10px] text-ink-muted font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-ink-muted text-[11px] leading-relaxed">{log.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
