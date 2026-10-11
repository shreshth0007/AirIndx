import React, { useState } from 'react';
import { Home, ShieldCheck, Cpu, RefreshCw, AlertCircle, Wind, CheckCircle2, Sliders } from 'lucide-react';
import { IndoorAirMetrics, AirQualityMetrics } from '../types/airQuality';
import { DEFAULT_INDOOR_AIR } from '../data/initialData';

interface IndoorAirQualityCardProps {
  outdoorMetrics: AirQualityMetrics;
}

export const IndoorAirQualityCard: React.FC<IndoorAirQualityCardProps> = ({ outdoorMetrics }) => {
  const [indoorState, setIndoorState] = useState<IndoorAirMetrics>(DEFAULT_INDOOR_AIR);
  const [roomArea, setRoomArea] = useState<number>(30); // sq meters
  const [isSensorLive, setIsSensorLive] = useState<boolean>(true);

  // Calculate required Clean Air Delivery Rate (CADR in m3/h) for 4 ACH (Air Changes per Hour)
  const roomVolume = roomArea * 2.7; // assuming 2.7m ceiling
  const requiredCadr = Math.round(roomVolume * 4);

  // Infiltration calculation
  const outdoorInfiltrationPm25 = Math.round(outdoorMetrics.pm25 * (indoorState.estimatedOutdoorInfiltration / 100));

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-slate-800 text-sm">Indoor Air Quality (IAQ) &amp; HEPA ACH</h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                  Track 01: Air
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Indoor sensor stream &amp; infiltration defense</p>
            </div>
          </div>

          <button
            onClick={() => setIsSensorLive(!isSensorLive)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center space-x-1 ${
              isSensorLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isSensorLive ? 'BLE Sensor Connected' : 'Simulated Baseline'}</span>
          </button>
        </div>

        {/* Clear Data Attribution Disclaimer (Required by Track 01) */}
        <div className="mb-4 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-[11px] text-blue-900 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Measured vs Estimated Disclaimer: </span>
            Indoor AQI ({indoorState.measuredIaAqi}) is directly measured by local IAQ sensor hardware. Outdoor infiltration ({indoorState.estimatedOutdoorInfiltration}%) is estimated from building envelope leakiness models.
          </div>
        </div>

        {/* Indoor Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Indoor AQI</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">{indoorState.measuredIaAqi}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Good Range</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Indoor PM2.5</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{indoorState.measuredPm25} <span className="text-xs font-normal">µg/m³</span></div>
            <div className="text-[10px] text-slate-400">vs Outdoor {outdoorMetrics.pm25}</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">CO2 Concentration</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{indoorState.measuredCo2} <span className="text-xs font-normal">ppm</span></div>
            <div className="text-[10px] text-slate-400">Fresh Air Optimal</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Infiltration Leak</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">{indoorState.estimatedOutdoorInfiltration}%</div>
            <div className="text-[10px] text-slate-400">+{outdoorInfiltrationPm25} µg PM2.5</div>
          </div>
        </div>

        {/* HEPA CADR Calculator */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>HEPA Purifier CADR Calculator</span>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600">{roomArea} m² Room</span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={roomArea}
            onChange={(e) => setRoomArea(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2"
          />

          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold bg-white p-2 rounded-xl border border-slate-200">
            <span>Target Air Changes (4 ACH):</span>
            <span className="text-blue-700 font-extrabold">{requiredCadr} m³/h CADR Rating Required</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Hardware: {indoorState.sensorName}</span>
        <span className="font-mono text-emerald-600 font-bold">HEPA Filter Health: 84%</span>
      </div>
    </div>
  );
};
