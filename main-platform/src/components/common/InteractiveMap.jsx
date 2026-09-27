import React, { useState } from 'react';
import { MapPin, Navigation, Store, Bike, Home, Layers, ExternalLink } from 'lucide-react';

export const InteractiveMap = ({
  center = { x: 50, y: 50 },
  merchants = [],
  riders = [],
  orders = [],
  activeOrderId = null,
  height = "340px",
  onSelectMarker
}) => {
  const [mapView, setMapView] = useState(() => {
    try {
      return localStorage.getItem('urban_interactive_map_view') || 'vector';
    } catch (e) {
      return 'vector';
    }
  });

  const handleToggleMapView = () => {
    setMapView(prev => {
      const next = prev === 'vector' ? 'google' : prev === 'google' ? 'satellite' : 'vector';
      try { localStorage.setItem('urban_interactive_map_view', next); } catch (e) {}
      return next;
    });
  };

  const activeOrder = orders.find(o => o.id === activeOrderId);

  const targetLat = activeOrder?.riderLat || 27.8048;
  const targetLng = activeOrder?.riderLng || 79.2882;

  // Static Ushait embed center URL so the iframe NEVER reloads or flickers on real-time GPS updates
  const stableEmbedUrl = React.useMemo(() => {
    return `https://maps.google.com/maps?q=27.8048,79.2882&t=${
      mapView === 'satellite' ? 'k' : 'm'
    }&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [mapView]);

  return (
    <div
      className="sim-map-container-light map-grid-bg-light relative w-full overflow-hidden select-none rounded-3xl"
      style={{ height }}
    >
      {/* Google Maps Embed Layer (Only rendered if user explicitly selects Google Maps) */}
      {mapView !== 'vector' && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#e2e8f0] pointer-events-auto">
          <iframe
            key={`map-frame-${mapView}`}
            title="Google Maps Live Tracking"
            src={stableEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
      {/* City Street Grid Vector Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
        <defs>
          <pattern id="city-roads-light" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 0 40 L 80 40 M 40 0 L 40 80" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
            <path d="M 0 10 L 80 10 M 10 0 L 10 80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <path d="M 0 70 L 80 70 M 70 0 L 70 80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          </pattern>
          <linearGradient id="routeOrangeLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#city-roads-light)" />

        {/* Dynamic Route Polyline strictly along city roads (No diagonal building cuts) */}
        {activeOrder && activeOrder.orderStatus !== 'delivered' && (
          <g>
            <path
              d={`M ${(activeOrder.merchantCoords?.x || 38) * 10} ${(activeOrder.merchantCoords?.y || 35) * 4} 
                  L ${(activeOrder.customerCoords?.x || 45) * 10} ${(activeOrder.merchantCoords?.y || 35) * 4} 
                  L ${(activeOrder.customerCoords?.x || 45) * 10} ${(activeOrder.customerCoords?.y || 42) * 4}`}
              fill="none"
              stroke="url(#routeOrangeLightGrad)"
              strokeWidth="5"
              strokeDasharray="6 4"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>

      {/* Merchant Markers */}
      {merchants.map((m) => {
        const isTarget = activeOrder && activeOrder.merchantId === m.id;
        const mX = m.coordinates?.x ?? m.coords_x ?? 40;
        const mY = m.coordinates?.y ?? m.coords_y ?? 40;

        return (
          <div
            key={m.id}
            onClick={() => onSelectMarker && onSelectMarker('merchant', m)}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 z-20 ${isTarget ? 'z-30' : ''}`}
            style={{ top: `${mY}%`, left: `${mX}%` }}
            title={m.name}
          >
            <div className={`relative p-2.5 rounded-2xl border flex items-center justify-center shadow-lg transition-all ${
              isTarget
                ? 'bg-[#f97316] border-white text-white scale-110 shadow-orange-500/40'
                : 'bg-white border-zinc-300 text-zinc-800 hover:border-orange-500 hover:text-[#f97316]'
            }`}>
              <Store className="w-4 h-4" />
              {isTarget && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[10px] whitespace-nowrap font-extrabold bg-white text-zinc-900 border border-zinc-200 shadow-md">
              {m.name?.split(' ')[0] || 'Store'}
            </span>
          </div>
        );
      })}

      {/* Customer Location Pin */}
      {activeOrder && activeOrder.orderStatus !== 'delivered' && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
          style={{
            top: `${activeOrder.customerCoords?.y ?? 42}%`,
            left: `${activeOrder.customerCoords?.x ?? 45}%`
          }}
        >
          <div className="relative p-2.5 rounded-2xl bg-emerald-600 text-white border-2 border-white shadow-xl flex items-center justify-center animate-bounce">
            <Home className="w-4 h-4" />
          </div>
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap font-black bg-emerald-700 text-white shadow-md">
            Destination
          </span>
        </div>
      )}

      {/* Active Riders Markers */}
      {riders.map((r) => {
        const isOrderRider = activeOrder && activeOrder.orderStatus !== 'delivered' && activeOrder.riderId === r.id;
        const coords = isOrderRider && activeOrder.riderCoords
          ? activeOrder.riderCoords
          : (r.coordinates || { x: r.coords_x ?? 50, y: r.coords_y ?? 50 });

        const rX = coords?.x ?? 50;
        const rY = coords?.y ?? 50;

        return (
          <div
            key={r.id}
            onClick={() => onSelectMarker && onSelectMarker('rider', r)}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-25 ${
              isOrderRider ? 'z-40 scale-125' : ''
            }`}
            style={{ top: `${rY}%`, left: `${rX}%` }}
            title={`${r.name} (${r.status})`}
          >
            {/* Orange Radar Pulse */}
            {isOrderRider && (
              <div className="absolute inset-0 -m-3.5 rounded-full bg-orange-500/25 radar-ring pointer-events-none" />
            )}

            <div className={`p-2.5 rounded-2xl border flex items-center justify-center shadow-xl ${
              isOrderRider
                ? 'bg-gradient-to-tr from-[#f97316] to-[#ea580c] border-white text-white shadow-orange-500/50 ring-2 ring-orange-300'
                : 'bg-white border-zinc-300 text-zinc-700'
            }`}>
              <Bike className="w-4 h-4" />
            </div>

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[9px] whitespace-nowrap font-extrabold bg-white text-zinc-900 border border-zinc-200 flex items-center gap-1 shadow-md">
              <span className={`w-1.5 h-1.5 rounded-full ${r.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {r.name?.split(' ')[0] || 'Rider'}
            </div>
          </div>
        );
      })}

      {/* Map Legend */}
      <div className="absolute top-3 left-3 flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/95 border border-zinc-200 text-[11px] shadow-sm z-20">
        <div className="flex items-center gap-1.5 text-[#ea580c] font-bold">
          <Store className="w-3.5 h-3.5" /> Kitchen
        </div>
        <div className="flex items-center gap-1.5 text-[#f97316] font-bold">
          <Bike className="w-3.5 h-3.5" /> Rider (Live)
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <Home className="w-3.5 h-3.5" /> Destination
        </div>
      </div>

      {/* Map Mode Switcher Top Right */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <button
          onClick={handleToggleMapView}
          className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-800 text-[10px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-orange-50 cursor-pointer transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-orange-500" />
          <span className="uppercase">{mapView === 'google' ? 'Google Maps' : mapView === 'satellite' ? 'Satellite' : 'Vector Map'}</span>
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`}
          target="_blank"
          rel="noreferrer"
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-700 hover:text-orange-600 flex items-center justify-center shadow-sm cursor-pointer"
          title="Open in Google Maps"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
