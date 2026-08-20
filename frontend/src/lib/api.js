const API_BASE = '/api';

// Helper to fetch with timeout so UI never hangs
async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Submit Citizen Report (Camera / Upload / Text)
 */
export async function submitReport(formData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/reports`, {
      method: 'POST',
      body: formData,
    }, 45000);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const stage = data?.stage || 'server';
      const errorMsg = data?.error || data?.detail || `Server error: ${res.status}`;
      const err = new Error(errorMsg);
      err.stage = stage;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('[API submitReport error]', error);
    throw error;
  }
}

/**
 * Fetch Verified Live Air Quality Telemetry
 */
export async function getLiveAirQuality(lat = 28.6139, lon = 77.2090, forceRefresh = false) {
  // 1. Try backend server endpoint
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/data-sources/air-quality?lat=${lat}&lon=${lon}&force_refresh=${forceRefresh}`,
      {},
      5000
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.is_live) return data;
    }
  } catch (e) {
    // Continue to direct public client fallback
  }

  // 2. Direct client query to Open-Meteo Air Quality API (public, no key required)
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi`;
    const resp = await fetchWithTimeout(url, {}, 5000);
    if (resp.ok) {
      const json = await resp.json();
      const current = json.current || {};
      const pollutants = {};

      if (current.pm2_5 !== undefined && current.pm2_5 !== null) {
        pollutants.pm25 = { value: Math.round(current.pm2_5 * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }
      if (current.pm10 !== undefined && current.pm10 !== null) {
        pollutants.pm10 = { value: Math.round(current.pm10 * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }
      if (current.nitrogen_dioxide !== undefined && current.nitrogen_dioxide !== null) {
        pollutants.no2 = { value: Math.round(current.nitrogen_dioxide * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }
      if (current.sulphur_dioxide !== undefined && current.sulphur_dioxide !== null) {
        pollutants.so2 = { value: Math.round(current.sulphur_dioxide * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }
      if (current.carbon_monoxide !== undefined && current.carbon_monoxide !== null) {
        pollutants.co = { value: Math.round(current.carbon_monoxide * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }
      if (current.ozone !== undefined && current.ozone !== null) {
        pollutants.o3 = { value: Math.round(current.ozone * 10) / 10, unit: 'µg/m³', provenance: 'modelled' };
      }

      return {
        is_live: true,
        status: 'active',
        latitude: lat,
        longitude: lon,
        us_aqi: current.us_aqi,
        european_aqi: current.european_aqi,
        aqi_type: current.us_aqi !== undefined && current.us_aqi !== null ? 'reported' : 'calculated',
        pollutants,
        timestamp: current.time,
        provenance: 'modelled',
        data_type: 'Modelled (Atmospheric Chemical Transport)',
        source: 'Open-Meteo Air Quality',
        atmospheric_source: 'Copernicus Atmosphere'
      };
    }
  } catch (err) {
    console.warn('[Direct Open-Meteo Air Quality fallback error]', err);
  }

  // 3. Return clean unavailable state if no live source is reachable
  return {
    is_live: false,
    status: 'unavailable',
    message: 'No verified environmental data is currently available for this location.',
    pollutants: {},
    provenance: 'modelled'
  };
}

/**
 * Fetch Verified Live Weather Telemetry
 */
export async function getLiveWeather(lat = 28.6139, lon = 77.2090, forceRefresh = false) {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/data-sources/weather?lat=${lat}&lon=${lon}&force_refresh=${forceRefresh}`,
      {},
      4000
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.is_live) return data;
    }
  } catch (e) {
    // Continue to direct public client fallback
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure`;
    const resp = await fetchWithTimeout(url, {}, 4000);
    if (resp.ok) {
      const json = await resp.json();
      const current = json.current || {};
      return {
        is_live: true,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        wind_speed: current.wind_speed_10m,
        wind_direction: current.wind_direction_10m,
        surface_pressure: current.surface_pressure,
        timestamp: current.time,
        provenance: 'observed',
        source: 'Open-Meteo Public Meteorological Service'
      };
    }
  } catch (err) {
    console.warn('[Direct Open-Meteo Weather fallback error]', err);
  }

  return {
    is_live: false,
    status: 'unavailable',
    message: 'Live meteorological data unavailable for this location',
    provenance: 'observed'
  };
}

/**
 * Get Hotspots Catalog (with country filter)
 */
export async function getHotspots(country = null) {
  try {
    const url = country && country !== 'all' ? `${API_BASE}/hotspots?country=${encodeURIComponent(country)}` : `${API_BASE}/hotspots`;
    const res = await fetchWithTimeout(url, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Hotspot by ID
 */
export async function getHotspotById(id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/hotspots/${id}`, {}, 3000);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Get Predictive Spike Forecast & Feature Importance
 */
export async function getPrediction(hotspotId = null, lat = null, lon = null) {
  try {
    let url = `${API_BASE}/predict`;
    const params = new URLSearchParams();
    if (hotspotId) params.append('hotspot_id', hotspotId);
    if (lat) params.append('latitude', lat);
    if (lon) params.append('longitude', lon);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetchWithTimeout(url, {}, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return {
      hotspot_id: hotspotId,
      latitude: lat,
      longitude: lon,
      forecast: [],
      feature_importance: [],
      model_metadata: {
        model_type: 'Physics-Grounded Atmospheric Risk Predictor',
        status: 'insufficient_data',
        message: 'Insufficient observational telemetry to compute 24h dispersion trajectory.'
      }
    };
  }
}

/**
 * Get Cross-Border Atmospheric Transport Corridors
 */
export async function getCrossBorderScenarios(scenarioId = null) {
  try {
    const url = scenarioId ? `${API_BASE}/crossborder?scenario_id=${encodeURIComponent(scenarioId)}` : `${API_BASE}/crossborder`;
    const res = await fetchWithTimeout(url, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Authority Incident Alerts (with status filter)
 */
export async function getAlerts(status = 'all') {
  try {
    const url = status && status !== 'all' ? `${API_BASE}/alerts?status=${encodeURIComponent(status)}` : `${API_BASE}/alerts`;
    const res = await fetchWithTimeout(url, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Authority Incident Alert by ID
 */
export async function getAlertById(id) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/alerts/${id}`, {}, 3000);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Update Authority Incident Alert Status (Human-in-the-Loop)
 */
export async function updateAlert(id, action, actor = 'Municipal Officer', notes = '') {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, actor, notes })
    }, 4000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('[API updateAlert error]', e);
    throw e;
  }
}

/**
 * Get Data Sources Registry
 */
export async function getDataSources() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data-sources`, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Ground Sensor Monitors
 */
export async function getSensors(country = null) {
  try {
    const url = country && country !== 'all' ? `${API_BASE}/data-sources/sensors?country=${encodeURIComponent(country)}` : `${API_BASE}/data-sources/sensors`;
    const res = await fetchWithTimeout(url, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Satellite Optical Depth Grid
 */
export async function getSatelliteGrid() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data-sources/satellite`, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/**
 * Get Operational Audit Log
 */
export async function getAuditLog() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/data-sources/audit-log`, {}, 3000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
