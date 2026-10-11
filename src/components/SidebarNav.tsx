import React, { useState } from 'react';
import { LayoutDashboard, Globe, Map, BarChart3, LineChart, Sparkles, MapPin, Leaf } from 'lucide-react';
import { RegionData } from '../types/airQuality';
import { INDIA_REGIONS } from '../data/cityCoordinates';
import { WORLD_COUNTRIES } from '../data/worldCountriesData';
import { BrandLogo } from './BrandLogo';

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  onOpenHomepage: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  selectedRegion,
  onSelectRegion,
  onOpenHomepage,
}) => {
  const [regionScope, setRegionScope] = useState<'india' | 'world'>('india');

  const mainNavItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'worldAQI', label: 'World AQI', icon: <Globe className="w-4 h-4" /> },
    { id: 'pollutionMap', label: 'Map', icon: <Map className="w-4 h-4" /> },
    { id: 'airQuality', label: 'Air Quality', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'forecasts', label: 'Forecasts', icon: <LineChart className="w-4 h-4" /> },
    { id: 'aiInsights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const quickIndiaRegions = INDIA_REGIONS.slice(0, 6);

  const quickWorldCountries: RegionData[] = WORLD_COUNTRIES.slice(0, 6).map((c) => ({
    id: c.id,
    name: `${c.flag} ${c.name}`,
    lat: c.lat,
    lng: c.lng,
    aqi: c.aqi,
    category: c.category,
  }));

  const displayedRegions = regionScope === 'india' ? quickIndiaRegions : quickWorldCountries;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 p-5 flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden lg:flex select-none">
      <div>
        {/* Professional Brand Logo */}
        <div className="mb-8">
          <BrandLogo size="md" variant="light" onClick={onOpenHomepage} />
        </div>

        {/* Navigation Group */}
        <div className="space-y-1 mb-8">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Regions Group with India/World switcher */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              REGIONS
            </span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold border border-slate-200">
              <button
                onClick={() => setRegionScope('india')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  regionScope === 'india' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                India
              </button>
              <button
                onClick={() => setRegionScope('world')}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  regionScope === 'world' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                World
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {displayedRegions.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => onSelectRegion(region)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-1">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{region.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0 font-bold">
                    {region.aqi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Motto */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            Cleaner Air <br />
            <span className="text-slate-600 font-bold">Healthier Tomorrow</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
