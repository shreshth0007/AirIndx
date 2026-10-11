import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Key,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
  Server,
  Zap,
  Info,
} from 'lucide-react';
import {
  fetchEmailStatus,
  configureEmailService,
  sendTestEmail,
  fetchEmailHistory,
} from '../services/backendApi';
import { EmailServiceStatus, EmailLogEntry } from '../types/airQuality';

interface EmailGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: (status: EmailServiceStatus) => void;
}

export const EmailGatewayModal: React.FC<EmailGatewayModalProps> = ({
  isOpen,
  onClose,
  onStatusChanged,
}) => {
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);

  const [status, setStatus] = useState<EmailServiceStatus | null>(null);
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'test' | 'logs'>('settings');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Test Email state
  const [testEmail, setTestEmail] = useState('');
  const [testLocation, setTestLocation] = useState('Delhi NCR');
  const [testAqi, setTestAqi] = useState(168);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatusAndLogs();
    }
  }, [isOpen]);

  const loadStatusAndLogs = async () => {
    try {
      const s = await fetchEmailStatus();
      setStatus(s);
      if (s.smtp_user) setSmtpUser(s.smtp_user);
      if (s.smtp_host) setSmtpHost(s.smtp_host);
      if (s.smtp_port) setSmtpPort(s.smtp_port);

      const h = await fetchEmailHistory(30);
      setLogs(h);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMsg(null);

    try {
      const res = await configureEmailService({
        smtp_user: smtpUser.trim().toLowerCase(),
        smtp_password: smtpPassword.trim().replace(/\s+/g, ''),
        smtp_host: smtpHost.trim(),
        smtp_port: Number(smtpPort) || 587,
        smtp_from_name: 'AirIndx Environmental Intelligence',
      });

      setStatus(res.status);
      if (onStatusChanged) onStatusChanged(res.status);
      setSaveSuccessMsg('✅ Gmail SMTP credentials saved successfully! Test email sending to verify connection.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save Gmail SMTP credentials');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const clean = testEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setTestResult({
        success: false,
        message: 'Please enter a valid Gmail / Email address.',
      });
      setIsTesting(false);
      return;
    }

    try {
      const res = await sendTestEmail(clean, testLocation, testAqi);
      if (res.success) {
        setTestResult({
          success: true,
          message: `✅ Emergency environmental warning email successfully delivered to ${clean} via ${res.provider || 'smtp.gmail.com:587'}!`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || res.message || 'Email delivery failed.',
          error: res.error,
        });
      }
      // Reload logs
      const h = await fetchEmailHistory(30);
      setLogs(h);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error triggering test email.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/10">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">
                Nodemailer &amp; Real Gmail Delivery
              </h3>
              {status && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                    status.is_configured
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.is_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {status.is_configured ? 'SMTP Active' : 'Setup Required'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real TLS authenticated transport via Google's official SMTP servers (smtp.gmail.com:587)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5 shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Gmail Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'test'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Email Audit Logs</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-cyan-400 font-mono">
              {logs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: GMAIL SMTP CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="overflow-y-auto space-y-5 pr-1 flex-1">
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Quick 3-step Google App Password Guide */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/30 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Info className="w-4 h-4 text-cyan-400" />
                  How to connect your Real Gmail Account (100% Genuine Delivery)
                </span>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Google Security</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Google requires a free 16-character <strong>App Password</strong> for automated TLS email sending:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] pl-1 font-medium">
                <li>Visit <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">Google Account &gt; Security</a> and turn on 2-Step Verification.</li>
                <li>Search for <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">"App passwords"</a>.</li>
                <li>Enter app name <strong>"AirIndx"</strong> and click <strong>Create</strong>.</li>
                <li>Copy the generated 16-character code and paste below!</li>
              </ol>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sender Gmail Address (SMTP User)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="youraccount@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Google App Password (16 Characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Spaces are automatically stripped. Kept secure on your local machine.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SMTP Port (TLS)
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {status?.is_configured ? '✅ Gmail credentials active' : '⚠️ Enter App Password to activate real emails'}
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-blue-500/25 flex items-center space-x-2 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Save &amp; Connect Gmail</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SEND TEST ALERT */}
        {activeTab === 'test' && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">Test Real Email Dispatch</span>
              <p className="text-[11px] text-slate-400">
                Transmits a realistic HTML environmental emergency health alert (with AQI score, personalized medical guidance, and respirators advice) directly to your Gmail inbox.
              </p>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/70 border-red-500/50 text-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">{testResult.message}</span>
                  {testResult.error && (
                    <span className="text-[11px] text-red-300 font-mono mt-1 block">
                      Error details: {testResult.error}
                    </span>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Recipient Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="recipient@gmail.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Simulated AQI
                  </label>
                  <input
                    type="number"
                    value={testAqi}
                    onChange={(e) => setTestAqi(Number(e.target.value))}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-500/20 flex items-center space-x-2 cursor-pointer"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isTesting ? 'Sending to Gmail...' : 'Transmit Emergency Alert Email'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: EMAIL AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">Recent Email Dispatch Audit Trail</span>
              <button
                onClick={loadStatusAndLogs}
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                No email dispatch records found yet. Trigger a test email above or send a broadcast alert!
              </div>
            ) : (
              <div className="space-y-2.5">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            log.status === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : log.status === 'simulated'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="font-bold text-white font-mono">{log.recipient_email}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2">
                      {log.subject}
                    </p>

                    {log.error_details && (
                      <p className="text-[10px] text-red-400 font-mono bg-red-950/40 p-1.5 rounded-lg border border-red-900/40">
                        {log.error_details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
