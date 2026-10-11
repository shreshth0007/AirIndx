import { GoogleGenerativeAI } from '@google/generative-ai';
import { AirQualityMetrics, AIInsightData } from '../types/airQuality';

const ENV_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';
// Only treat as genuine Gemini API key if it conforms to Google AI Studio format (starts with AIzaSy)
const IS_VALID_GEMINI_KEY = typeof ENV_KEY === 'string' && ENV_KEY.startsWith('AIzaSy');

let genAI: GoogleGenerativeAI | null = null;
if (IS_VALID_GEMINI_KEY) {
  try {
    genAI = new GoogleGenerativeAI(ENV_KEY);
  } catch (err) {
    console.warn('Gemini AI initialization note:', err);
  }
}

/**
 * Intelligent Layman NLP Engine: Generates human-friendly, accurate answers
 * for any environmental air question using live metrics context.
 */
function generateIntelligentLaymanAnswer(question: string, m: AirQualityMetrics): string {
  const q = question.toLowerCase().trim();
  const aqi = m.aqi;
  const pm25 = m.pm25;
  const city = m.locationName || 'your area';
  const category = m.category;
  const temp = m.temperature;
  const wind = m.windSpeed;

  // 1. Exercise / Jogging / Running / Cycling / Outdoor Sports
  if (
    q.includes('exercise') ||
    q.includes('run') ||
    q.includes('jog') ||
    q.includes('walk') ||
    q.includes('cycling') ||
    q.includes('gym') ||
    q.includes('sport') ||
    q.includes('workout') ||
    q.includes('training')
  ) {
    if (aqi <= 50) {
      return `🏃 **Yes, absolutely!** Air quality in ${city} is currently Good (AQI ${aqi}, PM2.5 ${pm25} µg/m³).
- It is ideal for outdoor jogging, cycling, and intense cardio workouts.
- Deep breathing during sports is safe today.
- Best time: Any time of the day is safe!`;
    } else if (aqi <= 100) {
      return `🚶 **Yes, but moderate your intensity.** AQI in ${city} is ${aqi} (Satisfactory / Moderate).
- Light-to-moderate walks and cycling are fine for healthy individuals.
- If you have asthma or sensitive lungs, consider exercising indoors or scheduling runs between 11 AM - 4 PM when ground smog is lower.
- Stay well hydrated before and after.`;
    } else if (aqi <= 150) {
      return `⚠️ **Exercise with caution.** AQI in ${city} is ${aqi} (Moderate / Poor, PM2.5 ${pm25} µg/m³).
- Avoid vigorous cardio (fast running, high-intensity outdoor HIIT). Heavy breathing pulls fine dust deep into your lungs.
- Switch to brisk walking or indoor workout routines.
- Avoid early morning runs (6 AM - 8 AM) when cool air traps pollutants near ground level.`;
    } else {
      return `🚫 **Avoid outdoor exercise today!** AQI in ${city} is currently ${aqi} (${category}, PM2.5 ${pm25} µg/m³).
- Heavy breathing outdoors can cause chest tightness, throat irritation, and lung inflammation.
- Move all workouts indoors with windows shut and an air purifier running.
- If you must walk outside, wear a snug-fitting N95 respirator.`;
    }
  }

  // 2. Masks / N95 / Protection
  if (
    q.includes('mask') ||
    q.includes('n95') ||
    q.includes('kn95') ||
    q.includes('cloth') ||
    q.includes('wear') ||
    q.includes('protect') ||
    q.includes('respirator')
  ) {
    if (aqi <= 50) {
      return `🌱 **No mask needed today.**
- AQI in ${city} is clean at ${aqi}. Normal outdoor air is fresh and healthy to breathe without protective face gear.`;
    } else if (aqi <= 100) {
      return `😷 **Mask optional for healthy adults, recommended for sensitive groups.**
- AQI is ${aqi} in ${city}.
- If you have dust allergies, asthma, or a sensitive throat, wearing an N95 or surgical mask near heavy traffic or construction is helpful.`;
    } else {
      return `😷 **Yes, wearing an N95 or KN95 mask is strongly advised!**
- AQI in ${city} is high at ${aqi} with PM2.5 at ${pm25} µg/m³.
- **Important:** Ordinary cloth masks and loose surgical masks do NOT filter microscopic PM2.5 particles.
- Use a certified N95, KN95, or FFP2 respirator with a tight seal around your nose and chin when commuting outdoors.`;
    }
  }

  // 3. Children, Babies, Toddlers & Schools
  if (
    q.includes('child') ||
    q.includes('kid') ||
    q.includes('baby') ||
    q.includes('babies') ||
    q.includes('infant') ||
    q.includes('toddler') ||
    q.includes('school') ||
    q.includes('play') ||
    q.includes('park')
  ) {
    if (aqi <= 50) {
      return `👶 **Safe for kids and toddlers!**
- Air quality in ${city} is Good (AQI ${aqi}).
- Children breathe more air per kilogram of body weight than adults, and today's air is clean enough for playgrounds, school sports, and outdoor playtime.`;
    } else if (aqi <= 100) {
      return `👶 **Safe for general play, keep an eye on sensitive kids.**
- AQI in ${city} is ${aqi}.
- Kids can play outdoors, but avoid playing next to busy highways or dusty construction areas.
- Encourage children to drink plenty of water after playing.`;
    } else {
      return `🚸 **Limit outdoor playtime for children today.**
- AQI in ${city} is ${aqi} (${category}, PM2.5 ${pm25} µg/m³).
- Developing lungs are twice as vulnerable to fine particulate smog.
- Keep recess and physical play indoors.
- If children must commute to school, ensure they wear child-sized N95 masks.`;
    }
  }

  // 4. Asthma, Respiratory, Cough, Allergies, Inhalers
  if (
    q.includes('asthma') ||
    q.includes('inhaler') ||
    q.includes('breath') ||
    q.includes('lung') ||
    q.includes('cough') ||
    q.includes('allergy') ||
    q.includes('wheez') ||
    q.includes('bronchitis') ||
    q.includes('throat')
  ) {
    return `🫁 **Respiratory Health Advisory for ${city} (AQI ${aqi}):**
- **Current Air:** ${category} with dominant pollutant ${m.dominantPollutant} (${pm25} µg/m³).
- ${aqi > 100 ? '⚠️ High risk of airway twitching, coughing fits, and shortness of breath.' : 'Air is relatively mild, but sensitive airways can still react.'}
- **Action steps:**
  1. Always keep your quick-relief rescue inhaler (e.g. Salbutamol) within easy reach.
  2. Avoid going out during early morning (6 AM - 8:30 AM) when temperature inversion traps smoke and dust close to the ground.
  3. Gargle with warm saline water after returning indoors to flush trapped particulate matter from your throat.
  4. Use an indoor air purifier in your bedroom while sleeping.`;
  }

  // 5. Seniors, Elderly, Heart Conditions, Grandparents
  if (
    q.includes('senior') ||
    q.includes('elderly') ||
    q.includes('old') ||
    q.includes('grandparent') ||
    q.includes('heart') ||
    q.includes('blood pressure') ||
    q.includes('stroke') ||
    q.includes('cardio')
  ) {
    if (aqi <= 60) {
      return `👴 **Comfortable and safe for seniors.**
- AQI in ${city} is ${aqi}. Morning walks and outdoor garden relaxation are safe today.`;
    } else {
      return `👵 **Special care advised for seniors & heart patients:**
- AQI in ${city} is currently ${aqi} (${category}).
- Inhaling microscopic PM2.5 passes directly into the bloodstream, which can trigger blood vessel inflammation and raise blood pressure.
- Recommend taking walks indoors or waiting until mid-afternoon when sunshine disperses surface pollution.
- Avoid heavy lifting or stressful physical exertion outside today.`;
    }
  }

  // 6. Windows, Ventilation, Air Purifier, AC Mode
  if (
    q.includes('window') ||
    q.includes('ventilat') ||
    q.includes('air purifier') ||
    q.includes('indoor') ||
    q.includes('hepa') ||
    q.includes('filter') ||
    q.includes('room') ||
    q.includes('house') ||
    q.includes('ac') ||
    q.includes('fan')
  ) {
    if (aqi <= 60) {
      return `🪟 **Yes, you can open your windows!**
- AQI in ${city} is ${aqi}. Outdoor air is fresh, so opening windows will ventilate indoor carbon dioxide and bring fresh air inside.`;
    } else {
      return `🪟 **Keep windows closed today.**
- AQI in ${city} is ${aqi} (PM2.5: ${pm25} µg/m³).
- Opening windows will let outdoor dust, vehicle soot, and particulate smog penetrate your living rooms.
- **Indoor Best Practices:**
  1. Keep windows and balcony doors shut, especially during morning and evening rush hours.
  2. If using air conditioning, switch the vent setting to **"Internal Recirculation"** rather than drawing outside air.
  3. Run an indoor HEPA air purifier in the bedroom for clean sleep.`;
    }
  }

  // 7. Stubble burning / Parali / Smoke / Fire / Smog
  if (
    q.includes('stubble') ||
    q.includes('parali') ||
    q.includes('smoke') ||
    q.includes('fire') ||
    q.includes('burn') ||
    q.includes('smog') ||
    q.includes('winter') ||
    q.includes('inversion')
  ) {
    return `🔥 **Smoke & Biomass Impact Analysis:**
- In ${city}, the current AQI is ${aqi} with PM2.5 at ${pm25} µg/m³.
- Wind is blowing at **${wind} km/h** from the **${m.windDirection || 'prevailing'}** direction.
- Agricultural residue (parali burning) and low boundary-layer inversion trap particulate smoke, causing heavy haze and reduced visibility.
- When wind speed is under 12 km/h, smoke does not disperse quickly and stagnates over urban basins.
- Keep outdoor exposure minimal until solar heating promotes vertical air mixing around midday.`;
  }

  // 8. Forecast / Improvement / Tomorrow / Future / Trend
  if (
    q.includes('tomorrow') ||
    q.includes('forecast') ||
    q.includes('improve') ||
    q.includes('better') ||
    q.includes('when') ||
    q.includes('future') ||
    q.includes('weekend') ||
    q.includes('trend')
  ) {
    const isWindy = wind > 14;
    return `📈 **Air Quality Outlook for ${city}:**
- **Current AQI:** ${aqi} (${category}) with wind speed at ${wind} km/h.
- **Hourly pattern:** Pollution typically peaks twice a day: between **7:00 AM - 10:00 AM** (morning commute + temperature inversion) and **7:00 PM - 10:30 PM** (evening traffic cooling).
- **Clearest hours:** Usually between **1:00 PM - 4:00 PM** when surface temperatures rise and disperse trapped smog layers.
- ${
      isWindy
        ? `💨 Gusty wind (${wind} km/h) is active, which will help sweep out stagnant particulates over the next 24-48 hours.`
        : `Wind speeds are relatively calm (${wind} km/h), meaning pollution levels will likely remain steady until stronger weather systems arrive.`
    }`;
  }

  // 9. Travel, Driving, Commute, Traffic, Metro
  if (
    q.includes('car') ||
    q.includes('drive') ||
    q.includes('travel') ||
    q.includes('commute') ||
    q.includes('traffic') ||
    q.includes('metro') ||
    q.includes('bus') ||
    q.includes('bike')
  ) {
    return `🚗 **Commuting & Travel Recommendations for ${city}:**
- **Current AQI:** ${aqi} (${category})
- If driving, roll up all car windows and set the climate control to **"Recirculate"** mode so your cabin filter blocks outside diesel exhaust.
- If commuting by two-wheeler, auto-rickshaw, or walking to public transit, wear an N95 mask to block high roadside PM2.5 and PM10 fumes.
- Prefer enclosed transit like the Metro where stations and trains have filtered air.`;
  }

  // 10. Diet, Remedies, Detox, Water, Jaggery
  if (
    q.includes('food') ||
    q.includes('diet') ||
    q.includes('eat') ||
    q.includes('water') ||
    q.includes('drink') ||
    q.includes('jaggery') ||
    q.includes('tea') ||
    q.includes('remedy') ||
    q.includes('detox')
  ) {
    return `🍵 **Nutritional & Daily Care Tips for High Air Pollution:**
- **Stay well-hydrated:** Drink 2-3 liters of clean water daily. Hydration keeps the mucosal lining of your throat and nasal passage moist, helping expel trapped dust.
- **Natural antioxidants:** Citrus fruits (oranges, lemons, amla) provide Vitamin C to combat oxidative stress caused by inhaled pollutants.
- **Herbal support:** Warm ginger-tulsi tea or warm water with honey helps soothe throat irritation.
- **Traditional remedies:** A small piece of jaggery (gur) after meals can help clear particulate residue from the upper respiratory tract.`;
  }

  // 11. Generic / Default Layman Assessment
  return `💡 **Layman Air Assessment for ${city}:**
- **Current Status:** The AQI is **${aqi} (${category})**, with primary pollutant **${m.dominantPollutant}** at **${pm25} µg/m³**.
- **Temperature & Weather:** ${temp}°C, Humidity ${m.humidity}%, Wind ${wind} km/h.
- **What this means for you:**
  ${
    aqi <= 50
      ? 'The air is remarkably clean and fresh! You can freely go outdoors, exercise, and open windows.'
      : aqi <= 100
      ? 'Air quality is acceptable for most people. Sensitive individuals should take basic precautions during long outdoor walks.'
      : aqi <= 150
      ? 'Air is moderately polluted. Wear a mask near heavy traffic and avoid intense outdoor workouts.'
      : 'Pollution levels are high and unhealthy. Limit outdoor exposure, keep windows closed, and wear an N95 mask outside.'
  }
- **Ask me anything specific:** Feel free to ask about outdoor exercise, wearing masks, children safety, asthma care, or opening windows!`;
}

