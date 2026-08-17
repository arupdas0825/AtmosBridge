export const BRICS_COUNTRIES = [
  { id: 'all', name: 'All BRICS Regions', lat: 20.0, lng: 50.0, zoom: 3 },
  { id: 'India', name: 'India', lat: 28.6139, lng: 77.2090, zoom: 6, hub: 'New Delhi / Punjab' },
  { id: 'Brazil', name: 'Brazil', lat: -23.5505, lng: -46.6333, zoom: 5, hub: 'São Paulo / Amazon' },
  { id: 'Russia', name: 'Russia', lat: 55.7558, lng: 37.6173, zoom: 5, hub: 'Moscow / Amur' },
  { id: 'China', name: 'China', lat: 39.9042, lng: 116.4074, zoom: 6, hub: 'Beijing / Hebei' },
  { id: 'South Africa', name: 'South Africa', lat: -26.2041, lng: 28.0473, zoom: 6, hub: 'Johannesburg / Highveld' }
];

export const SEVERITY_CONFIG = {
  1: { label: 'Safe', color: '#1B7A4D', bg: '#E8F5E9', text: 'text-[#1B7A4D]', badgeBg: 'bg-[#1B7A4D]/10', border: 'border-[#1B7A4D]/30' },
  2: { label: 'Watch', color: '#C98A12', bg: '#FFF8E1', text: 'text-[#C98A12]', badgeBg: 'bg-[#C98A12]/10', border: 'border-[#C98A12]/30' },
  3: { label: 'High', color: '#D9622B', bg: '#FBE9E7', text: 'text-[#D9622B]', badgeBg: 'bg-[#D9622B]/10', border: 'border-[#D9622B]/30' },
  4: { label: 'Critical', color: '#B3251F', bg: '#FFEBEE', text: 'text-[#B3251F]', badgeBg: 'bg-[#B3251F]/10', border: 'border-[#B3251F]/30' }
};

export const PROVENANCE_CONFIG = {
  observed: { label: 'Observed', icon: 'Radio', desc: 'Direct live station reading (OpenAQ / Open-Meteo)', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  inferred: { label: 'Inferred', icon: 'Sparkles', desc: 'Structured via Gemini Multimodal Analysis', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  predicted: { label: 'Predicted', icon: 'TrendingUp', desc: 'Forecasted by XGBoost Atmospheric Model', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  simulated: { label: 'Simulated', icon: 'Cpu', desc: 'Synthetic Benchmark / Demonstration Data', badge: 'bg-slate-100 text-slate-700 border-slate-300' }
};

export const POLLUTANT_THRESHOLDS = {
  pm25: { unit: 'µg/m³', safe: 30, moderate: 60, high: 90, critical: 150 },
  pm10: { unit: 'µg/m³', safe: 50, moderate: 100, high: 150, critical: 250 },
  no2: { unit: 'ppb', safe: 20, moderate: 40, high: 70, critical: 100 },
  so2: { unit: 'ppb', safe: 10, moderate: 25, high: 50, critical: 80 }
};
