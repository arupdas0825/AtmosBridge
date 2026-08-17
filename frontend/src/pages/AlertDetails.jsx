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
  UserCheck
} from 'lucide-react';

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
        actionNotes || `Operational action ${actionType} recorded.`
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
        <p className="text-sm text-ink-muted">Alert not found.</p>
        <button onClick={() => navigateTo('authority')} className="btn-primary mt-4">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Back link */}
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
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 uppercase border border-slate-200">
                Status: {alert.status}
              </span>
              <ProvenanceTag type="inferred" size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{alert.title}</h1>
            <div className="flex items-center gap-4 text-xs text-ink-muted pt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                {alert.location_name} ({alert.country})
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-ink-muted" />
                Affected Pop: <b className="text-ink font-mono">{alert.affected_population?.toLocaleString()}</b>
              </span>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-card border border-slate-200 text-center min-w-[130px] flex-shrink-0">
            <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">Risk Urgency</span>
            <span className="text-3xl font-extrabold font-mono text-risk-high block mt-0.5">{alert.risk_score}</span>
            <span className="text-[10px] text-ink-muted block">Composite Score</span>
          </div>
        </div>
      </div>

      {/* Grid: Evidence & Recommended Intervention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Sighting Evidence */}
        <div className="card-surface p-6 space-y-4">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand" />
            <span>Gemini Incident Evaluation</span>
          </h3>

          {alert.evidence_photo_url && (
            <div className="rounded-md overflow-hidden border border-slate-200 aspect-video bg-slate-900">
              <img src={alert.evidence_photo_url} alt="Evidence" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-surface p-3.5 rounded-card border border-slate-200/80 text-xs text-ink leading-relaxed">
            {alert.gemini_summary}
          </div>
        </div>

        {/* Recommended Authority Protocol */}
        <div className="card-surface p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-700" />
              <span>Recommended Municipal Interventions</span>
            </h3>

            <div className="bg-emerald-50/50 p-4 rounded-card border border-emerald-200/80 text-xs text-ink space-y-2 whitespace-pre-line leading-relaxed font-mono">
              {alert.recommended_intervention}
            </div>
          </div>

          {/* Operational Action Form */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
              Officer Action Log Notes:
            </label>
            <input
              type="text"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Unit 04 dispatched. Notice issued."
              className="input-control text-xs"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleAction('acknowledge')}
                disabled={actionLoading}
                className="btn-primary text-xs py-2 px-3 flex-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
              <button
                onClick={() => handleAction('escalate')}
                disabled={actionLoading}
                className="btn-destructive text-xs py-2 px-3 flex-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Escalate & Dispatch</span>
              </button>
              <button
                onClick={() => handleAction('resolve')}
                disabled={actionLoading}
                className="btn-secondary text-xs py-2 px-3 flex-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resolve Incident</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Log History */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand" />
          <h3 className="font-bold text-sm text-ink">{t.auditLogTitle || 'Governance Audit Trail'}</h3>
        </div>

        {(!alert.action_log || alert.action_log.length === 0) ? (
          <p className="text-xs text-ink-muted">No operational actions logged yet. Awaiting officer triage.</p>
        ) : (
          <div className="space-y-2">
            {alert.action_log.map((entry, idx) => (
              <div key={idx} className="bg-surface p-3 rounded-md border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-brand uppercase font-mono">{entry.action}</span>
                  <span className="text-ink-muted ml-2 font-medium">by {entry.actor}</span>
                  {entry.notes && <p className="text-ink text-[11px] mt-0.5">{entry.notes}</p>}
                </div>
                <span className="font-mono text-[10px] text-ink-muted">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
