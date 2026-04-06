const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Transactions E2E', () => {
  const request = supertest(app);
  let adminToken;
  let fmToken;
  let acctToken;
  let baseAccount;
  let txn;

  before(async () => {
    const adminLogin = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(adminLogin, 200);
    adminToken = adminLogin.body.token;

    const fmLogin = await loginAs(request, 'fmgr@example.test', 'Finance@123');
    expectStatus(fmLogin, 200);
    fmToken = fmLogin.body.token;

    const acctLogin = await loginAs(request, 'acct@example.test', 'Account@123');
    expectStatus(acctLogin, 200);
    acctToken = acctLogin.body.token;

    const accountsRes = await request
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${acctToken}`);
    expectStatus(accountsRes, 200);
    expect(accountsRes.body).to.be.an('array').that.is.not.empty;
    baseAccount = accountsRes.body[0];
  });

  it('should require auth to list transactions', async () => {
    const res = await request.get('/api/v1/transactions');
    expectStatus(res, 401);
  });

  it('should list transactions as accountant', async () => {
    const res = await request
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });

  it('should reject empty transaction body with 400', async () => {
    const res = await request
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`)
      .send({});
    expectStatus(res, 400);
  });

  it('should reject invalid date 2020-13-40', async () => {
    const res = await request
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`)
      .send({
        txnDate: '2020-13-40',
        accountId: baseAccount.id,
        currency: 'USD'
      });
    expectStatus(res, 400);
  });

  it('should reject invalid datetime string "not-a-date"', async () => {
    const res = await request
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`)
      .send({
        txnDate: 'not-a-date',
        accountId: baseAccount.id,
        currency: 'USD'
      });
    expectStatus(res, 400);
  });

  it('should create a valid draft transaction as accountant', async () => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const res = await request
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`)
      .send({
        txnDate: now,
        accountId: baseAccount.id,
        currency: 'USD',
        debitAmount: 100,
        creditAmount: 0,
        description: 'E2E Transaction'
      });
    expectStatus(res, 201);
    txn = res.body;
    expect(txn).to.have.property('status', 'DRAFT');
  });

  it('should forbid accountant approving transaction', async () => {
    const res = await request
      .post(`/api/v1/transactions/${txn.id}/approve`)
      .set('Authorization', `Bearer ${acctToken}`);
    expectStatus(res, 403);
  });

  it('should allow Finance Manager to approve transaction', async () => {
    const res = await request
      .post(`/api/v1/transactions/${txn.id}/approve`)
      .set('Authorization', `Bearer ${fmToken}`);
    expectStatus(res, 200);
    expect(res.body).to.have.property('status', 'POSTED');
    txn = res.body;
  });

  it('should reject update on POSTED transaction with 400', async () => {
    const res = await request
      .patch(`/api/v1/transactions/${txn.id}`)
      .set('Authorization', `Bearer ${acctToken}`)
      .send({ description: 'Should not update' });
    expectStatus(res, 400);
  });

  it('should get transaction by id as admin', async () => {
    const res = await request
      .get(`/api/v1/transactions/${txn.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.have.property('id', txn.id);
  });

  it('should return 405 for DELETE /transactions', async () => {
    const res = await request
      .delete('/api/v1/transactions')
      .set('Authorization', `Bearer ${acctToken}`);
    expectStatus(res, 405);
  });
});