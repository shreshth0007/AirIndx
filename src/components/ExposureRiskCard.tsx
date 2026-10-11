import React, { useState } from 'react';
import { ShieldAlert, User, Clock, HeartPulse, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AirQualityMetrics, ExposureRiskProfile } from '../types/airQuality';

interface ExposureRiskCardProps {
  metrics: AirQualityMetrics;
}

export const ExposureRiskCard: React.FC<ExposureRiskCardProps> = ({ metrics }) => {
  const [userGroup, setUserGroup] = useState<ExposureRiskProfile['userGroup']>('Asthma / Respiratory');
  const [outdoorHours, setOutdoorHours] = useState<number>(2);

  // Compute exposure risk profile dynamically
  const baseScore = metrics.pollutionRiskScore;
  let groupMultiplier = 1.0;
  if (userGroup === 'Children & Elderly') groupMultiplier = 1.35;
  if (userGroup === 'Asthma / Respiratory') groupMultiplier = 1.55;
  if (userGroup === 'Outdoor Workers') groupMultiplier = 1.40;

  const durationMultiplier = Math.min(1.8, 0.6 + outdoorHours * 0.25);
  const finalScore = Math.min(100, Math.round(baseScore * groupMultiplier * durationMultiplier));

  let riskLevel: ExposureRiskProfile['riskLevel'] = 'Low';
  let badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (finalScore > 75) {
    riskLevel = 'Severe';
    badgeColor = 'bg-red-500/10 text-red-600 border-red-500/20';
  } else if (finalScore > 50) {
    riskLevel = 'High';
    badgeColor = 'bg-orange-500/10 text-orange-600 border-orange-500/20';
  } else if (finalScore > 30) {
    riskLevel = 'Moderate';
    badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  }

  const precautions: string[] = [];
  if (finalScore > 70) {
    precautions.push('Mandatory fit-tested N95 / FFP2 mask for all outdoor trips.');
    precautions.push('Avoid strenuous outdoor cardio exercises between 6 AM - 10 AM during temperature inversion.');
    precautions.push('Run indoor HEPA air purification continuously.');
  } else if (finalScore > 40) {
    precautions.push('Wear a protective mask if commuting along heavy traffic corridors.');
    precautions.push('Keep windows closed; use recirculated AC in vehicles.');
    precautions.push('Hydrate frequently to support upper respiratory mucosal clearance.');
  } else {
    precautions.push('Air exposure risk is low for short duration outdoor activities.');
    precautions.push('Normal outdoor physical exercise safe.');
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Personal Exposure Risk</h3>
              <p className="text-[11px] text-slate-400">Tailored particulate dose calculator</p>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
            {riskLevel} Risk ({finalScore}%)
          </span>
        </div>

        {/* User Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* User Profile Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-blue-500" /> Health Profile
            </label>
            <select
              value={userGroup}
              onChange={(e) => setUserGroup(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Standard">Standard Healthy Adult</option>
              <option value="Children & Elderly">Children &amp; Senior Citizens</option>
              <option value="Asthma / Respiratory">Asthma / Respiratory Patient</option>
              <option value="Outdoor Workers">Outdoor Construction / Courier Worker</option>
            </select>
          </div>

          {/* Planned Exposure Duration */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" /> Outdoor Duration ({outdoorHours} hrs)
            </label>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={outdoorHours}
              onChange={(e) => setOutdoorHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
          </div>
        </div>

        {/* Progress Bar Score Gauge */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
            <span>Cumulative Inhalation Dose Score</span>
            <span className="font-bold text-slate-800">{finalScore} / 100</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                finalScore > 75 ? 'bg-red-500' : finalScore > 50 ? 'bg-orange-500' : finalScore > 30 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${finalScore}%` }}
            />
          </div>
        </div>

        {/* Precautions List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Required Precautions</div>
          {precautions.map((p, i) => (
            <div key={i} className="flex items-start space-x-2 bg-slate-50 rounded-xl p-2 border border-slate-100 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Estimates based on WHO 24h particulate absorption models</span>
        <span className="font-mono">GreenPulse Risk Engine</span>
      </div>
    </div>
  );
};
