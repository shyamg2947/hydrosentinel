# HydroSentinel Telemetry Simulation Engine Documentation

## 1. Overview
The **HydroSentinel Synthetic Telemetry Engine** runs as an event loop inside the Express server runtime (`server/src/simulator/telemetryEngine.js`). It continuously computes physical and environmental variables for all configured hydrogen storage units and mounted sensors across facilities, broadcasting updates via Socket.IO WebSocket rooms and persisting samples to MongoDB.

## 2. Physics & Failure Scenarios
The simulator features 5 selectable physics modes configured in `SimulatorConfiguration.js`:

| Scenario ID | Name | Thermodynamic & Signal Model | Injected Failure Dynamics |
| :--- | :--- | :--- | :--- |
| `NORMAL_OPERATION` | Nominal Operating Mode | Gaussian noise around base pressure (300-350 bar) and temperature (18-22°C). 0.0 ppm $H_2$. | None. Stable state with baseline vibrational micro-jitter. |
| `MINOR_LEAK` | Flange Seal Degradation | Incremental gas concentration climb (from 0 to >100 ppm) with subtle exponential pressure loss (decay $\approx 0.15$ bar/s). | Triggers Warning status on catalytic sensors; tests preventative dispatch. |
| `PRESSURE_SPIKE` | Compression Surge | Abrupt pressure escalation reaching >380 bar within 30 seconds. | Triggers Critical pressure threshold alarm; tests emergency triage workflow. |
| `THERMAL_RUNAWAY` | High Temperature Excursion | Vessel temperature rises towards 60°C due to cooling jacket failure or ambient fire exposure. | Triggers Critical thermal alarms and automatic SOP checklist prompt. |
| `SENSOR_DRIFT` | Transducer Calibration Drift | Systematic positive bias ($\approx 0.8\%$ per minute) on piezoelectric transducer signals. | Tests calibration interval verification and sensor drift flags. |

## 3. Data Flow & Socket.IO Topology
1. **Clock Tick**: Every $N$ seconds (default: 3s, configurable from 1s to 15s via `/settings`), the engine iterates across all active sensors in MongoDB.
2. **Value Synthesis**: Values are computed based on vessel storage type (Compressed Type IV, Cryo-Liquid LH2, or Buffer Manifold).
3. **Threshold Assessment**: The synthesized point is evaluated against `sensor.thresholds` (`warningHigh`, `criticalHigh`, `warningLow`, `criticalLow`).
4. **Broadcast**:
   - `telemetry:update`: Emitted to the facility room (`facility:{id}`).
   - `alert:new`: Emitted to `facility:{id}` if an unacknowledged alarm threshold is breached.
5. **Persistence & Pruning**: Readings are batch-saved to `Telemetry` collection with auto-capping to prevent unbounded database growth during extended testing.
