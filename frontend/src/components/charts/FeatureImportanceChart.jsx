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
    return <div className="text-sm text-ink-muted p-6 text-center">No risk driver weighting data available.</div>;
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
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-bold text-ink">Key Risk Drivers & Feature Weights</h4>
          <p className="text-xs text-ink-muted">Relative feature contribution evaluated by the atmospheric regressor</p>
        </div>
        <ProvenanceTag type="predicted" size="xs" />
      </div>

      {/* Bar Chart Container */}
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 15, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748B" fontSize={11} />
            <YAxis type="category" dataKey="shortName" stroke="#64748B" fontSize={11} width={130} tickLine={false} />
            
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-card text-xs shadow-modal max-w-xs space-y-1">
                      <div className="font-bold text-brand-light">{d.name} ({d.importance}% Weight)</div>
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

      {/* Detailed List Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        {features.map((f, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
            <div>
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <span>{f.feature}</span>
                <span className="font-mono text-brand font-bold">({Math.round(f.importance * 100)}%)</span>
              </div>
              <p className="text-ink-muted text-[11px] leading-relaxed mt-0.5">{f.description}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
