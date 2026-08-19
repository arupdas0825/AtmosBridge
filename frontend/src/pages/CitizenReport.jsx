import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { submitReport } from '../lib/api';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  Camera, 
  MapPin, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Mic, 
  Navigation,
  Image as ImageIcon,
  X
} from 'lucide-react';

const LOCATION_PRESETS = [
  { 
    label: 'Okhla Industrial Area, Phase II', 
    city: 'Delhi', 
    lat: 28.5355, 
    lng: 77.2690, 
    badge: '🏭 Industrial Waste Burning (Delhi)',
    sampleText: 'Massive thick black smoke plume billowing from waste processing area. Acrid plastic burning smell.'
  },
  { 
    label: 'Majha Agricultural Corridor, Amritsar', 
    city: 'Punjab', 
    lat: 31.6340, 
    lng: 74.8723, 
    badge: '🌾 Stubble Burning Plume (Punjab)',
    sampleText: 'Extensive agricultural stubble fires across farmland. Thick white-grey smoke drifting westwards across border.'
  },
  { 
    label: 'Paulista Avenue Transit Corridor', 
    city: 'São Paulo', 
    lat: -23.5610, 
    lng: -46.6560, 
    badge: '🚚 Freight Congestion (São Paulo)',
    sampleText: 'Dense diesel exhaust and vehicle idling haze along highway freight transit corridor.'
  }
];

