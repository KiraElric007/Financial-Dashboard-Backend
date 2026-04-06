const orgsRepository = require('../repositories/orgs.repository');

async function getCurrentOrganization(organizationId) {
  return orgsRepository.findById(organizationId);
}

async function listOrganizations() {
  return orgsRepository.findAll();
}

async function getOrganizationById(id) {
  return orgsRepository.findById(id);
}

async function updateOrganization(id, payload) {
  const org = await orgsRepository.findById(id);
  if (!org) {
    const err = new Error('Organization not found');
    err.status = 404;
    throw err;
  }

  const update = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.code !== undefined) update.code = payload.code;

  return orgsRepository.update(id, update);
}

module.exports = {
  getCurrentOrganization,
  listOrganizations,
  getOrganizationById,
  updateOrganization
};