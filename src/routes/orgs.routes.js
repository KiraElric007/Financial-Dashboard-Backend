const express = require('express');
const router = express.Router();

const orgsController = require('../controllers/orgs.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

router.use(auth.requireAuth);

// GET /api/v1/orgs/me   – current user’s org details
router.get('/me', orgsController.getCurrentOrganization);

router.all('/me', methodNotAllowed);

// GET /api/v1/orgs      – list orgs (admin)
router.get(
  '/',
  rbac.requirePermission('ORG_MANAGE'),
  orgsController.listOrganizations
);

router.all('/', methodNotAllowed);

// GET /api/v1/orgs/:id
router.get(
  '/:id',
  rbac.requirePermission('ORG_MANAGE'),
  orgsController.getOrganizationById
);

// PATCH /api/v1/orgs/:id
router.patch(
  '/:id',
  rbac.requirePermission('ORG_MANAGE'),
  orgsController.updateOrganization
);

router.all('/:id', methodNotAllowed);

module.exports = router;