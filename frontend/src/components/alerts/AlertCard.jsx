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
  FileText
} from 'lucide-react';

export default function AlertCard({ alert, onUpdate = () => {}, onOpenDetail = () => {} }) {
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAction = async (actionType) => {
    setLoadingAction(true);
    try {
      const updated = await updateAlert(
        alert.id,
        actionType,
        'Officer Sharma (Municipal EPC)',
        `Action ${actionType} triggered from Authority Dashboard.`
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

  return (
    <div className="card-surface p-5 border-l-4 hover:shadow-card transition-all space-y-4 font-sans" style={{
      borderLeftColor: alert.severity === 'critical' ? '#B3251F' : alert.severity === 'high' ? '#D9622B' : '#C98A12'
    }}>
      
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={alert.severity} size="sm" />
            <span className="font-mono text-xs text-ink-muted">ID: {alert.id}</span>
            <ProvenanceTag type="inferred" size="xs" />
          </div>
          <h4 className="font-bold text-base text-ink hover:text-brand cursor-pointer transition-colors" onClick={onOpenDetail}>
            {alert.title}
          </h4>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-ink border border-slate-200">
            Risk {alert.risk_score}/100
          </span>
          <div className="text-[11px] text-ink-muted mt-1.5 flex items-center justify-end gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Location & Population */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
          <span className="font-medium text-ink">{alert.location_name} ({alert.country})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
          <span>Affected Population: <b className="text-ink font-mono">{alert.affected_population?.toLocaleString()}</b></span>
        </div>
      </div>

      {/* AI Incident Summary */}
      <div className="bg-surface p-3.5 rounded-card border border-slate-200/80 text-xs text-ink space-y-1">
        <div className="flex items-center gap-1 font-semibold text-brand text-[11px] uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5" />
          <span>Gemini Incident Dossier</span>
        </div>
        <p className="text-ink leading-relaxed text-xs">{alert.gemini_summary}</p>
      </div>

      {/* Action Buttons (Human-in-the-Loop Governance) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {isPending && (
            <button
              onClick={() => handleAction('acknowledge')}
              disabled={loadingAction}
              className="btn-primary text-xs py-1.5 px-3 min-h-[36px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
          )}

          {(isPending || isAcknowledged) && (
            <button
              onClick={() => handleAction('escalate')}
              disabled={loadingAction}
              className="btn-destructive text-xs py-1.5 px-3 min-h-[36px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Escalate & Dispatch Unit</span>
            </button>
          )}

          {alert.status === 'escalated' && (
            <button
              onClick={() => handleAction('resolve')}
              disabled={loadingAction}
              className="btn-secondary text-xs py-1.5 px-3 min-h-[36px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenDetail}
          className="text-xs font-semibold text-brand hover:text-brand-dark flex items-center gap-1 py-1.5 px-2.5 rounded-md hover:bg-brand-surface transition-colors"
        >
          <span>Full Incident Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
