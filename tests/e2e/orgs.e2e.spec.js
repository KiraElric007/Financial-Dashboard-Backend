const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Organizations E2E', () => {
  const request = supertest(app);
  let adminToken;
  let accountantToken;

  before(async () => {
    const adminLogin = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(adminLogin, 200);
    adminToken = adminLogin.body.token;

    const acctLogin = await loginAs(request, 'acct@example.test', 'Account@123');
    expectStatus(acctLogin, 200);
    accountantToken = acctLogin.body.token;
  });

  it('should require auth for /orgs/me', async () => {
    const res = await request.get('/api/v1/orgs/me');
    expectStatus(res, 401);
  });

  it('should return current org for admin', async () => {
    const res = await request
      .get('/api/v1/orgs/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.have.property('id');
    expect(res.body).to.have.property('code');
  });

  it('should list orgs for admin', async () => {
    const res = await request
      .get('/api/v1/orgs')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });

  it('should forbid accountant listing orgs', async () => {
    const res = await request
      .get('/api/v1/orgs')
      .set('Authorization', `Bearer ${accountantToken}`);
    expectStatus(res, 403);
  });

  it('should return 404 for non-existent org', async () => {
    const res = await request
      .get('/api/v1/orgs/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 404);
  });

  it('should return 405 for POST /orgs/me', async () => {
    const res = await request
      .post('/api/v1/orgs/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expectStatus(res, 405);
  });
});