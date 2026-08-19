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
  Building2,
  Activity,
  Flame,
  Radio
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { t, navigateTo, setActiveAlertId, refreshData, hotspotsList } = useApp();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'acknowledged' | 'escalated' | 'resolved'

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

  // Operational metrics computed from active data
  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const ackCount = alerts.filter(a => a.status === 'acknowledged').length;
  const dispatchCount = alerts.filter(a => a.status === 'escalated').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const highRiskCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Authority Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Municipal Environmental Authority
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Demo / Simulated Operational Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Human-approved environmental incident triage and response. Every action updates the municipal compliance audit trail.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>Refresh Incident Queue</span>
        </button>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="card-surface p-4 text-center space-y-1 border-t-2 border-t-rose-500">
          <span className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Pending Review</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-critical">
            {pendingCount}
          </div>
          <span className="text-[10px] text-ink-muted">Awaiting Triage</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1 border-t-2 border-t-amber-500">
          <span className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Acknowledged</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-risk-watch">
            {ackCount}
          </div>
          <span className="text-[10px] text-ink-muted">Under Assessment</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1 border-t-2 border-t-teal-500">
          <span className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Field Dispatch</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-brand">
            {dispatchCount}
          </div>
          <span className="text-[10px] text-ink-muted">Inspectors En Route</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1 border-t-2 border-t-emerald-500">
          <span className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Resolved</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700">
            {resolvedCount}
          </div>
          <span className="text-[10px] text-ink-muted">Contained Events</span>
        </div>

        <div className="card-surface p-4 text-center space-y-1 border-t-2 border-t-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-ink-muted font-medium uppercase tracking-wider">Active Hotspots</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {hotspotsList.length || 6}
          </div>
          <span className="text-[10px] text-ink-muted">Monitored Clusters</span>
        </div>
      </div>

      {/* Triage Status Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200">
        {[
          { id: 'all', label: `All Incidents (${alerts.length})` },
          { id: 'pending', label: `🚨 Pending Review (${pendingCount})` },
          { id: 'acknowledged', label: `👀 Acknowledged (${ackCount})` },
          { id: 'escalated', label: `🚒 Field Dispatched (${dispatchCount})` },
          { id: 'resolved', label: `✅ Resolved (${resolvedCount})` }
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

      {/* Incident Queue List */}
      {loading ? (
        <Loader text="Loading municipal incident queue..." />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No incidents in this queue"
          description="All reported environmental pollution events in this status category have been addressed."
          actionText="View All Incidents"
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
