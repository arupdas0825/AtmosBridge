import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Globe2, 
  TrendingUp, 
  Calendar, 
  FileSpreadsheet,
  Check
} from 'lucide-react';

const HISTORICAL_TRENDS = [
  { month: 'Jan', Delhi: 280, SaoPaulo: 42, Joburg: 95, Beijing: 120, Moscow: 35 },
  { month: 'Feb', Delhi: 240, SaoPaulo: 38, Joburg: 88, Beijing: 98, Moscow: 40 },
  { month: 'Mar', Delhi: 195, SaoPaulo: 45, Joburg: 102, Beijing: 85, Moscow: 32 },
  { month: 'Apr', Delhi: 180, SaoPaulo: 48, Joburg: 110, Beijing: 78, Moscow: 28 },
  { month: 'May', Delhi: 165, SaoPaulo: 52, Joburg: 118, Beijing: 82, Moscow: 25 },
  { month: 'Jun', Delhi: 140, SaoPaulo: 58, Joburg: 135, Beijing: 75, Moscow: 22 },
  { month: 'Jul', Delhi: 110, SaoPaulo: 62, Joburg: 142, Beijing: 70, Moscow: 20 },
  { month: 'Aug', Delhi: 125, SaoPaulo: 59, Joburg: 138, Beijing: 74, Moscow: 24 },
  { month: 'Sep', Delhi: 155, SaoPaulo: 51, Joburg: 120, Beijing: 88, Moscow: 30 },
  { month: 'Oct', Delhi: 310, SaoPaulo: 44, Joburg: 105, Beijing: 115, Moscow: 38 },
  { month: 'Nov', Delhi: 395, SaoPaulo: 40, Joburg: 98, Beijing: 145, Moscow: 42 },
  { month: 'Dec', Delhi: 340, SaoPaulo: 39, Joburg: 92, Beijing: 130, Moscow: 45 }
];

export default function Analytics() {
  const { t } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCSV = () => {
    const headers = 'Month,New Delhi (PM2.5),São Paulo (PM2.5),Johannesburg (PM2.5),Beijing (PM2.5),Moscow (PM2.5)\n';
    const rows = HISTORICAL_TRENDS.map(r => `${r.month},${r.Delhi},${r.SaoPaulo},${r.Joburg},${r.Beijing},${r.Moscow}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AtmosBridge_BRICS_Historical_AQI.csv';
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.navAnalytics || 'Public Health & Regional Analytics'}</h1>
            <ProvenanceTag type="modelled" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Illustrative seasonal PM2.5 trend patterns across BRICS airsheds, based on historical published ranges. Not live or real-time measurements.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-primary text-xs py-2 px-4 shadow-sm"
        >
          {downloaded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>CSV Dataset Exported</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export Open Dataset (.CSV)</span>
            </>
          )}
        </button>
      </div>

      {/* Historical Trend Multi-Line Chart */}
      <div className="card-surface p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-ink">12-Month Seasonal PM2.5 Trend Patterns (BRICS Airsheds)</h3>
            <p className="text-xs text-ink-muted">Illustrative historical seasonal ranges based on published CPCB, MEE, and WHO annual reports. Values are representative averages — not live station telemetry.</p>
          </div>
          <ProvenanceTag type="modelled" size="xs" />
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HISTORICAL_TRENDS} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} unit=" µg" tickLine={false} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-card text-xs shadow-modal space-y-1 font-sans">
                        <div className="font-bold border-b border-slate-700 pb-1">{label} Historical Average:</div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <b className="font-mono">{entry.value} µg/m³</b>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="Delhi" stroke="#B3251F" strokeWidth={3} dot={{ r: 3 }} name="New Delhi" />
              <Line type="monotone" dataKey="Beijing" stroke="#D9622B" strokeWidth={2} dot={{ r: 2 }} name="Beijing" />
              <Line type="monotone" dataKey="Joburg" stroke="#C98A12" strokeWidth={2} dot={{ r: 2 }} name="Johannesburg" />
              <Line type="monotone" dataKey="SaoPaulo" stroke="#0E5C63" strokeWidth={2} dot={{ r: 2 }} name="São Paulo" />
              <Line type="monotone" dataKey="Moscow" stroke="#64748B" strokeWidth={2} dot={{ r: 2 }} name="Moscow" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#B3251F]"></span> New Delhi</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D9622B]"></span> Beijing</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C98A12]"></span> Johannesburg</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0E5C63]"></span> São Paulo</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span> Moscow</span>
        </div>
      </div>

    </div>
  );
}
