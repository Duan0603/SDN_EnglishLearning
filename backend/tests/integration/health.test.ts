// Integration test for GET /health endpoint
// AC1: When I call the /health API endpoint, it returns { success: true }
import request from 'supertest';
import { createApp } from '../../src/app';

// Mock Prisma to avoid real DB connection during tests
jest.mock('../../src/config/prisma.config', () => ({
  prisma: {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $runCommandRaw: jest.fn().mockResolvedValue({ ok: 1 }),
  },
}));

// Mock Redis to avoid real connection during tests
jest.mock('../../src/config/redis.config', () => ({
  getRedisClient: jest.fn().mockResolvedValue({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('GET /health', () => {
  const app = createApp();

  it('should return success: true with status 200', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should include status field in data', async () => {
    const response = await request(app).get('/health');

    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBeDefined();
    expect(['healthy', 'degraded']).toContain(response.body.data.status);
  });

  it('should include timestamp in response', async () => {
    const response = await request(app).get('/health');

    expect(response.body.data.timestamp).toBeDefined();
    const timestamp = new Date(response.body.data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });

  it('should return JSON content-type', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('API Error Handling', () => {
  const app = createApp();

  it('should return { success: false } for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe(404);
    expect(response.body.error.message).toBeDefined();
  });
});
