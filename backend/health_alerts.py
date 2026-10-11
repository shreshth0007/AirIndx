from typing import List, Dict, Any

def evaluate_smart_health_alerts(
    location_name: str,
    aqi: int,
    pm25: float,
    pm10: float,
    temperature: float,
    humidity: int,
    wind_speed: float,
    health_conditions: List[str]
) -> Dict[str, Any]:
    """
    Evaluates environmental readings against clinical thresholds and individual medical profiles.
    Generates personalized health advisories, trigger factors, and actionable precautions.
    """
    conditions_set = set(health_conditions or [])
    precautions: List[str] = []
    triggers: List[str] = []
    
    # 1. Base Severity Classification
    if aqi > 200 or pm25 > 90:
        severity = "high"
        level_label = "Severe Health Hazard"
    elif aqi > 100 or pm25 > 45:
        severity = "moderate"
        level_label = "Unhealthy for Sensitive Groups"
    else:
        severity = "info"
        level_label = "Normal / Safe Air"

    # 2. Environmental Trigger Detection
    if pm25 > 60:
        triggers.append(f"PM2.5 fine particulate concentration is {round(pm25/15.0, 1)}x WHO guideline ({pm25} µg/m³).")
    if pm10 > 120:
        triggers.append(f"PM10 coarse particulate surge ({pm10} µg/m³) indicates localized road dust or construction.")
    if temperature > 38:
        triggers.append(f"Extreme Heat ({temperature}°C) compounds cardiovascular and ozone distress.")
    if humidity > 80:
        triggers.append(f"High Humidity ({humidity}%) prevents atmospheric dispersion and traps aerosols near ground.")
    if wind_speed < 5:
        triggers.append(f"Stagnant air conditions ({wind_speed} km/h wind) indicate thermal inversion trapping pollutants.")

    # 3. Personalized Medical Rules Engine
    if "Asthma / Respiratory" in conditions_set:
        if aqi > 100:
            precautions.append("Keep rapid-acting bronchodilator / rescue inhaler within immediate reach.")
            precautions.append("Strictly avoid early-morning outdoor walking or cardiovascular workouts.")
            precautions.append("Wear N95/FFP2 respirator with silicone seal if venturing outside.")
        else:
            precautions.append("Mild respiratory risk. Monitor peak flow meter if symptoms arise.")

    if "Cardiovascular / Heart Disease" in conditions_set:
        if aqi > 120:
            precautions.append("High PM2.5 causes vascular constriction. Avoid heavy physical lifting and outdoor tasks.")
            precautions.append("Remain in air-conditioned / HEPA-filtered indoor environments.")
            precautions.append("Monitor blood pressure and pulse rate twice daily during high pollution peaks.")
        else:
            precautions.append("Maintain routine physical activities in clean indoor spaces.")

    if "Allergies to Dust/Pollen" in conditions_set:
        if pm10 > 80 or pm25 > 40:
            precautions.append("Rinse nasal passages with sterile saline after returning indoors.")
            precautions.append("Wear wraparound sunglasses and particulate mask to block ocular and mucosal irritants.")
            precautions.append("Keep windows closed during windy periods to prevent allergen infiltration.")

    if "Elderly (65+)" in conditions_set:
        if aqi > 100:
            precautions.append("Seniors should remain indoors. Limit exposure to smoky transit corridors.")
            precautions.append("Stay well hydrated and ensure clean indoor air filtration.")

    if "Child / Infant (<10)" in conditions_set:
        if aqi > 100:
            precautions.append("Cancel outdoor recess and sports drills for young children.")
            precautions.append("Maintain indoor play and operate room air purifiers in bedrooms.")

    if "Outdoor Worker / Athlete" in conditions_set:
        if aqi > 100:
            precautions.append("Mandatory rest rotations in clean indoor filtration booths every 45 minutes.")
            precautions.append("Wear certified particulate respirators during all outdoor shifts.")

    # General baseline precautions if none matched
    if not precautions:
        if severity == "high":
            precautions.append("Minimize outdoor exertion and wear N95 respirators.")
            precautions.append("Operate indoor HEPA air purifiers continuously.")
        elif severity == "moderate":
            precautions.append("Sensitive individuals should limit prolonged outdoor exertion.")
        else:
            precautions.append("Air quality is satisfactory. Normal outdoor activities safe.")

    # Title & Summary
    if severity == "high":
        title = f"High Risk Air Quality Alert: {location_name}"
        summary = (
            f"Dangerous particulate levels (AQI {aqi}, PM2.5 {pm25} µg/m³) detected in {location_name}. "
            f"Active health risks for {' & '.join(health_conditions) if health_conditions else 'general population'}."
        )
    elif severity == "moderate":
        title = f"Moderate Environmental Advisory: {location_name}"
        summary = (
            f"Elevated pollution levels (AQI {aqi}) in {location_name}. "
            f"Sensitive individuals ({', '.join(health_conditions) if health_conditions else 'asthma/allergies'}) should exercise caution."
        )
    else:
        title = f"Normal / Clean Air Advisory: {location_name}"
        summary = f"Air quality in {location_name} is within acceptable safety parameters (AQI {aqi})."

    return {
        "title": title,
        "severity": severity,
        "level_label": level_label,
        "summary": summary,
        "aqi": aqi,
        "triggers": triggers,
        "personalized_precautions": precautions,
        "location": location_name,
        "health_conditions_evaluated": health_conditions
    }
