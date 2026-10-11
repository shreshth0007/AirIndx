import React, { useEffect, useState } from 'react';
import { MessageSquare, X, Check, ExternalLink, Bell, Smartphone } from 'lucide-react';
import { playMobileSmsChime } from '../utils/smsNotifier';

export interface IncomingSmsPayload {
  sender?: string;
  phone: string;
  message: string;
  otpCode?: string;
  ntfyUrl?: string;
}

interface IncomingSmsBannerProps {
  sms: IncomingSmsPayload | null;
  onClose: () => void;
  onUseOtp?: (code: string) => void;
}

export const IncomingSmsBanner: React.FC<IncomingSmsBannerProps> = ({
  sms,
  onClose,
  onUseOtp,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sms) {
      playMobileSmsChime();
    }
  }, [sms]);

  if (!sms) return null;

  const handleCopy = () => {
    if (sms.otpCode) {
      navigator.clipboard.writeText(sms.otpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onUseOtp) onUseOtp(sms.otpCode);
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-bounce-short select-none">
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/20 backdrop-blur-xl p-4 text-white overflow-hidden">
        {/* Top bar: Carrier & Timestamp */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white">MESSAGES</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-mono">VM-AIRIND</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px]">Just now</span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white flex items-center justify-between">
              <span>To: +91 {sms.phone}</span>
              {sms.otpCode && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-black text-xs tracking-wider">
                  {sms.otpCode}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 mt-1 font-mono leading-relaxed line-clamp-3">
              {sms.message}
            </p>

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-2">
              {sms.otpCode && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3 h-3" /> : null}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              )}

              {sms.ntfyUrl && (
                <a
                  href={sms.ntfyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                  title="Open live push stream on phone browser"
                >
                  <span>Open Mobile Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
