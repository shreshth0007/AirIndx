import React from 'react';
import { Wind, Thermometer, Droplets, Leaf, Activity, Sun } from 'lucide-react';
import { AirQualityMetrics } from '../types/airQuality';
import { getAQICategory } from '../services/airQualityApi';

interface AQICardProps {
  metrics: AirQualityMetrics;
}

export const AQICardGrid: React.FC<AQICardProps> = ({ metrics }) => {
  const categoryMeta = getAQICategory(metrics.aqi);

  const cards = [
    {
      id: 'aqi',
      title: 'Air Quality Index (AQI)',
      value: `${metrics.aqi}`,
      unit: '',
      category: metrics.category,
      categoryBg: categoryMeta.badgeBg,
      trend: '↓ 12%',
      trendDirection: 'down',
      icon: <Leaf className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'pm25',
      title: 'PM2.5',
      value: `${metrics.pm25}`,
      unit: 'µg/m³',
      category: metrics.pm25 > 35 ? 'Unhealthy' : 'Moderate',
      categoryBg: metrics.pm25 > 35 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      trend: '↓ 18%',
      trendDirection: 'down',
      icon: <Sun className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'pm10',
      title: 'PM10',
      value: `${metrics.pm10}`,
      unit: 'µg/m³',
      category: metrics.pm10 > 50 ? 'Moderate' : 'Good',
      categoryBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      trend: '↓ 14%',
      trendDirection: 'down',
      icon: <Wind className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'temp',
      title: 'Temperature',
      value: `${metrics.temperature}`,
      unit: '°C',
      category: 'Normal',
      categoryBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      trend: '↑ 2%',
      trendDirection: 'up',
      icon: <Thermometer className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: `${metrics.humidity}`,
      unit: '%',
      category: 'Normal',
      categoryBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      trend: '↑ 6%',
      trendDirection: 'up',
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >
          {/* Top Row: Icon & Title */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
              {card.icon}
            </div>
            <span className="text-xs font-semibold text-slate-500 truncate">{card.title}</span>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{card.value}</span>
            {card.unit && <span className="text-xs font-semibold text-slate-400">{card.unit}</span>}
          </div>

          {/* Footer Badge & Trend */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${card.categoryBg}`}>
              {card.category}
            </span>

            <div className="flex items-center space-x-0.5 text-[10px] text-slate-400 font-medium">
              <span className={card.trendDirection === 'down' ? 'text-emerald-500 font-bold' : 'text-slate-500 font-semibold'}>
                {card.trend}
              </span>
              <span>vs yesterday</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
