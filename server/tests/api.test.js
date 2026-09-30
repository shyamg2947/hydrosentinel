import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';

dotenv.config();

let authToken = '';
let superAdminToken = '';
let testFacilityId = '';
let testSensorId = '';
let testAlertId = '';
let testWorkOrderId = '';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hydrosentinel');

  // Login as Super Admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@hydrosentinel.io', password: 'Hydrogen@2026' });

  if (!adminRes.body.success) {
    console.error('Admin login error:', adminRes.body);
  }
  superAdminToken = adminRes.body.token;

  // Login as Facility Manager
  const managerRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'manager@hydrosentinel.io', password: 'Hydrogen@2026' });

  authToken = managerRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('1. Authentication & Security Middleware', () => {
  it('should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hydrosentinel.io', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate user and return profile on /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('manager@hydrosentinel.io');
    expect(res.body.user.role).toBe('Facility Manager');
  });

  it('should reject unauthenticated calls to protected routes with 401', async () => {
    const res = await request(app).get('/api/v1/facilities');
    expect(res.status).toBe(401);
  });
});

describe('2. Facility Management APIs', () => {
  it('should retrieve list of facilities', async () => {
    const res = await request(app)
      .get('/api/v1/facilities')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    testFacilityId = res.body.data[0]._id;
  });

  it('should retrieve individual facility detail with storage units and sensors', async () => {
    const res = await request(app)
      .get(`/api/v1/facilities/${testFacilityId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.facility).toBeDefined();
    expect(res.body.data.storageUnits).toBeDefined();
    expect(res.body.data.sensors).toBeDefined();
  });
});

describe('3. Sensor & Telemetry APIs', () => {
  it('should fetch sensors with status and calibration metadata', async () => {
    const res = await request(app)
      .get('/api/v1/sensors')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    testSensorId = res.body.data[0]._id;
  });

  it('should fetch latest live telemetry readings with simulation tag', async () => {
    const res = await request(app)
      .get('/api/v1/telemetry/latest')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].isSimulated).toBe(true);
  });
});

describe('4. Alert Lifecycle Management', () => {
  it('should fetch alerts list and summary stats', async () => {
    const res = await request(app)
      .get('/api/v1/alerts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    testAlertId = res.body.data[0]._id;

    const statsRes = await request(app)
      .get('/api/v1/alerts/summary')
      .set('Authorization', `Bearer ${authToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.total).toBeGreaterThan(0);
  });

  it('should allow acknowledging an alert', async () => {
    const res = await request(app)
      .post(`/api/v1/alerts/${testAlertId}/acknowledge`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Acknowledged');
    expect(res.body.data.acknowledgedBy).toBeDefined();
  });
});

describe('5. Maintenance Work Orders', () => {
  it('should fetch work orders and templates', async () => {
    const res = await request(app)
      .get('/api/v1/maintenance/work-orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    testWorkOrderId = res.body.data[0]._id;
  });

  it('should allow updating work order status with completion note', async () => {
    const res = await request(app)
      .put(`/api/v1/maintenance/work-orders/${testWorkOrderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'In Progress',
        completionNotes: 'Technician has arrived on site with calibration rig.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('In Progress');
  });
});

describe('6. Safety & Compliance Workflows', () => {
  it('should fetch compliance checklists and safety stats', async () => {
    const res = await request(app)
      .get('/api/v1/compliance/checklists')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);

    const statsRes = await request(app)
      .get('/api/v1/compliance/dashboard-stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.complianceRate).toBeDefined();
  });
});

describe('7. Executive Analytics & Reporting', () => {
  it('should fetch executive dashboard metrics with KPIs', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/executive-dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.facilitiesCount).toBeGreaterThan(0);
    expect(res.body.data.sensorStats).toBeDefined();
    expect(res.body.data.simulationNotice).toBeDefined();
  });

  it('should export CSV data with proper headers', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/export/csv?module=alerts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('AlertID,FacilityCode,FacilityName');
  });
});
