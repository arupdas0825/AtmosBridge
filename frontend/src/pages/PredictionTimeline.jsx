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
  Info
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.predTitle || 'Atmospheric Spike Forecast (6h / 12h / 24h)'}</h1>
            <ProvenanceTag type="predicted" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            {t.predSubtitle || 'Gradient-boosted machine learning model trained on planetary boundary layers, OpenAQ telemetry, and wind trajectories.'}
          </p>
        </div>

        <button
          onClick={fetchForecast}
          className="btn-secondary text-xs py-2"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>Re-compute Models</span>
        </button>
      </div>

      {/* Main Prediction Views */}
      {loading ? (
        <Loader text="Computing 24-hour meteorological atmospheric dispersion..." />
      ) : !predictionData ? (
        <div className="card-surface p-8 text-center text-ink-muted text-sm">
          Failed to load forecast model.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart (7 Cols) */}
          <div className="lg:col-span-7 card-surface p-6 space-y-5">
            <PredictionTimelineChart forecast={predictionData.forecast} />

            {/* Model Metadata Box */}
            <div className="bg-surface p-4 rounded-card border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">Model Architecture:</span>
                <span className="font-mono text-brand font-bold text-xs">{predictionData.model_metadata?.model_type || 'XGBoost Regressor v2.1'}</span>
              </div>
              <p className="text-ink-muted leading-relaxed text-[11px]">
                Features are evaluated against historical OpenAQ backfill and planetary boundary layer meteorological observations. Output figures represent non-deterministic probabilistic forecasts.
              </p>
            </div>
          </div>

          {/* Explainable AI Feature Importance (5 Cols) */}
          <div className="lg:col-span-5 card-surface p-6 space-y-5">
            <FeatureImportanceChart features={predictionData.feature_importance} />

            {/* Responsible AI Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-card text-[11px] text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
              <span>
                <b>Explainability Guarantee:</b> Every forecast is accompanied by explicit feature importance attribution to prevent black-box municipal decisions.
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
