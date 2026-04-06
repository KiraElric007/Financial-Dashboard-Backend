const chai = require('chai');
const expect = chai.expect;

async function loginAs(request, email, password) {
  return request
    .post('/api/v1/auth/login')
    .send({ email, password });
}

function expectStatus(res, expected) {
  expect(
    res.status,
    `Expected status ${expected} but got ${res.status} with body: ${JSON.stringify(res.body)}`
  ).to.equal(expected);
}

module.exports = {
  expect,
  loginAs,
  expectStatus
};