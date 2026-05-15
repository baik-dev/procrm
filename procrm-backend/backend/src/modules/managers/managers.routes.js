// src/modules/managers/managers.routes.js
const router = require('express').Router();
const ctrl   = require('./managers.controller');
const { authenticate }  = require('../../middleware/auth.middleware');
const { requireAdmin }  = require('../../middleware/role.middleware');
const { injectTenant }  = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant, requireAdmin);

router.get('/',                 ctrl.getManagers);
router.post('/',                ctrl.createManager);
router.patch('/:id',            ctrl.updateManager);
router.patch('/:id/deactivate', ctrl.deactivateManager);
router.delete('/:id',           ctrl.deleteManager);

module.exports = router;
