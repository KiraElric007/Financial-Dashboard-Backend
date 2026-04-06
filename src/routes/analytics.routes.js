const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');
const methodNotAllowed = require('../middlewares/method-not-allowed.middleware');

router.use(auth.requireAuth);
router.use(rbac.requirePermission('ANALYTICS_VIEW'));

// GET /api/v1/analytics/category-spend?from=&to=
router.get('/category-spend', analyticsController.getCategorySpend);
router.all('/category-spend', methodNotAllowed);

// GET /api/v1/analytics/budget-vs-actual?year=2025
router.get('/budget-vs-actual', analyticsController.getBudgetVsActual);
router.all('/budget-vs-actual', methodNotAllowed);

// GET /api/v1/analytics/cashflow?from=&to=
router.get('/cashflow', analyticsController.getCashflow);
router.all('/cashflow', methodNotAllowed);

module.exports = router;