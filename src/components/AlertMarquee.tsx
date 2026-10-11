import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Bell, X, ShieldAlert, CheckCircle2, ChevronRight, Activity, Zap, Server, Radio } from 'lucide-react';
import { MarqueeAlertItem, UserProfile } from '../types/airQuality';
import { fetchMarqueeAlerts } from '../services/backendApi';

interface AlertMarqueeProps {
  currentUser?: UserProfile | null;
  onOpenProfile?: () => void;
  onOpenBroadcastModal?: () => void;
  onOpenSmsGatewayModal?: () => void;
}

export const AlertMarquee: React.FC<AlertMarqueeProps> = ({
  currentUser,
  onOpenProfile,
  onOpenBroadcastModal,
  onOpenSmsGatewayModal,
}) => {
  const [alerts, setAlerts] = useState<MarqueeAlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<MarqueeAlertItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await fetchMarqueeAlerts();
      if (isMounted && data.length > 0) {
        setAlerts(data);
      }
    };
    load();
    const timer = setInterval(load, 60000); // Refresh every minute
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <>
      {/* SCROLLING MARQUEE STRIP */}
      <div 
        className="relative overflow-hidden w-full bg-slate-950/90 border-y border-slate-800/80 shadow-md backdrop-blur-md z-30 select-none py-2.5 px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          {/* Static Live Alert Pill Header */}
          <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-black tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-0.5" />
            <Bell className="w-3.5 h-3.5 text-red-400" />
            <span className="uppercase text-[11px]">Live Alerts</span>
          </div>

          {/* Scrolling Ticker Line */}
          <div className="overflow-hidden flex-1 relative whitespace-nowrap">
            <div 
              className={`inline-flex items-center space-x-8 transition-transform ${isPaused ? '' : 'animate-marquee'}`}
              style={{ animationDuration: '38s' }}
            >
              {alerts.concat(alerts).map((alert, idx) => {
                const isHigh = alert.severity === 'high';
                const isMod = alert.severity === 'moderate';

                const badgeBg = isHigh
                  ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                  : isMod
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/50';

                return (
                  <button
                    key={`${alert.id}-${idx}`}
                    onClick={() => setSelectedAlert(alert)}
                    className="inline-flex items-center space-x-2.5 group cursor-pointer text-left focus:outline-none transition-transform hover:scale-[1.01]"
                  >
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeBg}`}>
                      {alert.severity} Risk
                    </span>
                    <span className="font-bold text-slate-200 text-xs tracking-tight group-hover:text-white transition-colors">
                      {alert.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      — {alert.message.slice(0, 110)}...
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold group-hover:underline flex items-center">
                      View Precautions <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                    <span className="text-slate-700 text-xs mx-3">•</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Broadcast & Email Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {onOpenBroadcastModal && (
              <button
                onClick={onOpenBroadcastModal}
                className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-black tracking-wide shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Broadcast emergency alert emails to all registered user Gmail inboxes"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Broadcast Alert</span>
              </button>
            )}

            {onOpenSmsGatewayModal && (
              <button
                onClick={onOpenSmsGatewayModal}
                className="hidden sm:flex px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold tracking-wide transition-all items-center gap-1 cursor-pointer"
                title="Configure Gmail SMTP credentials for real email delivery"
              >
                <Server className="w-3 h-3 text-cyan-400" />
                <span>Gmail Setup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CLICKABLE ALERT DETAILS & MEDICAL PRECAUTIONS MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md ${
                  selectedAlert.severity === 'high'
                    ? 'bg-red-500/20 border-red-500 text-red-400 shadow-red-500/20'
                    : selectedAlert.severity === 'moderate'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-amber-500/20'
                    : 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-sky-500/20'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      selectedAlert.severity === 'high'
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : selectedAlert.severity === 'moderate'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    }`}>
                      {selectedAlert.severity.toUpperCase()} ALERT
                    </span>
                    {selectedAlert.aqi_reading > 0 && (
                      <span className="text-xs font-mono font-bold text-slate-300">
                        AQI: {selectedAlert.aqi_reading} ({selectedAlert.dominant_pollutant})
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
                    {selectedAlert.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Situation Description */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                <span className="font-bold text-slate-100 block mb-1">Situation Overview:</span>
                {selectedAlert.message}
              </div>

              {/* Affected Regions */}
              <div className="flex items-center justify-between text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Affected Regions:</span>
                <span className="font-bold text-cyan-300">{selectedAlert.affected_regions}</span>
              </div>

              {/* Actionable Medical Precautions Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    Recommended Health Precautions
                  </h4>
                  {currentUser && currentUser.health_conditions?.length > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Personalized for {currentUser.health_conditions.join(', ')}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedAlert.precautions.map((prec, i) => (
                    <div 
                      key={i} 
                      className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{prec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Email Status */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-slate-400">
                {currentUser?.email_alerts_enabled ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Gmail Alerts are active for {currentUser.email}
                  </span>
                ) : (
                  <span>
                    Want real-time Gmail alerts during severe pollution?{' '}
                    <button 
                      onClick={() => {
                        setSelectedAlert(null);
                        if (onOpenProfile) onOpenProfile();
                      }}
                      className="text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      Enable in Profile
                    </button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onOpenBroadcastModal && (
                  <button
                    onClick={() => {
                      setSelectedAlert(null);
                      onOpenBroadcastModal();
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Broadcast to All Users</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all cursor-pointer text-center text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
