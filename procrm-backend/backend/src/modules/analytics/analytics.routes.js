// src/modules/analytics/analytics.routes.js
const router = require('express').Router();
const ctrl   = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);
router.get('/dashboard', ctrl.getDashboard);
router.get('/funnel',    ctrl.getFunnel);
router.get('/managers',  ctrl.getManagersAnalytics);

module.exports = router;
