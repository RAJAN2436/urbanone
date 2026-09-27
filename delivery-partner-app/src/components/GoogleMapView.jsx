import React, { useState, useEffect, useRef } from 'react';
import { useRider } from '../context/RiderContext';
import {
  Navigation,
  MapPin,
  Store,
  Compass,
  Layers,
  LocateFixed,
  ExternalLink,
  ChevronRight,
  Bike,
  ShieldCheck,
  Zap,
  CornerUpRight,
  Settings,
  KeyRound,
  Check,
  Radio
} from 'lucide-react';

export const GoogleMapView = ({ 
  order = null,
  riderLocation = null,
  targetLocation = null,
  targetName = '',
  targetType = 'merchant',
  address = '',
  fullScreen = false
}) => {
  const { 
    currentLocation: contextRiderLocation, 
    openGoogleMapsNavigation, 
    isOnline,
    activeOrder: contextActiveOrder
  } = useRider();

  const currentOrder = order || contextActiveOrder;
  const riderLoc = riderLocation || contextRiderLocation || { lat: 27.8048, lng: 79.2882 };

  // View mode: 'vector' | 'google_live' | 'satellite'
  const [mapMode, setMapMode] = useState('google_live');

  const handleToggleMapMode = () => {
    setMapMode(prev => {
      const next = prev === 'vector' ? 'google_live' : prev === 'google_live' ? 'satellite' : 'vector';
      try { localStorage.setItem('urban_rider_map_mode', next); } catch (e) {}
      return next;
    });
  };

  const [apiKey] = useState(() => {
    try {
      const envKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY : '';
      const stored = localStorage.getItem('urban_google_maps_api_key');
      return (envKey && String(envKey).trim()) || stored || '';
    } catch (e) {
      return '';
    }
  });
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [jsApiLoaded, setJsApiLoaded] = useState(false);

  const googleMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);

  // Ushait coordinates
  const merchantLocation = {
    name: currentOrder?.merchantName || targetName || 'Urban Kitchen Ushait',
    address: currentOrder?.pickupAddress || address || 'Clock Tower Chowk, Ushait (243641)',
    lat: currentOrder?.merchantLocation?.lat || (targetType === 'merchant' && targetLocation?.lat) || 27.8062,
    lng: currentOrder?.merchantLocation?.lng || (targetType === 'merchant' && targetLocation?.lng) || 79.2895
  };

  const customerLocation = {
    name: currentOrder?.customerName || targetName || 'Customer Destination',
    address: currentOrder?.deliveryAddress || address || 'Ward 4, Near Primary School, Ushait (243641)',
    lat: currentOrder?.customerLocation?.lat || (targetType === 'customer' && targetLocation?.lat) || 27.8035,
    lng: currentOrder?.customerLocation?.lng || (targetType === 'customer' && targetLocation?.lng) || 79.2858
  };

  const isDelivering = currentOrder && ['picked_up', 'on_the_way'].includes(currentOrder.orderStatus);
  const target = isDelivering
    ? customerLocation
    : {
        name: targetName || merchantLocation.name,
        address: address || merchantLocation.address,
        lat: targetLocation?.lat || merchantLocation.lat,
        lng: targetLocation?.lng || merchantLocation.lng
      };

  // Calculate real Haversine Distance in meters/kilometers
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const distanceKm = calculateDistanceKm(riderLoc.lat, riderLoc.lng, target.lat, target.lng);
  const estimatedMins = Math.max(2, Math.round(Number(distanceKm) * 3.5));

  // Initialize real Google Maps JavaScript SDK when API key is present
  useEffect(() => {
    if (!apiKey) return;

    if (window.google?.maps) {
      setJsApiLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setJsApiLoaded(true);
      script.onerror = () => {
        console.warn('[Google Maps SDK] Could not load API. Falling back to Google Maps Interactive Embed.');
        setJsApiLoaded(false);
      };
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // Mount Google Map Instance ONCE when SDK is ready and element exists
  useEffect(() => {
    if (jsApiLoaded && window.google?.maps && googleMapRef.current && (mapMode === 'google_live' || mapMode === 'satellite')) {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setMapTypeId(mapMode === 'satellite' ? 'satellite' : 'roadmap');
          return;
        }

        const center = { lat: riderLoc.lat, lng: riderLoc.lng };
        const map = new window.google.maps.Map(googleMapRef.current, {
          center,
          zoom: 16,
          mapTypeId: mapMode === 'satellite' ? 'satellite' : 'roadmap',
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#38414e' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#212a37' }]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#9ca5b3' }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#746855' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#17263c' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        // 1. Rider Marker (🛵)
        riderMarkerRef.current = new window.google.maps.Marker({
          position: center,
          map,
          title: 'You (Rider)',
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
            scaledSize: new window.google.maps.Size(36, 36)
          }
        });
        markersRef.current.push(riderMarkerRef.current);

        // 2. Target Destination Marker
        targetMarkerRef.current = new window.google.maps.Marker({
          position: { lat: target.lat, lng: target.lng },
          map,
          title: target.name || 'Destination',
          icon: {
            url: isDelivering 
              ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png' 
              : 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
            scaledSize: new window.google.maps.Size(34, 34)
          }
        });
        markersRef.current.push(targetMarkerRef.current);

        // 3. Draw Route strictly along roads via Google Directions (Driving mode) or road-grid waypoints
        if (window.google.maps.DirectionsService && window.google.maps.DirectionsRenderer) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: '#f97316',
              strokeOpacity: 0.95,
              strokeWeight: 5
            }
          });
          directionsRendererRef.current = directionsRenderer;

          directionsService.route({
            origin: center,
            destination: { lat: target.lat, lng: target.lng },
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);
            } else {
              // Fallback: Road-grid waypoints (horizontal then vertical street)
              const roadWaypoints = [
                center,
                { lat: center.lat, lng: target.lng },
                { lat: target.lat, lng: target.lng }
              ];
              polylineRef.current = new window.google.maps.Polyline({
                path: roadWaypoints,
                geodesic: false,
                strokeColor: '#f97316',
                strokeOpacity: 0.9,
                strokeWeight: 4
              });
              polylineRef.current.setMap(map);
            }
          });
        } else {
          // Road-grid waypoints (travel strictly along road grid)
          const roadWaypoints = [
            center,
            { lat: center.lat, lng: target.lng },
            { lat: target.lat, lng: target.lng }
          ];
          polylineRef.current = new window.google.maps.Polyline({
            path: roadWaypoints,
            geodesic: false,
            strokeColor: '#f97316',
            strokeOpacity: 0.9,
            strokeWeight: 4
          });
          polylineRef.current.setMap(map);
        }
      } catch (err) {
        console.warn('[Google Map Render Error]:', err.message);
      }
    }
  }, [jsApiLoaded, mapMode]);

  // Update existing marker positions on GPS change WITHOUT recreating the map
  useEffect(() => {
    if (mapInstanceRef.current && riderMarkerRef.current) {
      const newPos = { lat: riderLoc.lat, lng: riderLoc.lng };
      riderMarkerRef.current.setPosition(newPos);
      if (polylineRef.current) {
        polylineRef.current.setPath([
          newPos,
          { lat: newPos.lat, lng: target.lng },
          { lat: target.lat, lng: target.lng }
        ]);
      }
    }
  }, [riderLoc.lat, riderLoc.lng, target.lat, target.lng]);

  const handleSaveApiKey = () => {
    if (!tempKey.trim()) return;
    localStorage.setItem('urban_google_maps_api_key', tempKey.trim());
    setApiKey(tempKey.trim());
    setShowKeyConfig(false);
  };

  // Google Maps Interactive Embed URL - Fixed to Ushait so the iframe NEVER reloads or blinks
  const embedMapUrl = React.useMemo(() => {
    return `https://maps.google.com/maps?q=27.8048,79.2882&t=${
      mapMode === 'satellite' ? 'k' : 'm'
    }&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [mapMode]);

  return (
    <div className={`relative w-full overflow-hidden bg-zinc-950 flex flex-col justify-between ${
      fullScreen
        ? 'h-full min-h-[460px] sm:min-h-full rounded-none sm:rounded-3xl border-0 sm:border sm:border-zinc-800'
        : 'h-[360px] sm:h-[420px] rounded-3xl border border-zinc-800 shadow-2xl'
    }`}>
      
      {/* ======================================================== */}
      {/* MAP LAYER: GOOGLE MAPS LIVE / SATELLITE / VECTOR CANVAS */}
      {/* ======================================================== */}
      {jsApiLoaded && window.google?.maps ? (
        <div ref={googleMapRef} className="absolute inset-0 w-full h-full z-0" />
      ) : mapMode === 'google_live' || mapMode === 'satellite' ? (
        /* Real Interactive Google Maps Embed with Pan/Zoom & Ushait Road Network */
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-zinc-900 pointer-events-auto">
          <iframe
            title="Google Maps Ushait Navigation"
            src={embedMapUrl}
            className="w-full h-full border-0 filter contrast-[1.05] brightness-[0.95]"
            loading="lazy"
            allowFullScreen
          />
          {/* Subtle gradient overlay at top & bottom so controls stand out */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Vector Night Road Navigation Canvas (Route drawn ONLY by roads) */
        <div className="absolute inset-0 bg-[#0f1115] z-0 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="roadGlowOrange" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* City Urban Blocks / Ground */}
            <rect width="100" height="100" fill="#0f1117" />

            {/* Street Grid - Wide Asphalt Roads */}
            {/* 1. Main East-West Bazaar Road (horizontal, y=65) */}
            <line x1="0" y1="65" x2="100" y2="65" stroke="#1f242d" strokeWidth="12" />
            <line x1="0" y1="65" x2="100" y2="65" stroke="#333b47" strokeWidth="1" strokeDasharray="3 2" />

            {/* 2. Secondary Hospital & School Road (horizontal, y=30) */}
            <line x1="0" y1="30" x2="100" y2="30" stroke="#1f242d" strokeWidth="10" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="#333b47" strokeWidth="1" strokeDasharray="3 2" />

            {/* 3. Station Link Road (vertical, x=35) */}
            <line x1="35" y1="0" x2="35" y2="100" stroke="#1f242d" strokeWidth="10" />
            <line x1="35" y1="0" x2="35" y2="100" stroke="#333b47" strokeWidth="1" strokeDasharray="3 2" />

            {/* 4. Clock Tower Chowk Avenue (vertical, x=75) */}
            <line x1="75" y1="0" x2="75" y2="100" stroke="#1f242d" strokeWidth="12" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#333b47" strokeWidth="1" strokeDasharray="3 2" />

            {/* 5. Additional Cross Street (vertical, x=15) */}
            <line x1="15" y1="0" x2="15" y2="100" stroke="#1a1e27" strokeWidth="7" />

            {/* Navigation Line Drawn ONLY ALONG THE ROAD:
                Starts at Rider (35, 65) -> travels along Main Bazaar Road East to Chowk (75, 65) 
                -> turns 90 degrees North along Clock Tower Chowk -> reaches Destination (75, 30) */}
            <path
              d="M 35 65 L 75 65 L 75 30"
              fill="none"
              stroke="#ea580c"
              strokeWidth="4.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 35 65 L 75 65 L 75 30"
              fill="none"
              stroke="url(#roadGlowOrange)"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="4 2.5"
              className="animate-pulse"
            />
          </svg>

          {/* Road Name Badges */}
          <span className="absolute left-[38%] top-[66%] text-[8px] font-mono font-bold tracking-wider text-zinc-500 uppercase select-none pointer-events-none">
            Main Bazaar Marg ➔
          </span>
          <span className="absolute left-[77%] top-[45%] text-[8px] font-mono font-bold tracking-wider text-zinc-500 uppercase select-none pointer-events-none -rotate-90 origin-left">
            Clock Tower Chowk ➔
          </span>

          {/* Rider Marker (positioned exactly on the road at x=35%, y=65%) */}
          <div className="absolute left-[35%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <span className="absolute -inset-2.5 rounded-full bg-orange-500/40 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-[#ea580c] border-2 border-white shadow-xl flex items-center justify-center text-white text-base">
              🛵
            </div>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-zinc-900/95 border border-zinc-700 text-[10px] font-black text-white whitespace-nowrap shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>You (Rider)</span>
            </div>
          </div>

          {/* Destination Marker (positioned on the road at x=75%, y=30%) */}
          <div className="absolute left-[75%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black animate-bounce">
              {isDelivering ? <MapPin className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-zinc-900/95 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 whitespace-nowrap shadow-md">
              {target.name?.slice(0, 16)}...
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP FLOATING MAP CONTROLS & TURN-BY-TURN INSTRUCTIONS   */}
      {/* ======================================================== */}
      <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between pointer-events-auto">
        {/* Turn-by-Turn Instruction Pill */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-zinc-700/80 shadow-xl flex items-center gap-2 text-xs max-w-[240px] sm:max-w-xs">
          <CornerUpRight className="w-4 h-4 text-[#f97316] flex-shrink-0 animate-pulse" />
          <div className="font-extrabold text-white truncate">
            {isDelivering ? 'Head to customer in Ushait' : 'Navigate to restaurant'}
          </div>
          <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-950/80 px-1.5 py-0.5 rounded-md flex-shrink-0">
            {distanceKm} km
          </span>
        </div>

        {/* Layer Mode & Settings Switchers */}
        <div className="flex items-center gap-1.5">
          {/* Google Maps / Satellite / Vector Toggle */}
          <button
            onClick={handleToggleMapMode}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-zinc-700 text-zinc-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-md text-[10px] font-bold"
            title="Switch Map Mode"
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span className="uppercase tracking-wider">
              {mapMode === 'google_live' ? 'Maps' : mapMode === 'satellite' ? 'Satellite' : 'Vector'}
            </span>
          </button>

          {/* Re-center GPS Button */}
          <button
            onClick={() => {
              if (mapInstanceRef.current && window.google?.maps) {
                mapInstanceRef.current.panTo({ lat: riderLoc.lat, lng: riderLoc.lng });
                mapInstanceRef.current.setZoom(17);
              }
            }}
            className="w-8 h-8 rounded-xl bg-zinc-950/85 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-[#f97316] flex items-center justify-center cursor-pointer transition-colors shadow-md"
            title="Center My GPS"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM FLOATING GOOGLE MAPS NAVIGATION LAUNCHER          */}
      {/* ======================================================== */}
      <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-4 pointer-events-auto">
        <div className="p-3 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                {isDelivering ? 'Drop-off Destination' : 'Pickup Destination'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                ~{estimatedMins} min ({distanceKm} km)
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate mt-0.5">
              {target.name}
            </div>
            <div className="text-[11px] text-zinc-400 truncate font-medium">
              {target.address}
            </div>
          </div>

          {/* Direct 1-Tap Google Maps Turn-by-Turn GPS Button */}
          <button
            onClick={() => openGoogleMapsNavigation(target.lat, target.lng, target.name)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95 flex-shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Open Google Maps</span>
          </button>
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyConfig && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-zinc-200 animate-scaleUp text-zinc-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-900">Google Maps API Setup</h3>
              </div>
              <button 
                onClick={() => setShowKeyConfig(false)}
                className="text-xs text-zinc-400 hover:text-zinc-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 mb-3 leading-relaxed">
              Google Maps Interactive Live Embed is active by default. For custom 3D map styling and Directions API, enter your Google Cloud API key:
            </p>

            <input
              type="text"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 rounded-xl mb-3 focus:outline-none focus:border-orange-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyConfig(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-zinc-100 text-zinc-700"
              >
                Close
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/20"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoogleMapView;
