import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { HistoricalDataPoint, ForecastDataPoint, AirQualityMetrics } from '../types/airQuality';
import {
  Activity,
  Calendar,
  Layers,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wind,
  Info,
} from 'lucide-react';
import { getStrictAQIColor } from '../services/airQualityApi';

interface PollutionChartsProps {
  history: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  metrics: AirQualityMetrics;
}

export const PollutionCharts: React.FC<PollutionChartsProps> = ({
  history,
  forecast,
  metrics,
}) => {
  const [activeTab, setActiveTab] = useState<'24h' | '7day' | 'pollutants'>('24h');
  const [visibleSeries, setVisibleSeries] = useState({
    aqi: true,
    pm25: true,
    pm10: false,
    temp: false,
  });

  // Calculate 24h statistics from history
  const aqiValues = history.map((h) => h.aqi);
  const pm25Values = history.map((h) => h.pm25);
  const peakAqi = aqiValues.length > 0 ? Math.max(...aqiValues) : metrics.aqi;
  const lowestAqi = aqiValues.length > 0 ? Math.min(...aqiValues) : metrics.aqi;
  const avgPm25 =
    pm25Values.length > 0
      ? (pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length).toFixed(1)
      : metrics.pm25;

  // Pollutant standards reference (WHO 24h limits & primary emission sources)
  const pollutantList = [
    {
      name: 'PM2.5',
      value: metrics.pm25,
      unit: 'µg/m³',
      max: 120,
      safeLimit: 15,
      color: '#F59E0B',
      source: 'Vehicle exhaust, biomass burning, thermal power',
      impact: 'Deep lung & bloodstream penetration; cardiovascular risk',
    },
    {
      name: 'PM10',
      value: metrics.pm10,
      unit: 'µg/m³',
      max: 250,
      safeLimit: 45,
      color: '#3B82F6',
      source: 'Road dust, construction sites, industrial emissions',
      impact: 'Upper respiratory tract & bronchial irritation, asthma flares',
    },
    {
      name: 'NO2',
      value: metrics.no2,
      unit: 'ppb',
      max: 100,
      safeLimit: 25,
      color: '#10B981',
      source: 'Diesel engines, fossil fuel combustion in transit',
      impact: 'Airway inflammation, reduced lung capacity, wheezing',
    },
    {
      name: 'SO2',
      value: metrics.so2,
      unit: 'ppb',
      max: 80,
      safeLimit: 40,
      color: '#8B5CF6',
      source: 'Coal combustion, refineries, industrial smelting',
      impact: 'Eye stinging, throat constriction, throat mucus buildup',
    },
    {
      name: 'O3',
      value: metrics.o3,
      unit: 'ppb',
      max: 120,
      safeLimit: 60,
      color: '#EC4899',
      source: 'Sunlight-driven photochemical smog reaction',
      impact: 'Chest tightness, coughing during afternoon sun hours',
    },
    {
      name: 'CO',
      value: metrics.co,
      unit: 'mg/m³',
      max: 10,
      safeLimit: 4,
      color: '#06B6D4',
      source: 'Incomplete combustion in motor vehicle traffic',
      impact: 'Binds with blood hemoglobin, reducing oxygen delivery',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col h-full select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              Real-Time Environmental Analytics &amp; Air Trends
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Live hourly sensor progression for {metrics.locationName}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto font-bold text-xs">
          <button
            onClick={() => setActiveTab('24h')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === '24h'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            24H Trend
          </button>
          <button
            onClick={() => setActiveTab('7day')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === '7day'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            7-Day Forecast
          </button>
          <button
            onClick={() => setActiveTab('pollutants')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'pollutants'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pollutant Breakdown
          </button>
        </div>
      </div>

      {/* TAB 1: 24H TREND */}
      {activeTab === '24h' && (
        <div className="space-y-4">
          {/* Summary Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  24h Peak AQI
                </div>
                <div className="text-xl font-black text-amber-950 mt-0.5">{peakAqi}</div>
              </div>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  24h Lowest AQI
                </div>
                <div className="text-xl font-black text-emerald-950 mt-0.5">{lowestAqi}</div>
              </div>
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Avg PM2.5
                </div>
                <div className="text-xl font-black text-blue-950 mt-0.5">
                  {avgPm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </div>
              </div>
              <Wind className="w-5 h-5 text-blue-600" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Diurnal Peak Time
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">Morning &amp; Dusk</div>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Series Toggle Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold">
            <span className="text-slate-400 mr-1 text-[11px]">Display Lines:</span>
            <button
              onClick={() => setVisibleSeries((p) => ({ ...p, aqi: !p.aqi }))}
              className={`px-3 py-1 rounded-full border transition-all ${
                visibleSeries.aqi
                  ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              ● AQI Index
            </button>
            <button
              onClick={() => setVisibleSeries((p) => ({ ...p, pm25: !p.pm25 }))}
              className={`px-3 py-1 rounded-full border transition-all ${
                visibleSeries.pm25
                  ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              ● PM2.5 (µg/m³)
            </button>
            <button
              onClick={() => setVisibleSeries((p) => ({ ...p, pm10: !p.pm10 }))}
              className={`px-3 py-1 rounded-full border transition-all ${
                visibleSeries.pm10
                  ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              ● PM10 (µg/m³)
            </button>
            <button
              onClick={() => setVisibleSeries((p) => ({ ...p, temp: !p.temp }))}
              className={`px-3 py-1 rounded-full border transition-all ${
                visibleSeries.temp
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              ● Temp (°C)
            </button>
          </div>

          {/* Dynamic 24H Area Chart with Real Curves */}
          <div className="w-full h-[320px] sm:h-[360px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pm25Glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pm10Glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="time"
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />

                {visibleSeries.aqi && (
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    name="AQI Index"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#aqiGlow)"
                  />
                )}

                {visibleSeries.pm25 && (
                  <Area
                    type="monotone"
                    dataKey="pm25"
                    name="PM2.5 (µg/m³)"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pm25Glow)"
                  />
                )}

                {visibleSeries.pm10 && (
                  <Area
                    type="monotone"
                    dataKey="pm10"
                    name="PM10 (µg/m³)"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pm10Glow)"
                  />
                )}

                {visibleSeries.temp && (
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temp (°C)"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tempGlow)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 2: 7-DAY FORECAST */}
      {activeTab === '7day' && (
        <div className="space-y-4">
          <div className="w-full h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis yAxisId="aqiAxis" stroke="#64748B" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis yAxisId="tempAxis" orientation="right" stroke="#10B981" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Bar
                  yAxisId="aqiAxis"
                  dataKey="aqi"
                  name="Forecast AQI"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="tempAxis"
                  type="monotone"
                  dataKey="tempMax"
                  name="Max Temp (°C)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* 7-Day Day-by-Day Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
            {forecast.map((f, idx) => {
              const strict = getStrictAQIColor(f.aqi);
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-center shadow-sm"
                >
                  <div className="text-xs font-black text-slate-800">{f.day}</div>
                  <div className="text-[10px] text-slate-400 font-medium mb-1.5">{f.date}</div>
                  <div
                    className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-black text-xs shadow-sm mb-1.5 text-white"
                    style={{ backgroundColor: strict.color }}
                  >
                    {f.aqi}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: strict.color }}>
                    {f.category}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    {f.tempMin}° / {f.tempMax}°C
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: POLLUTANT BREAKDOWN */}
      {activeTab === 'pollutants' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {pollutantList.map((p) => {
            const percentage = Math.min(100, Math.round((p.value / p.max) * 100));
            const isExceeded = p.value > p.safeLimit;

            return (
              <div
                key={p.name}
                className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-base">{p.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({p.unit})</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-slate-900 text-lg">{p.value}</span>
                      {isExceeded ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-red-200">
                          <AlertCircle className="w-3 h-3" /> &gt; Limit
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Safe
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${percentage}%`, backgroundColor: p.color }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-3">
                    <span>WHO 24h Limit: {p.safeLimit} {p.unit}</span>
                    <span>{percentage}% of Scale</span>
                  </div>

                  {/* Primary Source & Impact */}
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                    <div>
                      <strong className="text-slate-800">Source:</strong> {p.source}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong className="text-slate-700">Health Impact:</strong> {p.impact}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
