import request from 'supertest';
import app from '../src/app.js';

describe('GET /api/adoption', () => {
  it('debería devolver un array', async () => {
    const res = await request(app).get('/api/adoption');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
