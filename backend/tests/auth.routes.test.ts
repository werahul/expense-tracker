import request from 'supertest';
import app from '../src/app';

describe('POST /api/auth/register validation', () => {
  it('rejects a payload with a weak password and missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });
});

describe('GET /health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
