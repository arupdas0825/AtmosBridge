import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import ProvenanceTag from '../common/ProvenanceTag';

export default function PredictionTimelineChart({ forecast = [] }) {
  if (!forecast || forecast.length === 0) {
    return <div className="text-sm text-ink-muted p-6 text-center">No prediction forecast available.</div>;
  }

  // Format chart data with clean local time formatting and truthful target labels
  const chartData = forecast.map((f) => {
    const ts = new Date(f.timestamp);
    const formattedTime = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = ts.toLocaleDateString([], { month: 'short', day: 'numeric' });

    let riskLabel = 'Moderate';
    let riskColor = 'text-amber-600';
    if (f.predicted_aqi > 400) {
      riskLabel = 'Critical Spike';
      riskColor = 'text-risk-critical';
    } else if (f.predicted_aqi > 250) {
      riskLabel = 'High Risk';
      riskColor = 'text-risk-high';
    } else if (f.predicted_aqi > 100) {
      riskLabel = 'Watch';
      riskColor = 'text-amber-600';
    } else {
      riskLabel = 'Low Risk';
      riskColor = 'text-emerald-600';
    }

    return {
      horizon: `+${f.horizon_hours}h`,
      timestampLabel: `${formattedTime} (${formattedDate})`,
      timeOnly: formattedTime,
      predictedPm25: f.predicted_aqi,
      lower: f.confidence_lower,
      upper: f.confidence_upper,
      spikeProbability: Math.round((f.spike_probability || 0.75) * 100),
      riskLabel,
      riskColor
    };
  });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">PM2.5 Concentration & Dispersion Forecast (µg/m³)</h4>
          <p className="text-xs text-ink-muted">Trajectory over 6h, 12h, and 24h horizons with model uncertainty bounds</p>
        </div>
        <ProvenanceTag type="predicted" size="xs" />
      </div>

      {/* Recharts Area Container */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9622B" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#D9622B" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="horizon" stroke="#64748B" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={12} domain={['auto', 'auto']} tickLine={false} unit=" µg/m³" />
            
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-card text-xs shadow-modal space-y-1.5 min-w-[200px]">
                      <div className="font-bold border-b border-slate-700 pb-1 flex justify-between gap-4">
                        <span>Horizon: {label}</span>
                        <span className={d.riskColor}>{d.riskLabel}</span>
                      </div>
                      <div className="text-slate-300">Time: <b className="text-white">{d.timestampLabel}</b></div>
                      <div className="text-slate-300">Predicted PM2.5: <b className="text-amber-400 font-mono">{d.predictedPm25} µg/m³</b></div>
                      <div className="text-slate-400 text-[11px]">Uncertainty Range: {d.lower} – {d.upper} µg/m³</div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={150} stroke="#B3251F" strokeDasharray="3 3" label={{ value: 'Critical Threshold (150 µg/m³)', fill: '#B3251F', fontSize: 10 }} />

            {/* Uncertainty Bounds */}
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="transparent" 
              fill="url(#bandGrad)" 
              name="Uncertainty Range" 
            />

            {/* Primary Predicted Trajectory */}
            <Area 
              type="monotone" 
              dataKey="predictedPm25" 
              stroke="#D9622B" 
              strokeWidth={3} 
              fill="url(#pm25Grad)" 
              name="Predicted PM2.5" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizon Summary Badges */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {chartData.map((d, i) => (
          <div key={i} className="bg-surface p-3 rounded-card border border-slate-200 text-center space-y-1">
            <div className="text-[11px] font-mono text-ink-muted">{d.horizon} ({d.timeOnly})</div>
            <div className="text-lg font-extrabold font-mono text-ink">{d.predictedPm25} <span className="text-xs font-normal text-ink-muted">µg/m³</span></div>
            <div className={`text-[11px] font-bold ${d.riskColor}`}>{d.riskLabel}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
