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

// 1. ALL 28 STATES AND 8 UNION TERRITORIES (36 Total)
export const INDIA_STATES_UTS: MapStationData[] = [
  // 28 States
  { id: 'st-ap', name: 'Andhra Pradesh', state: 'Andhra Pradesh', type: 'state', lat: 16.5062, lng: 80.6480 },
  { id: 'st-ar', name: 'Arunachal Pradesh', state: 'Arunachal Pradesh', type: 'state', lat: 27.0844, lng: 93.6053 },
  { id: 'st-as', name: 'Assam', state: 'Assam', type: 'state', lat: 26.1445, lng: 91.7362 },
  { id: 'st-br', name: 'Bihar', state: 'Bihar', type: 'state', lat: 25.5941, lng: 85.1376 },
  { id: 'st-cg', name: 'Chhattisgarh', state: 'Chhattisgarh', type: 'state', lat: 21.2514, lng: 81.6296 },
  { id: 'st-ga', name: 'Goa', state: 'Goa', type: 'state', lat: 15.4909, lng: 73.8278 },
  { id: 'st-gj', name: 'Gujarat', state: 'Gujarat', type: 'state', lat: 23.2156, lng: 72.6369 },
  { id: 'st-hr', name: 'Haryana', state: 'Haryana', type: 'state', lat: 28.4595, lng: 77.0266 },
  { id: 'st-hp', name: 'Himachal Pradesh', state: 'Himachal Pradesh', type: 'state', lat: 31.1048, lng: 77.1734 },
  { id: 'st-jh', name: 'Jharkhand', state: 'Jharkhand', type: 'state', lat: 23.3441, lng: 85.3096 },
  { id: 'st-ka', name: 'Karnataka', state: 'Karnataka', type: 'state', lat: 12.9716, lng: 77.5946 },
  { id: 'st-kl', name: 'Kerala', state: 'Kerala', type: 'state', lat: 8.5241, lng: 76.9366 },
  { id: 'st-mp', name: 'Madhya Pradesh', state: 'Madhya Pradesh', type: 'state', lat: 23.2599, lng: 77.4126 },
  { id: 'st-mh', name: 'Maharashtra', state: 'Maharashtra', type: 'state', lat: 19.0760, lng: 72.8777 },
  { id: 'st-mn', name: 'Manipur', state: 'Manipur', type: 'state', lat: 24.8170, lng: 93.9368 },
  { id: 'st-ml', name: 'Meghalaya', state: 'Meghalaya', type: 'state', lat: 25.5788, lng: 91.8933 },
  { id: 'st-mz', name: 'Mizoram', state: 'Mizoram', type: 'state', lat: 23.7271, lng: 92.7176 },
  { id: 'st-nl', name: 'Nagaland', state: 'Nagaland', type: 'state', lat: 25.6751, lng: 94.1086 },
  { id: 'st-or', name: 'Odisha', state: 'Odisha', type: 'state', lat: 20.2961, lng: 85.8245 },
  { id: 'st-pb', name: 'Punjab', state: 'Punjab', type: 'state', lat: 31.6340, lng: 74.8723 },
  { id: 'st-rj', name: 'Rajasthan', state: 'Rajasthan', type: 'state', lat: 26.9124, lng: 75.7873 },
  { id: 'st-sk', name: 'Sikkim', state: 'Sikkim', type: 'state', lat: 27.3389, lng: 88.6065 },
  { id: 'st-tn', name: 'Tamil Nadu', state: 'Tamil Nadu', type: 'state', lat: 13.0827, lng: 80.2707 },
  { id: 'st-tg', name: 'Telangana', state: 'Telangana', type: 'state', lat: 17.3850, lng: 78.4867 },
  { id: 'st-tr', name: 'Tripura', state: 'Tripura', type: 'state', lat: 23.8315, lng: 91.2868 },
  { id: 'st-up', name: 'Uttar Pradesh', state: 'Uttar Pradesh', type: 'state', lat: 26.8467, lng: 80.9462 },
  { id: 'st-uk', name: 'Uttarakhand', state: 'Uttarakhand', type: 'state', lat: 30.3165, lng: 78.0322 },
  { id: 'st-wb', name: 'West Bengal', state: 'West Bengal', type: 'state', lat: 22.5726, lng: 88.3639 },

  // 8 Union Territories
  { id: 'ut-an', name: 'Andaman and Nicobar', state: 'Andaman & Nicobar Islands', type: 'state', lat: 11.6234, lng: 92.7265 },
  { id: 'ut-ch', name: 'Chandigarh (UT)', state: 'Chandigarh', type: 'state', lat: 30.7333, lng: 76.7794 },
  { id: 'ut-dd', name: 'Dadra & Nagar Haveli and Daman & Diu', state: 'Daman & Diu', type: 'state', lat: 20.3974, lng: 72.8328 },
  { id: 'ut-dl', name: 'Delhi (NCT)', state: 'Delhi', type: 'state', lat: 28.6139, lng: 77.2090 },
  { id: 'ut-jk', name: 'Jammu and Kashmir', state: 'Jammu & Kashmir', type: 'state', lat: 34.0837, lng: 74.7973 },
  { id: 'ut-la', name: 'Ladakh', state: 'Ladakh', type: 'state', lat: 34.1526, lng: 77.5771 },
  { id: 'ut-ld', name: 'Lakshadweep', state: 'Lakshadweep', type: 'state', lat: 10.5667, lng: 72.6417 },
  { id: 'ut-py', name: 'Puducherry', state: 'Puducherry', type: 'state', lat: 11.9416, lng: 79.8083 },
];

