import { UserProfile, MarqueeAlertItem, SevenDayForecastResponse, EmailServiceStatus, EmailLogEntry } from '../types/airQuality';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

// ==========================================
// 1. AUTHENTICATION & EMAIL OTP VERIFICATION
// ==========================================

export async function requestEmailOtp(email: string, name?: string, password?: string): Promise<{
  success: boolean;
  email: string;
  message: string;
  otp?: string;
  provider?: string;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      name: name?.trim(),
      password: password?.trim() || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to request OTP' }));
    throw new Error(err.detail || 'Failed to request OTP');
  }
  return res.json();
}

export async function loginWithPassword(email: string, password: string): Promise<{
  success: boolean;
  message: string;
  user: UserProfile;
  token: string;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function verifyEmailOtp(
  email: string,
  otp: string,
  name?: string,
  password?: string,
  healthConditions: string[] = [],
  preferredLocation: string = 'Delhi NCR',
  preferredLat: number = 28.6139,
  preferredLng: number = 77.2090,
  emailAlertsEnabled: boolean = true,
  alertThreshold: string = 'Moderate'
): Promise<{
  success: boolean;
  message: string;
  user: UserProfile;
  token: string;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
      password: password?.trim() || undefined,
      name: name?.trim() || 'AirIndx Member',
      health_conditions: healthConditions,
      preferred_location: preferredLocation,
      preferred_lat: preferredLat,
      preferred_lng: preferredLng,
      email_alerts_enabled: emailAlertsEnabled,
      alert_threshold: alertThreshold,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid OTP code' }));
    throw new Error(err.detail || 'Invalid OTP code');
  }
  return res.json();
}

// Backward-compatibility aliases
export async function requestPhoneOtp(phoneOrEmail: string, name?: string) {
  return requestEmailOtp(phoneOrEmail, name);
}

export async function verifyPhoneOtp(
  phoneOrEmail: string,
  otp: string,
  name?: string,
  healthConditions: string[] = [],
  preferredLocation: string = 'Delhi NCR',
  preferredLat: number = 28.6139,
  preferredLng: number = 77.2090,
  smsAlertsEnabled: boolean = true,
  smsAlertThreshold: string = 'Moderate'
) {
  return verifyEmailOtp(
    phoneOrEmail,
    otp,
    name,
    healthConditions,
    preferredLocation,
    preferredLat,
    preferredLng,
    smsAlertsEnabled,
    smsAlertThreshold
  );
}

// ==========================================
// 2. USER PROFILE MANAGEMENT
// ==========================================

export async function fetchUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Unable to fetch user profile');
  }
  const data = await res.json();
  return data.user;
}

export async function updateUserProfile(
  token: string,
  data: {
    name: string;
    health_conditions: string[];
    preferred_location: string;
    preferred_lat: number;
    preferred_lng: number;
    email_alerts_enabled?: boolean;
    alert_threshold?: string;
    sms_alerts_enabled?: boolean;
    sms_alert_threshold?: string;
  }
): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: data.name,
      health_conditions: data.health_conditions,
      preferred_location: data.preferred_location,
      preferred_lat: data.preferred_lat,
      preferred_lng: data.preferred_lng,
      email_alerts_enabled: data.email_alerts_enabled !== undefined ? data.email_alerts_enabled : (data.sms_alerts_enabled ?? true),
      alert_threshold: data.alert_threshold || data.sms_alert_threshold || 'Moderate',
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to update profile');
  }
  const resData = await res.json();
  return resData.user;
}

// ==========================================
// 3. GMAIL SMTP CONFIGURATION & REAL DELIVERY
// ==========================================

export async function fetchEmailStatus(): Promise<EmailServiceStatus> {
  const res = await fetch(`${BASE_URL}/api/v1/email/status`);
  if (!res.ok) throw new Error('Failed to fetch email service status');
  const data = await res.json();
  return data.status;
}

