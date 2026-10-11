import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Compass,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SevenDayForecastResponse, SevenDayForecastItem, RegionData } from '../types/airQuality';
import { fetchBackendSevenDayForecast } from '../services/backendApi';

interface SevenDayForecastViewProps {
  selectedRegion: RegionData;
}

export const SevenDayForecastView: React.FC<SevenDayForecastViewProps> = ({ selectedRegion }) => {
  const [data, setData] = useState<SevenDayForecastResponse | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchBackendSevenDayForecast(
          selectedRegion.lat,
          selectedRegion.lng,
          selectedRegion.name
        );
        if (isMounted) {
          setData(res);
          setSelectedDayIndex(0);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading forecast');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [selectedRegion]);

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-3xl p-12 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center select-none">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <h4 className="text-base font-extrabold text-white">Loading 7-Day Atmospheric &amp; Weather Projections...</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md font-medium">
          Fetching real-time verified numerical models from Open-Meteo &amp; Copernicus ECMWF.
        </p>
      </div>
    );
  }

  if (error || !data || !data.seven_day_forecast) {
    return (
      <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800 text-center select-none">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white">Forecast Service Temporary Fallback</h4>
        <p className="text-xs text-slate-400 mt-1">{error || 'Unable to retrieve forecast data'}</p>
      </div>
    );
  }

  const current = data.current_measured;
  const days = data.seven_day_forecast;
  const activeDay: SevenDayForecastItem = days[selectedDayIndex] || days[0];

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* SECTION HEADER WITH ATTRIBUTION & DATA LABELS */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> 7-Day Verified Meteorological Forecast
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              100% Real Data Only
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Weather &amp; Air Quality Forecast for {data.location_name}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Clearly distinguishing measured physical sensors from Copernicus &amp; Open-Meteo numerical predictions.
          </p>
        </div>

        {/* Real vs Predicted Legend Pill */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="font-bold text-slate-200">[Measured Live]:</span>
            <span className="text-slate-400 text-[11px]">Real sensor/met station</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="font-bold text-slate-200">[Predicted Forecast]:</span>
            <span className="text-slate-400 text-[11px]">Numerical weather model</span>
          </div>
        </div>
      </div>

      {/* CURRENT CONDITIONS CARD (MEASURED LIVE) */}
      <div className="bg-slate-900/90 rounded-3xl p-6 border border-emerald-500/30 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                {current.data_label}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Coords: {data.coordinates.lat.toFixed(4)}, {data.coordinates.lng.toFixed(4)}
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Current Ground Truth Conditions</h3>
          </div>

          {/* AQI Pill */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">CPCB National AQI</div>
              <div className="text-2xl font-black text-white tracking-tight">{current.aqi}</div>
            </div>
            <div 
              style={{ backgroundColor: current.color }}
              className="px-4 py-2.5 rounded-2xl text-slate-950 font-black text-xs uppercase shadow-lg shadow-black/40"
            >
              {current.category}
            </div>
          </div>
        </div>

        {/* 6 Key Meteorological & Pollutant Measured Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
              <Thermometer className="w-4 h-4" />
              <span>Temperature</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.temperature}°C</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sensor Ground Level</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-bold">
              <Droplets className="w-4 h-4" />
              <span>Humidity</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.humidity}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Relative Air Moisture</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-blue-400 font-bold">
              <CloudRain className="w-4 h-4" />
              <span>Rainfall</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.rain_mm} mm</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Precip: {current.precipitation_mm} mm</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
              <Wind className="w-4 h-4" />
              <span>Wind Speed</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.wind_speed_kmh} km/h</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Heading: {current.wind_direction_deg}°</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-red-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>PM2.5 Aerosol</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.pm25} µg/m³</div>
            <div className="text-[10px] text-slate-400 mt-0.5">WHO Limit: 15 µg/m³</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-xs text-orange-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>PM10 Dust</span>
            </div>
            <div className="text-lg font-black text-white mt-1">{current.pm10} µg/m³</div>
            <div className="text-[10px] text-slate-400 mt-0.5">CPCB Safe: 100 µg/m³</div>
          </div>
        </div>
      </div>

      {/* 7-DAY FORECAST GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            7-Day Numerical Model Forecasts (Click Day for Detailed Breakdown)
          </h3>
          <span className="text-[11px] text-cyan-300 font-mono font-bold">
            [Open-Meteo &amp; Copernicus Predictions]
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-xl shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Active selection accent bar */}
                {isSelected && <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400" />}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{day.day_label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{day.date.slice(5)}</span>
                </div>

                {/* AQI Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">AQI Proj.</div>
                    <div className="text-xl font-black text-white">{day.aqi}</div>
                  </div>
                  <span 
                    style={{ backgroundColor: day.color }}
                    className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-slate-950 shadow-sm"
                  >
                    {day.category}
                  </span>
                </div>

                {/* Temp & Rain */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400 text-[11px]">Temp:</span>
                    <span className="font-bold">{day.temp_max}° / {day.temp_min}°</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400 text-[11px]">Precip:</span>
                    <span className="font-bold text-blue-300">{day.rain_mm} mm</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400 text-[11px]">PM2.5:</span>
                    <span className="font-bold text-red-300">{day.pm25} µg</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-cyan-400/90 font-bold text-center">
                  {isSelected ? '● Inspected' : 'Inspect Details'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY DEEP-DIVE INSPECTION DRAWER */}
      <div className="bg-slate-900/95 rounded-3xl p-6 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider">
                {activeDay.prediction_label}
              </span>
              <span className="text-xs font-mono text-slate-400">Target Date: {activeDay.date}</span>
            </div>
            <h4 className="text-lg font-black text-white mt-1">
              {activeDay.day_label} Detailed Atmospheric &amp; Precipitation Projection
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Predicted CPCB AQI</div>
              <div className="text-2xl font-black text-white">{activeDay.aqi}</div>
            </div>
            <span 
              style={{ backgroundColor: activeDay.color }}
              className="px-3.5 py-2 rounded-2xl text-slate-950 font-black text-xs uppercase shadow-md"
            >
              {activeDay.category}
            </span>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" /> Thermal Range
            </div>
            <div className="text-xl font-black text-white mt-1">{activeDay.temp_max}°C <span className="text-xs text-slate-400 font-normal">high</span></div>
            <div className="text-xs text-slate-400 mt-0.5">Low: {activeDay.temp_min}°C</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-blue-400 font-bold flex items-center gap-1.5">
              <CloudRain className="w-4 h-4" /> Rainfall &amp; Precip
            </div>
            <div className="text-xl font-black text-white mt-1">{activeDay.rain_mm} mm <span className="text-xs text-slate-400 font-normal">rain</span></div>
            <div className="text-xs text-slate-400 mt-0.5">Rain Probability: {activeDay.precipitation_probability}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <Wind className="w-4 h-4" /> Wind Dynamics
            </div>
            <div className="text-xl font-black text-white mt-1">{activeDay.wind_speed_kmh} km/h</div>
            <div className="text-xs text-slate-400 mt-0.5">Dominant Bearing: {activeDay.wind_direction_deg}°</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-xs text-red-400 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Particulate Loading
            </div>
            <div className="text-xl font-black text-white mt-1">{activeDay.pm25} <span className="text-xs text-slate-400 font-normal">µg PM2.5</span></div>
            <div className="text-xs text-slate-400 mt-0.5">Coarse Dust PM10: {activeDay.pm10} µg</div>
          </div>
        </div>

        {/* Clinical Health Advisory for this predicted day */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-start space-x-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Clinical Meteorological Advisory for {activeDay.day_label}: </strong>
            {activeDay.aqi > 200
              ? 'Severe atmospheric stagnation predicted. High fine particulate loading expected to trigger acute respiratory distress. Plan indoor activities and prepare N95 filtration.'
              : activeDay.aqi > 100
              ? 'Elevated particulate and ozone levels predicted. Asthmatic and cardiac individuals should reschedule morning outdoor athletics.'
              : 'Favorable dispersion conditions expected. Clean air profile suitable for outdoor conditioning, school sports, and routine commuting.'}
          </div>
        </div>
      </div>
    </div>
  );
};
