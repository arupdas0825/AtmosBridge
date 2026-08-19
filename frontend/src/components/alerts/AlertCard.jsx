import React, { useState } from 'react';
import SeverityBadge from '../common/SeverityBadge';
import ProvenanceTag from '../common/ProvenanceTag';
import { updateAlert } from '../../lib/api';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Send, 
  ChevronRight,
  AlertTriangle,
  FileText,
  Camera,
  Radio,
  ExternalLink,
  Flame,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function AlertCard({ alert, onUpdate = () => {}, onOpenDetail = () => {} }) {
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAction = async (actionType) => {
    setLoadingAction(true);
    try {
      const updated = await updateAlert(
        alert.id,
        actionType,
        'Officer Sharma (Municipal EPC Lead)',
        `Action ${actionType} recorded from Authority Dashboard.`
      );
      if (updated) onUpdate(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const isPending = alert.status === 'pending';
  const isAcknowledged = alert.status === 'acknowledged';
  const isEscalated = alert.status === 'escalated';
  const isResolved = alert.status === 'resolved';

  const evidence = alert.evidence_count || {
    citizen_reports: 6,
    photos: 1,
    sensor_anomalies: 1
  };

  const statusLabel = {
    pending: { label: 'Pending Review', bg: 'bg-rose-100 text-rose-800 border-rose-200' },
    acknowledged: { label: 'Acknowledged', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    escalated: { label: 'Field Dispatched', bg: 'bg-teal-100 text-teal-800 border-teal-200' },
    resolved: { label: 'Resolved', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  }[alert.status] || { label: alert.status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };

  return (
    <div 
      className="card-surface p-5 sm:p-6 border-l-4 hover:shadow-card transition-all space-y-4 font-sans" 
      style={{
        borderLeftColor: alert.severity === 'critical' ? '#B3251F' : alert.severity === 'high' ? '#D9622B' : alert.severity === 'watch' ? '#C98A12' : '#1B7A4D'
      }}
    >
      
      {/* Top Bar: Severity, ID, Status, Risk Score, Timestamp */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={alert.severity} size="sm" />
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border font-mono ${statusLabel.bg}`}>
              {statusLabel.label}
            </span>
            <span className="font-mono text-xs text-ink-muted">ID: {alert.id}</span>
            <ProvenanceTag type="inferred" size="xs" />
          </div>

          <h3 
            className="font-extrabold text-base sm:text-lg text-ink hover:text-brand cursor-pointer transition-colors flex items-center gap-1.5 pt-0.5" 
            onClick={onOpenDetail}
          >
            <span>{alert.title}</span>
            <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-brand" />
          </h3>
          
          <div className="text-xs text-ink-muted flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-brand">{alert.pollution_type || 'Industrial Emission'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              <b>{alert.location_name}</b>, {alert.country}
            </span>
          </div>
        </div>

        {/* Risk & Time */}
        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-ink-muted font-medium">Risk Score:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
              {Math.round(alert.risk_score)} / 100
            </span>
          </div>
          <div className="text-[11px] text-ink-muted flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Evidence Multi-Source Summary Bar */}
      <div className="bg-surface p-3 rounded-card border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          <span className="text-ink-muted">Citizen Reports: <b className="text-ink font-mono">{evidence.citizen_reports || 6} sightings</b></span>
        </div>
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-ink-muted">Photo Evidence: <b className="text-ink font-mono">{evidence.photos || 1} verified</b></span>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="text-ink-muted">Sensors: <b className="text-ink font-mono">{evidence.sensor_anomalies || 1} anomaly spike</b></span>
        </div>
      </div>

      {/* Gemini AI Synthesis */}
      <div className="p-3.5 bg-brand-surface/40 border border-brand/20 rounded-card text-xs text-ink space-y-1.5">
        <div className="flex items-center gap-1 font-semibold text-brand text-[11px] uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>Gemini Evidence Synthesis</span>
        </div>
        <p className="text-ink leading-relaxed text-xs">{alert.gemini_summary}</p>
      </div>

      {/* Authority Workflow Action Buttons (Real State Change) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Acknowledge Button */}
          {isPending && (
            <button
              onClick={() => handleAction('acknowledge')}
              disabled={loadingAction}
              className="btn-primary text-xs py-1.5 px-3.5 min-h-[36px]"
            >
              {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Acknowledge Incident</span>
            </button>
          )}

          {/* Dispatch Field Unit Button */}
          {(isPending || isAcknowledged) && (
            <button
              onClick={() => handleAction('dispatch')}
              disabled={loadingAction}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs transition-colors min-h-[36px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Field Unit</span>
            </button>
          )}

          {/* Resolve Incident Button */}
          {(isAcknowledged || isEscalated) && (
            <button
              onClick={() => handleAction('resolve')}
              disabled={loadingAction}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition-colors min-h-[36px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}

          {/* Status badge when resolved */}
          {isResolved && (
            <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Incident Contained & Resolved</span>
            </span>
          )}
        </div>

        {/* View Full Dossier */}
        <button
          onClick={onOpenDetail}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 min-h-[36px]"
        >
          <span>View Full Dossier</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand" />
        </button>
      </div>

    </div>
  );
}
