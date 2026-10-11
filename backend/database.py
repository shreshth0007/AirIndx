import sqlite3
import os
import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "airindx.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        
        # 1. Users table (Email primary identifier)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                is_verified INTEGER DEFAULT 0,
                health_conditions TEXT DEFAULT '[]',
                preferred_location TEXT DEFAULT 'Delhi NCR',
                preferred_lat REAL DEFAULT 28.6139,
                preferred_lng REAL DEFAULT 77.2090,
                email_alerts_enabled INTEGER DEFAULT 1,
                alert_threshold TEXT DEFAULT 'Moderate',
                auth_token TEXT,
                phone TEXT,
                sms_alerts_enabled INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Safely migrate existing users table if columns are missing
        cursor = conn.execute("PRAGMA table_info(users)")
        existing_cols = [row[1] for row in cursor.fetchall()]
        if "email" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT;")
        if "email_alerts_enabled" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN email_alerts_enabled INTEGER DEFAULT 1;")
        if "alert_threshold" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN alert_threshold TEXT DEFAULT 'Moderate';")
        if "password" not in existing_cols:
            conn.execute("ALTER TABLE users ADD COLUMN password TEXT;")

        # 2. OTP Codes table (Email-based)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used INTEGER DEFAULT 0,
                attempts INTEGER DEFAULT 0,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor_otp = conn.execute("PRAGMA table_info(otp_codes)")
        otp_cols = [row[1] for row in cursor_otp.fetchall()]
        if "email" not in otp_cols:
            conn.execute("ALTER TABLE otp_codes ADD COLUMN email TEXT;")

        # 3. Marquee Ticker table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS alert_marquee (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                precautions TEXT DEFAULT '[]',
                affected_regions TEXT DEFAULT 'All India',
                aqi_reading INTEGER DEFAULT 0,
                dominant_pollutant TEXT DEFAULT 'PM2.5',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 4. Email History Audit table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS email_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipient_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                status TEXT NOT NULL,
                provider TEXT NOT NULL,
                error_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Seed initial smart alert marquee items if table is empty
        cursor = conn.execute("SELECT COUNT(*) FROM alert_marquee")
        count = cursor.fetchone()[0]
        if count == 0:
            initial_alerts = [
                (
                    "High Particulate Alert: Delhi-NCR & Northern Plains",
                    "high",
                    "PM2.5 concentrations exceeding 165 µg/m³ due to slow surface winds & stubble smoke transport. Sensitive respiratory groups advised to remain indoors.",
                    json.dumps([
                        "Asthma & COPD patients should carry rescue inhalers and avoid outdoor commuting.",
                        "Wear fit-tested N95 / FFP2 respirators if stepping outdoors.",
                        "Seal indoor ventilation dampers and operate HEPA purifiers continuously."
                    ]),
                    "Delhi NCR, Punjab, Haryana, Western UP",
                    178,
                    "PM2.5"
                ),
                (
                    "Moderate Air Quality Notice: Mumbai & Coastal Hubs",
                    "moderate",
                    "AQI hovering at 94 with sea-breeze dispersion active. Relative humidity 74% with localized dust near construction zones.",
                    json.dumps([
                        "Individuals with dust allergies should wear protective eyewear and face coverings near transit corridors.",
                        "Hydrate frequently to soothe upper respiratory tract irritation."
                    ]),
                    "Mumbai, Thane, Navi Mumbai",
                    94,
                    "PM10"
                ),
                (
                    "Clean Air Corridor: Bengaluru & Nilgiris",
                    "info",
                    "Favorable southeasterly breeze keeping AQI below 42 (Good / Safe). Outdoor activities, jogging, and school sports fully cleared.",
                    json.dumps([
                        "Natural ventilation and open windows recommended during morning hours.",
                        "Optimal time for outdoor athletic conditioning."
                    ]),
                    "Bengaluru, Mysuru, Ooty",
                    38,
                    "Ozone"
                )
            ]
            conn.executemany("""
                INSERT INTO alert_marquee (title, severity, message, precautions, affected_regions, aqi_reading, dominant_pollutant)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, initial_alerts)

    conn.close()

# User helpers
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        data = dict(row)
        try:
            data['health_conditions'] = json.loads(data['health_conditions'])
        except Exception:
            data['health_conditions'] = []
        return data
    return None

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM users WHERE auth_token = ?", (token,))
    row = cursor.fetchone()
    conn.close()
    if row:
        data = dict(row)
        try:
            data['health_conditions'] = json.loads(data['health_conditions'])
        except Exception:
            data['health_conditions'] = []
        return data
    return None

def create_or_update_user(
    email: str,
    name: str,
    password: Optional[str] = None,
    health_conditions: List[str] = None,
    preferred_location: str = "Delhi NCR",
    preferred_lat: float = 28.6139,
    preferred_lng: float = 77.2090,
    email_alerts_enabled: bool = True,
    alert_threshold: str = "Moderate"
) -> Dict[str, Any]:
    conn = get_db()
    clean_email = email.strip().lower()
    health_json = json.dumps(health_conditions or [])
    auth_token = secrets.token_hex(32)
    now = datetime.utcnow().isoformat()

    existing = get_user_by_email(clean_email)
    with conn:
        if existing:
            pwd_to_save = password if password else existing.get("password")
            conn.execute("""
                UPDATE users 
                SET name = ?, password = ?, health_conditions = ?, preferred_location = ?, preferred_lat = ?, preferred_lng = ?,
                    email_alerts_enabled = ?, alert_threshold = ?, auth_token = ?, updated_at = ?
                WHERE LOWER(email) = LOWER(?)
            """, (name, pwd_to_save, health_json, preferred_location, preferred_lat, preferred_lng, 1 if email_alerts_enabled else 0, alert_threshold, auth_token, now, clean_email))
        else:
            conn.execute("""
                INSERT INTO users (email, name, password, is_verified, health_conditions, preferred_location, preferred_lat, preferred_lng, email_alerts_enabled, alert_threshold, auth_token, created_at, updated_at)
                VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (clean_email, name, password, health_json, preferred_location, preferred_lat, preferred_lng, 1 if email_alerts_enabled else 0, alert_threshold, auth_token, now, now))

    conn.close()
    return get_user_by_email(clean_email)

