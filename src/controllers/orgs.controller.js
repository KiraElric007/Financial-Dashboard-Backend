const orgsService = require('../services/orgs.service');

async function getCurrentOrganization(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const org = await orgsService.getCurrentOrganization(orgId);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function listOrganizations(req, res, next) {
  try {
    const orgs = await orgsService.listOrganizations();
    res.json(orgs);
  } catch (err) {
    next(err);
  }
}

async function getOrganizationById(req, res, next) {
  try {
    const { id } = req.params;
    const org = await orgsService.getOrganizationById(Number(id));
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function updateOrganization(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await orgsService.updateOrganization(Number(id), req.body || {});
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCurrentOrganization,
  listOrganizations,
  getOrganizationById,
  updateOrganization
};