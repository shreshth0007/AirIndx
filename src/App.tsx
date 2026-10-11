import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Globe3D } from './components/Globe3D';
import { AQICardGrid } from './components/AQICard';
import { IndiaMap } from './components/IndiaMap';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { PollutionCharts } from './components/PollutionCharts';
import { SearchLocationModal } from './components/SearchLocationModal';
import { CommunityReportsModal } from './components/CommunityReportsModal';
import { SidebarNav } from './components/SidebarNav';
import { LiveDashboardClock } from './components/LiveDashboardClock';
import { BrandLogo } from './components/BrandLogo';

// Track 01 Specialized Air Modules
import { ExposureRiskCard } from './components/ExposureRiskCard';
import { StubbleBurningTracker } from './components/StubbleBurningTracker';
import { SchoolSafetyModule } from './components/SchoolSafetyModule';
import { IndoorAirQualityCard } from './components/IndoorAirQualityCard';
import { WorldCountriesAQI } from './components/WorldCountriesAQI';
import { AlertMarquee } from './components/AlertMarquee';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SevenDayForecastView } from './components/SevenDayForecastView';
import { BroadcastAlertModal } from './components/BroadcastAlertModal';
import { EmailGatewayModal } from './components/EmailGatewayModal';

import { GLOBAL_CITIES, INDIA_REGIONS } from './data/cityCoordinates';
import { fetchLiveAirQuality, fetchUserCurrentLocation } from './services/airQualityApi';
import { generateAIEnvironmentalInsights, askAIAssistant } from './services/geminiService';
import { CityMarkerData, RegionData, MapStationData, AirQualityMetrics, HistoricalDataPoint, ForecastDataPoint, AIInsightData, UserProfile } from './types/airQuality';
import { Sparkles, Facebook, Twitter, MessageCircle } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'homepage' | 'dashboard'>('dashboard');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected Location State - Default to All India (lat: 22.8, lng: 80.2)
  const [selectedCity, setSelectedCity] = useState<CityMarkerData>({
    id: 'india-national',
    name: 'India Overview',
    country: 'India',
    lat: 22.8000,
    lng: 80.2000,
    aqi: 87,
    category: 'Moderate',
    pm25: 32.4,
    pm10: 68.0,
    temp: 28,
    humidity: 58,
    windSpeed: 11.4,
    riskScore: 35,
  });
  const [selectedRegion, setSelectedRegion] = useState<RegionData>(INDIA_REGIONS[0]);

  // Live Data State
  const [metrics, setMetrics] = useState<AirQualityMetrics | null>(null);
  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [forecast, setForecast] = useState<ForecastDataPoint[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsightData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Modals & User Profile State
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [communityModalOpen, setCommunityModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('airindx_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState<boolean>(false);
  const [emailGatewayModalOpen, setEmailGatewayModalOpen] = useState<boolean>(false);

  // Load air quality metrics when selected city changes
  const loadData = useCallback(async (city: CityMarkerData) => {
    setIsLoading(true);
    try {
      const res = await fetchLiveAirQuality(city.lat, city.lng, city.name, city.country);
      setMetrics(res.metrics);
      setHistory(res.history);
      setForecast(res.forecast);

      // Generate AI Insights (Layman mode)
      setIsAiLoading(true);
      const insights = await generateAIEnvironmentalInsights(res.metrics);
      setAiInsights(insights);
    } catch (err) {
      console.error('Error loading air quality data:', err);
    } finally {
      setIsLoading(false);
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedCity);
  }, [selectedCity, loadData]);

  // Handle Fetch User GPS Location (Requirement 2 - Real GPS, no hardcoded Delhi)
  const handleFetchUserLocation = async () => {
    setIsLocating(true);
    try {
      const userLoc = await fetchUserCurrentLocation();
      const liveRes = await fetchLiveAirQuality(userLoc.lat, userLoc.lng, userLoc.locationName, userLoc.country);

      const newCity: CityMarkerData = {
        id: `gps-${Date.now()}`,
        name: userLoc.locationName,
        country: userLoc.country,
        lat: userLoc.lat,
        lng: userLoc.lng,
        aqi: liveRes.metrics.aqi,
        category: liveRes.metrics.category,
        pm25: liveRes.metrics.pm25,
        pm10: liveRes.metrics.pm10,
        temp: liveRes.metrics.temperature,
        humidity: liveRes.metrics.humidity,
        windSpeed: liveRes.metrics.windSpeed,
        riskScore: liveRes.metrics.pollutionRiskScore,
      };

      setSelectedCity(newCity);
      setSelectedRegion({
        id: `gps-region-${Date.now()}`,
        name: `📍 ${userLoc.locationName}`,
        lat: userLoc.lat,
        lng: userLoc.lng,
        aqi: liveRes.metrics.aqi,
        category: liveRes.metrics.category,
      });

      setMetrics(liveRes.metrics);
      setHistory(liveRes.history);
      setForecast(liveRes.forecast);
    } catch (err: any) {
      alert(err.message || 'Unable to retrieve location. Please check browser location permissions or search your city above.');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle region select in dashboard
  const handleSelectRegion = (region: RegionData) => {
    setSelectedRegion(region);
    const matchingCity = GLOBAL_CITIES.find(
      (c) => c.name.toLowerCase().includes(region.name.toLowerCase()) || region.name.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchingCity) {
      setSelectedCity(matchingCity);
    } else {
      const isCountry = region.id.startsWith('country-');
      const cleanName = region.name.replace(/^[^\w\s]+/, '').trim();
      setSelectedCity({
        id: `region-${region.id}`,
        name: cleanName,
        country: isCountry ? cleanName : 'India',
        lat: region.lat,
        lng: region.lng,
        aqi: region.aqi,
        category: region.category,
        pm25: Math.round(region.aqi * 0.45),
        pm10: Math.round(region.aqi * 0.9),
        temp: 25,
        humidity: 55,
        windSpeed: 10,
        riskScore: Math.min(100, Math.round((region.aqi / 300) * 100)),
      });
    }
  };

  // Handle station select from IndiaMap / GoogleMapReal
  const handleSelectStation = (station: MapStationData) => {
    const isCountry = station.id.startsWith('country-');
    const cleanName = station.name.replace(/^[^\w\s]+/, '').trim();
    const newCity: CityMarkerData = {
      id: station.id,
      name: cleanName,
      country: isCountry ? cleanName : 'India',
      lat: station.lat,
      lng: station.lng,
      aqi: station.aqi || 80,
      category: (station.category as any) || 'Moderate',
      pm25: station.pm25 || 25,
      pm10: station.pm10 || 50,
      temp: station.temp || 24,
      humidity: station.humidity || 55,
      windSpeed: station.windSpeed || 10,
      riskScore: Math.min(100, Math.round(((station.aqi || 80) / 300) * 100)),
    };

    setSelectedCity(newCity);
    setSelectedRegion({
      id: station.id,
      name: isCountry ? station.name : `${station.name}, ${station.state}`,
      lat: station.lat,
      lng: station.lng,
      aqi: station.aqi || 80,
      category: (station.category as any) || 'Moderate',
    });
  };

  // Handle select country from World Countries AQI Directory
  const handleSelectCountry = (countryCity: CityMarkerData) => {
    setSelectedCity(countryCity);
    setSelectedRegion({
      id: countryCity.id,
      name: countryCity.flag ? `${countryCity.flag} ${countryCity.country}` : countryCity.name,
      lat: countryCity.lat,
      lng: countryCity.lng,
      aqi: countryCity.aqi,
      category: countryCity.category,
    });
    setActiveTab('overview');
  };

  // Handle Ask AI
  const handleAskAI = async (question: string): Promise<string> => {
    if (!metrics) return 'Data loading, please try again shortly.';
    return await askAIAssistant(question, metrics);
  };

  // Refresh AI Analysis
  const handleRefreshAI = async () => {
    if (!metrics) return;
    setIsAiLoading(true);
    const updated = await generateAIEnvironmentalInsights(metrics);
    setAiInsights(updated);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Search Location Modal */}
      <SearchLocationModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectCity={(city) => {
          setSelectedCity(city);
          const matchRegion = INDIA_REGIONS.find(r => r.name.toLowerCase() === city.name.toLowerCase());
          if (matchRegion) setSelectedRegion(matchRegion);
        }}
      />

      {/* Crowdsourced Community Reports Modal */}
      <CommunityReportsModal
        isOpen={communityModalOpen}
        onClose={() => setCommunityModalOpen(false)}
      />

      {/* MAIN VIEW CONTENT SWITCH */}
      {viewMode === 'homepage' ? (
        /* HOMEPAGE VIEW: 3D Earth Globe Landing Page */
        <div className="bg-[#050811] text-slate-100 min-h-screen flex flex-col">
          <Navbar
            viewMode="homepage"
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setViewMode('dashboard');
            }}
            onOpenDashboard={() => setViewMode('dashboard')}
            onOpenHomepage={() => setViewMode('homepage')}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            onOpenCommunityReports={() => setCommunityModalOpen(true)}
            onFetchUserLocation={handleFetchUserLocation}
            isLocating={isLocating}
          />

          <main className="flex-1 flex flex-col justify-between px-4 sm:px-8 py-6 max-w-[1440px] mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
              {/* LEFT HERO STATS COLUMN */}
              <div className="lg:col-span-4 xl:col-span-4 space-y-5 z-20">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <span>Air Quality</span>
                    <span className="px-3.5 py-1 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-3xl font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                      Index
                    </span>
                  </h1>

                  {/* Live Date & Time matching Reference Image */}
                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium mt-3">
                    <LiveDashboardClock format="reference" showIcon={true} />
                    <div className="flex items-center space-x-1 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                      <span>Location</span>
                      <span className="text-emerald-400 font-bold">&rarr;</span>
                      <span className="text-base">🇮🇳</span>
                      <span className="font-bold">{metrics?.locationName || 'India'}</span>
                    </div>
                  </div>
                </div>

                {/* Card 1: Main Statistics */}
                <div className="glass-card rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                  <div className="text-sm font-semibold text-slate-400 mb-2">Main Statistics</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AQI</div>
                  
                  <div className="text-5xl sm:text-6xl font-black text-white tracking-tight my-2">
                    {metrics?.aqi || 87}
                  </div>

                  <div className="text-xs text-slate-400 font-medium mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span>Dominant Pollutant <strong className="text-slate-200">{metrics?.dominantPollutant || 'PM2.5'}</strong></span>
                    <span>Wind <strong className="text-slate-200">{metrics?.windSpeed || 11.4} km/h</strong></span>
                  </div>
                </div>

                {/* Card 2: Risk of Pollution */}
                <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-900/80 via-indigo-950/90 to-slate-900 border border-blue-500/30 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-200">Risk of Pollution</span>
                    <button
                      onClick={() => setViewMode('dashboard')}
                      className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all hover:scale-105"
                    >
                      Details
                    </button>
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">Risk</div>
                  <div className="text-5xl sm:text-6xl font-black text-white tracking-tight my-1">
                    {metrics?.pollutionRiskScore || 35}%
                  </div>

                  <div className="text-xs text-slate-300 font-medium mt-2">
                    {metrics?.pollutionRiskSummary || 'Moderate risk due to weather conditions'}
                  </div>
                </div>

                {/* Share Bar */}
                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-xs font-semibold text-slate-400">Share</span>
                  <div className="flex items-center space-x-2">
                    <button className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all">
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all">
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Realistic 3D Globe */}
              <div className="lg:col-span-8 xl:col-span-8 w-full h-[650px] lg:h-[720px] relative">
                <Globe3D
                  cities={GLOBAL_CITIES}
                  selectedCity={selectedCity}
                  onSelectCity={(city) => setSelectedCity(city)}
                  onOpenDashboard={() => setViewMode('dashboard')}
                />
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* DASHBOARD VIEW */
        <div className="flex min-h-screen">
          <SidebarNav
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            onOpenHomepage={() => setViewMode('homepage')}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Navbar
              viewMode="dashboard"
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              onOpenDashboard={() => setViewMode('dashboard')}
              onOpenHomepage={() => setViewMode('homepage')}
              selectedRegion={selectedRegion}
              onSelectRegion={handleSelectRegion}
              onOpenCommunityReports={() => setCommunityModalOpen(true)}
              onFetchUserLocation={handleFetchUserLocation}
              isLocating={isLocating}
              currentUser={currentUser}
              onOpenAuthModal={() => setAuthModalOpen(true)}
              onOpenProfileModal={() => setProfileModalOpen(true)}
            />

            {/* DASHBOARD ALERT MARQUEE (Requirement 5) */}
            <AlertMarquee
              currentUser={currentUser}
              onOpenProfile={() => setProfileModalOpen(true)}
              onOpenBroadcastModal={() => setBroadcastModalOpen(true)}
              onOpenSmsGatewayModal={() => setEmailGatewayModalOpen(true)}
            />

            <main className="p-4 sm:p-8 space-y-6 flex-1 max-w-[1400px] w-full mx-auto">
              {metrics && <AQICardGrid metrics={metrics} />}

              {/* TAB 0: WORLDWIDE COUNTRIES AQI DIRECTORY */}
              {activeTab === 'worldAQI' && (
                <WorldCountriesAQI onSelectCountry={handleSelectCountry} />
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7 xl:col-span-8 min-h-[500px]">
                      <IndiaMap
                        selectedRegion={selectedRegion}
                        onSelectRegion={handleSelectRegion}
                        onSelectStation={handleSelectStation}
                        onSearchQuery={() => setSearchModalOpen(true)}
                      />
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4 min-h-[500px]">
                      {aiInsights && metrics ? (
                        <AIInsightsPanel
                          insights={aiInsights}
                          metrics={metrics}
                          onRefresh={handleRefreshAI}
                          onAskAI={handleAskAI}
                          isLoading={isAiLoading}
                        />
                      ) : (
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full text-center">
                          <Sparkles className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                          <p className="text-xs text-slate-500 font-medium">Generating Layman AI Analysis...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {metrics && <PollutionCharts history={history} forecast={forecast} metrics={metrics} />}
                </div>
              )}

              {/* TAB 2: POLLUTION MAP (Full-sized interactive map) */}
              {activeTab === 'pollutionMap' && (
                <div className="space-y-6">
                  <div className="w-full min-h-[560px] h-[640px]">
                    <IndiaMap
                      selectedRegion={selectedRegion}
                      onSelectRegion={handleSelectRegion}
                      onSelectStation={handleSelectStation}
                      onSearchQuery={() => setSearchModalOpen(true)}
                    />
                  </div>
                  {metrics && <PollutionCharts history={history} forecast={forecast} metrics={metrics} />}
                </div>
              )}

              {/* TAB 3: AIR QUALITY & RISK */}
              {activeTab === 'airQuality' && metrics && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <ExposureRiskCard metrics={metrics} />
                  </div>
                  <div className="lg:col-span-6">
                    <PollutionCharts history={history} forecast={forecast} metrics={metrics} />
                  </div>
                </div>
              )}

              {/* TAB 4: 7-DAY VERIFIED FORECASTS (Requirement 2) */}
              {activeTab === 'forecasts' && (
                <div className="space-y-6">
                  <SevenDayForecastView selectedRegion={selectedRegion} />
                  {metrics && <PollutionCharts history={history} forecast={forecast} metrics={metrics} />}
                </div>
              )}

              {/* TAB 5: AI INSIGHTS */}
              {activeTab === 'aiInsights' && metrics && aiInsights && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6">
                    <AIInsightsPanel
                      insights={aiInsights}
                      metrics={metrics}
                      onRefresh={handleRefreshAI}
                      onAskAI={handleAskAI}
                      isLoading={isAiLoading}
                    />
                  </div>
                  <div className="lg:col-span-6">
                    <ExposureRiskCard metrics={metrics} />
                  </div>
                </div>
              )}

              {/* SPECIALIZED MODULES */}
              {activeTab === 'stubbleTrack' && (
                <div className="w-full">
                  <StubbleBurningTracker />
                </div>
              )}

              {activeTab === 'schoolSafety' && (
                <div className="w-full">
                  <SchoolSafetyModule />
                </div>
              )}

              {activeTab === 'indoorAir' && metrics && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <IndoorAirQualityCard outdoorMetrics={metrics} />
                  </div>
                  <div className="lg:col-span-5">
                    <ExposureRiskCard metrics={metrics} />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Modern Footer with Professional Logo */}
      <footer className="w-full py-4 px-6 sm:px-12 bg-white border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center space-x-3">
          <BrandLogo size="sm" variant="light" onClick={() => setViewMode('homepage')} />
          <span className="text-slate-400">•</span>
          <span>© {new Date().getFullYear()} AirIndx Environmental Intelligence</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-500 font-semibold">
          <button onClick={() => setViewMode('homepage')} className="hover:text-blue-600 transition-colors">
            3D Globe
          </button>
          <button onClick={() => { setViewMode('dashboard'); setActiveTab('overview'); }} className="hover:text-blue-600 transition-colors">
            Dashboard
          </button>
          <button onClick={() => { setViewMode('dashboard'); setActiveTab('pollutionMap'); }} className="hover:text-blue-600 transition-colors">
            Interactive Map
          </button>
          <button onClick={() => setCommunityModalOpen(true)} className="hover:text-blue-600 transition-colors">
            Incidents Feed
          </button>
        </div>
      </footer>

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
        }}
        onOpenSmsGatewayModal={() => {
          setAuthModalOpen(false);
          setEmailGatewayModalOpen(true);
        }}
      />

      {/* User Profile & Health Sensitivities Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={(u) => setCurrentUser(u)}
          onOpenBroadcastModal={() => {
            setProfileModalOpen(false);
            setBroadcastModalOpen(true);
          }}
          onOpenSmsGatewayModal={() => {
            setProfileModalOpen(false);
            setEmailGatewayModalOpen(true);
          }}
          onLogout={() => {
            localStorage.removeItem('airindx_auth_token');
            localStorage.removeItem('airindx_user_profile');
            setCurrentUser(null);
            setProfileModalOpen(false);
          }}
        />
      )}

      {/* Real-Time Live Emergency Alert Broadcast Modal */}
      <BroadcastAlertModal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onOpenEmailSettings={() => {
          setBroadcastModalOpen(false);
          setEmailGatewayModalOpen(true);
        }}
      />

      {/* Real Gmail SMTP Email Gateway Settings Modal */}
      <EmailGatewayModal
        isOpen={emailGatewayModalOpen}
        onClose={() => setEmailGatewayModalOpen(false)}
      />
    </div>
  );
}
