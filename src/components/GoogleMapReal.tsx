import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Plus,
  Minus,
  MapPin,
  Navigation,
  RefreshCw,
  RotateCcw,
  Layers,
  AlertTriangle,
  X,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { RegionData, MapStationData, UserLocationResult } from '../types/airQuality';
import {
  INDIA_STATES_UTS,
  INDIA_MAJOR_CITIES,
  INDIA_LOCAL_STATIONS,
  ALL_INDIA_MAP_STATIONS,
} from '../data/indiaStationsData';
import { WORLD_COUNTRY_STATIONS } from '../data/worldCountriesData';
import {
  fetchBatchStationsAQI,
  getStrictAQIColor,
  fetchUserCurrentLocation,
  fetchLiveAirQuality,
} from '../services/airQualityApi';

interface GoogleMapRealProps {
  selectedRegion: RegionData;
  onSelectRegion: (region: RegionData) => void;
  onSelectStation?: (station: MapStationData) => void;
  onSearchQuery?: (query: string) => void;
}

export const GoogleMapReal: React.FC<GoogleMapRealProps> = ({
  selectedRegion,
  onSelectRegion,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  // Map state
  const [currentZoom, setCurrentZoom] = useState<number>(3);
  const [mapScope, setMapScope] = useState<'world' | 'india'>('world');
  const [mapMode, setMapMode] = useState<'satellite' | 'hybrid' | 'dark'>('satellite'); // Default to Satellite View (Requirement 5)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapStationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocationResult | null>(null);
  const [isUpdatingData, setIsUpdatingData] = useState(false);

  // Live stations data with real-time AQI readings
  const [liveStations, setLiveStations] = useState<Map<string, MapStationData>>(new Map());

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default view: Global Panoramic View for Worldwide Countries
    const map = L.map(mapContainerRef.current, {
      center: [20.0, 10.0],
      zoom: 2.5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 18,
    });

    mapInstanceRef.current = map;

    // Layer Groups
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const userGroup = L.layerGroup().addTo(map);
    userLocationLayerRef.current = userGroup;

    // Set Tile Layer
    updateTileLayer(map, mapMode);

    // Zoom listener for zoom-level multi-tier rendering (Requirement 1 & 4)
    map.on('zoomend', () => {
      const z = map.getZoom();
      setCurrentZoom(z);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile Layer Update Handler
  const updateTileLayer = (map: L.Map, mode: 'satellite' | 'hybrid' | 'dark') => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; // Pure Satellite
    if (mode === 'hybrid') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Satellite + Labels Hybrid
    } else if (mode === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; // Dark Mode
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains: ['a', 'b', 'c', 'd'],
    }).addTo(map);

    tileLayerRef.current = newLayer;
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, mapMode);
    }
  }, [mapMode]);

  // 3. Batch Fetch Real-time AQI for stations
  const loadStationAQI = useCallback(async (stationsToFetch: MapStationData[]) => {
    if (stationsToFetch.length === 0) return;
    setIsUpdatingData(true);

    try {
      const updated = await fetchBatchStationsAQI(stationsToFetch);
      setLiveStations((prev) => {
        const next = new Map(prev);
        updated.forEach((st) => next.set(st.id, st));
        return next;
      });
    } catch (err) {
      console.warn('Live station AQI batch update note:', err);
    } finally {
      setIsUpdatingData(false);
    }
  }, []);

  // Fetch initial AQI for all world countries and Indian states on mount
  useEffect(() => {
    loadStationAQI([...WORLD_COUNTRY_STATIONS, ...INDIA_STATES_UTS]);
  }, [loadStationAQI]);

  // When zooming in, fetch cities or localities
  useEffect(() => {
    if (currentZoom >= 7 && currentZoom < 10) {
      loadStationAQI(INDIA_MAJOR_CITIES);
    } else if (currentZoom >= 10) {
      loadStationAQI(INDIA_LOCAL_STATIONS);
    }
  }, [currentZoom, loadStationAQI]);

  // 4. Render Circular AQI Markers (Worldwide & Regional)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // Determine which stations to show based on zoom level and scope
    let visibleStations: MapStationData[] = [];

    if (mapScope === 'world') {
      // Worldwide view: Render all countries across all 6 continents
      if (currentZoom < 6) {
        visibleStations = WORLD_COUNTRY_STATIONS;
      } else if (currentZoom < 9) {
        visibleStations = [...WORLD_COUNTRY_STATIONS, ...INDIA_STATES_UTS];
      } else {
        visibleStations = [...WORLD_COUNTRY_STATIONS, ...INDIA_MAJOR_CITIES, ...INDIA_LOCAL_STATIONS];
      }
    } else {
      // India focused view
      if (currentZoom < 7) {
        visibleStations = INDIA_STATES_UTS;
      } else if (currentZoom < 10) {
        visibleStations = INDIA_MAJOR_CITIES;
      } else {
        visibleStations = [...INDIA_LOCAL_STATIONS, ...INDIA_MAJOR_CITIES];
      }
    }

    // Determine marker size based on zoom level
    const markerSize = currentZoom < 7 ? 36 : currentZoom < 10 ? 40 : 44;
    const fontSize = currentZoom < 7 ? 11 : 12;

    visibleStations.forEach((station) => {
      const live = liveStations.get(station.id) || station;
      const aqi = live.aqi;
      const strict = getStrictAQIColor(aqi);

      // Color rules (Requirement 3):
      // Red: aqi > 150
      // Yellow: 51 <= aqi <= 150
      // Green: aqi <= 50
      // Gray: aqi == null
      let badgeStyle = 'background: rgba(16, 185, 129, 0.95); border: 2px solid #FFFFFF; color: #FFFFFF; box-shadow: 0 0 14px rgba(16, 185, 129, 0.7);';
      if (aqi === null || aqi === undefined) {
        badgeStyle = 'background: rgba(100, 116, 139, 0.95); border: 2px solid #E2E8F0; color: #F8FAFC; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);';
      } else if (aqi > 150) {
        badgeStyle = 'background: rgba(239, 68, 68, 0.95); border: 2px solid #FFFFFF; color: #FFFFFF; box-shadow: 0 0 15px rgba(239, 68, 68, 0.75);';
      } else if (aqi >= 51) {
        badgeStyle = 'background: rgba(245, 158, 11, 0.98); border: 2px solid #FFFFFF; color: #0F172A; box-shadow: 0 0 15px rgba(245, 158, 11, 0.75);';
      }

      const displayText = aqi !== null && aqi !== undefined ? `${aqi}` : 'N/A';
      const isCountry = station.id.startsWith('country-');

      // Circular AQI DivIcon matching Reference Image 1
      const icon = L.divIcon({
        className: 'aqi-circular-station-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: ${fontSize}px;
              font-family: inherit;
              user-select: none;
              cursor: pointer;
              transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
              ${badgeStyle}
            "
            title="${station.name}: ${displayText} AQI (${strict.statusText})"
            >
              <span>${displayText}</span>
            </div>
            ${isCountry ? `
              <div style="
                font-size: 10px;
                font-weight: 800;
                color: #FFFFFF;
                text-shadow: 0 1px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.85);
                margin-top: 2px;
                white-space: nowrap;
                pointer-events: none;
                letter-spacing: -0.2px;
              ">${station.name}</div>
            ` : ''}
          </div>
        `,
        iconSize: [markerSize, markerSize + (isCountry ? 16 : 0)],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      // Crucial: Instantiate the Leaflet Marker
      const marker = L.marker([station.lat, station.lng], { icon });

      const stationTypeLabel = isCountry
        ? 'Global Country'
        : station.type === 'state'
        ? 'State / UT'
        : station.type === 'city'
        ? 'City Center'
        : 'CAAQM Station';

      // Informative Popup (Requirement 4)
      const popupContent = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94A3B8;">${stationTypeLabel}</div>
              <div style="font-size: 14px; font-weight: 900; color: #0F172A;">${station.name}</div>
              <div style="font-size: 11px; color: #64748B;">${station.state}</div>
            </div>
            <div style="
              padding: 4px 10px;
              border-radius: 9999px;
              font-weight: 900;
              font-size: 12px;
              ${badgeStyle}
            ">
              ${displayText} AQI
            </div>
          </div>

          <div style="font-size: 11px; font-weight: 800; color: ${strict.color}; margin-bottom: 8px;">
            ${strict.statusText}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: #F8FAFC; padding: 8px; border-radius: 10px; border: 1px solid #F1F5F9;">
            <div>PM2.5: <strong style="color: #0F172A;">${live.pm25 != null ? live.pm25 + ' µg/m³' : '—'}</strong></div>
            <div>PM10: <strong style="color: #0F172A;">${live.pm10 != null ? live.pm10 + ' µg/m³' : '—'}</strong></div>
            <div>Temp: <strong style="color: #0F172A;">${live.temp != null ? live.temp + '°C' : '—'}</strong></div>
            <div>Humidity: <strong style="color: #0F172A;">${live.humidity != null ? live.humidity + '%' : '—'}</strong></div>
          </div>

          <div style="font-size: 10px; color: #94A3B8; text-align: right; margin-top: 6px;">
            Last Updated: ${live.lastUpdated || 'Live API'}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'aqi-custom-clean-popup',
        maxWidth: 280,
      });

      // Marker Click Handler (Requirement 5)
      marker.on('click', () => {
        if (isCountry) {
          // World country clicked - pan and load data
          mapInstanceRef.current?.flyTo([station.lat, station.lng], 6, { duration: 1.2 });
          onSelectRegion({
            id: station.id,
            name: station.name,
            lat: station.lat,
            lng: station.lng,
            aqi: aqi || 80,
            category: (strict.category === 'Data Unavailable' ? 'Moderate' : strict.category) as any,
          });
          if (onSelectStation) onSelectStation(live);
        } else if (station.type === 'state') {
          // Zoom into state and reveal city markers
          mapInstanceRef.current?.flyTo([station.lat, station.lng], 8, { duration: 1.2 });
          onSelectRegion({
            id: station.id,
            name: station.name,
            lat: station.lat,
            lng: station.lng,
            aqi: aqi || 80,
            category: (strict.category === 'Data Unavailable' ? 'Moderate' : strict.category) as any,
          });
        } else if (station.type === 'city') {
          // Zoom into city and reveal local stations
          mapInstanceRef.current?.flyTo([station.lat, station.lng], 11, { duration: 1.2 });
          if (onSelectStation) onSelectStation(live);
        } else {
          // Locality clicked
          if (onSelectStation) onSelectStation(live);
        }
      });

      marker.addTo(layer);
    });
  }, [currentZoom, mapScope, liveStations, onSelectRegion, onSelectStation]);

  // 5. Draw User Location Dot with Circular Accuracy Indicator (Requirement 2)
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocationLayerRef.current) return;
    const userLayer = userLocationLayerRef.current;
    userLayer.clearLayers();

    if (!userLocation) return;

    const { lat, lng, accuracy, locationName } = userLocation;

    // A. Circular Accuracy Indicator (Requirement 2)
    const accuracyRadius = Math.max(accuracy, 120);
    const accuracyCircle = L.circle([lat, lng], {
      radius: accuracyRadius,
      color: '#3B82F6',
      fillColor: '#60A5FA',
      fillOpacity: 0.18,
      weight: 1.5,
      dashArray: '4, 4',
    });
    accuracyCircle.addTo(userLayer);

    // B. Distinct Blue Current-Location Pulsing Dot (Requirement 2)
    const userIcon = L.divIcon({
      className: 'user-current-gps-pin',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 28px;
            height: 28px;
            background: rgba(59, 130, 246, 0.45);
            border-radius: 50%;
            animation: pulse-ring 2s infinite ease-out;
          "></div>
          <div style="
            width: 14px;
            height: 14px;
            background: #2563EB;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px #3B82F6;
            z-index: 10;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 2000 });
    userMarker.bindPopup(`
      <div style="padding: 6px; font-family: inherit;">
        <div style="font-size: 11px; font-weight: 900; color: #2563EB; display: flex; align-items: center; gap: 4px;">
          <span>📍</span> <span>Your Actual Location</span>
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-top: 2px;">${locationName}</div>
        <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Accuracy: ±${Math.round(accuracy)} meters</div>
      </div>
    `);

    userMarker.addTo(userLayer);
  }, [userLocation]);

  // Synchronize map center when selectedRegion changes (Countries, States, Cities)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRegion) return;
    const isIndiaDefault = Math.abs(selectedRegion.lat - 22.8) < 0.1 && Math.abs(selectedRegion.lng - 80.2) < 0.1;
    if (isIndiaDefault && mapScope === 'world') {
      return; // Preserve world panoramic view
    }
    const isCountry = selectedRegion.id.startsWith('country-');
    const targetZoom = isIndiaDefault ? 5 : isCountry ? 4.5 : 7;
    mapInstanceRef.current.flyTo([selectedRegion.lat, selectedRegion.lng], targetZoom, {
      duration: 1.4,
    });
  }, [selectedRegion, mapScope]);

  // 6. Handle "Locate Me" Button Action (Requirement 2 - Never silently fall back to Delhi)
  const handleLocateMe = async () => {
    setIsLocating(true);
    setGeoError(null);

    try {
      // Fetch browser GPS coordinates
      const loc = await fetchUserCurrentLocation();
      setUserLocation(loc);

      // Center map on user's exact coordinates and zoom to neighborhood (Requirement 2)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.5 });
      }

      // Fetch live AQI near user's coordinates
      const liveRes = await fetchLiveAirQuality(loc.lat, loc.lng, loc.locationName, loc.country);

      const userRegion: RegionData = {
        id: `user-gps-${Date.now()}`,
        name: `📍 ${loc.locationName}`,
        lat: loc.lat,
        lng: loc.lng,
        aqi: liveRes.metrics.aqi,
        category: liveRes.metrics.category,
      };

      onSelectRegion(userRegion);

      if (onSelectStation) {
        onSelectStation({
          id: `gps-station-${Date.now()}`,
          name: loc.locationName,
          state: loc.state,
          type: 'locality',
          lat: loc.lat,
          lng: loc.lng,
          aqi: liveRes.metrics.aqi,
          category: liveRes.metrics.category,
          pm25: liveRes.metrics.pm25,
          pm10: liveRes.metrics.pm10,
          temp: liveRes.metrics.temperature,
          humidity: liveRes.metrics.humidity,
          lastUpdated: 'Live GPS',
        });
      }
    } catch (err: any) {
      console.warn('Geolocation error note:', err);
      // Requirement 2: Show clear message, do NOT silently fall back to Delhi!
      setGeoError(
        err.message || 'Unable to retrieve location. Please check browser location permissions or search your city above.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  // 7. Reset Map to Current Scope View
  const handleResetMap = () => {
    if (!mapInstanceRef.current) return;
    if (mapScope === 'world') {
      mapInstanceRef.current.flyTo([20.0, 0.0], 2.5, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([22.8, 80.2], 5, { duration: 1.2 });
      onSelectRegion({
        id: 'all',
        name: 'All India',
        lat: 22.8,
        lng: 80.2,
        aqi: 87,
        category: 'Moderate',
      });
    }
  };

  // 8. Search Filter Logic (Searches Worldwide Countries + Indian Stations)
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const query = val.toLowerCase().trim();
    const allSearchable = [...WORLD_COUNTRY_STATIONS, ...ALL_INDIA_MAP_STATIONS];
    const matches = allSearchable
      .filter((s) => s.name.toLowerCase().includes(query) || s.state.toLowerCase().includes(query))
      .slice(0, 10);

    setSearchResults(matches);
  };

  const handleSelectSearchResult = (station: MapStationData) => {
    setSearchQuery(station.name);
    setSearchResults([]);

    const zoomToUse = station.id.startsWith('country-') ? 6 : station.type === 'state' ? 8 : station.type === 'city' ? 11 : 13;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([station.lat, station.lng], zoomToUse, { duration: 1.5 });
    }

    onSelectRegion({
      id: station.id,
      name: station.name,
      lat: station.lat,
      lng: station.lng,
      aqi: station.aqi || 80,
      category: 'Moderate',
    });

    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  const handleManualSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const name = place.display_name.split(',')[0];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 8, { duration: 1.5 });
        }

        const liveRes = await fetchLiveAirQuality(lat, lng, name, 'Global');
        onSelectRegion({
          id: `search-${Date.now()}`,
          name: liveRes.metrics.locationName,
          lat,
          lng,
          aqi: liveRes.metrics.aqi,
          category: liveRes.metrics.category,
        });
      } else {
        setGeoError(`No locations found for "${searchQuery}". Please check spelling.`);
      }
    } catch {
      setGeoError('Search error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative flex flex-col h-full overflow-hidden select-none">
      {/* Header Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-base tracking-tight">Interactive Global &amp; Regional AQI Map</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                {mapScope === 'world' ? 'Worldwide Countries Live' : 'All 36 States & UTs Live'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Zoom and pan to explore AQI markers for countries worldwide or regional stations
            </p>
          </div>
        </div>

        {/* Action Controls: Scope Toggle, Locate Me, Reset, Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle: World Map vs India View */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                setMapScope('world');
                mapInstanceRef.current?.flyTo([20.0, 0.0], 2.5, { duration: 1.2 });
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                mapScope === 'world'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌍 World</span>
            </button>
            <button
              onClick={() => {
                setMapScope('india');
                mapInstanceRef.current?.flyTo([22.8, 80.2], 5, { duration: 1.2 });
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                mapScope === 'india'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇮🇳 India</span>
            </button>
          </div>

          {/* Locate Me GPS Button (Requirement 2) */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Locate my actual GPS coordinates via browser geolocation"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Reset Map View */}
          <button
            onClick={handleResetMap}
            className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all border border-slate-200 active:scale-95 cursor-pointer"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset</span>
          </button>

          {/* Search Box with Autocomplete (Requirement 5) */}
          <div className="relative flex-1 sm:w-56">
            <form onSubmit={handleManualSearchSubmit}>
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search country, capital, city..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              {isSearching && (
                <RefreshCw className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 max-h-56 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-medium">({item.state})</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Layer Mode Switcher (Satellite default - Requirement 5) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapMode === 'satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode('hybrid')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapMode === 'hybrid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapMode('dark')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mapMode === 'dark' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Error Alert Banner (Requirement 2 - No silent fallback to Delhi) */}
      {geoError && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 animate-fade-in z-20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{geoError}</span>
          </div>
          <button
            onClick={() => setGeoError(null)}
            className="p-1 hover:bg-amber-100 rounded-lg text-amber-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Map Leaflet Container */}
      <div className="relative flex-1 min-h-[420px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-inner z-10">
        <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

        {/* Zoom Level Context Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full z-30 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>
            {mapScope === 'world'
              ? currentZoom < 6
                ? 'Level: Worldwide Countries (All Continents)'
                : currentZoom < 9
                ? 'Level: Countries & Regional Hubs'
                : 'Level: Cities & Monitoring Stations'
              : currentZoom < 7
              ? 'Level: All India (36 States & UTs)'
              : currentZoom < 10
              ? 'Level: Major Cities'
              : 'Level: Localities & Stations'}
          </span>
          {isUpdatingData && (
            <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin ml-1" />
          )}
        </div>

        {/* PERMANENT AQI INTENSITY COLOR LEGEND (Requirement 3 & 4) */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/90 px-3.5 py-2.5 rounded-2xl z-30 text-white text-[11px] shadow-2xl space-y-1.5 select-none">
          <div className="font-black text-slate-300 text-[10px] uppercase tracking-wider mb-1">
            AQI Marker Legend
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            <span className="font-bold text-red-300">Red:</span>
            <span className="text-slate-300">High / Unhealthy (&gt; 150)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="font-bold text-amber-300">Yellow:</span>
            <span className="text-slate-300">Moderate (51 – 150)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="font-bold text-emerald-300">Green:</span>
            <span className="text-slate-300">Normal / Good (0 – 50)</span>
          </div>
          <div className="flex items-center space-x-2 pt-0.5 border-t border-slate-800">
            <span className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="font-bold text-slate-400">Gray:</span>
            <span className="text-slate-400 text-[10px]">Data Unavailable</span>
          </div>
        </div>

        {/* Map Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-1.5 z-30">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8.5 h-8.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg font-bold text-sm active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8.5 h-8.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg font-bold text-sm active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
