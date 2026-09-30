import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../src/models/User.js';
import Facility from '../src/models/Facility.js';
import StorageUnit from '../src/models/StorageUnit.js';
import Sensor from '../src/models/Sensor.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';
import WorkOrder from '../src/models/WorkOrder.js';
import MaintenanceTemplate from '../src/models/MaintenanceTemplate.js';
import ComplianceChecklist from '../src/models/ComplianceChecklist.js';
import ComplianceRecord from '../src/models/ComplianceRecord.js';
import SafetyDocument from '../src/models/SafetyDocument.js';
import CorrectiveAction from '../src/models/CorrectiveAction.js';
import Notification from '../src/models/Notification.js';
import AuditLog from '../src/models/AuditLog.js';
import SimulatorConfiguration from '../src/models/SimulatorConfiguration.js';
import { ROLES, ALERT_SEVERITIES, ALERT_STATUSES, WORK_ORDER_STATUSES } from '../src/config/constants.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hydrosentinel';
    console.log(`[Seed Script] Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script] Purging existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Facility.deleteMany({}),
      StorageUnit.deleteMany({}),
      Sensor.deleteMany({}),
      Telemetry.deleteMany({}),
      Alert.deleteMany({}),
      WorkOrder.deleteMany({}),
      MaintenanceTemplate.deleteMany({}),
      ComplianceChecklist.deleteMany({}),
      ComplianceRecord.deleteMany({}),
      SafetyDocument.deleteMany({}),
      CorrectiveAction.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      SimulatorConfiguration.deleteMany({})
    ]);

    console.log('[Seed Script] Creating 7 Indian Green Hydrogen Facilities...');
    const facilities = await Facility.create([
      {
        name: 'Deendayal Port Green Hydrogen Hub',
        code: 'H2-KANDLA-01',
        location: {
          address: 'Kandla Special Economic Zone, Port Operational Area',
          city: 'Gandhidham / Kandla',
          state: 'Gujarat',
          country: 'India',
          coordinates: { lat: 23.0131, lng: 70.2185 }
        },
        description: 'Flagship National Green Hydrogen Mission export hub. Features 350-700 bar Type IV composite cylinder banks and maritime bunkering manifold.',
        status: 'Normal',
        totalCapacityKg: 18000,
        currentStorageKg: 13400,
        operationalMode: 'Bulk Storage Buffer',
        thresholds: {
          pressureWarningBar: 450,
          pressureCriticalBar: 500,
          tempMinC: -20,
          tempMaxC: 60,
          leakWarningPpm: 400,
          leakCriticalPpm: 1000
        },
        contacts: [
          { name: 'Vikramaditya Patel', role: 'Port Operations Director', phone: '+91-2836-255010', email: 'manager@hydrosentinel.io' },
          { name: 'Dr. Priya Sharma', role: 'Chief Safety Officer', phone: '+91-2836-255012', email: 'safety@hydrosentinel.io' }
        ],
        lastAuditDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'Paradip Port Green Ammonia & H2 Hub',
        code: 'H2-PARADIP-02',
        location: {
          address: 'Marine Drive Coastal Industrial Corridor',
          city: 'Paradip',
          state: 'Odisha',
          country: 'India',
          coordinates: { lat: 20.2644, lng: 86.6698 }
        },
        description: 'East coast deepwater cryogenic liquid hydrogen and green ammonia synthesis buffer facility for industrial export.',
        status: 'Warning',
        totalCapacityKg: 28000,
        currentStorageKg: 21500,
        operationalMode: 'Bulk Storage Buffer',
        thresholds: {
          pressureWarningBar: 25,
          pressureCriticalBar: 32,
          tempMinC: -253,
          tempMaxC: -230,
          leakWarningPpm: 350,
          leakCriticalPpm: 900
        },
        contacts: [
          { name: 'Ananya Mohanty', role: 'Terminal Manager', phone: '+91-6722-222144', email: 'ananya.mohanty@paradip.in' }
        ],
        lastAuditDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'V.O. Chidambaranar Port H2 Valley',
        code: 'H2-VOC-03',
        location: {
          address: 'Harbour Estate, Tuticorin Port Zone',
          city: 'Thoothukudi',
          state: 'Tamil Nadu',
          country: 'India',
          coordinates: { lat: 8.7642, lng: 78.1348 }
        },
        description: 'Southern Maritime Hydrogen Corridor hub supporting offshore bunkering and heavy transport fuel cell dispensing.',
        status: 'Critical',
        totalCapacityKg: 15000,
        currentStorageKg: 11200,
        operationalMode: 'Active Dispensing',
        thresholds: {
          pressureWarningBar: 420,
          pressureCriticalBar: 480,
          tempMinC: -15,
          tempMaxC: 55,
          leakWarningPpm: 400,
          leakCriticalPpm: 1000
        },
        contacts: [
          { name: 'K. Senthil Kumar', role: 'Plant Supervisor', phone: '+91-461-2352290', email: 'senthil.kumar@vocport.in' }
        ],
        lastAuditDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'Kochi Marine Cryogenic H2 Terminal',
        code: 'H2-KOCHI-04',
        location: {
          address: 'Willingdon Island Port Approach Road',
          city: 'Kochi',
          state: 'Kerala',
          country: 'India',
          coordinates: { lat: 9.9312, lng: 76.2673 }
        },
        description: 'Cryogenic liquid hydrogen terminal designed for coastal shipping, naval hydrogen fuel cells, and inland waterway vessels.',
        status: 'Normal',
        totalCapacityKg: 20000,
        currentStorageKg: 14800,
        operationalMode: 'Standby Hold',
        thresholds: {
          pressureWarningBar: 28,
          pressureCriticalBar: 35,
          tempMinC: -253,
          tempMaxC: -235,
          leakWarningPpm: 300,
          leakCriticalPpm: 800
        },
        contacts: [
          { name: 'Mathew Varghese', role: 'Marine Superintendent', phone: '+91-484-2666411', email: 'mathew.v@cochinport.in' }
        ],
        lastAuditDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'Jaisalmer Solar Electrolyzer Buffer Depot',
        code: 'H2-JAISALMER-05',
        location: {
          address: 'Thar Solar Energy Park Complex, Zone 4',
          city: 'Jaisalmer',
          state: 'Rajasthan',
          country: 'India',
          coordinates: { lat: 26.9157, lng: 70.9083 }
        },
        description: 'Ultra-high capacity solar-powered PEM electrolyzer generation and buffer storage facility in the Thar desert solar corridor.',
        status: 'Normal',
        totalCapacityKg: 12000,
        currentStorageKg: 8900,
        operationalMode: 'Electrolyzer Ingestion',
        thresholds: {
          pressureWarningBar: 450,
          pressureCriticalBar: 520,
          tempMinC: -10,
          tempMaxC: 65,
          leakWarningPpm: 400,
          leakCriticalPpm: 1000
        },
        contacts: [
          { name: 'Rajendra Singh Bhati', role: 'Solar-H2 Operations Lead', phone: '+91-2992-251140', email: 'r.singh@tharenergy.in' }
        ],
        lastAuditDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'Visakhapatnam Coastal Energy Corridor',
        code: 'H2-VIZAG-06',
        location: {
          address: 'Gajuwaka Industrial Belt, Port Road',
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          country: 'India',
          coordinates: { lat: 17.6868, lng: 83.2185 }
        },
        description: 'Heavy industrial green hydrogen buffer supplying steel plants, petrochemical complexes, and East Coast freight corridors.',
        status: 'Normal',
        totalCapacityKg: 16000,
        currentStorageKg: 12100,
        operationalMode: 'Active Dispensing',
        thresholds: {
          pressureWarningBar: 430,
          pressureCriticalBar: 490,
          tempMinC: -15,
          tempMaxC: 58,
          leakWarningPpm: 380,
          leakCriticalPpm: 950
        },
        contacts: [
          { name: 'S. Ramachandra Raju', role: 'Regional Safety Inspector', phone: '+91-891-2564880', email: 'raju.s@vizagport.in' }
        ],
        lastAuditDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      },
      {
        name: 'Mangaluru Petrochemical & Hydrogen Complex',
        code: 'H2-MANGALURU-07',
        location: {
          address: 'Panambur Harbour Zone, Industrial Gate 3',
          city: 'Mangaluru',
          state: 'Karnataka',
          country: 'India',
          coordinates: { lat: 12.9141, lng: 74.8560 }
        },
        description: 'Coastal refinery integration facility with high-pressure tube trailer manifolds and solid-state metal hydride buffer.',
        status: 'Normal',
        totalCapacityKg: 14500,
        currentStorageKg: 10300,
        operationalMode: 'Bulk Storage Buffer',
        thresholds: {
          pressureWarningBar: 440,
          pressureCriticalBar: 500,
          tempMinC: -20,
          tempMaxC: 60,
          leakWarningPpm: 400,
          leakCriticalPpm: 1000
        },
        contacts: [
          { name: 'Girish Shenoy', role: 'Refinery Integration Lead', phone: '+91-824-2407221', email: 'shenoy.g@nmpt.in' }
        ],
        lastAuditDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        lastTelemetryTimestamp: new Date()
      }
    ]);

    const [facKandla, facParadip, facTuticorin, facKochi, facJaisalmer, facVizag, facMangaluru] = facilities;

    console.log('[Seed Script] Creating Personnel Credentials...');
    const defaultPassword = 'Hydrogen@2026';

    const users = await User.create([
      {
        name: 'Elena Vance',
        email: 'admin@hydrosentinel.io',
        password: defaultPassword,
        role: ROLES.SUPER_ADMIN,
        department: 'National Operations & Safety Command',
        phone: '+91-11-2309-4001',
        assignedFacilities: facilities.map(f => f._id),
        notificationPreferences: { emailAlerts: true, criticalOnly: false, soundEnabled: false }
      },
      {
        name: 'Vikramaditya Patel',
        email: 'manager@hydrosentinel.io',
        password: defaultPassword,
        role: ROLES.FACILITY_MANAGER,
        department: 'West Coast Operations',
        phone: '+91-2836-255010',
        assignedFacilities: [facKandla._id, facJaisalmer._id, facMangaluru._id],
        notificationPreferences: { emailAlerts: true, criticalOnly: false, soundEnabled: true }
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'safety@hydrosentinel.io',
        password: defaultPassword,
        role: ROLES.SAFETY_OFFICER,
        department: 'Safety & Compliance Directorate (PESO/ISO)',
        phone: '+91-11-2309-4050',
        assignedFacilities: facilities.map(f => f._id),
        notificationPreferences: { emailAlerts: true, criticalOnly: false, soundEnabled: true }
      },
      {
        name: 'Rajesh Nair',
        email: 'tech@hydrosentinel.io',
        password: defaultPassword,
        role: ROLES.MAINTENANCE_TECH,
        department: 'Field Engineering & Instrumentation',
        phone: '+91-484-2666490',
        assignedFacilities: [facKandla._id, facTuticorin._id, facKochi._id],
        notificationPreferences: { emailAlerts: true, criticalOnly: true, soundEnabled: false }
      },
      {
        name: 'Arjun Das',
        email: 'viewer@hydrosentinel.io',
        password: defaultPassword,
        role: ROLES.VIEWER,
        department: 'Regulatory Compliance Audit Board',
        phone: '+91-11-2309-4099',
        assignedFacilities: [facKandla._id, facParadip._id],
        notificationPreferences: { emailAlerts: false, criticalOnly: true, soundEnabled: false }
      }
    ]);

    const [adminUser, managerUser, safetyUser, techUser, viewerUser] = users;

    console.log('[Seed Script] Creating Storage Units...');
    const storageUnits = await StorageUnit.create([
      // Kandla units
      {
        facility: facKandla._id,
        unitId: 'SU-KAN-01',
        name: 'High-Pressure Type IV Cylinder Bank 01',
        type: 'High-Pressure Type IV Cylinder Bank',
        volumeM3: 40,
        maxWorkingPressureBar: 500,
        currentStorageKg: 4800,
        status: 'Normal',
        commissionDate: new Date('2023-04-15'),
        lastInspectedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        facility: facKandla._id,
        unitId: 'SU-KAN-02',
        name: 'High-Pressure Type IV Cylinder Bank 02',
        type: 'High-Pressure Type IV Cylinder Bank',
        volumeM3: 40,
        maxWorkingPressureBar: 500,
        currentStorageKg: 4600,
        status: 'Normal',
        commissionDate: new Date('2023-04-15'),
        lastInspectedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        facility: facKandla._id,
        unitId: 'SU-KAN-03',
        name: 'Metal Hydride Solid Storage Buffer',
        type: 'Metal Hydride Solid Storage Tank',
        volumeM3: 25,
        maxWorkingPressureBar: 60,
        currentStorageKg: 4000,
        status: 'Normal',
        commissionDate: new Date('2024-01-10'),
        lastInspectedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      },
      // Paradip units
      {
        facility: facParadip._id,
        unitId: 'SU-PDP-01',
        name: 'Cryogenic Liquid LH2 Vessel Alpha',
        type: 'Cryogenic Liquid LH2 Vessel',
        volumeM3: 140,
        maxWorkingPressureBar: 35,
        currentStorageKg: 12500,
        status: 'Warning',
        commissionDate: new Date('2022-09-20'),
        lastInspectedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        facility: facParadip._id,
        unitId: 'SU-PDP-02',
        name: 'Cryogenic Liquid LH2 Vessel Beta',
        type: 'Cryogenic Liquid LH2 Vessel',
        volumeM3: 110,
        maxWorkingPressureBar: 35,
        currentStorageKg: 9000,
        status: 'Normal',
        commissionDate: new Date('2022-09-20'),
        lastInspectedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      // Tuticorin units
      {
        facility: facTuticorin._id,
        unitId: 'SU-VOC-01',
        name: 'High Pressure Marine Dispensing Buffer',
        type: 'High-Pressure Type IV Cylinder Bank',
        volumeM3: 30,
        maxWorkingPressureBar: 450,
        currentStorageKg: 5800,
        status: 'Critical',
        commissionDate: new Date('2023-06-10'),
        lastInspectedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        facility: facTuticorin._id,
        unitId: 'SU-VOC-02',
        name: 'Maritime Bunkering Buffer Manifold',
        type: 'Underground Cavern Buffer Module',
        volumeM3: 32,
        maxWorkingPressureBar: 450,
        currentStorageKg: 5400,
        status: 'Normal',
        commissionDate: new Date('2023-06-10'),
        lastInspectedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      // Kochi units
      {
        facility: facKochi._id,
        unitId: 'SU-KCH-01',
        name: 'Naval Cryogenic LH2 Sphere',
        type: 'Cryogenic Liquid LH2 Vessel',
        volumeM3: 120,
        maxWorkingPressureBar: 35,
        currentStorageKg: 10000,
        status: 'Normal',
        commissionDate: new Date('2024-02-15'),
        lastInspectedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      // Jaisalmer units
      {
        facility: facJaisalmer._id,
        unitId: 'SU-JAI-01',
        name: 'Solar PEM Electrolyzer Buffer Cylinder Pack',
        type: 'High-Pressure Type IV Cylinder Bank',
        volumeM3: 35,
        maxWorkingPressureBar: 520,
        currentStorageKg: 8900,
        status: 'Normal',
        commissionDate: new Date('2024-03-01'),
        lastInspectedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]);

    const [uKan01, uKan02, uKan03, uPdp01, uPdp02, uVoc01, uVoc02, uKch01, uJai01] = storageUnits;

    console.log('[Seed Script] Creating Industrial Sensor Transducers...');
    const sensors = await Sensor.create([
      // Kandla Unit 1 sensors
      {
        sensorId: 'SEN-KAN-PT-01',
        name: 'Vessel 01 Primary Piezo Pressure Transducer',
        type: 'Pressure',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        model: 'WIKA IS-3 Intrinsically Safe',
        serialNumber: 'SN-WIK-882104',
        unit: 'bar',
        rangeMin: 0,
        rangeMax: 600,
        warningHigh: 450,
        criticalHigh: 500,
        warningLow: 50,
        criticalLow: 20,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        locationDescription: 'Cylinder Bank 01 Top Manifold Discharge'
      },
      {
        sensorId: 'SEN-KAN-TT-01',
        name: 'Vessel 01 Skin RTD Thermocouple',
        type: 'Temperature',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        model: 'Yokogawa YTA70 ATEX/PESO Certified',
        serialNumber: 'SN-YOK-441098',
        unit: '°C',
        rangeMin: -50,
        rangeMax: 100,
        warningHigh: 50,
        criticalHigh: 60,
        warningLow: -20,
        criticalLow: -40,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        locationDescription: 'Cylinder Bank 01 Exterior Mid-Skin'
      },
      {
        sensorId: 'SEN-KAN-GD-01',
        name: 'Manifold Catalytic Bead Hydrogen Gas Detector',
        type: 'Hydrogen Leak',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        model: 'Honeywell Sensepoint XCD H2',
        serialNumber: 'SN-HON-993812',
        unit: 'ppm',
        rangeMin: 0,
        rangeMax: 40000,
        warningHigh: 400,
        criticalHigh: 1000,
        warningLow: 0,
        criticalLow: 0,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        locationDescription: 'Cylinder Bank 01 Overhead Ceiling Canopy'
      },
      {
        sensorId: 'SEN-KAN-PT-02',
        name: 'Vessel 02 Secondary Pressure Transducer',
        type: 'Pressure',
        facility: facKandla._id,
        storageUnit: uKan02._id,
        model: 'WIKA IS-3 Intrinsically Safe',
        serialNumber: 'SN-WIK-882109',
        unit: 'bar',
        rangeMin: 0,
        rangeMax: 600,
        warningHigh: 450,
        criticalHigh: 500,
        warningLow: 50,
        criticalLow: 20,
        status: 'Calibration Overdue',
        lastCalibrationDate: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        locationDescription: 'Cylinder Bank 02 Top Manifold'
      },
      // Paradip Cryogenic sensor
      {
        sensorId: 'SEN-PDP-PT-01',
        name: 'Cryo Vessel Alpha Head Pressure Sensor',
        type: 'Pressure',
        facility: facParadip._id,
        storageUnit: uPdp01._id,
        model: 'Emerson Rosemount 3051S Cryo',
        serialNumber: 'SN-EME-110294',
        unit: 'bar',
        rangeMin: 0,
        rangeMax: 50,
        warningHigh: 25,
        criticalHigh: 32,
        warningLow: 8,
        criticalLow: 5,
        status: 'Warning',
        lastCalibrationDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000),
        locationDescription: 'Dome Vapour Space Port'
      },
      {
        sensorId: 'SEN-PDP-TT-01',
        name: 'Cryo Vessel Alpha Liquid Core Platinum RTD',
        type: 'Temperature',
        facility: facParadip._id,
        storageUnit: uPdp01._id,
        model: 'Lake Shore Cryotronics PT-100',
        serialNumber: 'SN-LSC-773019',
        unit: '°C',
        rangeMin: -260,
        rangeMax: 20,
        warningHigh: -230,
        criticalHigh: -210,
        warningLow: -255,
        criticalLow: -258,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 135 * 24 * 60 * 60 * 1000),
        locationDescription: 'Liquid Level 20% Submerged Well'
      },
      // Tuticorin sensors
      {
        sensorId: 'SEN-VOC-PT-01',
        name: 'Bunkering Dispenser Line Piezo Transducer',
        type: 'Pressure',
        facility: facTuticorin._id,
        storageUnit: uVoc01._id,
        model: 'Keller PA-23SY High Pressure',
        serialNumber: 'SN-KEL-402911',
        unit: 'bar',
        rangeMin: 0,
        rangeMax: 700,
        warningHigh: 420,
        criticalHigh: 480,
        warningLow: 40,
        criticalLow: 15,
        status: 'Critical',
        lastCalibrationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
        locationDescription: 'Marine Loading Arm Breakaway Coupler'
      },
      {
        sensorId: 'SEN-VOC-GD-01',
        name: 'Bunkering Skid Electrochemical H2 Gas Sniffer',
        type: 'Hydrogen Leak',
        facility: facTuticorin._id,
        storageUnit: uVoc01._id,
        model: 'Dräger Polytron 8000',
        serialNumber: 'SN-DRA-550183',
        unit: 'ppm',
        rangeMin: 0,
        rangeMax: 20000,
        warningHigh: 400,
        criticalHigh: 1000,
        warningLow: 0,
        criticalLow: 0,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        locationDescription: 'Dispensing Sump Lower Drainage Trench'
      },
      // Jaisalmer sensor
      {
        sensorId: 'SEN-JAI-PT-01',
        name: 'Desert Solar Ingestion Buffer Pressure Transducer',
        type: 'Pressure',
        facility: facJaisalmer._id,
        storageUnit: uJai01._id,
        model: 'WIKA IS-3 Intrinsically Safe',
        serialNumber: 'SN-WIK-994411',
        unit: 'bar',
        rangeMin: 0,
        rangeMax: 600,
        warningHigh: 450,
        criticalHigh: 520,
        warningLow: 40,
        criticalLow: 15,
        status: 'Active',
        lastCalibrationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
        locationDescription: 'Solar PEM Electrolyzer Compression Output'
      }
    ]);

    const [sKanPt01, sKanTt01, sKanGd01, sKanPt02, sPdpPt01, sPdpTt01, sVocPt01, sVocGd01, sJaiPt01] = sensors;

    console.log('[Seed Script] Seeding Historical Telemetry Points...');
    const telemetryRecords = [];
    const now = Date.now();

    // Generate 48 hours of time-series points for Kandla sensors
    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      const basePressure = 340 + Math.sin(i / 4) * 15 + (Math.random() * 4 - 2);
      const baseTemp = 24 + Math.sin(i / 6) * 5 + (Math.random() * 1.5 - 0.75);

      telemetryRecords.push({
        sensor: sKanPt01._id,
        sensorId: sKanPt01.sensorId,
        sensorType: 'Pressure',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        value: Number(basePressure.toFixed(2)),
        unit: 'bar',
        status: 'Normal',
        timestamp,
        isSimulated: true,
        rawQuality: 'Good'
      });

      telemetryRecords.push({
        sensor: sKanTt01._id,
        sensorId: sKanTt01.sensorId,
        sensorType: 'Temperature',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        value: Number(baseTemp.toFixed(2)),
        unit: '°C',
        status: 'Normal',
        timestamp,
        isSimulated: true,
        rawQuality: 'Good'
      });

      telemetryRecords.push({
        sensor: sKanGd01._id,
        sensorId: sKanGd01.sensorId,
        sensorType: 'Hydrogen Leak',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        value: i === 3 ? 120 : (Math.random() > 0.8 ? Math.floor(Math.random() * 15) : 0),
        unit: 'ppm',
        status: 'Normal',
        timestamp,
        isSimulated: true,
        rawQuality: 'Good'
      });
    }

    await Telemetry.insertMany(telemetryRecords);

    console.log('[Seed Script] Creating Safety Incident Alerts...');
    const alerts = await Alert.create([
      {
        facility: facKandla._id,
        storageUnit: uKan01._id,
        sensor: sKanGd01._id,
        title: 'Fugitive Gas Leak Alert on Manifold Canopy',
        description: 'Hydrogen gas concentration exceeded warning threshold (425 ppm vs 400 ppm limit) near Kandla port canopy.',
        category: 'Leak Detected',
        severity: ALERT_SEVERITIES.WARNING,
        status: ALERT_STATUSES.ACKNOWLEDGED,
        triggeredValue: 425,
        thresholdValue: 400,
        unit: 'ppm',
        sopCode: 'SOP-H2-EMG-01',
        sopTitle: 'Minor Gaseous Hydrogen Fugitive Emission Isolation',
        sopSteps: [
          'Verify atmospheric gas reading via portable intrinsically safe FID detector.',
          'Identify manifold flanged connections and test with certified soapy bubble surfactant.',
          'Torque flange bolts to 85 Nm according to ASME B31.12 guidelines.',
          'Re-verify gas reading has decreased below 50 ppm background baseline.'
        ],
        acknowledgedBy: safetyUser._id,
        acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
      },
      {
        facility: facTuticorin._id,
        storageUnit: uVoc01._id,
        sensor: sVocPt01._id,
        title: 'Overpressure Critical Breach on Marine Dispenser Line',
        description: 'Overpressure condition on Tuticorin Marine Loading Arm (488 bar vs 480 bar critical limit).',
        category: 'Pressure Exceeded',
        severity: ALERT_SEVERITIES.CRITICAL,
        status: ALERT_STATUSES.NEW,
        triggeredValue: 488,
        thresholdValue: 480,
        unit: 'bar',
        sopCode: 'SOP-H2-EMG-02',
        sopTitle: 'Acute Hydrogen Storage Overpressure & Emergency Venting Protocol',
        sopSteps: [
          'Sound audible zone alarm: Area 2 Tuticorin Berth.',
          'Halt all marine bunkering and disconnect dispenser emergency dry-break couplers.',
          'Verify mechanical pressure relief valve PRV-101 has actuated to vent stack.',
          'Dispatch senior maintenance technician for nitrogen purge circuit inspection.'
        ],
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        facility: facParadip._id,
        storageUnit: uPdp01._id,
        sensor: sPdpPt01._id,
        title: 'Cryogenic Vessel Vapour Space Boil-Off Pressure Elevated',
        description: 'Cryogenic vessel vapour space boil-off pressure elevated during coastal heatwave.',
        category: 'Pressure Exceeded',
        severity: ALERT_SEVERITIES.WARNING,
        status: ALERT_STATUSES.RESOLVED,
        triggeredValue: 26.8,
        thresholdValue: 25.0,
        unit: 'bar',
        sopCode: 'SOP-H2-CRY-04',
        sopTitle: 'LH2 Boil-Off Gas (BOG) Compressor Re-routing',
        sopSteps: [
          'Engage stage-2 BOG recovery compressor.',
          'Route excess vapour to green ammonia synthesis buffer.',
          'Inspect outer vacuum jacket insulation level.'
        ],
        acknowledgedBy: managerUser._id,
        acknowledgedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        resolvedBy: techUser._id,
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolutionNotes: 'BOG compressor engaged; vessel pressure returned to nominal 18 bar.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed Script] Creating Maintenance Work Orders...');
    const workOrders = await WorkOrder.create([
      {
        workOrderNumber: 'WO-2026-0101',
        title: 'Emergency Flange Gasket Replacement & Torque Check',
        description: 'Post-alarm inspection following ALT-KAN-2026-001. Replace spiral wound metallic gasket on Bank 01 header.',
        facility: facKandla._id,
        storageUnit: uKan01._id,
        category: 'Equipment Servicing',
        assignedTo: techUser._id,
        createdBy: safetyUser._id,
        priority: 'High',
        status: WORK_ORDER_STATUSES.IN_PROGRESS,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        checklist: [
          { task: 'Isolate Bank 01 inlet valve and tag out with Lockout Tag #LOTO-881', completed: true },
          { task: 'Execute nitrogen purge until oxygen is < 1% and H2 is < 0.5%', completed: true },
          { task: 'Remove existing gasket and inspect stainless steel flange face for pitting', completed: false },
          { task: 'Install new Grafoil filled spiral wound 316SS gasket', completed: false },
          { task: 'Torque bolts cross-pattern to 85 Nm and log torque wrench calibration ID', completed: false }
        ]
      },
      {
        workOrderNumber: 'WO-2026-0102',
        title: 'Overdue Calibration: Transducer SEN-KAN-PT-02',
        description: 'Quarterly NIST-traceable deadweight tester calibration for secondary piezo pressure sensor.',
        facility: facKandla._id,
        storageUnit: uKan02._id,
        category: 'Sensor Calibration',
        assignedTo: techUser._id,
        createdBy: managerUser._id,
        priority: 'Medium',
        status: WORK_ORDER_STATUSES.PLANNED,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        checklist: [
          { task: 'Zero-point check at atmospheric pressure', completed: false },
          { task: '5-point upscale and downscale pressure verification (100, 200, 300, 400, 500 bar)', completed: false },
          { task: 'Apply calibration seal and sign PESO test certificate', completed: false }
        ]
      }
    ]);

    console.log('[Seed Script] Creating Safety Compliance Checklists...');
    const complianceChecklists = await ComplianceChecklist.create([
      {
        title: 'Monthly High-Pressure Hydrogen Station Safety Audit',
        code: 'CHK-ISO-19880-MONTHLY',
        category: 'Storage Pressure Integrity',
        frequency: 'Monthly',
        facility: facKandla._id,
        items: [
          { itemId: 'item_1', requirement: 'Are storage cylinders free of surface corrosion, denting, or mechanical abrasion?', verificationMethod: 'Visual & Ultrasonic Gauge', isMandatory: true },
          { itemId: 'item_2', requirement: 'Has 100% of flanged joints been surveyed with certified optical gas imaging or soap bubble testing?', verificationMethod: 'Optical Gas Imager / Soap Bubble', isMandatory: true },
          { itemId: 'item_3', requirement: 'Are all electrical junctions in Zone 1 / Zone 2 hazardous areas properly sealed and grounded (<4 ohms)?', verificationMethod: 'Earth Resistance Megger Test', isMandatory: true },
          { itemId: 'item_4', requirement: 'Did manual Emergency Shutdown (ESD) pushbuttons successfully trip the main isolation solenoid?', verificationMethod: 'Trip Circuit Test Protocol', isMandatory: true },
          { itemId: 'item_5', requirement: 'Is the PESO storage licence valid and displayed with up-to-date inspection logs?', verificationMethod: 'Documentary Review', isMandatory: true }
        ]
      },
      {
        title: 'Quarterly PESO & SMPV(U) Statutory Inspection',
        code: 'CHK-PESO-QUARTERLY',
        category: 'Emergency Isolation & Venting',
        frequency: 'Quarterly',
        facility: facKandla._id,
        items: [
          { itemId: 'item_1', requirement: 'Are dual safety relief valves tested and within ±3% set-pressure tolerance?', verificationMethod: 'Test Bench Pop Pressure Test', isMandatory: true },
          { itemId: 'item_2', requirement: 'Is the vent stack exit at least 4.5m above ground and unobstructed by overhead structures?', verificationMethod: 'Laser Range Finder & Geometry Audit', isMandatory: true },
          { itemId: 'item_3', requirement: 'Are automatic water deluge and UV/IR flame detection interlocks operational?', verificationMethod: 'Optical Test Lamp & Solenoid Actuation', isMandatory: true }
        ]
      }
    ]);

    console.log('[Seed Script] Creating Safety Documents & SOPs...');
    await SafetyDocument.create([
      {
        title: 'Standard Operating Procedure: Hydrogen Fugitive Emissions Isolation',
        documentNumber: 'SOP-H2-EMG-01',
        category: 'Standard Operating Procedure',
        version: '3.2',
        facility: facKandla._id,
        reviewDate: new Date('2024-01-01'),
        expiryDate: new Date('2027-01-01'),
        status: 'Active'
      },
      {
        title: 'Emergency Response Plan: Acute Overpressure & Safe Venting',
        documentNumber: 'ERP-H2-NAT-04',
        category: 'Emergency Response Plan',
        version: '2.0',
        facility: facKandla._id,
        reviewDate: new Date('2024-02-15'),
        expiryDate: new Date('2027-02-15'),
        status: 'Active'
      }
    ]);

    console.log('[Seed Script] Creating Corrective Actions (CAPA)...');
    await CorrectiveAction.create([
      {
        actionNumber: 'CAPA-2026-004',
        title: 'Overpressure Relief Valve Spring Recalibration',
        description: 'Initiated after acute pressure surge warning on VOC port marine loading line.',
        facility: facTuticorin._id,
        priority: 'Critical',
        status: 'In Progress',
        rootCause: 'Elastomer seal hardening and spring tension drift under marine saline coastal conditions.',
        actionPlan: 'Upgrade spring assembly to Inconel 718 marine alloy and install protective nitrogen sweep seal.',
        assignedTo: techUser._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed Script] Creating Initial System Audit Logs...');
    await AuditLog.create([
      {
        actor: adminUser._id,
        actorName: adminUser.name,
        actorRole: adminUser.role,
        action: 'SYSTEM_INITIALIZATION',
        targetEntity: 'Facility',
        details: { description: 'Platform initialized with 7 Indian Green Hydrogen Hubs under National Green Hydrogen Mission guidelines.' },
        ipAddress: '127.0.0.1'
      }
    ]);

    console.log('[Seed Script] Creating Initial Notifications...');
    await Notification.create([
      {
        user: adminUser._id,
        facility: facKandla._id,
        title: 'Network Commissioning Complete',
        message: '7 Indian Green Hydrogen Hubs connected with real-time telemetry streaming.',
        type: 'system',
        severity: 'info',
        isRead: false
      },
      {
        user: safetyUser._id,
        facility: facTuticorin._id,
        title: 'Overpressure Event Logged',
        message: 'Critical overpressure detected on Tuticorin Marine Arm SEN-VOC-PT-01 (488 bar).',
        type: 'alert',
        severity: 'critical',
        isRead: false
      }
    ]);

    console.log('[Seed Script] Initializing Simulator Configuration...');
    await SimulatorConfiguration.create({
      isRunning: true,
      intervalMs: 3000,
      scenario: 'Normal Operations',
      noiseFactor: 0.02,
      lastRunAt: new Date()
    });

    console.log('\n===============================================================');
    console.log('🎉 HYDROSENTINEL DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('Facilities Created: 7 Indian Green Hydrogen Hubs across India');
    console.log('  1. Deendayal Port Green Hydrogen Hub (Gandhidham, Gujarat)');
    console.log('  2. Paradip Port Green Ammonia & H2 Hub (Paradip, Odisha)');
    console.log('  3. V.O. Chidambaranar Port H2 Valley (Thoothukudi, Tamil Nadu)');
    console.log('  4. Kochi Marine Cryogenic H2 Terminal (Kochi, Kerala)');
    console.log('  5. Jaisalmer Solar Electrolyzer Buffer Depot (Jaisalmer, Rajasthan)');
    console.log('  6. Visakhapatnam Coastal Energy Corridor (Visakhapatnam, Andhra Pradesh)');
    console.log('  7. Mangaluru Petrochemical & Hydrogen Complex (Mangaluru, Karnataka)');
    console.log('Users Seeded: 5 (Super Admin, Facility Manager, Safety Officer, Tech, Viewer)');
    console.log('Password for all users: Hydrogen@2026');
    console.log('===============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database seed failed:', err);
    process.exit(1);
  }
};

seedDatabase();
