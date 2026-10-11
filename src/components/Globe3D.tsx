import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CityMarkerData } from '../types/airQuality';
import { Plus, Minus, Thermometer, Droplets, Wind } from 'lucide-react';

interface Globe3DProps {
  cities: CityMarkerData[];
  selectedCity: CityMarkerData;
  onSelectCity: (city: CityMarkerData) => void;
  onOpenDashboard: () => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onOpenDashboard,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'3d' | '2d'>('3d');
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 5.404578, y: -73.828177 });
  const [markerPositions, setMarkerPositions] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});
  const [hoveredCity, setHoveredCity] = useState<CityMarkerData | null>(selectedCity);

  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 210;
    cameraRef.current = camera;

    // Renderer with high antialiasing & tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights matching Reference Image (Sun light top-left key, blue rim light)
    const ambientLight = new THREE.AmbientLight(0x121d30, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.8);
    sunLight.position.set(-220, 220, 180); // Top-left sun key light matching Image 1 flare
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x00d2ff, 2.5);
    blueRimLight.position.set(200, -100, 150);
    scene.add(blueRimLight);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Earth Sphere Geometry
    const radius = 72;
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);

    // --- HIGH RESOLUTION SATELLITE EARTH TEXTURE CANVAS ---
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Realistic Deep Blue Ocean Canvas Texture
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a1728');
    oceanGrad.addColorStop(0.3, '#0e2344');
    oceanGrad.addColorStop(0.7, '#091932');
    oceanGrad.addColorStop(1, '#050d1a');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Realistic Landmass Painting
    const drawLand = (pathData: [number, number][], landColor: string, strokeColor: string) => {
      ctx.fillStyle = landColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      pathData.forEach(([lng, lat], idx) => {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Americas
    drawLand([[-160, 70], [-100, 60], [-80, 45], [-60, 45], [-80, 25], [-100, 20], [-120, 35], [-160, 60]], '#223323', '#3d593e');
    drawLand([[-80, 10], [-40, -5], [-35, -20], [-55, -55], [-70, -40], [-80, -5]], '#1d2e1f', '#365037');

    // Europe
    drawLand([[-10, 65], [30, 70], [45, 50], [30, 38], [0, 40], [-10, 50]], '#2c3e2a', '#4a6747');

    // Africa & Sahara Desert
    drawLand([[-15, 35], [35, 32], [50, 12], [40, -35], [15, -35], [10, 5], [-15, 15]], '#3d3222', '#635338');

    // Middle East
    drawLand([[35, 32], [60, 30], [55, 12], [40, 12]], '#473a26', '#735f3d');

    // Asia & Siberia
    drawLand([[60, 70], [140, 70], [170, 60], [140, 35], [100, 10], [60, 30]], '#243523', '#405c3e');

    // India Subcontinent
    drawLand([[68, 35], [88, 28], [80, 8], [72, 18]], '#283c29', '#476948');

    // Southeast Asia & Indonesia Archipelago
    drawLand([[95, 22], [110, 10], [105, -8], [95, 5]], '#1f3020', '#38553a');
    drawLand([[100, -2], [120, -5], [140, -3], [130, -10], [100, -8]], '#1f3020', '#38553a'); // Java & Sumatra

    // Australia
    drawLand([[115, -15], [150, -15], [150, -38], [115, -35]], '#423624', '#6b583a');

    // 3. Realistic Golden / Amber City Night Lights (Exact Match to Reference Image 1)
    const drawCityLights = (lng: number, lat: number, radius: number = 4) => {
      const x = ((lng + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.5);
      grad.addColorStop(0, '#ffe066');
      grad.addColorStop(0.35, '#f59e0b');
      grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.4)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    };

    // Golden Night Light Clusters for Global Cities
    drawCityLights(77.2090, 28.6139, 5); // Delhi
    drawCityLights(72.8777, 19.0760, 4); // Mumbai
    drawCityLights(88.3639, 22.5726, 4); // Kolkata
    drawCityLights(106.8456, -6.2088, 6.5); // Jakarta (Vibrant Light Cluster)
    drawCityLights(139.6503, 35.6762, 6); // Tokyo
    drawCityLights(116.4074, 39.9042, 5); // Beijing
    drawCityLights(2.3522, 48.8566, 5); // Paris
    drawCityLights(-0.1278, 51.5074, 5); // London
    drawCityLights(55.2708, 25.2048, 5); // Dubai
    drawCityLights(31.2357, 30.0444, 4.5); // Cairo
    drawCityLights(-74.0060, 40.7128, 6); // New York

    const texture = new THREE.CanvasTexture(canvas);

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 45,
      specular: new THREE.Color(0x38bdf8),
      emissive: new THREE.Color(0x061224),
      bumpScale: 0.05,
    });

    const earthMesh = new THREE.Mesh(sphereGeo, earthMaterial);
    globeGroup.add(earthMesh);

    // 4. Bright Cyan Atmosphere Halo Rim (Exact Match to Image 1)
    const atmosphereGeo = new THREE.SphereGeometry(radius * 1.09, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.35,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Outer Orbit Ring
    const ringGeo = new THREE.RingGeometry(radius * 1.25, radius * 1.26, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    globeGroup.add(ringMesh);

    // Initial Angle facing Europe / Africa / Middle East / Asia (Matching Image 1)
    globeGroup.rotation.y = -Math.PI / 1.6;
    globeGroup.rotation.x = 0.28;

    // Drag Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y,
      };

      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += deltaMove.x * 0.005;
        globeGroupRef.current.rotation.x += deltaMove.y * 0.005;
      }

      setCoords({
        x: parseFloat(((e.clientX / width) * 10 - 5).toFixed(6)),
        y: parseFloat((-(e.clientY / height) * 100 - 20).toFixed(6)),
      });

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domEl = mountRef.current;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.0012; // Slow auto rotation
      }

      if (cameraRef.current && globeGroupRef.current) {
        const positions: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        
        cities.forEach((city) => {
          const phi = (90 - city.lat) * (Math.PI / 180);
          const theta = (city.lng + 180) * (Math.PI / 180);
          const r = radius;

          const localPos = new THREE.Vector3(
            -(r * Math.sin(phi) * Math.cos(theta)),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
          );

          localPos.applyMatrix4(globeGroupRef.current!.matrixWorld);

          const isFront = localPos.z > -20;
          const vector = localPos.clone();
          vector.project(cameraRef.current!);

          const screenX = (vector.x * 0.5 + 0.5) * width;
          const screenY = (-(vector.y * 0.5) + 0.5) * height;

          positions[city.id] = {
            x: screenX,
            y: screenY,
            visible: isFront && vector.z < 1,
          };
        });

        setMarkerPositions(positions);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [cities]);

  // Handle Zoom
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    if (direction === 'in' && cameraRef.current.position.z > 140) {
      cameraRef.current.position.z -= 25;
    } else if (direction === 'out' && cameraRef.current.position.z < 380) {
      cameraRef.current.position.z += 25;
    }
  };

  const currentCity = hoveredCity || selectedCity || cities[0];

  return (
    <div className="relative w-full h-full min-h-[620px] select-none flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* FLOATING NUMBERED CIRCULAR AQI PINS (Red = High >150, Yellow = Moderate 51-150, Green = Good <=50) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {cities.map((city) => {
          const pos = markerPositions[city.id];
          if (!pos || !pos.visible) return null;

          const isSelected = selectedCity.id === city.id || hoveredCity?.id === city.id;
          
          // Image 1 specific pin styles: Red for High (>150), Yellow for Moderate (51-150), Green for Good (<=50)
          let pinBg = 'bg-emerald-500 text-white border-white shadow-[0_0_12px_#10b981]';
          let isYellowActive = false;

          if (city.aqi > 150) {
            pinBg = 'bg-red-600 text-white border-white shadow-[0_0_15px_#ef4444] scale-110';
          } else if (city.aqi > 50 || city.id === 'jakarta-idn' || isSelected) {
            pinBg = 'bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_#f59e0b] scale-125';
            if (city.id === 'jakarta-idn' || isSelected) isYellowActive = true;
          }

          return (
            <div
              key={city.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-auto transition-all duration-300 z-20 hover:z-40 cursor-pointer group"
              onClick={() => {
                onSelectCity(city);
                setHoveredCity(city);
              }}
              onMouseEnter={() => setHoveredCity(city)}
            >
              {/* Pointer line for active yellow badge (Image 1 replica) */}
              {isYellowActive && (
                <div className="absolute top-1/2 left-1/2 -translate-x-full -translate-y-full w-12 h-12 border-t-2 border-l-2 border-dashed border-amber-400/80 pointer-events-none" />
              )}

              {/* Numbered Circle Badge */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-xs sm:text-sm shadow-2xl border-2 backdrop-blur-md transition-all duration-300 ${pinBg}`}
              >
                <span>{city.aqi}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP DETAIL TOOLTIP CARD OVER JAKARTA / ACTIVE CITY (Exact Match to Reference Image 1) */}
      {currentCity && (
        <div className="absolute top-[32%] right-[5%] sm:right-[12%] w-[310px] sm:w-[340px] bg-[#0c1424]/90 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl text-white z-40 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wide text-slate-200">
                {currentCity.name}, {currentCity.country} Air Quality
              </span>
            </div>
            <button
              onClick={onOpenDashboard}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-extrabold hover:underline"
            >
              Details
            </button>
          </div>

          <div className="mt-3 flex items-center space-x-3">
            <div className={`flex items-center justify-center px-3 py-2 rounded-xl text-lg font-black shadow-md border border-white/40 shrink-0 ${
              currentCity.aqi > 150 ? 'bg-red-600 text-white' : currentCity.aqi > 50 ? 'bg-orange-500 text-slate-950' : 'bg-emerald-500 text-white'
            }`}>
              <div className="text-center">
                <div className="text-xl font-black leading-none">{currentCity.aqi}</div>
                <div className="text-[9px] uppercase font-extrabold opacity-90 mt-0.5">AQI</div>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-100 leading-snug">
                {currentCity.aqi > 150 ? 'Unhealthy - High Risk' : currentCity.aqi > 50 ? 'Unhealthy for sensitive people' : 'Good / Safe Air Quality'}
              </h4>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-medium">
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentCity.temp}°C</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentCity.humidity}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentCity.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE TOGGLE PILL AT BOTTOM CENTER (Exact Match to Image 1: 3D GLOBE / IQ AIR MAP) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-slate-900/95 border border-slate-700/80 rounded-full p-1 shadow-2xl backdrop-blur-md z-30">
        <button
          onClick={() => setActiveTab('3d')}
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
            activeTab === '3d'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3D GLOBE
        </button>
        <button
          onClick={onOpenDashboard}
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
            activeTab === '2d'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          IQ AIR MAP
        </button>
      </div>

      {/* COORDINATES READOUT AT BOTTOM LEFT (Exact Match to Image 1: X: 5.404578, Y: -73.828177) */}
      <div className="absolute bottom-6 left-6 hidden sm:block text-slate-400 font-mono text-[11px] bg-slate-900/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 z-30">
        <div>X: {coords.x}</div>
        <div>Y: {coords.y}</div>
      </div>

      {/* ZOOM CONTROLS AT BOTTOM RIGHT (Exact Match to Image 1: Zoom + -) */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-2 z-30">
        <span className="text-xs font-bold text-slate-300 hidden sm:inline mr-1">Zoom</span>
        <button
          onClick={() => handleZoom('in')}
          className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-100 flex items-center justify-center transition-all shadow-md active:scale-95 font-bold"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 hover:bg-slate-700 text-slate-100 flex items-center justify-center transition-all shadow-md active:scale-95 font-bold"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
