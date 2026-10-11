import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Bell,
  Heart,
  Wind,
  Sparkles,
  Send,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Settings,
} from 'lucide-react';
import { UserProfile } from '../types/airQuality';
import { updateUserProfile, sendTestEmail } from '../services/backendApi';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenBroadcastModal?: () => void;
  onOpenSmsGatewayModal?: () => void; // Used for opening Gmail SMTP settings modal
}

const HEALTH_CONDITION_OPTIONS = [
  { id: 'Asthma / Respiratory', label: 'Asthma / Respiratory', icon: Wind },
  { id: 'Cardiovascular / Heart Disease', label: 'Cardiovascular / Heart Disease', icon: Heart },
  { id: 'Allergies to Dust/Pollen', label: 'Allergies to Dust / Pollen', icon: Sparkles },
  { id: 'Elderly (65+)', label: 'Elderly (Age 65+)', icon: User },
  { id: 'Child / Infant (<10)', label: 'Child / Infant (<10 yrs)', icon: User },
  { id: 'Outdoor Worker / Active Athlete', label: 'Outdoor Worker / Athlete', icon: Wind },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenBroadcastModal,
  onOpenSmsGatewayModal,
}) => {
  const [name, setName] = useState(user.name);
  const [healthConditions, setHealthConditions] = useState<string[]>(user.health_conditions || []);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    user.email_alerts_enabled !== undefined ? Boolean(user.email_alerts_enabled) : true
  );
  const [alertThreshold, setAlertThreshold] = useState<'Moderate' | 'Unhealthy' | 'Severe'>(
    (user.alert_threshold as any) || (user.sms_alert_threshold as any) || 'Moderate'
  );
  const [preferredLocation, setPreferredLocation] = useState(user.preferred_location || 'Delhi NCR');

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCondition = (id: string) => {
    setHealthConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('airindx_auth_token') || user.auth_token || '';
      const updated = await updateUserProfile(token, {
        name,
        health_conditions: healthConditions,
        preferred_location: preferredLocation,
        preferred_lat: user.preferred_lat || 28.6139,
        preferred_lng: user.preferred_lng || 77.2090,
        email_alerts_enabled: emailAlertsEnabled,
        alert_threshold: alertThreshold,
      });

      localStorage.setItem('airindx_user_profile', JSON.stringify(updated));
      onUpdateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const token = localStorage.getItem('airindx_auth_token') || '';
      const res = await sendTestEmail(user.email, preferredLocation, 168, token);
      if (res.success) {
        setTestEmailStatus({
          success: true,
          message: `✅ Real emergency health alert email successfully sent to ${user.email} via Gmail SMTP!`,
        });
      } else {
        setTestEmailStatus({
          success: false,
          message: res.error || res.message || 'Email delivery failed. Please check your network connection.',
        });
      }
    } catch (err: any) {
      setTestEmailStatus({
        success: false,
        message: err.message || 'Error transmitting test email to Gmail',
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">{name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Account
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400 inline" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Profile and health preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name & Preferred City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Monitored City
              </label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
              Health Conditions &amp; Sensitivities
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {HEALTH_CONDITION_OPTIONS.map((c) => {
                const isSelected = healthConditions.includes(c.id);
                const Icon = c.icon;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleCondition(c.id)}
                    className={`text-left p-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Notification Settings & Live Test Trigger */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Real-Time Gmail Health Warnings
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {emailAlertsEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Trigger Alert When AQI is:</span>
                <select
                  value={alertThreshold}
                  onChange={(e: any) => setAlertThreshold(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="Moderate">Moderate (&gt;100 AQI)</option>
                  <option value="Unhealthy">Unhealthy (&gt;150 AQI)</option>
                  <option value="Severe">Severe (&gt;200 AQI)</option>
                </select>
              </div>
            )}

            {/* Test Email Dispatch Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSendingTestEmail ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send Test Alert to My Gmail</span>
              </button>

              <span className="text-[10px] text-slate-500">Delivers to {user.email}</span>
            </div>

            {/* Broadcast & Gateway Management Shortcuts */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              {onOpenBroadcastModal && (
                <button
                  type="button"
                  onClick={onOpenBroadcastModal}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Broadcast Live Alert to All Registered Emails</span>
                </button>
              )}

              {onOpenSmsGatewayModal && (
                <button
                  type="button"
                  onClick={onOpenSmsGatewayModal}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Gmail SMTP Settings</span>
                </button>
              )}
            </div>

            {testEmailStatus && (
              <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                testEmailStatus.success
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/50 text-red-200'
              }`}>
                {testEmailStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testEmailStatus.message}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer"
            >
              {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Health Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
