import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import { AirQualityMetrics, HistoricalDataPoint, ForecastDataPoint, RegionData } from '../types/airQuality';
import { IndiaMap } from './IndiaMap';
import { AIInsightsPanel } from './AIInsightsPanel';

import { Activity, Flame, Thermometer, Droplets, Wind, Sun, Sparkles } from 'lucide-react';

interface CommandCenterDashboardProps {
  metrics: AirQualityMetrics;
  history: HistoricalDataPoint[];
  forecast: ForecastDataPoint[];
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  aiInsights: any;
  onRefreshAI: () => void;
  onAskAI: (q: string) => Promise<string>;
  isAiLoading: boolean;
  onSearchQuery: (q: string) => void;
}

export const CommandCenterDashboard: React.FC<CommandCenterDashboardProps> = ({
  metrics,
  history,
  forecast,
  selectedRegion,
  onSelectRegion,
  aiInsights,
  onRefreshAI,
  onAskAI,
  isAiLoading,
  onSearchQuery,
}) => {
  // Generate 24h temperature & humidity trend for Image 2 widgets
  const sensibleData = history.map((h) => ({
    time: h.time,
    temp: h.temperature,
    comfort: Math.max(40, 100 - (metrics.aqi * 0.4)),
    humidity: Math.min(95, metrics.humidity + Math.round(Math.sin(parseInt(h.time) || 1) * 8)),
    fireRisk: Math.min(100, Math.round((metrics.pm25 / 100) * 85 + 15)),
    uv: Math.max(1, Math.round(6 + Math.sin(parseInt(h.time) || 1) * 5)),
  }));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Bar: Command Center Status Banner (Matching Reference Image 2 Top-Left Meter) */}
      <div className="glass-card-glow rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Radial Gauge Meter */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 stroke-current transition-all duration-1000"
                strokeWidth="3.5"
                strokeDasharray={`${Math.min(100, (metrics.aqi / 300) * 100)}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-white leading-none">{metrics.aqi}</span>
              <span className="text-[8px] uppercase font-bold text-cyan-400 mt-0.5">AQI</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {metrics.locationName}, {metrics.country}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Live Satellite Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: <span className="text-amber-400 font-bold">{metrics.category}</span> • Dominant: {metrics.dominantPollutant} • Risk: {metrics.pollutionRiskScore}%
            </p>
          </div>
        </div>

        {/* Micro Weather Bar */}
        <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5 shrink-0 self-end md:self-auto text-xs text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Temp</div>
              <div className="font-bold text-white">{metrics.temperature}°C</div>
            </div>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex items-center space-x-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Humidity</div>
              <div className="font-bold text-white">{metrics.humidity}%</div>
            </div>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex items-center space-x-1.5">
            <Wind className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Wind</div>
              <div className="font-bold text-white">{metrics.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Central Regional Heatmap (8 cols) + AI Insights (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 min-h-[480px]">
          <IndiaMap
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            onSearchQuery={onSearchQuery}
          />
        </div>

        <div className="lg:col-span-4 min-h-[480px]">
          {aiInsights ? (
            <AIInsightsPanel
              insights={aiInsights}
              metrics={metrics}
              onRefresh={onRefreshAI}
              onAskAI={onAskAI}
              isLoading={isAiLoading}
            />
          ) : (
            <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-medium">Synchronizing GreenPulse AI Engine...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: 4 Multi-Chart Cards (Matching Reference Image 2 Grid Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Card 1: Sensible Temperature Trend */}
        <div className="glass-card rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" /> Sensible Temp
            </span>
            <span className="text-[10px] font-mono text-amber-400">{metrics.temperature}°C Peak</span>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensibleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Human Comfort Index */}
        <div className="glass-card rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" /> Comfort Index
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Moderate</span>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensibleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="comfort" stroke="#10B981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Stubble & Forest Fire Risk Index */}
        <div className="glass-card rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" /> Stubble Fire Risk
            </span>
            <span className="text-[10px] font-mono text-red-400">Elevated</span>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensibleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="fireRisk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#fireGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Hourly UV & AQI Bar Chart */}
        <div className="glass-card rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-cyan-400" /> Hourly UV &amp; AQI
            </span>
            <span className="text-[10px] font-mono text-cyan-400">UV 6 High</span>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensibleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="uv" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
