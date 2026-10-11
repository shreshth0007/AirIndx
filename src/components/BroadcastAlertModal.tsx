import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  MapPin,
  Settings,
  Zap,
} from 'lucide-react';
import {
  broadcastAlertsToAllUsers,
  fetchEmailStatus,
  BroadcastResponse,
} from '../services/backendApi';
import { EmailServiceStatus } from '../types/airQuality';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSmsSettings?: () => void;
  onOpenEmailSettings?: () => void;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  onOpenSmsSettings,
  onOpenEmailSettings,
}) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResponse | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailServiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openSettings = onOpenEmailSettings || onOpenSmsSettings;

  useEffect(() => {
    if (isOpen) {
      fetchEmailStatus()
        .then(setEmailStatus)
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    setError(null);
    setBroadcastResult(null);

    try {
      const res = await broadcastAlertsToAllUsers();
      setBroadcastResult(res);
      // Refresh status after broadcast
      const st = await fetchEmailStatus();
      setEmailStatus(st);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch broadcast to registered emails.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">
                Live Emergency Alert Broadcast
              </h3>
              {emailStatus && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                    emailStatus.is_configured
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      emailStatus.is_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {emailStatus.is_configured ? 'Gmail SMTP Active' : 'SMTP Setup Needed'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Evaluates live Open-Meteo AQI for each user and dispatches medical warnings directly to registered Gmail inboxes.
            </p>
          </div>
        </div>

        {/* Telemetry & Target Audience Banner */}
        <div className="mb-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">Registered Recipient Accounts</div>
              <div className="text-sm font-black text-white">
                {emailStatus ? `${emailStatus.total_registered_users} Registered Users (${emailStatus.opted_in_users_count} Opted In)` : 'Loading...'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {openSettings && (
              <button
                type="button"
                onClick={openSettings}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-3 h-3" />
                <span>Gmail SMTP Settings</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-black tracking-wide shadow-lg shadow-red-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isBroadcasting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting Emails...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Transmit Real-Time Alert</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center space-x-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Broadcast Results */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {broadcastResult ? (
            <div>
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-200">
                    Broadcast complete: Processed {broadcastResult.dispatched} of {broadcastResult.total_users} registered inboxes.
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-2.5">
                {broadcastResult.results.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{rec.user_name}</span>
                        <span className="font-mono text-cyan-300 text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-cyan-400" /> {rec.email || rec.phone}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {rec.location || 'India'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                          AQI {rec.aqi}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.status === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : rec.status === 'simulated'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {rec.status === 'sent' ? 'Delivered' : rec.status === 'simulated' ? 'Generated' : 'Failed'}
                        </span>
                      </div>
                    </div>

                    {rec.message && (
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                        {rec.message}
                      </div>
                    )}

                    {rec.error && (
                      <div className="mt-1.5 text-[11px] text-red-400 font-medium">
                        Delivery error: {rec.error}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Transport: {rec.provider || 'smtp.gmail.com:587'}</span>
                      <span>Severity: {rec.severity || 'Notice'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 p-6 border border-dashed border-slate-800 rounded-2xl">
              <Radio className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-xs font-bold text-slate-400">Ready to Broadcast Real Emergency Alerts</p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                Click "Transmit Real-Time Alert" above to query live AQI for each user's location and send personalized medical health advisories to their Gmail inboxes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
