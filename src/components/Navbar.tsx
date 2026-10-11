import React, { useState } from 'react';
import { MapPin, User, ChevronDown, Flame, Navigation, RefreshCw, Globe } from 'lucide-react';
import { RegionData, UserProfile } from '../types/airQuality';
import { INDIA_REGIONS } from '../data/cityCoordinates';
import { BrandLogo } from './BrandLogo';
import { LiveDashboardClock } from './LiveDashboardClock';

interface NavbarProps {
  viewMode: 'homepage' | 'dashboard';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDashboard: () => void;
  onOpenHomepage: () => void;
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  onOpenCommunityReports: () => void;
  onFetchUserLocation?: () => void;
  isLocating?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  activeTab,
  onTabChange,
  onOpenDashboard,
  onOpenHomepage,
  selectedRegion,
  onSelectRegion,
  onOpenCommunityReports,
  onFetchUserLocation,
  isLocating,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  // Landing Page Header Navbar
  if (viewMode === 'homepage') {
    return (
      <header className="w-full py-4 px-6 sm:px-12 flex items-center justify-between z-50 bg-[#050811]/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0">
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
          <button
            onClick={() => { onTabChange('worldAQI'); onOpenDashboard(); }}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>World AQI</span>
          </button>
          <button
            onClick={() => { onTabChange('airQuality'); onOpenDashboard(); }}
            className="hover:text-cyan-400 transition-colors"
          >
            Air Quality
          </button>
          <button
            onClick={() => { onTabChange('stubbleTrack'); onOpenDashboard(); }}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Air Monitors</span>
          </button>
          <button
            onClick={() => { onTabChange('schoolSafety'); onOpenDashboard(); }}
            className="hover:text-cyan-400 transition-colors"
          >
            Discover
          </button>
        </nav>

        {/* Professional Project Logo */}
        <BrandLogo size="md" variant="dark" onClick={onOpenHomepage} />

        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <button onClick={onOpenCommunityReports} className="hover:text-cyan-400 transition-colors">
              About
            </button>
            <button
              onClick={() => { onTabChange('indoorAir'); onOpenDashboard(); }}
              className="hover:text-cyan-400 transition-colors"
            >
              Technology
            </button>
          </nav>

          <button
            onClick={onOpenDashboard}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>
    );
  }

  // Dashboard Header Navbar with Live Date & GPS Location
  return (
    <header className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
        {/* Professional Logo */}
        <BrandLogo size="sm" variant="light" onClick={onOpenHomepage} />

        <nav className="flex items-center space-x-5 text-xs sm:text-sm font-semibold shrink-0">
          <button
            onClick={() => onTabChange('overview')}
            className={`py-1 relative transition-colors ${
              activeTab === 'overview' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onTabChange('worldAQI')}
            className={`py-1 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'worldAQI' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>World AQI</span>
            {activeTab === 'worldAQI' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onTabChange('airQuality')}
            className={`py-1 relative transition-colors ${
              activeTab === 'airQuality' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Air Quality
          </button>
          <button
            onClick={() => onTabChange('pollutionMap')}
            className={`py-1 relative transition-colors ${
              activeTab === 'pollutionMap' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pollution Map
          </button>
          <button
            onClick={() => onTabChange('forecasts')}
            className={`py-1 relative transition-colors ${
              activeTab === 'forecasts' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Forecasts
          </button>
          <button
            onClick={() => onTabChange('aiInsights')}
            className={`py-1 relative transition-colors ${
              activeTab === 'aiInsights' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Insights
          </button>
        </nav>
      </div>

      {/* Top Right Controls (GPS Locate, Region Select, Working Live Date Ticker, User Profile) */}
      <div className="flex items-center space-x-2.5 shrink-0 self-end md:self-auto">
        {/* Fetch GPS Location Button */}
        {onFetchUserLocation && (
          <button
            onClick={onFetchUserLocation}
            disabled={isLocating}
            className="flex items-center space-x-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Fetch My Current Location AQI via GPS"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>
        )}

        {/* Country/Region Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedRegion.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {regionDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in max-h-60 overflow-y-auto">
              {INDIA_REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSelectRegion(r);
                    setRegionDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between ${
                    selectedRegion.id === r.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-mono">{r.aqi} AQI</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Working Date & Time Ticker */}
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm hidden sm:flex">
          <LiveDashboardClock format="full" showIcon={true} />
        </div>

        {/* User Profile / Sign In Button */}
        {currentUser ? (
          <button
            onClick={onOpenProfileModal}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer group"
            title="Manage Health Conditions & Email Alerts"
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {(currentUser.email_alerts_enabled || currentUser.sms_alerts_enabled) && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Home Globe Pill */}
        <button
          onClick={onOpenHomepage}
          className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
          title="Back to Homepage 3D Globe"
        >
          <Globe className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
