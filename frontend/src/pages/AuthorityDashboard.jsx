import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import AlertCard from '../components/alerts/AlertCard';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { getAlerts } from '../lib/api';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  RefreshCw, 
  Filter,
  Send,
  Building2
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { t, navigateTo, setActiveAlertId, refreshData } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'acknowledged' | 'escalated' | 'resolved'

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts(statusFilter);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleUpdate = (updatedAlert) => {
    setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? updatedAlert : a));
    refreshData();
  };

  const handleOpenDetail = (alertId) => {
    setActiveAlertId(alertId);
    navigateTo('alert-details', { alertId });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.authTitle || 'Municipal Authority Alert Queue'}</h1>
            <ProvenanceTag type="inferred" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            {t.authSubtitle || 'Triage queue for severe localized emissions. Human-in-the-loop verification with audit-logged action logs.'}
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="btn-secondary text-xs py-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-surface p-4 text-center space-y-1">
          <span className="text-xs text-ink-muted font-medium">Pending Review</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-critical">
            {alerts.filter(a => a.status === 'pending').length}
          </div>
          <span className="text-[11px] text-ink-muted">Immediate Action</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1">
          <span className="text-xs text-ink-muted font-medium">Acknowledged</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-watch">
            {alerts.filter(a => a.status === 'acknowledged').length}
          </div>
          <span className="text-[11px] text-ink-muted">Under Assessment</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1">
          <span className="text-xs text-ink-muted font-medium">Field Dispatched</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">
            {alerts.filter(a => a.status === 'escalated').length}
          </div>
          <span className="text-[11px] text-ink-muted">Inspectors En Route</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1">
          <span className="text-xs text-ink-muted font-medium">Resolved Today</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
            {alerts.filter(a => a.status === 'resolved').length}
          </div>
          <span className="text-[11px] text-ink-muted">Contained Incidents</span>
        </div>
      </div>

      {/* Triage Status Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200">
        {[
          { id: 'all', label: `All Alerts (${alerts.length})` },
          { id: 'pending', label: `🚨 ${t.statusPending || 'Pending'}` },
          { id: 'acknowledged', label: `👀 ${t.statusAcknowledged || 'Acknowledged'}` },
          { id: 'escalated', label: `🚒 ${t.statusEscalated || 'Escalated'}` },
          { id: 'resolved', label: `✅ ${t.statusResolved || 'Resolved'}` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              statusFilter === tab.id 
                ? 'bg-brand text-white shadow-xs' 
                : 'bg-white text-ink-muted hover:text-ink border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Queue */}
      {loading ? (
        <Loader text="Fetching real-time authority alerts..." />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No alerts in this queue"
          description="All high-risk pollution incidents in this category have been addressed or cleared."
          actionText="View All Categories"
          onAction={() => setStatusFilter('all')}
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onUpdate={handleUpdate}
              onOpenDetail={() => handleOpenDetail(alert.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
