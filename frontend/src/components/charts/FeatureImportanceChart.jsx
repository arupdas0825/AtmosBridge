import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import ProvenanceTag from '../common/ProvenanceTag';

const COLORS = ['#0E5C63', '#1B828B', '#D9622B', '#C98A12'];

export default function FeatureImportanceChart({ features = [] }) {
  if (!features || features.length === 0) {
    return <div className="text-sm text-ink-muted p-6 text-center">No feature importance data available.</div>;
  }

  const chartData = features.map((f, i) => ({
    name: f.feature,
    shortName: f.feature.length > 22 ? `${f.feature.substring(0, 20)}...` : f.feature,
    importance: Math.round(f.importance * 100),
    description: f.description,
    color: COLORS[i % COLORS.length]
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">Explainable AI: Key Predictor Drivers</h4>
          <p className="text-xs text-ink-muted">Relative weighting computed by XGBoost / atmospheric gradient model</p>
        </div>
        <ProvenanceTag type="predicted" size="xs" />
      </div>

      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748B" fontSize={11} />
            <YAxis type="category" dataKey="shortName" stroke="#64748B" fontSize={11} width={130} tickLine={false} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-card text-xs shadow-modal max-w-xs space-y-1">
                      <div className="font-bold text-brand-light">{d.name} ({d.importance}%)</div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">{d.description}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100">
        {features.map((f, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs">
            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <div>
              <span className="font-semibold text-ink">{f.feature}</span>
              <span className="font-mono text-ink-muted ml-1.5">({Math.round(f.importance * 100)}%)</span>
              <p className="text-ink-muted text-[11px] leading-snug">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
