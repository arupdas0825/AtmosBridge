import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import PredictionTimelineChart from '../components/charts/PredictionTimelineChart';
import FeatureImportanceChart from '../components/charts/FeatureImportanceChart';
import ProvenanceTag from '../components/common/ProvenanceTag';
import Loader from '../components/common/Loader';
import { getPrediction } from '../lib/api';
import { 
  TrendingUp, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  Activity, 
  RefreshCw,
  Info,
  ShieldCheck,
  Database,
  Wind
} from 'lucide-react';

export default function PredictionTimeline() {
  const { t, activeHotspotId } = useApp();
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await getPrediction(activeHotspotId);
      setPredictionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [activeHotspotId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              {t.predTitle || 'Pollution Spike Risk & PM2.5 Forecast (6h / 12h / 24h)'}
            </h1>
            <ProvenanceTag type="predicted" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            {t.predSubtitle || 'Physics-grounded atmospheric risk predictor evaluated against planetary boundary layer weather, OpenAQ baseline telemetry, and citizen sighting velocity.'}
          </p>
        </div>

        <button
          onClick={fetchForecast}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>Re-compute Forecast</span>
        </button>
      </div>

      {/* Main Prediction Content */}
      {loading ? (
        <Loader text="Computing 24-hour meteorological atmospheric dispersion..." />
      ) : !predictionData || !predictionData.forecast || predictionData.forecast.length === 0 ? (
        <div className="card-surface p-12 text-center space-y-3 border-dashed border-2 border-slate-200">
          <TrendingUp className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-ink">Insufficient Data for 24-Hour Atmospheric Prediction</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            A baseline of continuous telemetry or verified citizen incident reports in this airshed is required to calculate dynamic boundary layer dispersion and spike probabilities.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Forecast Trajectory Chart (7 Cols) */}
            <div className="lg:col-span-7 card-surface p-6 space-y-5">
              <PredictionTimelineChart forecast={predictionData.forecast} />

              {/* Model Architecture & Provenance Metadata */}
              <div className="bg-surface p-4 rounded-card border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">Model Architecture:</span>
                  <span className="font-mono text-brand font-bold text-xs bg-brand/10 px-2 py-0.5 rounded">
                    {predictionData.model_metadata?.model_type || 'Physics-Grounded Atmospheric Risk Predictor'}
                  </span>
                </div>
                <p className="text-ink-muted leading-relaxed text-[11px]">
                  Evaluates atmospheric ventilation capability (wind speed & bearing), boundary layer thermal inversion (relative humidity & temperature), citizen sighting velocity, and background aerosol optical depth (AOD) proxies.
                </p>
              </div>
            </div>

            {/* Risk Driver Attribution (5 Cols) */}
            <div className="lg:col-span-5 card-surface p-6 space-y-5 flex flex-col justify-between">
              <FeatureImportanceChart features={predictionData.feature_importance} />

              {/* Explainability & Decision Support Notice */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-card text-[11px] text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <b>Decision Support Disclaimer:</b> Forecasts are intended for operational screening and early warning support. They do not replace official regulatory air-quality bulletins.
                </span>
              </div>
            </div>

          </div>

          {/* Data & Method Transparency Box */}
          <div className="card-surface p-6 space-y-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-brand" />
              <span>Data Inputs & Methodological Transparency</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-surface p-3 rounded-card border border-slate-200 space-y-1">
                <span className="font-semibold text-ink flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ground Telemetry</span>
                </span>
                <p className="text-ink-muted text-[11px]">
                  OpenAQ API v2 verified station observations (PM2.5, PM10 baselines).
                </p>
              </div>

              <div className="bg-surface p-3 rounded-card border border-slate-200 space-y-1">
                <span className="font-semibold text-ink flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>Meteorological Feeds</span>
                </span>
                <p className="text-ink-muted text-[11px]">
                  Open-Meteo boundary layer wind vectors, thermal humidity, and dispersion coefficients.
                </p>
              </div>

              <div className="bg-surface p-3 rounded-card border border-slate-200 space-y-1">
                <span className="font-semibold text-ink flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Citizen Sightings</span>
                </span>
                <p className="text-ink-muted text-[11px]">
                  Multimodal Gemini structured reports generating real-time emission velocity signals.
                </p>
              </div>

              <div className="bg-surface p-3 rounded-card border border-slate-200 space-y-1">
                <span className="font-semibold text-ink flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <span>Prediction Engine</span>
                </span>
                <p className="text-ink-muted text-[11px]">
                  Physics-grounded dispersion regression model with dynamic stagnation and boundary layer weighting.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
