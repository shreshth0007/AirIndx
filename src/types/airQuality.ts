export type AQICategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Poor' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Severe' 
  | 'Hazardous';

export interface AirQualityMetrics {
  aqi: number;
  category: AQICategory;
  color: string;
  badgeBg: string;
  textColor: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  dominantPollutant: string;
  pollutionRiskScore: number;
  pollutionRiskSummary: string;
  locationName: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lastUpdated: string;
  isLive: boolean;
  sourceAttribution: string;
}

export interface CityMarkerData {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  riskScore: number;
  isStubbleHotspot?: boolean;
  flag?: string;
  capital?: string;
  continent?: string;
}

export interface WorldCountryData {
  id: string;
  name: string;
  code: string;
  flag: string;
  capital: string;
  continent: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania';
  lat: number;
  lng: number;
  aqi: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  dominantPollutant: string;
  population?: string;
  riskScore: number;
}

export interface HistoricalDataPoint {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  temperature: number;
}

export interface ForecastDataPoint {
  day: string;
  date: string;
  aqi: number;
  category: AQICategory;
  tempMax: number;
  tempMin: number;
  humidity: number;
  risk: string;
}

export interface CommunityReport {
  id: string;
  location: string;
  author: string;
  type: 'Stubble Burning' | 'Industrial Emissions' | 'Vehicle Traffic' | 'Dust & Construction' | 'Clean Air Spot';
  description: string;
  timestamp: string;
  upvotes: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Verified' | 'Under Review' | 'Resolved';
}

export interface AIInsightData {
  summaryTitle: string;
  overallStatus: AQICategory;
  summaryText: string;
  observations: string[];
  recommendations: string[];
  healthAdvice: string;
  timestamp: string;
  modelUsed: string;
}

export interface RegionData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  category: AQICategory;
}

export interface MapStationData {
  id: string;
  name: string;
  state: string;
  type: 'state' | 'city' | 'locality';
  lat: number;
  lng: number;
  aqi?: number | null;
  category?: string;
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  o3?: number;
  temp?: number;
  humidity?: number;
  windSpeed?: number;
  lastUpdated?: string;
}

export interface UserLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  locationName: string;
  state: string;
  country: string;
}

// Track 01: Air Specific Data Interfaces

export interface StubbleHotspot {
  id: string;
  locationName: string;
  stateRegion: string;
  lat: number;
  lng: number;
  fireCount: number;
  confidenceScore: number; // percentage (e.g. 94%)
  smokeDriftVector: string; // e.g. "SE towards Delhi-NCR"
  satelliteSource: string; // e.g. "NASA VIIRS / Sentinel-5P"
  uncertaintyNotes: string;
  lastDetected: string;
  impactedCities: string[];
}

export interface SchoolSafetyData {
  schoolId: string;
  schoolName: string;
  city: string;
  currentAQI: number;
  category: AQICategory;
  safetyRating: 'Safe' | 'Caution' | 'High Risk' | 'Hazardous';
  recessGuideline: string;
  outdoorPeGuideline: string;
  ventilationStatus: string;
  recommendedAction: string;
  studentCount: number;
}

export interface IndoorAirMetrics {
  measuredIaAqi: number;
  measuredPm25: number;
  measuredCo2: number; // ppm
  measuredHumidity: number;
  estimatedOutdoorInfiltration: number; // % outdoor air leaking in
  isSensorConnected: boolean;
  sensorName: string;
  cadrRecommendation: number; // m3/h
  purifierEfficiency: number; // %
  filtrationAdvice: string;
}

export interface ExposureRiskProfile {
  userGroup: 'Standard' | 'Children & Elderly' | 'Asthma / Respiratory' | 'Outdoor Workers';
  outdoorHours: number;
  calculatedExposureScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  advisoryText: string;
  precautionList: string[];
}

// User Profile & Authentication Types
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  is_verified: boolean | number;
  health_conditions: string[];
  preferred_location: string;
  preferred_lat: number;
  preferred_lng: number;
  email_alerts_enabled: boolean | number;
  alert_threshold?: 'Moderate' | 'Unhealthy' | 'Severe';
  phone?: string;
  sms_alerts_enabled?: boolean | number;
  sms_alert_threshold?: 'Moderate' | 'Unhealthy' | 'Severe';
  auth_token?: string;
  created_at?: string;
}

export interface EmailServiceStatus {
  is_configured: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  sender_email: string;
  info: string;
  total_registered_users: number;
  opted_in_users_count: number;
}

export interface EmailLogEntry {
  id: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'simulated';
  provider: string;
  error_details?: string;
  created_at: string;
}

// Smart Marquee Alert Types
export interface MarqueeAlertItem {
  id: number;
  title: string;
  severity: 'high' | 'moderate' | 'info';
  message: string;
  precautions: string[];
  affected_regions: string;
  aqi_reading: number;
  dominant_pollutant: string;
  created_at: string;
}

// 7-Day Forecast Types
export interface SevenDayForecastItem {
  day_label: string;
  date: string;
  is_prediction: boolean;
  prediction_label: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  precipitation_mm: number;
  rain_mm: number;
  precipitation_probability: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  pm25: number;
  pm10: number;
  aqi: number;
  category: string;
  color: string;
  badge_bg: string;
}

export interface SevenDayForecastResponse {
  location_name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  current_measured: {
    is_measured: boolean;
    data_label: string;
    temperature: number;
    humidity: number;
    precipitation_mm: number;
    rain_mm: number;
    wind_speed_kmh: number;
    wind_direction_deg: number;
    pm25: number;
    pm10: number;
    aqi: number;
    category: string;
    color: string;
  };
  seven_day_forecast: SevenDayForecastItem[];
  attribution: string;
  last_updated: string;
}

