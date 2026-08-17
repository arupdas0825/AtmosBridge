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

export default function CitizenReport() {
  const { t, language, setLanguage, navigateTo, setLastSubmittedReport, refreshData } = useApp();

  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Okhla Industrial Area, Phase II');
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.2690);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

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

  // Sample quick templates
  const applyTemplate = (text, loc, lat, lon) => {
    setDescription(text);
    setLocationName(loc);
    setLatitude(lat);
    setLongitude(lon);
  };

  // Detect GPS
  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setLocationName(`Current Location (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
          setIsLocating(false);
        },
        (err) => {
          console.warn(err);
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Submit Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please provide a description of the pollution sighting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('location_name', locationName);
      formData.append('language', language);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const reportResult = await submitReport(formData);
      setLastSubmittedReport(reportResult);
      await refreshData();
      // Navigate to Photo Analysis Result view
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

      {/* Quick Demonstration Scenario Templates */}
      <div className="bg-surface p-3.5 rounded-card border border-slate-200 space-y-2">
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
          Quick Demo Presets:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyTemplate(
              'Massive thick black smoke plume billowing from waste processing area. Acrid plastic burning smell.',
              'Okhla Industrial Area, Phase II',
              28.5355,
              77.2690
            )}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-ink text-left transition-colors font-medium shadow-xs"
          >
            🏭 Industrial Waste Burning (Delhi)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate(
              'Extensive agricultural stubble fires across farmland. Thick white-grey smoke drifting westwards across border.',
              'Majha Agricultural Corridor, Amritsar',
              31.6340,
              74.8723
            )}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-ink text-left transition-colors font-medium shadow-xs"
          >
            🌾 Stubble Burning Plume (Punjab)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate(
              'Dense diesel exhaust and vehicle idling haze along highway freight transit corridor.',
              'Paulista Avenue Transit Corridor',
              -23.5610,
              -46.6560
            )}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-ink text-left transition-colors font-medium shadow-xs"
          >
            🚚 Freight Congestion (São Paulo)
          </button>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="card-surface p-6 sm:p-8 space-y-5">
        
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

        {/* Location Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider">
              {t.locationTitle || 'Location / Landmark'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={t.locationPlaceholder || 'Neighborhood, corridor, or district'}
                className="input-control text-xs pl-8"
              />
              <MapPin className="w-3.5 h-3.5 text-brand absolute left-2.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                GPS Coordinates
              </label>
              <button 
                type="button" 
                onClick={handleDetectLocation} 
                disabled={isLocating}
                className="text-brand font-bold text-[11px] hover:underline flex items-center gap-1"
              >
                <Navigation className="w-3 h-3" />
                <span>{isLocating ? 'Detecting...' : (t.btnUseCurrentLoc || 'Use My GPS')}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                placeholder="Latitude"
                className="input-control text-xs font-mono"
              />
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                placeholder="Longitude"
                className="input-control text-xs font-mono"
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
