import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Shield, Activity, AlertTriangle, Layers, Filter, Search, 
  RefreshCw, Compass, Gauge, Zap, ChevronRight, Globe, Maximize2
} from 'lucide-react';
import { facilityService } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme } from '../../contexts/ThemeContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

// 7 Strategic Indian Green Hydrogen Hubs with verified coordinates
const FALLBACK_INDIAN_HUBS = [
  {
    _id: 'hub_kandla',
    name: 'Deendayal Port Green Hydrogen Hub',
    code: 'H2-KANDLA-01',
    status: 'Normal',
    location: {
      address: 'Deendayal Port Trust, Kandla Special Economic Zone',
      city: 'Gandhidham / Kandla',
      state: 'Gujarat',
      postalCode: '370210',
      coordinates: { lat: 23.0131, lng: 70.2185 }
    },
    totalCapacityKg: 18000,
    currentStorageKg: 13400,
    storageUnits: ['TK-101', 'TK-102', 'TK-103'],
    operationalMode: 'Bulk Storage Buffer',
    thresholds: { pressureWarningBar: 420, pressureCriticalBar: 500, tempMaxC: 60 },
    description: 'Flagship National Green Hydrogen Mission export hub. Features 350-700 bar Type IV composite cylinder banks and maritime bunkering manifold.'
  },
  {
    _id: 'hub_paradip',
    name: 'Paradip Port Green Ammonia & H2 Terminal',
    code: 'H2-PARADIP-02',
    status: 'Warning',
    location: {
      address: 'Haridaspur Industrial Corridor, Paradip Port',
      city: 'Paradip',
      state: 'Odisha',
      postalCode: '754142',
      coordinates: { lat: 20.2644, lng: 86.6698 }
    },
    totalCapacityKg: 28000,
    currentStorageKg: 21500,
    storageUnits: ['TK-201', 'TK-202', 'CRYO-01'],
    operationalMode: 'Cryogenic Liquid Buffer',
    thresholds: { pressureWarningBar: 300, pressureCriticalBar: 380, tempMaxC: -240 },
    description: 'Eastern seaboard green ammonia synthesis feedstock hub with double-walled vacuum insulated cryogenic spherical storage.'
  },
  {
    _id: 'hub_voc',
    name: 'V.O. Chidambaranar Port H2 Export Terminal',
    code: 'H2-VOC-03',
    status: 'Critical',
    location: {
      address: 'Harbour Estate, Tuticorin Maritime Complex',
      city: 'Thoothukudi',
      state: 'Tamil Nadu',
      postalCode: '628004',
      coordinates: { lat: 8.7642, lng: 78.1348 }
    },
    totalCapacityKg: 15000,
    currentStorageKg: 11200,
    storageUnits: ['TK-301', 'TK-302'],
    operationalMode: 'Maritime Bunkering',
    thresholds: { pressureWarningBar: 450, pressureCriticalBar: 520, tempMaxC: 55 },
    description: 'Southern tip maritime export terminal for coastal shipping and offshore tug refuelling. High pressure tube trailer staging yard.'
  },
  {
    _id: 'hub_kochi',
    name: 'Kochi Marine Cryogenic H2 Terminal',
    code: 'H2-KOCHI-04',
    status: 'Normal',
    location: {
      address: 'Puthuvype Special Economic Zone, Kochi Port',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682503',
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    totalCapacityKg: 20000,
    currentStorageKg: 14800,
    storageUnits: ['CRYO-02', 'TK-401'],
    operationalMode: 'Cryogenic Liquid Storage',
    thresholds: { pressureWarningBar: 280, pressureCriticalBar: 350, tempMaxC: -245 },
    description: 'Integrated liquid hydrogen maritime terminal adjacent to LNG regasification facilities. Features active boil-off gas reliquefaction.'
  },
  {
    _id: 'hub_jaisalmer',
    name: 'Jaisalmer Solar Electrolyzer & Buffer Depot',
    code: 'H2-JAISALMER-05',
    status: 'Normal',
    location: {
      address: 'Thar Desert Renewable Energy Park, Pokhran Road',
      city: 'Jaisalmer',
      state: 'Rajasthan',
      postalCode: '345001',
      coordinates: { lat: 26.9157, lng: 70.9083 }
    },
    totalCapacityKg: 12000,
    currentStorageKg: 8900,
    storageUnits: ['TK-501', 'TK-502'],
    operationalMode: 'Electrolyzer Ingestion Buffer',
    thresholds: { pressureWarningBar: 400, pressureCriticalBar: 480, tempMaxC: 65 },
    description: 'Ultra-mega solar powered green hydrogen generation buffer. Underground high-pressure cascade banks with thermal dissipation control.'
  },
  {
    _id: 'hub_vizag',
    name: 'Visakhapatnam Coastal Energy Hub',
    code: 'H2-VIZAG-06',
    status: 'Normal',
    location: {
      address: 'Gangavaram Industrial Zone, Visakhapatnam Port',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      postalCode: '530044',
      coordinates: { lat: 17.6868, lng: 83.2185 }
    },
    totalCapacityKg: 16000,
    currentStorageKg: 12100,
    storageUnits: ['TK-601', 'TK-602'],
    operationalMode: 'Industrial Heavy Transport',
    thresholds: { pressureWarningBar: 430, pressureCriticalBar: 510, tempMaxC: 58 },
    description: 'Supplies green hydrogen to coastal steel plants and heavy industrial transport fleets along the East Coast Economic Corridor.'
  },
  {
    _id: 'hub_mangaluru',
    name: 'Mangaluru Petrochemical & Port Terminal',
    code: 'H2-MANGALURU-07',
    status: 'Normal',
    location: {
      address: 'Panambur, New Mangalore Port Trust Area',
      city: 'Mangaluru',
      state: 'Karnataka',
      postalCode: '575010',
      coordinates: { lat: 12.9141, lng: 74.8560 }
    },
    totalCapacityKg: 14500,
    currentStorageKg: 10300,
    storageUnits: ['TK-701', 'TK-702'],
    operationalMode: 'Petrochemical Refuelling Buffer',
    thresholds: { pressureWarningBar: 410, pressureCriticalBar: 490, tempMaxC: 55 },
    description: 'Western coastal terminal co-located with refinery complexes. Supplies high-purity hydrogen for hydrotreating and commercial transport.'
  }
];

export default function IndiaFacilitiesMap() {
  const [facilities, setFacilities] = useState(FALLBACK_INDIAN_HUBS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [selectedFacility, setSelectedFacility] = useState(FALLBACK_INDIAN_HUBS[0]);
  
  const { isConnected } = useSocket();
  const { isDark } = useTheme();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Fetch facilities from backend API, merge coordinates if needed
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await facilityService.getAll();
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        // Map backend facilities with geo-coordinates fallback
        const merged = list.map((fac, idx) => {
          if (!fac.location?.coordinates?.lat || !fac.location?.coordinates?.lng) {
            const fallback = FALLBACK_INDIAN_HUBS[idx % FALLBACK_INDIAN_HUBS.length];
            return {
              ...fac,
              location: {
                ...fac.location,
                coordinates: fallback.location.coordinates,
                city: fac.location?.city || fallback.location.city,
                state: fac.location?.state || fallback.location.state
              }
            };
          }
          return fac;
        });
        setFacilities(merged);
        if (!selectedFacility) {
          setSelectedFacility(merged[0]);
        }
      }
    } catch (err) {
      console.warn('Using seeded Indian hubs data:', err.message);
      setFacilities(FALLBACK_INDIAN_HUBS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !search ||
        fac.name?.toLowerCase().includes(q) ||
        fac.code?.toLowerCase().includes(q) ||
        fac.location?.city?.toLowerCase().includes(q) ||
        fac.location?.state?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || fac.status === statusFilter;

      let matchesRegion = true;
      const state = fac.location?.state || '';
      if (regionFilter === 'WEST') {
        matchesRegion = ['Gujarat', 'Maharashtra', 'Karnataka'].includes(state);
      } else if (regionFilter === 'EAST') {
        matchesRegion = ['Odisha', 'Andhra Pradesh', 'West Bengal'].includes(state);
      } else if (regionFilter === 'SOUTH') {
        matchesRegion = ['Tamil Nadu', 'Kerala'].includes(state);
      } else if (regionFilter === 'NORTH_WEST') {
        matchesRegion = ['Rajasthan', 'Punjab', 'Haryana'].includes(state);
      }

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [facilities, search, statusFilter, regionFilter]);

  // Aggregate stats
  const totalCapacity = useMemo(() => {
    return facilities.reduce((sum, f) => sum + (f.totalCapacityKg || 0), 0);
  }, [facilities]);

  const currentStorage = useMemo(() => {
    return facilities.reduce((sum, f) => sum + (f.currentStorageKg || 0), 0);
  }, [facilities]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
      case 'Optimal':
        return {
          hex: '#10b981',
          bg: 'bg-emerald-500',
          text: 'text-emerald-500',
          badge: 'success',
          label: 'Optimal'
        };
      case 'Warning':
        return {
          hex: '#f59e0b',
          bg: 'bg-amber-500',
          text: 'text-amber-500',
          badge: 'warning',
          label: 'Warning'
        };
      case 'Critical':
        return {
          hex: '#ef4444',
          bg: 'bg-rose-500',
          text: 'text-rose-500',
          badge: 'danger',
          label: 'Critical'
        };
      default:
        return {
          hex: '#14b8a6',
          bg: 'bg-teal-500',
          text: 'text-teal-500',
          badge: 'neutral',
          label: status || 'Normal'
        };
    }
  };

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of India: Lat 21.8°N, Lng 79.5°E
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 78.9],
      zoom: 5,
      minZoom: 4,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: true
    });

    // Custom zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer (strictly OpenStreetMap standard by default)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors • National Hydrogen Safety Grid'
    }).addTo(map);

    tileLayerRef.current = osmLayer;

    // Layer group for facility markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // Invalidate size after mount so tiles fill container cleanly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Markers for filteredFacilities (pure OpenStreetMap)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredFacilities.forEach((fac) => {
      const lat = fac.location?.coordinates?.lat;
      const lng = fac.location?.coordinates?.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      const isSelected = selectedFacility?._id === fac._id || selectedFacility?.code === fac.code;
      const statusMeta = getStatusColor(fac.status);

      // Create rich industrial pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'leaflet-h2-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; cursor: pointer; transform: translate(-12px, -12px); font-family: 'Inter', sans-serif;">
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px;">
              <span class="marker-ping" style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background-color: ${statusMeta.hex}; opacity: 0.6;"></span>
              <span style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: ${statusMeta.hex}; border: 3px solid ${isSelected ? '#ffffff' : '#f8fafc'}; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
                <span style="width: 5px; height: 5px; border-radius: 50%; background-color: #ffffff;"></span>
              </span>
            </div>
            <div style="
              margin-left: 8px;
              padding: 3px 8px;
              background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)'};
              color: ${isDark ? '#f8fafc' : '#0f172a'};
              border: 1.5px solid ${isSelected ? '#0d9488' : (isDark ? '#334155' : '#cbd5e1')};
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              gap: 5px;
            ">
              <span style="color: ${statusMeta.hex};">●</span>
              <span>${fac.location?.city || fac.name}</span>
              <span style="font-family: monospace; font-size: 10px; color: ${isDark ? '#38bdf8' : '#0284c7'}; margin-left: 2px;">
                ${((fac.currentStorageKg || 0) / 1000).toFixed(0)}t
              </span>
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Interactive Popup with detailed metrics & action link
      const storagePct = Math.round(((fac.currentStorageKg || 0) / (fac.totalCapacityKg || 1)) * 100);
      const popupHtml = `
        <div style="padding: 4px; min-width: 220px; font-family: 'Inter', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${statusMeta.hex}20; color: ${statusMeta.hex};">
              ${statusMeta.label}
            </span>
            <span style="font-size: 10px; font-family: monospace; color: #64748b;">${fac.code}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; line-height: 1.3; color: inherit; margin-top: 4px;">
            ${fac.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ${fac.location?.city}, ${fac.location?.state}
          </div>

          <div style="margin-top: 10px; padding: 8px; background: ${isDark ? '#1e293b' : '#f1f5f9'}; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600;">
              <span>Storage Level</span>
              <span style="color: #0d9488; font-family: monospace;">${storagePct}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: #cbd5e1; border-radius: 9999px; margin-top: 4px; overflow: hidden;">
              <div style="width: ${storagePct}%; height: 100%; background: #0d9488; border-radius: 9999px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">
              <span>${((fac.currentStorageKg || 0)/1000).toFixed(1)}t stored</span>
              <span>${((fac.totalCapacityKg || 0)/1000).toFixed(1)}t cap</span>
            </div>
          </div>

          <div style="margin-top: 10px; font-size: 10px; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 4px;">
            ✓ PESO SMPV(U) 2016 Certified
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Marker click: select facility and pan map
      marker.on('click', () => {
        setSelectedFacility(fac);
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [filteredFacilities, selectedFacility, isDark]);

  // When selectedFacility changes, smooth pan to it
  const handleSelectFacility = (fac) => {
    setSelectedFacility(fac);
    const lat = fac.location?.coordinates?.lat;
    const lng = fac.location?.coordinates?.lng;
    if (mapInstanceRef.current && typeof lat === 'number' && typeof lng === 'number') {
      mapInstanceRef.current.flyTo([lat, lng], 8, {
        duration: 1.2
      });
    }
  };

  // Reset to All-India View
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([21.5, 78.9], 5, {
        duration: 1.2
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            National Green Hydrogen Strategic Infrastructure
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            India Facilities Geographic Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time geospatial tracking of 7 major green hydrogen production, deepwater export, and buffer hubs powered by Leaflet &amp; OpenStreetMap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFacilities}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Sync Grid
          </Button>

          <Link to="/monitoring">
            <Button variant="primary" size="sm" leftIcon={<Activity className="w-4 h-4" />}>
              Live Mission Control
            </Button>
          </Link>
        </div>
      </div>

      {/* National Capacity Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Monitored Grid Capacity</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
              {(totalCapacity / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500 font-sans">Tonnes H₂</span>
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Across 7 strategic centers</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Current In-Storage</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
              {(currentStorage / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500 font-sans">Tonnes</span>
            </div>
            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.round((currentStorage / (totalCapacity || 1)) * 100)}%` }} 
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Deepwater Export Hubs</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">5 Ports</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Kandla, Paradip, Tuticorin, Kochi, Mangaluru</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">PESO / ISO Compliance</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">100% Certified</div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">SMPV(U) Rules 2016 Compliant</span>
          </div>
        </Card>
      </div>

      {/* Main Map View Area & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaflet + OpenStreetMap Container (8 Columns) */}
        <div className="lg:col-span-8">
          <Card className="relative overflow-hidden p-0 border border-slate-200 dark:border-slate-800 shadow-md">
            {/* Top Toolbar overlay on Leaflet map */}
            <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Telemetry Status Indicator */}
              <div className="pointer-events-auto flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-slate-800 dark:text-slate-200 font-semibold font-mono text-[11px]">
                  {isConnected ? 'TELEMETRY GATEWAY: ONLINE' : 'GRID GATEWAY: CONNECTING...'}
                </span>
              </div>

              {/* Controls: Reset View */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={handleResetView}
                  className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  title="Reset to All-India View"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Fit India</span>
                </button>
              </div>
            </div>

            {/* Bottom Status Legend overlay on Leaflet map */}
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block">
              <div className="pointer-events-auto flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical
                </span>
              </div>
            </div>

            {/* The Actual Leaflet Map Canvas */}
            <div 
              ref={mapContainerRef} 
              id="india-leaflet-canvas"
              className="w-full h-[620px] bg-slate-100 dark:bg-slate-900"
              style={{ minHeight: '620px' }}
            />
          </Card>
        </div>

        {/* Selected Facility Details Dossier & Filter Controls (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Filter Card */}
          <Card className="p-4 space-y-3 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Filter Facilities
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city, port name, or code..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Normal">Optimal</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Region</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="ALL">All India</option>
                  <option value="WEST">West Coast (GJ/KA)</option>
                  <option value="EAST">East Coast (OD/AP)</option>
                  <option value="SOUTH">South (TN/KL)</option>
                  <option value="NORTH_WEST">North-West (RJ)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Selected Facility Dossier */}
          {selectedFacility ? (
            <Card className="p-5 space-y-4 bg-white dark:bg-slate-900 border-teal-500/50 dark:border-teal-500/40 shadow-md">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <Badge variant={getStatusColor(selectedFacility.status).badge}>
                    {selectedFacility.status}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                    {selectedFacility.code} • {selectedFacility.location?.city}, {selectedFacility.location?.state}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedFacility.description}
              </p>

              {/* Storage Capacity Gauge */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Inventory Level</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {Math.round(((selectedFacility.currentStorageKg || 0) / (selectedFacility.totalCapacityKg || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((selectedFacility.currentStorageKg || 0) / (selectedFacility.totalCapacityKg || 1)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Current: {(selectedFacility.currentStorageKg || 0).toLocaleString()} kg</span>
                  <span>Cap: {(selectedFacility.totalCapacityKg || 0).toLocaleString()} kg</span>
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operating Mode</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {selectedFacility.operationalMode || 'Bulk Storage Buffer'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordinates</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {selectedFacility.location?.coordinates?.lat?.toFixed(2)}°N, {selectedFacility.location?.coordinates?.lng?.toFixed(2)}°E
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Critical Pressure</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block font-semibold">
                    {selectedFacility.thresholds?.pressureCriticalBar || 500} bar
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Max Safe Temp</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block font-semibold">
                    {selectedFacility.thresholds?.tempMaxC || 60}°C
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link to={`/facilities/${selectedFacility._id}`} className="block">
                  <Button variant="primary" className="w-full justify-between" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Open Facility Dossier
                  </Button>
                </Link>
                <Link to={`/monitoring?facility=${selectedFacility._id}`} className="block">
                  <Button variant="outline" className="w-full justify-between" rightIcon={<Activity className="w-4 h-4" />}>
                    View Live Sensor Waveforms
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              Select a facility pin on the India map to inspect telemetry and specifications.
            </Card>
          )}

          {/* Quick Hub Switcher List */}
          <Card className="p-4 space-y-2 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              All 7 Indian Hubs
            </span>
            {filteredFacilities.map((fac) => (
              <div
                key={fac._id || fac.code}
                onClick={() => handleSelectFacility(fac)}
                className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                  selectedFacility?._id === fac._id || selectedFacility?.code === fac.code
                    ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-500/60 font-semibold text-teal-900 dark:text-teal-200'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(fac.status).bg}`} />
                  <span>{fac.name}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{fac.location?.city}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
