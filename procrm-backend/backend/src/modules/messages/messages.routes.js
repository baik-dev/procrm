// src/modules/messages/messages.routes.js
const router = require('express').Router();
const ctrl   = require('./messages.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);
router.get('/:leadId', ctrl.getMessages);
router.post('/',       ctrl.createMessage);

module.exports = router;
