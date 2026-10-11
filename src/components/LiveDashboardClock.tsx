import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface LiveDashboardClockProps {
  className?: string;
  showIcon?: boolean;
  format?: 'full' | 'compact' | 'reference';
}

export const LiveDashboardClock: React.FC<LiveDashboardClockProps> = ({
  className = '',
  showIcon = true,
  format = 'compact',
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (format === 'reference') {
    // Exactly formatted like the reference image header: 25/07/2025 10:11
    const refDate = `${dateStr} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    return (
      <div className={`flex items-center space-x-2 text-xs font-semibold ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />}
        <span className="font-mono text-slate-200">{refDate}</span>
      </div>
    );
  }

  if (format === 'full') {
    const fullDateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return (
      <div className={`flex items-center space-x-2 text-xs font-semibold ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
        <span className="text-slate-700">{fullDateStr}</span>
        <span className="text-blue-600 font-mono font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">{timeStr}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1.5 text-xs font-semibold text-slate-700 ${className}`}>
      {showIcon && <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
      <span>{dateStr}</span>
      <span className="text-blue-600 font-mono font-bold">{timeStr}</span>
    </div>
  );
};
