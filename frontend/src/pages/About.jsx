import React from 'react';
import { useApp } from '../state/AppContext';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Eye, 
  AlertOctagon, 
  ExternalLink,
  Layers,
  Lock,
  FileCode2
} from 'lucide-react';

export default function About() {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">About AtmosBridge & Responsible AI</h1>
          <ProvenanceTag type="observed" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          Governed by Google Responsible AI practices and human-in-the-loop environmental public infrastructure.
        </p>
      </div>

      {/* Mission Dossier */}
      <div className="card-surface p-6 sm:p-7 space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand" />
          <span>Hackathon Mandate & Context</span>
        </h2>
        <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
          Built for the <b>Hack2Skill × Google Cloud "Build with AI: Code for Communities" Hackathon (2nd Edition)</b> under <b>Track 2: Clean Air & Climate Resilience</b> with the <b>BRICS Sustainability Theme</b>.
        </p>
        <p className="text-xs text-ink-muted leading-relaxed">
          AtmosBridge was designed to address the critical blind spot in current macro-level city air monitoring: conventional stations report broad municipal averages that miss acute, localized burning, illegal industrial emissions, and trans-boundary smog plumes.
        </p>
      </div>

      {/* 4 Responsible AI Pillars */}
      <div className="space-y-3.5">
        <h2 className="text-base font-bold text-ink">Google Responsible AI Principles in Action</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="card-surface p-5 space-y-2 border-t-2 border-t-brand">
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Lock className="w-4 h-4 text-brand" />
              <span>1. Zero Sensor Invention (Anti-Hallucination)</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Gemini is structurally prompted and constrained from synthesizing or guessing numerical sensor values. All environmental figures are fetched strictly through grounded backend telemetry feeds (OpenAQ, Open-Meteo) or returned as null.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-emerald-600">
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>2. Mandatory Human-in-the-Loop Triage</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              No automated punitive, emergency, or regulatory enforcement actions are triggered by AI. Municipal authorities must review multimodal evidence, citizen sightings, and dispersion forecasts before acknowledging or dispatching inspection teams.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-amber-600">
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Eye className="w-4 h-4 text-amber-700" />
              <span>3. Total Provenance Transparency</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every numeric value and insight rendered across the platform is visibly badged with its origin classification: <b>Observed</b>, <b>Inferred</b>, <b>Predicted</b>, or <b>Simulated</b>. Color is never used as the sole indicator.
            </p>
          </div>

          <div className="card-surface p-5 space-y-2 border-t-2 border-t-indigo-600">
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <HeartHandshake className="w-4 h-4 text-indigo-700" />
              <span>4. Privacy & Non-Diagnostic Boundary</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Citizen reports are anonymous by default with minimal PII retention. Photos are analyzed solely for environmental smoke evidence and never for facial recognition. Public health advisories are protective and non-clinical.
            </p>
          </div>

        </div>
      </div>

      {/* Provenance Badge Registry Key */}
      <div className="card-surface p-6 space-y-4">
        <h3 className="font-bold text-sm text-ink">Data Provenance Taxonomy Legend</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 bg-surface p-3 rounded-card border border-slate-200/80">
            <ProvenanceTag type="observed" size="sm" />
            <span className="text-ink-muted text-[11px]">Real-time readings from OpenAQ and Open-Meteo physical stations.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-surface p-3 rounded-card border border-slate-200/80">
            <ProvenanceTag type="inferred" size="sm" />
            <span className="text-ink-muted text-[11px]">Grounded qualitative structuring produced by Gemini multimodal vision.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-surface p-3 rounded-card border border-slate-200/80">
            <ProvenanceTag type="predicted" size="sm" />
            <span className="text-ink-muted text-[11px]">6h/12h/24h atmospheric spike probabilities from physics-grounded dispersion models.</span>
          </div>
          <div className="flex items-start gap-2.5 bg-surface p-3 rounded-card border border-slate-200/80">
            <ProvenanceTag type="simulated" size="sm" />
            <span className="text-ink-muted text-[11px]">Dense neighborhood micro-sensors and satellite proxy indicators.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
