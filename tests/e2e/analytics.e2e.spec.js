const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Analytics E2E', () => {
  const request = supertest(app);
  let adminToken;

  before(async () => {
    const adminLogin = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(adminLogin, 200);
    adminToken = adminLogin.body.token;
  });

  it('should require auth for category-spend', async () => {
    const res = await request.get('/api/v1/analytics/category-spend?from=2020-13-40&to=2030-01-01');
    expectStatus(res, 401);
  });


  it('should return 400 for category-spend with invalid from date', async () => {
    const res = await request
      .get('/api/v1/analytics/category-spend?from=2020-13-40&to=2030-01-01')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 400);
  });

  it('should return 400 for category-spend with no query', async () => {
    const res = await request
      .get('/api/v1/analytics/category-spend')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 400);
  });

  it('should return category spend for valid from/to', async () => {
    const res = await request
      .get('/api/v1/analytics/category-spend?from=2020-01-01&to=2030-01-01')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });

  it('should return 400 for cashflow with invalid to date', async () => {
    const res = await request
      .get('/api/v1/analytics/cashflow?from=2020-01-01&to=bad-date')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 400);
  });

  it('should return cashflow for valid date range', async () => {
    const res = await request
      .get('/api/v1/analytics/cashflow?from=2020-01-01&to=2030-01-01')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });
});