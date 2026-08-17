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

  // Format data for Recharts
  const chartData = forecast.map((f) => ({
    horizon: `+${f.horizon_hours}h`,
    time: new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    predictedAqi: f.predicted_aqi,
    lower: f.confidence_lower,
    upper: f.confidence_upper,
    probability: Math.round(f.spike_probability * 100),
    uncertaintyRange: [f.confidence_lower, f.confidence_upper]
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">Spike Progression & Confidence Bounds</h4>
          <p className="text-xs text-ink-muted">6h, 12h, and 24h forecasted AQI trajectory with 90% confidence envelope</p>
        </div>
        <ProvenanceTag type="predicted" size="xs" />
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9622B" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#D9622B" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="horizon" stroke="#64748B" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={12} domain={['auto', 'auto']} tickLine={false} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-card text-xs shadow-modal space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1 flex justify-between gap-4">
                        <span>Horizon: {label} ({d.time})</span>
                        <span className="text-amber-400">Spike Prob: {d.probability}%</span>
                      </div>
                      <div>Predicted AQI: <b className="text-risk-high">{d.predictedAqi}</b></div>
                      <div className="text-slate-400 text-[11px]">Confidence: {d.lower} – {d.upper}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={200} stroke="#B3251F" strokeDasharray="3 3" label={{ value: 'Hazardous (200+)', fill: '#B3251F', fontSize: 10 }} />
            {/* Uncertainty Confidence Band */}
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="transparent" 
              fill="url(#bandGrad)" 
              name="Confidence Range" 
            />
            {/* Primary Predicted AQI */}
            <Area 
              type="monotone" 
              dataKey="predictedAqi" 
              stroke="#D9622B" 
              strokeWidth={3} 
              fill="url(#aqiGrad)" 
              name="Forecasted AQI" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Horizon Summary Badges */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {chartData.map((d, i) => (
          <div key={i} className="bg-surface p-2.5 rounded-sm border border-slate-200 text-center space-y-1">
            <span className="text-[11px] font-mono text-ink-muted">{d.horizon} Horizon ({d.time})</span>
            <div className="text-base font-bold font-mono text-risk-high">{d.predictedAqi}</div>
            <div className="text-[10px] text-ink-muted font-medium">Spike Risk: <b className="text-ink">{d.probability}%</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}
