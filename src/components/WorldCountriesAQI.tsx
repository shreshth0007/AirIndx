import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Wind,
  Thermometer,
  Droplets,
  ExternalLink,
  LayoutGrid,
  ListFilter,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { WORLD_COUNTRIES } from '../data/worldCountriesData';
import { WorldCountryData, CityMarkerData } from '../types/airQuality';
import { getStrictAQIColor } from '../services/airQualityApi';

interface WorldCountriesAQIProps {
  onSelectCountry: (country: CityMarkerData) => void;
}

export const WorldCountriesAQI: React.FC<WorldCountriesAQIProps> = ({ onSelectCountry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'aqiDesc' | 'aqiAsc' | 'name' | 'pop'>('aqiDesc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Continents list
  const continents = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

  // Global aggregate stats
  const totalCountries = WORLD_COUNTRIES.length;
  const globalAvgAqi = Math.round(
    WORLD_COUNTRIES.reduce((acc, c) => acc + c.aqi, 0) / totalCountries
  );
  const cleanestCountry = [...WORLD_COUNTRIES].sort((a, b) => a.aqi - b.aqi)[0];
  const mostPollutedCountry = [...WORLD_COUNTRIES].sort((a, b) => b.aqi - a.aqi)[0];

  // Filtering and Sorting
  const filteredCountries = useMemo(() => {
    return WORLD_COUNTRIES.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.continent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesContinent =
        selectedContinent === 'All' || c.continent === selectedContinent;

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Good' && c.aqi <= 50) ||
        (selectedStatus === 'Moderate' && c.aqi > 50 && c.aqi <= 100) ||
        (selectedStatus === 'Unhealthy' && c.aqi > 100 && c.aqi <= 150) ||
        (selectedStatus === 'Severe' && c.aqi > 150);

      return matchesSearch && matchesContinent && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'aqiDesc') return b.aqi - a.aqi;
      if (sortBy === 'aqiAsc') return a.aqi - b.aqi;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedContinent, selectedStatus, sortBy]);

  const handleCountryClick = (c: WorldCountryData) => {
    const cityMarker: CityMarkerData = {
      id: c.id,
      name: `${c.name} (${c.capital})`,
      country: c.name,
      lat: c.lat,
      lng: c.lng,
      aqi: c.aqi,
      category: c.category,
      pm25: c.pm25,
      pm10: c.pm10,
      temp: c.temp,
      humidity: c.humidity,
      windSpeed: c.windSpeed,
      riskScore: c.riskScore,
      flag: c.flag,
      capital: c.capital,
      continent: c.continent,
    };
    onSelectCountry(cityMarker);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & Global Air Health Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-xs tracking-wider uppercase mb-1">
                <Globe className="w-4 h-4 animate-spin [animation-duration:12s]" />
                <span>Global Atmospheric Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Worldwide Air Quality Index (AQI) Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                Explore real-time air quality metrics, particulate smog concentrations, and forecasts for all countries in the world.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">100% Live Open-Meteo &amp; CPCB Data</span>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Countries Monitored
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {totalCountries} <span className="text-xs font-normal text-cyan-300">Nations</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">All 6 Continents covered</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Global Average AQI
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {globalAvgAqi}
              </div>
              <div className="text-[11px] text-emerald-300 mt-1">Moderate Baseline</div>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/30">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                <span>Cleanest Air Country</span>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-1.5">
                <span>{cleanestCountry.flag}</span>
                <span>{cleanestCountry.name}</span>
              </div>
              <div className="text-[11px] text-emerald-200 mt-1 font-mono font-bold">
                AQI {cleanestCountry.aqi} (Pristine)
              </div>
            </div>

            <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-4 border border-red-400/30">
              <div className="text-[11px] font-bold text-red-300 uppercase tracking-wider flex items-center justify-between">
                <span>Highest Pollution Alert</span>
                <TrendingUp className="w-3.5 h-3.5 text-red-300" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-1.5">
                <span>{mostPollutedCountry.flag}</span>
                <span>{mostPollutedCountry.name}</span>
              </div>
              <div className="text-[11px] text-red-200 mt-1 font-mono font-bold">
                AQI {mostPollutedCountry.aqi} (Severe Smog)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any country, capital city, or ISO code (e.g., Japan, London, Brazil, US, Canada)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Sort Selector & View Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none font-bold text-slate-800 cursor-pointer"
              >
                <option value="aqiDesc">AQI: Highest First (Most Polluted)</option>
                <option value="aqiAsc">AQI: Lowest First (Cleanest)</option>
                <option value="name">Alphabetical (A - Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Rankings Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills: Continents & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Continent Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-slate-400 font-semibold mr-1 shrink-0 text-[11px]">Continent:</span>
            {continents.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-1 rounded-full font-bold text-xs shrink-0 transition-all ${
                  selectedContinent === cont
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>

          {/* AQI Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-slate-400 font-semibold mr-1 shrink-0 text-[11px]">Air Quality:</span>
            {['All', 'Good', 'Moderate', 'Unhealthy', 'Severe'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] shrink-0 border transition-all ${
                  selectedStatus === st
                    ? st === 'Good'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : st === 'Moderate'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : st === 'Severe'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-2">
        <span>
          Showing <strong className="text-slate-900">{filteredCountries.length}</strong> of{' '}
          {totalCountries} countries worldwide
        </span>
        <span>Tap any country to open live sensor logs &amp; charts</span>
      </div>

      {/* VIEW 1: CARDS GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCountries.map((c) => {
            const strict = getStrictAQIColor(c.aqi);

            return (
              <div
                key={c.id}
                onClick={() => handleCountryClick(c)}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
              >
                <div>
                  {/* Card Header: Flag, Name, Code, Continent */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-3xl filter drop-shadow-sm">{c.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-slate-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                            {c.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-bold">
                            {c.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Capital: <strong className="text-slate-600">{c.capital}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {c.continent}
                    </span>
                  </div>

                  {/* AQI Score and Category */}
                  <div className="flex items-center justify-between my-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Air Quality Index
                      </div>
                      <div className="text-2xl font-black mt-0.5" style={{ color: strict.color }}>
                        {c.aqi}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-black shadow-xs inline-block text-white"
                        style={{ backgroundColor: strict.color }}
                      >
                        {c.category}
                      </span>
                      <div className="text-[10px] text-slate-400 font-medium mt-1">
                        Dom: <strong className="text-slate-700">{c.dominantPollutant}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Particulate Matter & Weather Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold text-slate-600 mb-3">
                    <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <span className="text-slate-400 block text-[9px]">PM2.5</span>
                      <strong className="text-slate-800">{c.pm25}</strong> µg
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <span className="text-slate-400 block text-[9px]">PM10</span>
                      <strong className="text-slate-800">{c.pm10}</strong> µg
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                      <span className="text-slate-400 block text-[9px]">Temp</span>
                      <strong className="text-slate-800">{c.temp}°C</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>View Live Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: RANKINGS TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4"># Rank</th>
                  <th className="py-3 px-4">Country &amp; Capital</th>
                  <th className="py-3 px-4">Continent</th>
                  <th className="py-3 px-4">AQI Index</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">PM2.5 (µg/m³)</th>
                  <th className="py-3 px-4">PM10 (µg/m³)</th>
                  <th className="py-3 px-4">Temp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCountries.map((c, idx) => {
                  const strict = getStrictAQIColor(c.aqi);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleCountryClick(c)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-2xl">{c.flag}</span>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{c.capital}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{c.continent}</td>
                      <td className="py-3 px-4">
                        <span
                          className="font-black text-sm px-2.5 py-1 rounded-xl text-white inline-block shadow-xs"
                          style={{ backgroundColor: strict.color }}
                        >
                          {c.aqi}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold" style={{ color: strict.color }}>
                        {c.category}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.pm25}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.pm10}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{c.temp}°C</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCountryClick(c);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ml-auto"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
