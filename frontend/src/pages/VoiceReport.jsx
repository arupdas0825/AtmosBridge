import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext';
import { submitReport } from '../lib/api';
import ProvenanceTag from '../components/common/ProvenanceTag';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  MapPin, 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function VoiceReport() {
  const { t, language, setLanguage, navigateTo, setLastSubmittedReport, refreshData } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [language]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!speechSupported || !recognitionRef.current) {
        setErrorMessage('Web Speech API is not supported in your browser. Please use Chrome or Edge, or type your report directly below.');
        return;
      }
      setErrorMessage('');
      try {
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn(err);
        setErrorMessage('Could not start recording. Please check microphone permissions.');
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      setErrorMessage('Please record your voice report or type a description first.');
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage('Please enter a location name before submitting.');
      return;
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMessage('Please enter a valid latitude (-90 to +90).');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setErrorMessage('Please enter a valid longitude (-180 to +180).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('description', transcript);
      formData.append('voice_transcript', transcript);
      formData.append('latitude', lat.toString());
      formData.append('longitude', lon.toString());
      formData.append('location_name', locationName);
      formData.append('language', language);

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      
      {/* Back button */}
      <button 
        onClick={() => navigateTo('report')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Text & Photo Form</span>
      </button>

      {/* Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t.voiceTitle || 'Voice Audio Report'}</h1>
          <ProvenanceTag type="inferred" size="xs" />
        </div>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
          {t.voiceSubtitle || 'Speak in your preferred language. Web Speech captures your audio and Gemini extracts structured metrics.'}
        </p>
      </div>

      {/* Language Toggle for Speech */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'en', label: 'English (en-IN)' },
          { id: 'hi', label: 'हिन्दी (hi-IN)' },
          { id: 'bn', label: 'বাংলা (bn-IN)' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setLanguage(item.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
              language === item.id 
                ? 'bg-brand text-white border-brand shadow-sm font-semibold' 
                : 'bg-white text-ink-muted border-slate-200 hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mic Capture Box */}
      <div className="card-surface p-6 sm:p-8 text-center space-y-5 flex flex-col items-center justify-center">
        
        {/* Animated Mic Button */}
        <div className="relative py-2">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
          )}
          <button
            type="button"
            onClick={toggleRecording}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
              isRecording 
                ? 'bg-risk-critical shadow-red-600/40 scale-105' 
                : 'bg-brand hover:bg-brand-dark shadow-brand/30 hover:scale-105'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base text-ink">
            {isRecording ? (t.micListening || 'Listening to your report...') : (t.micStart || 'Tap microphone to start speaking')}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {isRecording ? 'Tap mic again to stop recording' : 'Describe smoke color, burning smells, or active fire sightings'}
          </p>
        </div>

        {/* Live Transcript Box */}
        <div className="w-full text-left space-y-1.5">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand" />
              {t.transcriptLabel || 'Voice Transcript'}
            </span>
            {transcript && (
              <button 
                type="button" 
                onClick={() => setTranscript('')} 
                className="text-[11px] text-ink-muted hover:text-ink transition-colors"
              >
                Clear
              </button>
            )}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Live speech transcript will appear here (or type directly)..."
            className="input-control text-sm"
          />
        </div>

        {/* Location Fields */}
        <div className="w-full space-y-2 text-left">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            <span>Incident Location <span className="text-risk-critical">*</span></span>
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Neighborhood, district, or landmark name"
            className="input-control text-xs w-full"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude (-90 to +90)"
              className="input-control text-xs font-mono"
              required
            />
            <input
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude (-180 to +180)"
              className="input-control text-xs font-mono"
              required
            />
          </div>
        </div>

        {!speechSupported && (
          <div className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>Web Speech API is not supported in this browser. Please use Chrome or Edge, or type your incident description directly in the transcript box below.</span>
          </div>
        )}

        {errorMessage && (
          <div className="w-full p-2.5 bg-red-50 text-risk-critical rounded-md text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Voice Report CTA */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !transcript.trim() || !locationName.trim()}
          className="btn-primary w-full text-sm py-3 font-semibold shadow-md shadow-brand/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Speech with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Submit Voice Report for AI Structuring</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
}
