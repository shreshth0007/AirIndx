import asyncio
import requests
import json
from datetime import datetime
from database import get_all_email_opted_in_users, add_marquee_alert
from email_service import send_smtp_email, format_health_alert_email
from health_alerts import evaluate_smart_health_alerts
from forecast_service import calculate_cpcb_aqi

async def evaluate_and_notify_users():
    """
    Periodic job that monitors conditions for all verified users with Email notifications enabled.
    Evaluates real-time weather & AQI, applies medical conditions, and dispatches real email alerts.
    Runs in background even when browser is closed.
    """
    users = get_all_email_opted_in_users()
    if not users:
        return

    print(f"[{datetime.utcnow().strftime('%H:%M:%S')}] Running background environmental health monitor for {len(users)} opted-in users...")

    for user in users:
        email = user.get("email")
        if not email or "@" not in email:
            continue

        lat = user.get("preferred_lat", 28.6139)
        lng = user.get("preferred_lng", 77.2090)
        loc_name = user.get("preferred_location", "Preferred Location")
        health_conds = user.get("health_conditions", [])
        threshold_pref = user.get("alert_threshold", "Moderate")

        # Threshold numeric boundary
        threshold_aqi = 100 if threshold_pref == "Moderate" else (150 if threshold_pref == "Unhealthy" else 200)

        try:
            # Fetch current live reading from Open-Meteo
            aq_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=us_aqi,pm10,pm2_5"
            w_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m"

            aq_res = requests.get(aq_url, timeout=6)
            w_res = requests.get(w_url, timeout=6)

            if not aq_res.ok or not w_res.ok:
                continue

            aq_data = aq_res.json().get("current", {})
            w_data = w_res.json().get("current", {})

            pm25 = float(aq_data.get("pm2_5", 35.0))
            pm10 = float(aq_data.get("pm10", 70.0))
            temp = float(w_data.get("temperature_2m", 28.0))
            humidity = int(w_data.get("relative_humidity_2m", 60))
            wind_speed = float(w_data.get("wind_speed_10m", 10.0))

            aqi = calculate_cpcb_aqi(pm25, pm10)

            # Check if threshold crossed
            if aqi >= threshold_aqi:
                eval_res = evaluate_smart_health_alerts(
                    location_name=loc_name,
                    aqi=aqi,
                    pm25=pm25,
                    pm10=pm10,
                    temperature=temp,
                    humidity=humidity,
                    wind_speed=wind_speed,
                    health_conditions=health_conds
                )

                severity = eval_res["severity"]
                precautions = eval_res["personalized_precautions"]
                dominant = "PM2.5" if pm25 > (pm10 * 0.5) else "PM10"

                subject = f"[AirIndx Emergency Warning] {severity.upper()} Air Quality in {loc_name} (AQI {aqi})"
                html, text = format_health_alert_email(
                    location_name=loc_name,
                    aqi=aqi,
                    severity=severity,
                    dominant_pollutant=dominant,
                    health_conditions=health_conds,
                    precautions=precautions
                )

                send_res = send_smtp_email(email, subject, html, text)
                if send_res.get("success"):
                    print(f"-> Alert Email dispatched to {email} for {loc_name} (AQI {aqi})")
                    # Record to marquee for public visibility
                    add_marquee_alert(
                        title=eval_res["title"],
                        severity=severity,
                        message=eval_res["summary"],
                        precautions=precautions,
                        affected_regions=loc_name,
                        aqi_reading=aqi,
                        dominant_pollutant=dominant
                    )

        except Exception as e:
            print(f"Error checking user {email}: {e}")

async def start_background_monitoring_loop(interval_seconds: int = 900):
    """
    Continuous async daemon loop running in FastAPI server.
    Runs every 15 minutes (900 seconds) by default.
    """
    print("[Scheduler] Starting AirIndx Environmental Health Monitoring Daemon...")
    while True:
        try:
            await evaluate_and_notify_users()
        except Exception as e:
            print(f"[Scheduler Exception]: {e}")
        await asyncio.sleep(interval_seconds)
