import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Activity, Compass, ArrowRight, Zap, CheckCircle2, AlertTriangle, 
  Layers, Lock, Database, Wrench, BarChart3, Sun, Moon, MapPin, ExternalLink, Cpu 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const hubs = [
    { name: 'Deendayal Port (Kandla)', state: 'Gujarat', type: 'High-Pressure 700 bar Type IV', status: 'Optimal' },
    { name: 'Paradip Port Terminal', state: 'Odisha', type: 'Cryogenic Liquid LH2 Sphere', status: 'Warning' },
    { name: 'V.O. Chidambaranar Port', state: 'Tamil Nadu', type: 'Maritime Bunkering Manifold', status: 'Critical' },
    { name: 'Kochi Marine Terminal', state: 'Kerala', type: 'Cryo-Liquid Deep Storage', status: 'Optimal' },
    { name: 'Jaisalmer Solar Buffer Depot', state: 'Rajasthan', type: 'Solar Electrolyzer Ingestion', status: 'Optimal' },
    { name: 'Visakhapatnam Corridor', state: 'Andhra Pradesh', type: 'Heavy Transport Buffer', status: 'Optimal' },
    { name: 'Mangaluru Petrochem Complex', state: 'Karnataka', type: 'Tube Trailer Manifold', status: 'Optimal' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-teal-600 via-sky-600 to-blue-600 text-white py-2 px-4 text-xs text-center font-medium shadow-xs">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <span>Aligned with Government of India's <strong>National Green Hydrogen Mission 2030</strong> &amp; PESO SMPV(U) Standards</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                HydroSentinel
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                India H₂ Grid
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Features</a>
            <Link to="/india-map" className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              <Compass className="w-4 h-4 text-teal-500" />
              <span>India Facilities Map</span>
            </Link>
            <a href="#standards" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Statutory Compliance</a>
            <a href="#architecture" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {user ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Mission Control
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Access Platform
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Zap className="w-3.5 h-3.5 text-teal-500" />
              Industrial IoT Telemetry &amp; Safety Compliance
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Hydrogen Storage Facility Monitoring &amp; Safety Platform
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Orchestrating high-pressure gaseous cylinder banks and cryogenic liquid (LH₂) storage facilities across India.
              Automating real-time telemetry ingestion, deterministic emergency alerts, preventive maintenance, and PESO/ISO statutory compliance.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/login"}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {user ? "Enter Mission Control Dashboard" : "Launch Mission Control (Demo Login)"}
                </Button>
              </Link>

              <Link to="/india-map">
                <Button variant="outline" size="lg" leftIcon={<Compass className="w-5 h-5 text-teal-500" />}>
                  Explore India Facilities Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">7 Hubs</div>
              <div className="text-xs uppercase font-medium text-slate-500 mt-1">Operational in India</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">123.5 T</div>
              <div className="text-xs uppercase font-medium text-slate-500 mt-1">Active H₂ Capacity</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">&lt; 5 min</div>
              <div className="text-xs uppercase font-medium text-slate-500 mt-1">Average Alarm MTTA</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">100%</div>
              <div className="text-xs uppercase font-medium text-slate-500 mt-1">PESO / ISO 19880 Aligned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive India Grid Teaser */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs uppercase font-semibold text-teal-600 dark:text-teal-400 tracking-wider">
                Geospatial Hydrogen Grid
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                India's National Green Hydrogen Network
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Deepwater maritime export terminals, industrial corridor buffers, and desert solar electrolysis depots
              </p>
            </div>

            <Link to="/india-map">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Full Interactive India Map
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hubs.map((hub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-teal-500/50 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {hub.name}
                    </h3>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                    hub.status === 'Optimal' ? 'bg-emerald-500' : hub.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">{hub.state}, India</div>
                <div className="text-xs text-slate-400 mt-0.5">{hub.type}</div>
              </div>
            ))}

            <Link to="/india-map" className="p-4 rounded-xl border-2 border-dashed border-teal-500/30 flex flex-col items-center justify-center text-center text-teal-600 dark:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-colors">
              <Compass className="w-6 h-6 mb-1" />
              <span className="font-semibold text-xs">View All 7 Hubs on Map</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Leaflet &amp; OpenStreetMap Geospatial Grid</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Technology Pillars */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              End-to-End Safety &amp; Monitoring Architecture
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Built specifically to mitigate the thermodynamic hazards of compressed and liquid hydrogen storage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Sensor Waveforms
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bi-directional WebSocket streaming of piezo pressure transducers (up to 700 bar), RTD thermocouples, and catalytic PPM leak sensors.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Recharts live time-series
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Synthetic multi-scenario simulator
                </li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Incident Triage &amp; SOP Dispatch
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic threshold detection across Warning and Critical bands with instant SOP emergency instructions for field technicians.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> MTTA &amp; MTTR tracking
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Auto-dispatched work orders
                </li>
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Preventive Maintenance &amp; Audits
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Digital task checklists, torque wrench verification logs, NIST-traceable calibration schedules, and interactive maintenance calendar.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> Technician digital sign-off
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> 8D CAPA resolution workflow
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Standards Alignment */}
      <section id="standards" className="py-16 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              National &amp; International Standards Alignment
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Engineered according to statutory safety guidelines for compressed and cryogenic hydrogen installations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-sm text-teal-600 dark:text-teal-400">PESO SMPV(U) Rules</div>
              <div className="text-slate-500 mt-1">Petroleum &amp; Explosives Safety Organisation, Govt of India (Static &amp; Mobile Pressure Vessels).</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-sm text-sky-600 dark:text-sky-400">ISO 19880-1:2020</div>
              <div className="text-slate-500 mt-1">Gaseous hydrogen fueling stations, leak mitigation, and overpressure relief geometry.</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-sm text-amber-600 dark:text-amber-400">NFPA 2: Hydrogen Code</div>
              <div className="text-slate-500 mt-1">Storage, piping, explosion venting distances, and cryogenic boil-off gas management.</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-sm text-purple-600 dark:text-purple-400">OSHA 1910.103</div>
              <div className="text-slate-500 mt-1">Mandatory occupational safety regulations for bulk hydrogen storage facilities.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">HydroSentinel Platform</span>
            <p className="mt-1">
              Final-Year Engineering Capstone Project • MERN Stack Architecture • Indian Green Hydrogen Grid
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/india-map" className="hover:text-teal-600 dark:hover:text-teal-400">India Map</Link>
            <Link to="/login" className="hover:text-teal-600 dark:hover:text-teal-400">Staff Login</Link>
            <Link to="/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