// 2. MAJOR CITIES ACROSS INDIAN STATES (65 Cities)
export const INDIA_MAJOR_CITIES: MapStationData[] = [
  // Maharashtra
  { id: 'ct-mumbai', name: 'Mumbai', state: 'Maharashtra', type: 'city', lat: 19.0760, lng: 72.8777 },
  { id: 'ct-pune', name: 'Pune', state: 'Maharashtra', type: 'city', lat: 18.5204, lng: 73.8567 },
  { id: 'ct-nagpur', name: 'Nagpur', state: 'Maharashtra', type: 'city', lat: 21.1458, lng: 79.0882 },
  { id: 'ct-nashik', name: 'Nashik', state: 'Maharashtra', type: 'city', lat: 19.9975, lng: 73.7898 },
  { id: 'ct-aurangabad', name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', type: 'city', lat: 19.8762, lng: 75.3433 },

  // Karnataka
  { id: 'ct-bengaluru', name: 'Bengaluru', state: 'Karnataka', type: 'city', lat: 12.9716, lng: 77.5946 },
  { id: 'ct-mysuru', name: 'Mysuru', state: 'Karnataka', type: 'city', lat: 12.2958, lng: 76.6394 },
  { id: 'ct-hubballi', name: 'Hubballi-Dharwad', state: 'Karnataka', type: 'city', lat: 15.3647, lng: 75.1240 },
  { id: 'ct-mangaluru', name: 'Mangaluru', state: 'Karnataka', type: 'city', lat: 12.9141, lng: 74.8560 },

  // Tamil Nadu
  { id: 'ct-chennai', name: 'Chennai', state: 'Tamil Nadu', type: 'city', lat: 13.0827, lng: 80.2707 },
  { id: 'ct-coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', type: 'city', lat: 11.0168, lng: 76.9558 },
  { id: 'ct-madurai', name: 'Madurai', state: 'Tamil Nadu', type: 'city', lat: 9.9252, lng: 78.1198 },
  { id: 'ct-trichy', name: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'city', lat: 10.7905, lng: 78.7047 },
  { id: 'ct-salem', name: 'Salem', state: 'Tamil Nadu', type: 'city', lat: 11.6643, lng: 78.1460 },

  // Uttar Pradesh
  { id: 'ct-lucknow', name: 'Lucknow', state: 'Uttar Pradesh', type: 'city', lat: 26.8467, lng: 80.9462 },
  { id: 'ct-kanpur', name: 'Kanpur', state: 'Uttar Pradesh', type: 'city', lat: 26.4499, lng: 80.3319 },
  { id: 'ct-varanasi', name: 'Varanasi', state: 'Uttar Pradesh', type: 'city', lat: 25.3176, lng: 82.9739 },
  { id: 'ct-agra', name: 'Agra', state: 'Uttar Pradesh', type: 'city', lat: 27.1767, lng: 78.0081 },
  { id: 'ct-noida', name: 'Noida', state: 'Uttar Pradesh', type: 'city', lat: 28.5355, lng: 77.3910 },
  { id: 'ct-ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', type: 'city', lat: 28.6692, lng: 77.4538 },
  { id: 'ct-prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', type: 'city', lat: 25.4358, lng: 81.8463 },
  { id: 'ct-meerut', name: 'Meerut', state: 'Uttar Pradesh', type: 'city', lat: 28.9845, lng: 77.7064 },

  // Gujarat
  { id: 'ct-ahmedabad', name: 'Ahmedabad', state: 'Gujarat', type: 'city', lat: 23.0225, lng: 72.5714 },
  { id: 'ct-surat', name: 'Surat', state: 'Gujarat', type: 'city', lat: 21.1702, lng: 72.8311 },
  { id: 'ct-vadodara', name: 'Vadodara', state: 'Gujarat', type: 'city', lat: 22.3072, lng: 73.1812 },
  { id: 'ct-rajkot', name: 'Rajkot', state: 'Gujarat', type: 'city', lat: 22.3039, lng: 70.8022 },

  // Rajasthan
  { id: 'ct-jaipur', name: 'Jaipur', state: 'Rajasthan', type: 'city', lat: 26.9124, lng: 75.7873 },
  { id: 'ct-jodhpur', name: 'Jodhpur', state: 'Rajasthan', type: 'city', lat: 26.2389, lng: 73.0243 },
  { id: 'ct-udaipur', name: 'Udaipur', state: 'Rajasthan', type: 'city', lat: 24.5854, lng: 73.7125 },
  { id: 'ct-kota', name: 'Kota', state: 'Rajasthan', type: 'city', lat: 25.2138, lng: 75.8648 },

  // West Bengal
  { id: 'ct-kolkata', name: 'Kolkata', state: 'West Bengal', type: 'city', lat: 22.5726, lng: 88.3639 },
  { id: 'ct-howrah', name: 'Howrah', state: 'West Bengal', type: 'city', lat: 22.5958, lng: 88.2636 },
  { id: 'ct-siliguri', name: 'Siliguri', state: 'West Bengal', type: 'city', lat: 26.7271, lng: 88.3953 },
  { id: 'ct-asansol', name: 'Asansol', state: 'West Bengal', type: 'city', lat: 23.6739, lng: 86.9524 },

  // Telangana & Andhra Pradesh
  { id: 'ct-hyderabad', name: 'Hyderabad', state: 'Telangana', type: 'city', lat: 17.3850, lng: 78.4867 },
  { id: 'ct-warangal', name: 'Warangal', state: 'Telangana', type: 'city', lat: 17.9689, lng: 79.5941 },
  { id: 'ct-vizag', name: 'Visakhapatnam', state: 'Andhra Pradesh', type: 'city', lat: 17.6868, lng: 83.2185 },
  { id: 'ct-vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', type: 'city', lat: 16.5062, lng: 80.6480 },

  // Madhya Pradesh
  { id: 'ct-bhopal', name: 'Bhopal', state: 'Madhya Pradesh', type: 'city', lat: 23.2599, lng: 77.4126 },
  { id: 'ct-indore', name: 'Indore', state: 'Madhya Pradesh', type: 'city', lat: 22.7196, lng: 75.8577 },
  { id: 'ct-gwalior', name: 'Gwalior', state: 'Madhya Pradesh', type: 'city', lat: 26.2183, lng: 78.1828 },
  { id: 'ct-jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh', type: 'city', lat: 23.1815, lng: 79.9864 },

  // Bihar & Jharkhand
  { id: 'ct-patna', name: 'Patna', state: 'Bihar', type: 'city', lat: 25.5941, lng: 85.1376 },
  { id: 'ct-gaya', name: 'Gaya', state: 'Bihar', type: 'city', lat: 24.7914, lng: 85.0002 },
  { id: 'ct-ranchi', name: 'Ranchi', state: 'Jharkhand', type: 'city', lat: 23.3441, lng: 85.3096 },
  { id: 'ct-jamshedpur', name: 'Jamshedpur', state: 'Jharkhand', type: 'city', lat: 22.8046, lng: 86.2029 },

  // Punjab, Haryana & Chandigarh
  { id: 'ct-chandigarh', name: 'Chandigarh', state: 'Chandigarh', type: 'city', lat: 30.7333, lng: 76.7794 },
  { id: 'ct-amritsar', name: 'Amritsar', state: 'Punjab', type: 'city', lat: 31.6340, lng: 74.8723 },
  { id: 'ct-ludhiana', name: 'Ludhiana', state: 'Punjab', type: 'city', lat: 30.9010, lng: 75.8573 },
  { id: 'ct-gurugram', name: 'Gurugram', state: 'Haryana', type: 'city', lat: 28.4595, lng: 77.0266 },
  { id: 'ct-faridabad', name: 'Faridabad', state: 'Haryana', type: 'city', lat: 28.4089, lng: 77.3178 },

  // Kerala
  { id: 'ct-kochi', name: 'Kochi', state: 'Kerala', type: 'city', lat: 9.9312, lng: 76.2673 },
  { id: 'ct-tvm', name: 'Thiruvananthapuram', state: 'Kerala', type: 'city', lat: 8.5241, lng: 76.9366 },
  { id: 'ct-kozhikode', name: 'Kozhikode', state: 'Kerala', type: 'city', lat: 11.2588, lng: 75.7804 },

  // Odisha & Assam
  { id: 'ct-bbsr', name: 'Bhubaneswar', state: 'Odisha', type: 'city', lat: 20.2961, lng: 85.8245 },
  { id: 'ct-cuttack', name: 'Cuttack', state: 'Odisha', type: 'city', lat: 20.4625, lng: 85.8828 },
  { id: 'ct-guwahati', name: 'Guwahati', state: 'Assam', type: 'city', lat: 26.1445, lng: 91.7362 },

  // Uttarakhand & Himachal
  { id: 'ct-dehradun', name: 'Dehradun', state: 'Uttarakhand', type: 'city', lat: 30.3165, lng: 78.0322 },
  { id: 'ct-haridwar', name: 'Haridwar', state: 'Uttarakhand', type: 'city', lat: 29.9457, lng: 78.1642 },
  { id: 'ct-shimla', name: 'Shimla', state: 'Himachal Pradesh', type: 'city', lat: 31.1048, lng: 77.1734 },

  // Jammu & Kashmir & Ladakh
  { id: 'ct-srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', type: 'city', lat: 34.0837, lng: 74.7973 },
  { id: 'ct-jammu', name: 'Jammu', state: 'Jammu & Kashmir', type: 'city', lat: 32.7266, lng: 74.8570 },
  { id: 'ct-leh', name: 'Leh', state: 'Ladakh', type: 'city', lat: 34.1526, lng: 77.5771 },
];

// 3. DETAILED LOCALITIES & REAL CAAQM STATIONS (45 Stations)
export const INDIA_LOCAL_STATIONS: MapStationData[] = [
  // Delhi NCR Stations
  { id: 'loc-anand-vihar', name: 'Anand Vihar', state: 'Delhi', type: 'locality', lat: 28.6469, lng: 77.3160 },
  { id: 'loc-rk-puram', name: 'R.K. Puram', state: 'Delhi', type: 'locality', lat: 28.5660, lng: 77.1767 },
  { id: 'loc-punjabi-bagh', name: 'Punjabi Bagh', state: 'Delhi', type: 'locality', lat: 28.6692, lng: 77.1278 },
  { id: 'loc-mandir-marg', name: 'Mandir Marg', state: 'Delhi', type: 'locality', lat: 28.6365, lng: 77.2010 },
  { id: 'loc-dwarka', name: 'Dwarka Sector 8', state: 'Delhi', type: 'locality', lat: 28.5708, lng: 77.0718 },
  { id: 'loc-igi-airport', name: 'IGI Airport T3', state: 'Delhi', type: 'locality', lat: 28.5562, lng: 77.1000 },
  { id: 'loc-shadipur', name: 'Shadipur', state: 'Delhi', type: 'locality', lat: 28.6517, lng: 77.1582 },
  { id: 'loc-noida-sec62', name: 'Noida Sector 62', state: 'Uttar Pradesh', type: 'locality', lat: 28.6271, lng: 77.3653 },
  { id: 'loc-ggn-sec51', name: 'Gurugram Sector 51', state: 'Haryana', type: 'locality', lat: 28.4285, lng: 77.0718 },
  { id: 'loc-fbd-sec16', name: 'Faridabad Sector 16A', state: 'Haryana', type: 'locality', lat: 28.4112, lng: 77.3129 },

  // Mumbai Localities
  { id: 'loc-bkc', name: 'Bandra Kurla Complex (BKC)', state: 'Maharashtra', type: 'locality', lat: 19.0657, lng: 72.8687 },
  { id: 'loc-colaba', name: 'Colaba', state: 'Maharashtra', type: 'locality', lat: 18.9067, lng: 72.8147 },
  { id: 'loc-andheri', name: 'Andheri East', state: 'Maharashtra', type: 'locality', lat: 19.1136, lng: 72.8697 },
  { id: 'loc-worli', name: 'Worli Seaface', state: 'Maharashtra', type: 'locality', lat: 19.0166, lng: 72.8166 },
  { id: 'loc-chembur', name: 'Chembur', state: 'Maharashtra', type: 'locality', lat: 19.0622, lng: 72.8977 },
  { id: 'loc-vashi', name: 'Navi Mumbai Vashi', state: 'Maharashtra', type: 'locality', lat: 19.0771, lng: 72.9986 },
  { id: 'loc-borivali', name: 'Borivali National Park', state: 'Maharashtra', type: 'locality', lat: 19.2288, lng: 72.8541 },

  // Bengaluru Localities
  { id: 'loc-btm', name: 'BTM Layout', state: 'Karnataka', type: 'locality', lat: 12.9166, lng: 77.6101 },
  { id: 'loc-whitefield', name: 'Whitefield Tech Zone', state: 'Karnataka', type: 'locality', lat: 12.9698, lng: 77.7500 },
  { id: 'loc-peenya', name: 'Peenya Industrial Area', state: 'Karnataka', type: 'locality', lat: 13.0285, lng: 77.5197 },
  { id: 'loc-hebbal', name: 'Hebbal Flyover', state: 'Karnataka', type: 'locality', lat: 13.0358, lng: 77.5970 },
  { id: 'loc-silkboard', name: 'Central Silk Board', state: 'Karnataka', type: 'locality', lat: 12.9175, lng: 77.6233 },
  { id: 'loc-jayanagar', name: 'Jayanagar 4th Block', state: 'Karnataka', type: 'locality', lat: 12.9308, lng: 77.5838 },

  // Kolkata Localities
  { id: 'loc-victoria', name: 'Victoria Memorial', state: 'West Bengal', type: 'locality', lat: 22.5448, lng: 88.3426 },
  { id: 'loc-rbu', name: 'Rabindra Bharati Univ.', state: 'West Bengal', type: 'locality', lat: 22.6277, lng: 88.3846 },
  { id: 'loc-saltlake', name: 'Salt Lake Sector V', state: 'West Bengal', type: 'locality', lat: 22.5735, lng: 88.4331 },
  { id: 'loc-jadavpur', name: 'Jadavpur University', state: 'West Bengal', type: 'locality', lat: 22.4988, lng: 88.3716 },

  // Chennai Localities
  { id: 'loc-alandur', name: 'Alandur Metro', state: 'Tamil Nadu', type: 'locality', lat: 13.0033, lng: 80.2017 },
  { id: 'loc-manali', name: 'Manali Industrial Belt', state: 'Tamil Nadu', type: 'locality', lat: 13.1667, lng: 80.2667 },
  { id: 'loc-velachery', name: 'Velachery', state: 'Tamil Nadu', type: 'locality', lat: 12.9815, lng: 80.2180 },
  { id: 'loc-annanagar', name: 'Anna Nagar West', state: 'Tamil Nadu', type: 'locality', lat: 13.0850, lng: 80.2101 },

  // Hyderabad Localities
  { id: 'loc-sanathnagar', name: 'Sanathnagar Industrial', state: 'Telangana', type: 'locality', lat: 17.4578, lng: 78.4418 },
  { id: 'loc-hitec', name: 'HITEC City Cyber Towers', state: 'Telangana', type: 'locality', lat: 17.4474, lng: 78.3762 },
  { id: 'loc-charminar', name: 'Charminar Heritage', state: 'Telangana', type: 'locality', lat: 17.3616, lng: 78.4747 },
  { id: 'loc-bollaram', name: 'Bollaram Industrial Zone', state: 'Telangana', type: 'locality', lat: 17.5564, lng: 78.3582 },

  // Pune Localities
  { id: 'loc-shivajinagar', name: 'Shivajinagar Station', state: 'Maharashtra', type: 'locality', lat: 18.5314, lng: 73.8446 },
  { id: 'loc-kothrud', name: 'Kothrud Paud Road', state: 'Maharashtra', type: 'locality', lat: 18.5074, lng: 73.8077 },
  { id: 'loc-hinjewadi', name: 'Hinjewadi Phase 1', state: 'Maharashtra', type: 'locality', lat: 18.5913, lng: 73.7389 },

  // Ahmedabad Localities
  { id: 'loc-maninagar', name: 'Maninagar', state: 'Gujarat', type: 'locality', lat: 22.9978, lng: 72.6033 },
  { id: 'loc-navrangpura', name: 'Navrangpura Commerce', state: 'Gujarat', type: 'locality', lat: 23.0365, lng: 72.5611 },
  { id: 'loc-satellite', name: 'Satellite Area', state: 'Gujarat', type: 'locality', lat: 23.0287, lng: 72.5186 },
];

// Master Combined Stations Array
export const ALL_INDIA_MAP_STATIONS: MapStationData[] = [
  ...INDIA_STATES_UTS,
  ...INDIA_MAJOR_CITIES,
  ...INDIA_LOCAL_STATIONS,
];