export async function configureEmailService(config: {
  smtp_user: string;
  smtp_password: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_from_name?: string;
  smtp_from_email?: string;
}): Promise<{ success: boolean; message: string; status: EmailServiceStatus }> {
  const res = await fetch(`${BASE_URL}/api/v1/email/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to configure Gmail SMTP' }));
    throw new Error(err.detail || 'Failed to configure Gmail SMTP');
  }
  return res.json();
}

export async function sendTestEmail(
  toEmail?: string,
  locationName?: string,
  aqi?: number,
  token?: string
): Promise<{
  success: boolean;
  provider?: string;
  message?: string;
  error?: string;
  note?: string;
}> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/v1/email/send-test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      to_email: toEmail?.trim().toLowerCase(),
      location_name: locationName,
      aqi,
    }),
  });
  return res.json();
}

export async function fetchEmailHistory(limit: number = 30): Promise<EmailLogEntry[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/email/history?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}

// Backwards-compatible aliases for SMS modals
export type SMSProviderStatus = EmailServiceStatus & {
  is_live_telecom: boolean;
  configured_provider: string;
};

export async function fetchSmsStatus(): Promise<SMSProviderStatus> {
  const emailStatus = await fetchEmailStatus();
  return {
    ...emailStatus,
    is_live_telecom: emailStatus.is_configured,
    configured_provider: emailStatus.is_configured ? 'gmail_smtp' : 'sandbox',
  };
}

export async function configureSmsProvider(config: any) {
  // If user passes credentials, route to configureEmailService
  if (config.smtp_user && config.smtp_password) {
    return configureEmailService(config);
  }
  const current = await fetchEmailStatus();
  return {
    success: true,
    message: 'Gmail SMTP status queried',
    status: {
      ...current,
      is_live_telecom: current.is_configured,
      configured_provider: current.is_configured ? 'gmail_smtp' : 'sandbox',
    },
  };
}

export async function sendTestSmsAlert(
  phoneOrEmail?: string,
  locationName?: string,
  aqi?: number,
  token?: string
) {
  return sendTestEmail(phoneOrEmail, locationName, aqi, token);
}

export async function fetchSmsHistory(limit: number = 30): Promise<any[]> {
  const logs = await fetchEmailHistory(limit);
  return logs.map((l) => ({
    id: l.id,
    phone: l.recipient_email,
    alert_severity: 'High',
    message_body: l.subject,
    provider: l.provider,
    status: l.status,
    created_at: l.created_at,
    error_details: l.error_details,
  }));
}

// ==========================================
// 4. REAL-TIME EMERGENCY BROADCAST TO ALL USERS
// ==========================================

export interface BroadcastAlertResult {
  user_name: string;
  email?: string;
  phone?: string;
  location?: string;
  aqi?: number;
  severity?: string;
  status: 'sent' | 'failed' | 'error' | 'simulated';
  provider?: string;
  message?: string;
  error?: string | null;
}

export interface BroadcastResponse {
  success: boolean;
  total_users: number;
  dispatched: number;
  results: BroadcastAlertResult[];
  message?: string;
}

export async function broadcastAlertsToAllUsers(): Promise<BroadcastResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/alerts/broadcast-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to broadcast alerts' }));
    throw new Error(err.detail || 'Failed to broadcast alerts');
  }
  return res.json();
}

// ==========================================
// 5. MARQUEE ALERTS & 7-DAY FORECAST
// ==========================================

export async function fetchMarqueeAlerts(): Promise<MarqueeAlertItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/alerts/marquee?limit=8`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.alerts || [];
  } catch (err) {
    console.warn('Backend marquee alerts fallback note:', err);
    return [
      {
        id: 1,
        title: 'High Particulate Alert: Northern Plains',
        severity: 'high',
        message: 'PM2.5 concentrations exceeding 165 µg/m³. Asthma & cardiac patients advised to avoid outdoor exposure.',
        precautions: [
          'Wear N95 respirators outdoors.',
          'Keep rescue inhalers accessible.',
          'Seal room ventilation and run HEPA filtration.',
        ],
        affected_regions: 'Delhi NCR, Punjab, Western UP',
        aqi_reading: 178,
        dominant_pollutant: 'PM2.5',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Moderate Humidity & Dust Notice: Coastal Belt',
        severity: 'moderate',
        message: 'AQI 94 with sea-breeze dispersion active. Dust allergy sensitivity observed near arterial corridors.',
        precautions: [
          'Wear protective eyewear and face coverings.',
          'Rinse nasal passages with saline.',
        ],
        affected_regions: 'Mumbai, Thane',
        aqi_reading: 94,
        dominant_pollutant: 'PM10',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Clean Air Corridor: Southern Plateau',
        severity: 'info',
        message: 'AQI under 40 (Good / Safe). Outdoor activities, jogging, and school athletics cleared.',
        precautions: ['Natural ventilation recommended during morning hours.'],
        affected_regions: 'Bengaluru, Mysuru, Ooty',
        aqi_reading: 38,
        dominant_pollutant: 'Ozone',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchBackendSevenDayForecast(
  lat: number,
  lng: number,
  locationName: string = 'Current Location'
): Promise<SevenDayForecastResponse> {
  const url = `${BASE_URL}/api/v1/forecast/7day?lat=${lat}&lng=${lng}&location=${encodeURIComponent(locationName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to retrieve 7-day forecast from backend');
  }
  return res.json();
}
