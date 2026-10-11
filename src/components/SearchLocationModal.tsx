import React, { useState } from 'react';
import { Search, X, MapPin, Navigation, Sparkles, RefreshCw } from 'lucide-react';
import { CityMarkerData } from '../types/airQuality';
import { GLOBAL_CITIES } from '../data/cityCoordinates';
import { fetchLiveAirQuality, fetchUserCurrentLocation } from '../services/airQualityApi';

interface SearchLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: CityMarkerData) => void;
}

export const SearchLocationModal: React.FC<SearchLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  if (!isOpen) return null;

  const filtered = GLOBAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
  );

  const handleFetchCurrentGPS = async () => {
    setLocating(true);
    try {
      const userLoc = await fetchUserCurrentLocation();
      const live = await fetchLiveAirQuality(userLoc.lat, userLoc.lng, userLoc.locationName, userLoc.country);

      const newCity: CityMarkerData = {
        id: `gps-${Date.now()}`,
        name: live.metrics.locationName,
        country: live.metrics.country,
        lat: userLoc.lat,
        lng: userLoc.lng,
        aqi: live.metrics.aqi,
        category: live.metrics.category,
        pm25: live.metrics.pm25,
        pm10: live.metrics.pm10,
        temp: live.metrics.temperature,
        humidity: live.metrics.humidity,
        windSpeed: live.metrics.windSpeed,
        riskScore: live.metrics.pollutionRiskScore,
      };

      onSelectCity(newCity);
      onClose();
    } catch (err) {
      console.warn('GPS location error:', err);
    } finally {
      setLocating(false);
    }
  };

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const name = item.display_name.split(',')[0];
        const country = item.display_name.split(',').slice(-1)[0].trim();

        const live = await fetchLiveAirQuality(lat, lng, name, country);

        const newCity: CityMarkerData = {
          id: `custom-${Date.now()}`,
          name: live.metrics.locationName,
          country: live.metrics.country,
          lat,
          lng,
          aqi: live.metrics.aqi,
          category: live.metrics.category,
          pm25: live.metrics.pm25,
          pm10: live.metrics.pm10,
          temp: live.metrics.temperature,
          humidity: live.metrics.humidity,
          windSpeed: live.metrics.windSpeed,
          riskScore: live.metrics.pollutionRiskScore,
        };

        onSelectCity(newCity);
        onClose();
      }
    } catch (err) {
      console.warn('Geocoding search fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
        {/* Top Header Search Input & GPS Locate Button */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* GPS Locate Me Button */}
          <button
            onClick={handleFetchCurrentGPS}
            disabled={locating}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {locating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            <span>{locating ? 'Detecting GPS Coordinates...' : 'Use My Current GPS Location'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <form onSubmit={handleCustomSearch} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search city globally (e.g. Delhi, London, Tokyo, NYC)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                autoFocus
              />
            </form>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
              <span>Fetching live satellite &amp; ground station data...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((city) => (
              <div
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-lg">
                    {city.flag ? city.flag : <MapPin className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <span>{city.name}</span>
                    </h5>
                    <p className="text-[11px] text-slate-400">{city.country} • {city.temp}°C, {city.humidity}% Humidity</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-800 block">{city.aqi} AQI</span>
                  <span className="text-[10px] font-semibold text-amber-600">{city.category}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No matching preset cities. Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">Enter</kbd> to search global OpenStreetMap geocoding database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