export default function CitizenReport() {
  const { t, language, navigateTo, setLastSubmittedReport, refreshData } = useApp();

  const [description, setDescription] = useState('');
  
  // Canonical Location State Model
  const [locationState, setLocationState] = useState({
    label: 'Okhla Industrial Area, Phase II',
    latitude: 28.5355,
    longitude: 77.2690,
    source: 'preset', // 'gps' | 'geocoded' | 'manual' | 'preset'
    accuracy: null,
    isGeocoding: false,
    error: null
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Photo exceeds 5MB size limit.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  // Sample quick preset templates
  const applyPreset = (preset) => {
    setDescription(preset.sampleText);
    setLocationState({
      label: preset.label,
      latitude: preset.lat,
      longitude: preset.lng,
      source: 'preset',
      accuracy: null,
      isGeocoding: false,
      error: null
    });
  };

  // Detect GPS & Reverse Geocode
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationState(prev => ({ ...prev, error: 'Browser Geolocation API unavailable.' }));
      return;
    }

    setLocationState(prev => ({ ...prev, isGeocoding: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const acc = Math.round(pos.coords.accuracy);

        let name = `Detected GPS Position (${lat}, ${lon})`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              const addr = data.address || {};
              const parts = [
                addr.suburb || addr.neighbourhood || addr.road || addr.amenity,
                addr.city || fontTown(addr) || addr.county || addr.state,
                addr.country
              ].filter(Boolean);

              if (parts.length > 0) {
                name = parts.join(', ');
              } else {
                name = data.display_name.split(',').slice(0, 3).join(', ');
              }
            }
          }
        } catch (e) {
          console.warn('[Reverse Geocoding Fallback]', e);
          name = 'Coordinates detected — location name unavailable';
        }

        setLocationState({
          label: name,
          latitude: lat,
          longitude: lon,
          source: 'gps',
          accuracy: acc,
          isGeocoding: false,
          error: null
        });
      },
      (err) => {
        console.warn('[Geolocation Error]', err);
        setLocationState(prev => ({
          ...prev,
          isGeocoding: false,
          error: 'GPS permission denied or unavailable. You can enter location manually.'
        }));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  function fontTown(addr) {
    return addr.town || addr.municipality || addr.village;
  }

  // Coordinate Validation
  const validateForm = () => {
    if (!description.trim()) {
      return 'Please provide a description of the pollution sighting.';
    }
    if (isNaN(locationState.latitude) || locationState.latitude < -90 || locationState.latitude > 90) {
      return 'Latitude must be a valid number between -90 and +90 degrees.';
    }
    if (isNaN(locationState.longitude) || locationState.longitude < -180 || locationState.longitude > 180) {
      return 'Longitude must be a valid number between -180 and +180 degrees.';
    }
    return null;
  };

  // Submit Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('latitude', locationState.latitude.toString());
      formData.append('longitude', locationState.longitude.toString());
      formData.append('location_name', locationState.label);
      formData.append('language', language);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const reportResult = await submitReport(formData);
      setLastSubmittedReport(reportResult);
      await refreshData();
      navigateTo('analysis-result', { reportData: reportResult });
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1 text-center sm:text-left">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.reportTitle || 'Report Pollution Incident'}</h1>
          <ProvenanceTag type="inferred" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          {t.reportSubtitle || 'Submit geo-tagged evidence. Google Gemini will extract structured attributes and cross-reference nearby telemetry.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-4 text-xs sm:text-sm font-medium">
        <button className="pb-2.5 border-b-2 border-brand text-brand font-semibold flex items-center gap-1.5">
          <Camera className="w-4 h-4" />
          <span>{t.textTab || 'Photo & Description'}</span>
        </button>
        <button 
          onClick={() => navigateTo('voice')}
          className="pb-2.5 border-b-2 border-transparent text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <Mic className="w-4 h-4 text-brand" />
          <span>{t.voiceTab || 'Voice Audio Report'}</span>
        </button>
      </div>

      {/* Demonstration Presets */}
      <div className="bg-surface p-3.5 rounded-card border border-slate-200 space-y-2">
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
          Quick Incident Presets:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {LOCATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-ink text-left transition-colors font-medium shadow-xs"
            >
              {preset.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-6">
        
        {/* Description Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider">
            {t.inputDesc || 'Incident Description'} <span className="text-risk-critical">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={t.inputDescPlaceholder || 'Describe what you observe: smoke color, odor, estimated source, wind direction...'}
            required
            className="input-control text-sm placeholder:text-slate-400"
          />
        </div>

        {/* Photo Upload Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider">
            {t.photoUploadTitle || 'Photo Evidence'}
          </label>
          
          {photoPreview ? (
            <div className="relative rounded-md overflow-hidden border border-slate-200 max-h-56 bg-slate-900 flex items-center justify-center">
              <img src={photoPreview} alt="Upload preview" className="max-h-56 w-full object-cover" />
              <button
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-brand rounded-card p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface hover:bg-brand-surface/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-ink">Click or drag photo evidence here</span>
              <span className="text-[11px] text-ink-muted">{t.photoUploadSubtitle || 'PNG, JPG or WEBP (Max 5MB)'}</span>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handlePhotoChange} 
                className="hidden" 
              />
            </label>
          )}
        </div>

        {/* Clean, Non-Overlapping Location Section */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand" />
              <span>Incident Location & GPS Coordinates</span>
            </span>

            <button 
              type="button" 
              onClick={handleDetectLocation} 
              disabled={locationState.isGeocoding}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Navigation className={`w-3.5 h-3.5 ${locationState.isGeocoding ? 'animate-spin text-brand' : 'text-brand'}`} />
              <span>{locationState.isGeocoding ? 'Detecting Location...' : (t.btnUseCurrentLoc || 'Use Current Location')}</span>
            </button>
          </div>

          {/* GPS Status Badges */}
          {locationState.source === 'gps' && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Current GPS location verified (~{locationState.accuracy || 12}m accuracy)</span>
            </div>
          )}

          {locationState.error && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{locationState.error}</span>
            </div>
          )}

          {/* Location Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 space-y-1">
              <label className="block text-[11px] font-semibold text-ink-muted">
                Location / Landmark Name
              </label>
              <input
                type="text"
                value={locationState.label}
                onChange={(e) => setLocationState(prev => ({ ...prev, label: e.target.value, source: 'manual' }))}
                placeholder="Neighborhood, district, or landmark"
                className="input-control text-xs"
                required
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="block text-[11px] font-semibold text-ink-muted">
                Latitude (-90 to +90)
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={locationState.latitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLocationState(prev => ({ ...prev, latitude: isNaN(val) ? '' : val, source: 'manual' }));
                }}
                placeholder="28.5355"
                className="input-control text-xs font-mono"
                required
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="block text-[11px] font-semibold text-ink-muted">
                Longitude (-180 to +180)
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={locationState.longitude}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLocationState(prev => ({ ...prev, longitude: isNaN(val) ? '' : val, source: 'manual' }));
                }}
                placeholder="77.2690"
                className="input-control text-xs font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-risk-critical rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full text-sm py-3 font-semibold shadow-md shadow-brand/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t.submittingReport || 'Gemini is analyzing evidence...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t.btnSubmitReport || 'Analyze with Gemini AI'}</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
