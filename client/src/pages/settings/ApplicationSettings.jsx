import React, { useState, useEffect } from 'react';
import { 
  Settings, Play, Square, FastForward, AlertTriangle, ShieldAlert, Cpu, Activity, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { simulatorService } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import SimulationBanner from '../../components/SimulationBanner';

export default function ApplicationSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchSimulatorState = async () => {
    try {
      setLoading(true);
      const res = await simulatorService.getStatus();
      setConfig(res.data?.data || null);
    } catch (err) {
      console.error('Failed to get simulator state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulatorState();
  }, []);

  const handleToggleRunning = async () => {
    try {
      setUpdating(true);
      const newStatus = !config?.isRunning;
      const res = await simulatorService.toggleRunning({ isRunning: newStatus });
      setConfig(res.data?.data || { ...config, isRunning: newStatus });
      setFeedback({ type: 'success', message: `Simulator ${newStatus ? 'Started' : 'Halted'} successfully.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update simulator state' });
    } finally {
      setUpdating(false);
    }
  };

  const handleScenarioChange = async (scenario) => {
    try {
      setUpdating(true);
      const res = await simulatorService.updateScenario({ scenario });
      setConfig(res.data?.data || { ...config, scenario });
      setFeedback({ type: 'success', message: `Active physics scenario switched to: ${scenario}` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to switch scenario' });
    } finally {
      setUpdating(false);
    }
  };

  const handleTickRateChange = async (tickRateSeconds) => {
    try {
      setUpdating(true);
      const res = await simulatorService.updateTickRate({ tickRateSeconds: Number(tickRateSeconds) });
      setConfig(res.data?.data || { ...config, tickRateSeconds: Number(tickRateSeconds) });
      setFeedback({ type: 'success', message: `Sampling interval updated to ${tickRateSeconds} seconds.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update sampling rate' });
    } finally {
      setUpdating(false);
    }
  };

  const scenarios = [
    {
      id: 'NORMAL_OPERATION',
      name: 'Normal Nominal Operation',
      description: 'Pressures fluctuate naturally within safe operating band (300-350 bar). Zero hydrogen PPM detected.',
      badge: 'success'
    },
    {
      id: 'MINOR_LEAK',
      name: 'Simulated Flange Leak',
      description: 'Progressive hydrogen gas concentration rise (>100 PPM) with subtle pressure decay over time.',
      badge: 'warning'
    },
    {
      id: 'PRESSURE_SPIKE',
      name: 'Rapid Pressure Spike (Compression Surge)',
      description: 'Acute pressure escalation breaching critical limit (>380 bar). Triggers emergency threshold alarms.',
      badge: 'danger'
    },
    {
      id: 'THERMAL_RUNAWAY',
      name: 'High Temperature Excursion',
      description: 'Ambient/storage unit temperature escalates beyond 55°C, mimicking ambient fire exposure or cooling failure.',
      badge: 'danger'
    },
    {
      id: 'SENSOR_DRIFT',
      name: 'Sensor Calibration Drift',
      description: 'Transducer signals slowly deviate from ground truth, testing calibration warning flags.',
      badge: 'info'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Simulator & System Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure the Node.js synthetic telemetry engine, active scenario injectors, and alert threshold tolerances
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchSimulatorState} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh State
        </Button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      {/* Safety Boundary Notice */}
      <SimulationBanner />

      {/* Engine Status Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${
              config?.isRunning 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}>
              <Activity className={`w-8 h-8 ${config?.isRunning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Synthetic Telemetry Engine
                </h3>
                <Badge variant={config?.isRunning ? 'success' : 'outline'}>
                  {config?.isRunning ? 'GENERATING SENSOR STREAM' : 'HALTED'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Broadcasts simulated physics telemetry via WebSocket rooms every {config?.tickRateSeconds || 3} seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={config?.isRunning ? 'danger' : 'primary'}
              size="md"
              loading={updating}
              onClick={handleToggleRunning}
              leftIcon={config?.isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {config?.isRunning ? 'Stop Simulator' : 'Start Simulator'}
            </Button>
          </div>
        </div>

        {/* Sampling Interval Slider */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Telemetry Ticking Interval: <span className="font-mono text-blue-600 dark:text-blue-400">{config?.tickRateSeconds || 3} seconds</span>
            </label>
            <span className="text-xs text-slate-400">Lower = higher stream frequency</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">1s</span>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={config?.tickRateSeconds || 3}
              onChange={(e) => handleTickRateChange(e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">15s</span>
          </div>
        </div>
      </Card>

      {/* Scenarios Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Physics & Failure Scenarios
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Select an active physics condition to inject synthetic anomalies and test alarm triage response
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((sc) => {
            const isActive = config?.scenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleScenarioChange(sc.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-600 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {sc.name}
                    </h4>
                  </div>
                  <Badge variant={sc.badge}>{sc.id}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {sc.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className={`font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {isActive ? 'Active Scenario' : 'Click to Inject'}
                  </span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety SOP Notice */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Standard Operating Procedure Compliance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          HydroSentinel operates under compliance guidelines aligned with ISO 19880-1:2020 (Gaseous hydrogen fueling stations),
          NFPA 2 (Hydrogen Technologies Code), and OSHA 1910.103. In accordance with safety policies, all actuator actions
          must be executed by qualified on-site personnel using physical lock-out/tag-out (LOTO) protocols.
        </p>
      </Card>
    </div>
  );
}
