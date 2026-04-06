const supertest = require('supertest');
const app = require('../../src/app');
const { expect, loginAs, expectStatus } = require('./helpers');

describe('Users E2E', () => {
  const request = supertest(app);
  let adminToken;
  let accountantToken;
  let fmToken;
  let createdUser;

  before(async () => {
    const adminLogin = await loginAs(request, 'admin@example.test', 'Admin@123');
    expectStatus(adminLogin, 200);
    adminToken = adminLogin.body.token;

    const acctLogin = await loginAs(request, 'acct@example.test', 'Account@123');
    expectStatus(acctLogin, 200);
    accountantToken = acctLogin.body.token;

    const fmLogin = await loginAs(request, 'fmgr@example.test', 'Finance@123');
    expectStatus(fmLogin, 200);
    fmToken = fmLogin.body.token;
  });

  it('should require auth for listing users', async () => {
    const res = await request.get('/api/v1/users');
    expectStatus(res, 401);
  });

  it('should deny listing users to accountant (RBAC)', async () => {
    const res = await request
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accountantToken}`);
    expectStatus(res, 403);
  });

  it('should list users as admin', async () => {
    const res = await request
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.be.an('array');
  });

  it('should return 400 on create user with missing fields', async () => {
    const res = await request
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'newuser@example.test' });
    expectStatus(res, 400);
  });

  it('should forbid Finance Manager creating a user (RBAC)', async () => {
    const res = await request
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${fmToken}`)
      .send({
        email: 'forbidden@example.test',
        fullName: 'Forbidden User',
        password: 'Forbidden@123'
      });
    expectStatus(res, 403);
  });

  it('should create a new user as admin', async () => {
    const res = await request
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'e2euser@example.test',
        fullName: 'E2E User',
        password: 'E2EUser@123',
        isActive: true
      });
    expectStatus(res, 201);
    createdUser = res.body;
    expect(createdUser).to.have.property('email', 'e2euser@example.test');
  });

  it('should return 409 for duplicate email', async () => {
    const res = await request
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'e2euser@example.test',
        fullName: 'Dup',
        password: 'Dup@123'
      });
    expectStatus(res, 409);
  });

  it('should get user by id', async () => {
    const res = await request
      .get(`/api/v1/users/${createdUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 200);
    expect(res.body).to.have.property('email', 'e2euser@example.test');
  });

  it('should update user', async () => {
    const res = await request
      .patch(`/api/v1/users/${createdUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'E2E User Updated', isActive: false });
    expectStatus(res, 200);
    expect(res.body).to.have.property('fullName', 'E2E User Updated');
    expect(res.body).to.have.property('isActive', false);
  });

  it('should delete user', async () => {
    const res = await request
      .delete(`/api/v1/users/${createdUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expectStatus(res, 204);
  });

  it('should return 405 for POST /users/{id}', async () => {
    const res = await request
      .post('/api/v1/users/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expectStatus(res, 405);
  });
});