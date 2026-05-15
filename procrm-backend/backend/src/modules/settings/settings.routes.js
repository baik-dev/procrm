// src/modules/settings/settings.routes.js
const router = require('express').Router();
const ctrl   = require('./settings.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/role.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant, requireAdmin);
router.get('/',   ctrl.getSettings);
router.patch('/', ctrl.updateSettings);

module.exports = router;
