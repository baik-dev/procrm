// src/modules/contacts/contacts.routes.js
const router = require('express').Router();
const ctrl   = require('./contacts.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);
router.get('/',      ctrl.getContacts);
router.post('/',     ctrl.createContact);
router.patch('/:id', ctrl.updateContact);
router.delete('/:id',ctrl.deleteContact);

module.exports = router;
