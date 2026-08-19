import React, { useState, useRef } from 'react';
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
  X,
  RefreshCw,
  Trash2,
  FileText
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

  // Photo & Evidence States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoSource, setPhotoSource] = useState('upload'); // 'camera' | 'upload'
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hidden File Inputs
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // File Validation and Processing
  const processSelectedFile = (file, source = 'upload') => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo exceeds maximum 5MB size limit.');
      return;
    }

    setPhotoFile(file);
    setPhotoSource(source);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMessage('');
  };

  const handleFileChange = (e, source = 'upload') => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file, source);
    }
  };

  // Drag & Drop Handlers for Desktop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file, 'upload');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
                addr.city || addr.town || addr.municipality || addr.county || addr.state,
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
      
      {/* Hidden File Inputs for Native Camera and File Picker */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={(e) => handleFileChange(e, 'camera')}
        className="hidden"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, 'upload')}
        className="hidden"
      />

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

        {/* PHOTO EVIDENCE: TWO-OPTION UPLOADER (CAMERA + DRAG & DROP) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              {t.photoUploadTitle || 'Photo Evidence'}
            </label>
            <span className="text-[11px] text-ink-muted">JPEG, PNG, WebP (Max 5MB)</span>
          </div>

          {photoPreview ? (
            /* Selected Photo Preview Card */
            <div className="rounded-card border border-slate-200 overflow-hidden bg-slate-900 shadow-sm space-y-0">
              <div className="relative max-h-64 bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={photoPreview} 
                  alt="Incident Preview" 
                  className="max-h-64 w-full object-contain"
                />
              </div>

              {/* Photo Details & Action Bar */}
              <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 min-w-[140px]">
                  <div className="font-semibold text-ink truncate max-w-xs flex items-center gap-1.5">
                    <span className="text-brand">●</span>
                    <span className="truncate">{photoFile?.name || 'Captured Photo'}</span>
                  </div>
                  <div className="text-[11px] text-ink-muted flex items-center gap-2 font-mono">
                    <span>{formatFileSize(photoFile?.size)}</span>
                    <span>•</span>
                    <span className="capitalize font-sans bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                      {photoSource === 'camera' ? '📷 Camera Capture' : '📁 File Upload'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Two-Option Action Area */
            <div className="space-y-3">
              {/* Responsive Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Take Photo Button (Native Camera) */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-4 rounded-card border-2 border-slate-200 hover:border-brand bg-white hover:bg-brand-surface/40 flex items-center justify-center gap-3 transition-all group cursor-pointer shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-brand/10 group-hover:bg-brand group-hover:text-white text-brand flex items-center justify-center transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink group-hover:text-brand transition-colors">Take Photo</div>
                    <div className="text-[11px] text-ink-muted">Open device camera</div>
                  </div>
                </button>

                {/* 2. Upload Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-card border-2 border-slate-200 hover:border-brand bg-white hover:bg-brand-surface/40 flex items-center justify-center gap-3 transition-all group cursor-pointer shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink group-hover:text-brand transition-colors">Upload Photo</div>
                    <div className="text-[11px] text-ink-muted">Browse device files</div>
                  </div>
                </button>

              </div>

              {/* Desktop Drag-and-Drop Dropzone Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`hidden sm:flex border-2 border-dashed rounded-card p-6 text-center flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-brand bg-brand-surface/60 scale-[1.01]' 
                    : 'border-slate-300 hover:border-brand bg-surface hover:bg-brand-surface/30'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-brand">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  {isDragging ? 'Drop photo here to attach' : 'Drag & drop photo here or click to browse'}
                </div>
                <div className="text-[11px] text-ink-muted">Supports JPEG, PNG, or WebP up to 5MB</div>
              </div>
            </div>
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
