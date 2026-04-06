const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Accounts E2E', () => {
  const request = supertest(app);
  let adminToken;
  let accountantToken;
  let account;

  before(async () => {
    const adminLogin = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(adminLogin, 200);
    adminToken = adminLogin.body.token;

    const acctLogin = await loginAs(request, 'acct@example.test', 'Account@123');
    expectStatus(acctLogin, 200);
    accountantToken = acctLogin.body.token;
  });

  it('should require auth to list accounts', async () => {
    const res = await request.get('/api/v1/accounts');
    expectStatus(res, 401);
  });

  it('should list accounts as accountant', async () => {
    const res = await request
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${accountantToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });

  it('should return 400 for malformed create account', async () => {
    const res = await request
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Broken Account' });
    expectStatus(res, 400);
  });

  it('should return 400 for non-string accountNumber', async () => {
    const res = await request
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        accountNumber: 1234,
        name: 'Bad Type',
        accountType: 'EXPENSE',
        currency: 'USD'
      });
    expectStatus(res, 400);
  });

  it('should create a new account', async () => {
    const res = await request
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        accountNumber: '9999',
        name: 'E2E Test Account',
        accountType: 'EXPENSE',
        currency: 'USD'
      });
    expectStatus(res, 201);
    account = res.body;
    expect(account).to.have.property('accountNumber', '9999');
  });

  it('should get account by id', async () => {
    const res = await request
      .get(`/api/v1/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.have.property('id', account.id);
  });

  it('should update account', async () => {
    const res = await request
      .patch(`/api/v1/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E Updated' });
    expectStatus(res, 200);
    expect(res.body).to.have.property('name', 'E2E Updated');
  });

  it('should delete account', async () => {
    const res = await request
      .delete(`/api/v1/accounts/${account.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 204);
  });

  it('should return 405 for PUT /accounts', async () => {
    const res = await request
      .put('/api/v1/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expectStatus(res, 405);
  });
});