def verify_user_credentials(email: str, password: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    user = get_user_by_email(clean_email)
    if not user:
        return None
    stored_password = user.get("password")
    if not stored_password or stored_password != password.strip():
        return None
    
    # Generate fresh auth token
    auth_token = secrets.token_hex(32)
    conn = get_db()
    with conn:
        conn.execute("UPDATE users SET auth_token = ? WHERE LOWER(email) = LOWER(?)", (auth_token, clean_email))
    conn.close()
    return get_user_by_email(clean_email)

def mark_user_verified_by_email(email: str) -> bool:
    conn = get_db()
    with conn:
        conn.execute("UPDATE users SET is_verified = 1 WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    conn.close()
    return True

def update_user_profile(
    user_id: int,
    name: str,
    health_conditions: List[str],
    preferred_location: str,
    preferred_lat: float,
    preferred_lng: float,
    email_alerts_enabled: bool,
    alert_threshold: str
) -> Optional[Dict[str, Any]]:
    conn = get_db()
    health_json = json.dumps(health_conditions or [])
    now = datetime.utcnow().isoformat()
    with conn:
        conn.execute("""
            UPDATE users 
            SET name = ?, health_conditions = ?, preferred_location = ?, preferred_lat = ?, preferred_lng = ?,
                email_alerts_enabled = ?, alert_threshold = ?, updated_at = ?
            WHERE id = ?
        """, (name, health_json, preferred_location, preferred_lat, preferred_lng, 1 if email_alerts_enabled else 0, alert_threshold, now, user_id))
    
    cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        data = dict(row)
        try:
            data['health_conditions'] = json.loads(data['health_conditions'])
        except Exception:
            data['health_conditions'] = []
        return data
    return None

def get_all_email_opted_in_users() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM users WHERE email IS NOT NULL AND TRIM(email) != '' AND is_verified = 1 AND email_alerts_enabled = 1")
    rows = cursor.fetchall()
    conn.close()
    users = []
    for r in rows:
        d = dict(r)
        try:
            d['health_conditions'] = json.loads(d['health_conditions'])
        except Exception:
            d['health_conditions'] = []
        users.append(d)
    return users

def get_all_registered_users() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM users WHERE email IS NOT NULL AND TRIM(email) != '' ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    users = []
    for r in rows:
        d = dict(r)
        try:
            d['health_conditions'] = json.loads(d['health_conditions'])
        except Exception:
            d['health_conditions'] = []
        users.append(d)
    return users

# Email OTP helpers
def save_email_otp(email: str, otp: str, validity_minutes: int = 10):
    conn = get_db()
    clean_email = email.strip().lower()
    expires_at = (datetime.utcnow() + timedelta(minutes=validity_minutes)).isoformat()
    with conn:
        conn.execute("""
            INSERT INTO otp_codes (email, otp, expires_at, is_used, attempts)
            VALUES (?, ?, ?, 0, 0)
        """, (clean_email, otp, expires_at))
    conn.close()

def verify_email_otp_code(email: str, otp: str) -> bool:
    conn = get_db()
    clean_email = email.strip().lower()
    now = datetime.utcnow().isoformat()
    cursor = conn.execute("""
        SELECT * FROM otp_codes 
        WHERE LOWER(email) = LOWER(?) AND is_used = 0 AND expires_at > ?
        ORDER BY id DESC LIMIT 1
    """, (clean_email, now))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return False

    row_id = row['id']
    stored_otp = row['otp']
    attempts = row['attempts']

    if attempts >= 5:
        conn.close()
        return False

    if stored_otp == otp.strip():
        with conn:
            conn.execute("UPDATE otp_codes SET is_used = 1 WHERE id = ?", (row_id,))
            conn.execute("UPDATE users SET is_verified = 1 WHERE LOWER(email) = LOWER(?)", (clean_email,))
        conn.close()
        return True
    else:
        with conn:
            conn.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", (row_id,))
        conn.close()
        return False

# Email history logs
def log_email(recipient_email: str, subject: str, body: str, status: str, provider: str = "gmail_smtp", error_details: Optional[str] = None):
    conn = get_db()
    with conn:
        conn.execute("""
            INSERT INTO email_history (recipient_email, subject, body, status, provider, error_details)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (recipient_email, subject, body, status, provider, error_details))
    conn.close()

def get_recent_email_logs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM email_history ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Marquee alert helpers
def get_marquee_alerts(limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.execute("SELECT * FROM alert_marquee ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    alerts = []
    for r in rows:
        d = dict(r)
        try:
            d['precautions'] = json.loads(d['precautions'])
        except Exception:
            d['precautions'] = []
        alerts.append(d)
    return alerts

def add_marquee_alert(title: str, severity: str, message: str, precautions: List[str], affected_regions: str = "National", aqi_reading: int = 0, dominant_pollutant: str = "PM2.5"):
    conn = get_db()
    prec_json = json.dumps(precautions or [])
    with conn:
        conn.execute("""
            INSERT INTO alert_marquee (title, severity, message, precautions, affected_regions, aqi_reading, dominant_pollutant)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, severity, message, prec_json, affected_regions, aqi_reading, dominant_pollutant))
    conn.close()
