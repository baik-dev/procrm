// src/modules/leads/leads.routes.js
const router = require('express').Router();
const ctrl   = require('./leads.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);

router.get('/',              ctrl.getLeads);
router.post('/',             ctrl.createLead);
router.get('/:id',           ctrl.getLeadById);
router.patch('/:id',         ctrl.updateLead);
router.delete('/:id',        ctrl.deleteLead);
router.patch('/:id/assign',  ctrl.assignLead);
router.patch('/:id/stage',   ctrl.moveLeadStage);

module.exports = router;