export async function generateAIEnvironmentalInsights(
  metrics: AirQualityMetrics,
  customPrompt?: string
): Promise<AIInsightData> {
  const city = metrics.locationName || 'your area';
  const aqi = metrics.aqi;
  const pm25 = metrics.pm25;
  const category = metrics.category;

  const fallbackObservations = ((): string[] => {
    if (aqi <= 50) {
      return [
        `🌱 Clean and refreshing air in ${city}! Excellent for morning walks, jogging, and outdoor sports.`,
        `☀️ Particulate levels (PM2.5: ${pm25} µg/m³) are well within WHO safety limits for all age groups.`,
        `🪟 Windows can be kept wide open throughout the day to ventilate your home with natural fresh air.`,
        `💨 Gentle atmospheric breeze (${metrics.windSpeed} km/h) is keeping skies clear and free of smog.`,
      ];
    } else if (aqi <= 100) {
      return [
        `☁️ Air quality is moderate in ${city}. Safe for everyday routines, but noticeable fine dust near roads.`,
        `😷 Individuals with asthma or dust sensitivity should keep an inhaler or light mask handy during outdoor trips.`,
        `🪟 Ventilate indoor spaces during midday (12 PM - 3 PM) when ground-level dust concentrations are lowest.`,
        `🚶 Outdoor exercise is fine for healthy adults; stay hydrated to support airway clearance.`,
      ];
    } else if (aqi <= 150) {
      return [
        `⚠️ Elevated smog levels in ${city} (AQI: ${aqi}, PM2.5: ${pm25} µg/m³). Limit vigorous outdoor cardio.`,
        `😷 Recommended to wear an N95/KN95 respirator if commuting on two-wheelers or walking near heavy traffic.`,
        `🪟 Keep home and office windows closed during morning rush hours (7 AM - 10 AM) to block outdoor soot.`,
        `👶 Children and senior citizens should avoid prolonged playtime or exercise in open parks today.`,
      ];
    } else {
      return [
        `🚨 High smog and particulate pollution alert in ${city}! Inhaling air outdoors carries high health risk.`,
        `😷 Mandatory N95 / KN95 protective respirator for anyone stepping outdoors for work or travel.`,
        `🏠 Keep windows sealed shut; run indoor HEPA air purifiers and set vehicle AC to recirculate mode.`,
        `🫁 High vulnerability for asthma and cardiovascular patients: remain indoors in filtered air.`,
      ];
    }
  })();

  const fallbackSummary = ((): string => {
    if (aqi <= 50) {
      return `Air quality in ${city} is Good and pristine today. Perfect conditions for outdoor recreation!`;
    } else if (aqi <= 100) {
      return `Air quality in ${city} is Moderate. Safe for general public, but sensitive lungs should stay alert.`;
    } else if (aqi <= 150) {
      return `Air quality in ${city} is Unhealthy for sensitive groups. Reduce heavy outdoor exertion.`;
    } else {
      return `Air quality in ${city} is High & Unhealthy. Stay indoors when possible and wear an N95 mask outside.`;
    }
  })();

  const fallbackInsights: AIInsightData = {
    summaryTitle: 'Layman Air Quality Summary',
    overallStatus: category,
    summaryText: fallbackSummary,
    observations: fallbackObservations,
    recommendations: [
      aqi > 100 ? 'Wear a snug N95 mask when outdoors along busy roads.' : 'Great day for outdoor walks and open windows.',
      aqi > 100 ? 'Keep vehicle and home windows closed; use internal air recirculation.' : 'Keep indoor spaces well ventilated.',
      'Drink 2-3 liters of water to support respiratory mucous clearance.',
    ],
    healthAdvice:
      aqi > 120
        ? 'Children, seniors, and asthma patients should avoid strenuous outdoor exertion.'
        : 'Air quality is safe for standard daily outdoor routines.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: 'AirIndx Layman Intelligence Engine',
  };

  if (!genAI) {
    return fallbackInsights;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const promptText = `
You are AirIndx AI, a friendly environmental guide.
Analyze these air quality metrics for ${metrics.locationName}, ${metrics.country}:
- AQI: ${metrics.aqi} (${metrics.category})
- PM2.5: ${metrics.pm25} µg/m³
- Temperature: ${metrics.temperature}°C
- Wind: ${metrics.windSpeed} km/h

CRITICAL INSTRUCTION: Express all key observations in simple LAYMAN LANGUAGE so that everyone (children, grandparents, non-scientists) can immediately understand what the air quality means for their daily life.

${customPrompt ? `User Question: "${customPrompt}"` : ''}

Return JSON strictly in this format:
{
  "summaryTitle": "Layman Air Summary",
  "summaryText": "1-2 simple sentence overview in plain everyday English",
  "observations": [
    "Simple layman observation 1",
    "Simple layman observation 2",
    "Simple layman observation 3"
  ],
  "recommendations": ["Easy daily action 1", "Easy daily action 2"],
  "healthAdvice": "Simple health tip for daily life"
}
`;

    // Timeout after 4.5 seconds to prevent hanging UI
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 4500)
    );

    const apiPromise = model.generateContent(promptText);
    const result: any = await Promise.race([apiPromise, timeoutPromise]);
    const textResponse = result.response.text();

    const cleanJsonStr = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJsonStr);

    return {
      summaryTitle: parsed.summaryTitle || 'Layman Air Summary',
      overallStatus: metrics.category,
      summaryText: parsed.summaryText || fallbackInsights.summaryText,
      observations: Array.isArray(parsed.observations) && parsed.observations.length > 0 ? parsed.observations : fallbackInsights.observations,
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : fallbackInsights.recommendations,
      healthAdvice: parsed.healthAdvice || fallbackInsights.healthAdvice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Gemini AI (Layman Mode)',
    };
  } catch (error) {
    console.warn('Gemini API query fallback engaged:', error);
    return fallbackInsights;
  }
}

export async function askAIAssistant(
  question: string,
  metrics: AirQualityMetrics
): Promise<string> {
  if (!question || !question.trim()) {
    return 'Please enter a question about current air quality, outdoor safety, masks, or health precautions!';
  }

  // If a valid Google Gemini key is present, try Gemini 1.5 Flash with short timeout
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are AirIndx Layman AI Assistant.
Location: ${metrics.locationName}
AQI: ${metrics.aqi} (${metrics.category})
PM2.5: ${metrics.pm25} µg/m³
PM10: ${metrics.pm10} µg/m³
Temperature: ${metrics.temperature}°C
Wind: ${metrics.windSpeed} km/h

User Question: "${question}"

Provide a friendly, direct, actionable answer in easy everyday layman terms. Use bullet points or emojis where helpful so non-scientists and families can understand. Avoid technical jargon.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 4500)
      );
      const apiPromise = model.generateContent(prompt);
      const result: any = await Promise.race([apiPromise, timeoutPromise]);
      const text = result.response.text();
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    } catch (err) {
      console.warn('Gemini model call failed or timed out, switching to intelligent NLP engine:', err);
    }
  }

  // Always fallback to our robust intelligent natural language engine
  return generateIntelligentLaymanAnswer(question, metrics);
}

