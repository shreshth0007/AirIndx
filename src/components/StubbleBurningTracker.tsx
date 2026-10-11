import React, { useState } from 'react';
import { Flame, Wind, Satellite, AlertTriangle, ShieldCheck, MapPin, Info, ArrowUpRight } from 'lucide-react';
import { StubbleHotspot } from '../types/airQuality';
import { INITIAL_STUBBLE_HOTSPOTS } from '../data/initialData';

interface StubbleBurningTrackerProps {
  onSelectHotspot?: (hotspot: StubbleHotspot) => void;
}

export const StubbleBurningTracker: React.FC<StubbleBurningTrackerProps> = ({ onSelectHotspot }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<StubbleHotspot>(INITIAL_STUBBLE_HOTSPOTS[0]);
  const [filterState, setFilterState] = useState<string>('All');

  const filtered = INITIAL_STUBBLE_HOTSPOTS.filter(
    (h) => filterState === 'All' || h.stateRegion.toLowerCase() === filterState.toLowerCase()
  );

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Stubble Burning Satellite Monitor</h3>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                Track 01: Air Module
              </span>
            </div>
            <p className="text-xs text-slate-400">NASA VIIRS & Sentinel-5P TROPOMI thermal anomaly tracking</p>
          </div>
        </div>

        {/* State Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          {['All', 'Punjab', 'Haryana', 'Uttar Pradesh'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterState === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Hotspot Details + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column: Highlighted Fire Node Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-400">{selectedHotspot.satelliteSource}</span>
              </div>
              <span className="text-[11px] bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold">
                {selectedHotspot.confidenceScore}% Detection Confidence
              </span>
            </div>

            {/* Fire Node Title & Count */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-extrabold text-white">{selectedHotspot.locationName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {selectedHotspot.stateRegion}, India ({selectedHotspot.lat.toFixed(2)}°N, {selectedHotspot.lng.toFixed(2)}°E)
                </p>
              </div>

              <div className="text-right bg-red-950/60 border border-red-800/80 rounded-2xl p-3 shadow-inner">
                <div className="text-2xl font-black text-red-400 flex items-center justify-end gap-1">
                  <Flame className="w-5 h-5 text-red-500" /> {selectedHotspot.fireCount}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Active Fire Spots</div>
              </div>
            </div>

            {/* Smoke Vector & Impacted Cities */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mb-1">
                  <Wind className="w-3.5 h-3.5 text-blue-400" /> Smoke Plume Vector
                </div>
                <div className="text-xs font-bold text-slate-200">{selectedHotspot.smokeDriftVector}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Impacted Downwind Cities
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedHotspot.impactedCities.map((city) => (
                    <span key={city} className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Uncertainty Warning Note */}
            <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200/90 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Satellite Optical Uncertainty Note: </span>
                {selectedHotspot.uncertaintyNotes}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Last detected: {selectedHotspot.lastDetected}</span>
            <span className="font-mono text-cyan-400">Sentinel-5P TROPOMI SO2/NO2 Layer</span>
          </div>
        </div>

        {/* Right Column: Hotspot List Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 overflow-y-auto max-h-[380px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Active Fire Clusters ({filtered.length})
          </div>
          {filtered.map((hotspot) => {
            const isSelected = selectedHotspot.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                onClick={() => {
                  setSelectedHotspot(hotspot);
                  if (onSelectHotspot) onSelectHotspot(hotspot);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-red-50/90 border-red-300 shadow-md ring-2 ring-red-400/20'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className={`w-4 h-4 ${isSelected ? 'text-red-600' : 'text-slate-400'}`} />
                    <h5 className="font-bold text-slate-800 text-sm">{hotspot.locationName}</h5>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
                    {hotspot.fireCount} Fires
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{hotspot.stateRegion} • {hotspot.confidenceScore}% confidence</span>
                  <span className="font-medium text-slate-600">{hotspot.lastDetected}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
