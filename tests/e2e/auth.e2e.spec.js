const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Auth E2E', () => {
  const request = supertest(app);
  let adminToken;

  it('should login successfully as admin', async () => {
    const res = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(res, 200);
    expect(res.body).to.have.property('token');
    expect(res.body.user).to.have.property('email', 'admin@example.test');
    adminToken = res.body.token;
  });

  it('should return current user with valid token', async () => {
    const res = await request
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);  
    expectStatus(res, 200);
    expect(res.body).to.have.property('email', 'admin@example.test');
  });

  it('should fail login with wrong password', async () => {
    const res = await loginAs(request, 'admin@example.test', 'WrongPassword');
    expectStatus(res, 401);
  });

  it('should fail login with missing email', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ password: 'Admin@123' });
    expectStatus(res, 400);
  });

  it('should reject /auth/me without token', async () => {
    const res = await request.get('/api/v1/auth/me');
    expectStatus(res, 401);
  });

  it('should return 405 for GET /auth/login (wrong method)', async () => {
    const res = await request.get('/api/v1/auth/login');
    expectStatus(res, 405);
  });
});