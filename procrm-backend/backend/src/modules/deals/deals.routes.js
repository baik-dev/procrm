// src/modules/deals/deals.routes.js
const router = require('express').Router();
const ctrl   = require('./deals.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);

router.get('/',            ctrl.getDeals);
router.post('/',           ctrl.createDeal);
router.get('/:id',         ctrl.getDealById);
router.patch('/:id',       ctrl.updateDeal);
router.delete('/:id',      ctrl.deleteDeal);
router.patch('/:id/stage', ctrl.moveDealStage);

module.exports = router;
