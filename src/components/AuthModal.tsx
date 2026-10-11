import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Wind,
  AlertCircle,
  Bell,
  RefreshCw,
  Sparkles,
  Lock,
  Inbox,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { requestEmailOtp, verifyEmailOtp, loginWithPassword } from '../services/backendApi';
import { UserProfile } from '../types/airQuality';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenSmsGatewayModal?: () => void;
}

const HEALTH_CONDITION_OPTIONS = [
  { id: 'Asthma / Respiratory', label: 'Asthma / Respiratory', icon: Wind, desc: 'Bronchial sensitivity, COPD, wheezing' },
  { id: 'Cardiovascular / Heart Disease', label: 'Cardiovascular / Heart Disease', icon: Heart, desc: 'Hypertension, coronary risk, vascular stress' },
  { id: 'Allergies to Dust/Pollen', label: 'Allergies to Dust / Pollen', icon: Sparkles, desc: 'Rhinitis, mucosal irritation, particulate allergy' },
  { id: 'Elderly (65+)', label: 'Elderly (Age 65+)', icon: User, desc: 'High physiological sensitivity to particulate loading' },
  { id: 'Child / Infant (<10)', label: 'Child / Infant (<10 yrs)', icon: User, desc: 'Developing lungs, higher breath intake rate' },
  { id: 'Outdoor Worker / Active Athlete', label: 'Outdoor Worker / Athlete', icon: Wind, desc: 'High cumulative atmospheric particulate exposure' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields: ONLY Name, Gmail, and Password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification
  const [otp, setOtp] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);

  // Profile Preferences
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'Asthma / Respiratory',
  ]);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState<'Moderate' | 'Unhealthy' | 'Severe'>('Moderate');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // 1. Submit Registration: Name + Gmail + Password -> Requests OTP via Gmail
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid Gmail / Email address (e.g. yourname@gmail.com).');
      return;
    }

    if (!password.trim() || password.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestEmailOtp(cleanEmail, name.trim(), password.trim());
      setStep('otp');
      setOtp('');
      if (res.otp) {
        setDispatchedOtp(res.otp);
      }
      setStatusMessage(`✅ Verification code dispatched to ${cleanEmail} via Gmail. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Unable to register. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Direct Login: Gmail + Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithPassword(cleanEmail, password.trim());
      localStorage.setItem('airindx_auth_token', res.token);
      localStorage.setItem('airindx_user_profile', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect Gmail address or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify 6-digit OTP passcode
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyEmailOtp(
        cleanEmail,
        otp.trim(),
        name.trim() || 'AirIndx Member',
        password.trim(),
        selectedConditions,
        'Delhi NCR',
        28.6139,
        77.2090,
        emailAlertsEnabled,
        alertThreshold
      );

      // Save token in localStorage
      localStorage.setItem('airindx_auth_token', res.token);
      localStorage.setItem('airindx_user_profile', JSON.stringify(res.user));

      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            {step === 'otp' ? <ShieldCheck className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">
              {step === 'otp'
                ? 'Verify Gmail Passcode'
                : authMode === 'register'
                ? 'Create AirIndx Account'
                : 'Sign In to AirIndx'}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {step === 'otp'
                ? `Enter the 6-digit passcode sent to ${email}`
                : authMode === 'register'
                ? 'Register with your Gmail and password to receive real-time alerts'
                : 'Enter your registered Gmail and password'}
            </p>
          </div>
        </div>

        {/* Switch Between Register and Sign In (Only in form step) */}
        {step === 'form' && (
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register (New User)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Existing User)
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* STEP 1A: REGISTRATION FORM (Name, Gmail, Password) */}
        {step === 'form' && authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Shreya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-1">
                Enter any password for your AirIndx account (minimum 6 characters).
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code to Gmail...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Register &amp; Send Verification Code</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 1B: DIRECT LOGIN (Gmail + Password) */}
        {step === 'form' && authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 cursor-pointer mt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ENTER OTP & SELECT HEALTH PREFERENCES */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Enter 6-Digit Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-[11px] text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Change Email / Password
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-lg font-mono font-black text-cyan-400 tracking-widest text-center focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Informative notice with quick-code filler button */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Inbox className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <span className="font-bold text-white block">Passcode Sent to Gmail</span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Check your inbox at <strong className="text-white">{email}</strong> for the verification email.
                  </span>
                  {dispatchedOtp && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Verification Code: <strong className="font-mono text-emerald-300 font-bold tracking-wider">{dispatchedOtp}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(dispatchedOtp)}
                        className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/40 cursor-pointer font-bold"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Health Conditions Multi-Select */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Select Your Health Conditions
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Our clinical engine personalizes alert emails based on your selections:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {HEALTH_CONDITION_OPTIONS.map((cond) => {
                  const isSelected = selectedConditions.includes(cond.id);
                  const Icon = cond.icon;
                  return (
                    <button
                      type="button"
                      key={cond.id}
                      onClick={() => toggleCondition(cond.id)}
                      className={`text-left p-2 rounded-xl border transition-all flex items-start space-x-2 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">{cond.label}</div>
                        <div className="text-[10px] text-slate-400 opacity-80 truncate">{cond.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gmail Notifications Preferences */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Receive Real-Time Gmail Health Alerts
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
                  <span className="text-slate-400">Send Alert When AQI is:</span>
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
            </div>

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Email &amp; Complete Registration</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
