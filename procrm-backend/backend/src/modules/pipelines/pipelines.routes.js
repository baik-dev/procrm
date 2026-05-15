// src/modules/pipelines/pipelines.routes.js
const router = require('express').Router();
const ctrl   = require('./pipelines.controller');
const { authenticate }  = require('../../middleware/auth.middleware');
const { requireAdmin }  = require('../../middleware/role.middleware');
const { injectTenant }  = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);

router.get('/',         ctrl.getPipelines);  // GET /api/pipelines
router.get('/stages',   ctrl.getStages);     // GET /api/pipelines/stages

// Stage mutations — admin only
router.post('/stages',         requireAdmin, ctrl.createStage);
router.patch('/stages/:id',    requireAdmin, ctrl.updateStage);
router.delete('/stages/:id',   requireAdmin, ctrl.deleteStage);

module.exports = router;
