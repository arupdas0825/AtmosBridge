import React from 'react';
import { useApp } from '../state/AppContext';
import SeverityBadge from '../components/common/SeverityBadge';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Eye, 
  TrendingUp, 
  ArrowRight, 
  Shield, 
  FileText,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';

export default function PhotoAnalysis() {
  const { t, lastSubmittedReport, navigateTo } = useApp();

  // Fallback demo analysis if opened directly
  const report = lastSubmittedReport || {
    id: 'rep_demo_99',
    created_at: new Date().toISOString(),
    description: 'Thick black smoke billowing from waste processing area behind industrial complex.',
    location_name: 'Okhla Industrial Area, Phase II',
    latitude: 28.5355,
    longitude: 77.2690,
    photo_url: 'https://images.unsplash.com/photo-1579240830604-fa9a781258d4?w=600&auto=format&fit=crop&q=60',
    analysis: {
      event_type: 'industrial_smoke',
      pollution_source: 'Unpermitted tire and industrial scrap combustion',
      severity: 4,
      confidence: 0.94,
      visual_evidence: [
        'Dense dark particulate plume',
        'Ground-level dispersion towards residential colonies',
        'Visible low-altitude acrid haze'
      ],
      recommended_verification: [
        'Dispatch municipal environmental inspection squad',
        'Examine continuous stack emission (CEMS) telemetry',
        'Cross-check nearest ground micro-sensor AQI-DEL-01'
      ],
      explanation: 'High-density hydrocarbon combustion combined with atmospheric stagnation (wind 4.5 km/h) creates severe localized acute exposure risk.'
    }
  };

  const analysis = report.analysis || {};
  const eventTypeFormatted = (analysis.event_type || 'industrial_smoke').replace('_', ' ').toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white p-6 sm:p-7 rounded-card shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-wider">
              Gemini Multimodal Vision
            </span>
            <ProvenanceTag type="inferred" size="xs" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.analysisResultTitle || 'Multimodal AI Incident Dossier'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Report <span className="font-mono font-medium">#{report.id}</span> structured through grounded vision analysis and local weather telemetry.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-card border border-white/20 text-center space-y-1.5 flex-shrink-0">
          <span className="text-[11px] font-medium text-slate-200 block">AI Severity Level</span>
          <div className="flex justify-center">
            <SeverityBadge severity={analysis.severity || 3} size="lg" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-amber-300 block">
            Confidence: {Math.round((analysis.confidence || 0.9) * 100)}%
          </span>
        </div>
      </div>

      {/* Main Analysis Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Photo & Sighting Details */}
        <div className="space-y-4">
          <div className="card-surface overflow-hidden">
            <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
              {report.photo_url ? (
                <img 
                  src={report.photo_url} 
                  alt="Incident evidence" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Flame className="w-8 h-8 text-risk-high" />
                  <span>Text / Voice Sighting</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <ProvenanceTag type="observed" size="xs" />
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Citizen Sighting:</span>
                <p className="text-xs text-ink mt-1 leading-relaxed font-medium">"{report.description}"</p>
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center gap-2 text-xs text-ink-muted">
                <MapPin className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                <span className="truncate">{report.location_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Structured Gemini Classification */}
        <div className="md:col-span-2 space-y-5">
          
          {/* Classification Specs */}
          <div className="card-surface p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.eventTypeLabel || 'Detected Event Type'}</span>
                <div className="text-base font-bold text-ink mt-0.5">{eventTypeFormatted}</div>
              </div>
              <div>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.sourceLabel || 'Identified Source'}</span>
                <div className="text-sm font-semibold text-brand mt-0.5">{analysis.pollution_source}</div>
              </div>
            </div>

            {/* Explainable Rationale */}
            <div className="bg-surface p-4 rounded-card border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>{t.aiExplanationLabel || 'Gemini Multimodal Reasoning'}</span>
              </div>
              <p className="text-xs text-ink leading-relaxed">
                {analysis.explanation}
              </p>
            </div>

            {/* Visual Evidence Cues */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.visualEvidenceLabel || 'Visual Evidence Cues'}</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(analysis.visual_evidence || []).map((cue, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-200 text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Verification Steps */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{t.verificationLabel || 'Recommended Protocol'}</span>
              <div className="space-y-1.5">
                {(analysis.recommended_verification || []).map((step, idx) => (
                  <div key={idx} className="text-xs text-ink flex items-start gap-2">
                    <span className="font-mono text-brand font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('map')}
              className="btn-primary flex-1 text-xs py-2.5"
            >
              <span>{t.btnViewOnMap || 'View Hotspot on Live Map'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigateTo('predictions')}
              className="btn-secondary flex-1 text-xs py-2.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-brand" />
              <span>{t.btnCheckForecast || 'Spike Forecast'}</span>
            </button>

            <button
              onClick={() => navigateTo('authority')}
              className="btn-secondary text-xs py-2.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Authority Triage Queue</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
