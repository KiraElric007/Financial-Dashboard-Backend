const express = require('express');

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const orgsRoutes = require('./orgs.routes');
const accountsRoutes = require('./accounts.routes');
const transactionsRoutes = require('./transactions.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/orgs', orgsRoutes);
router.use('/accounts', accountsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;