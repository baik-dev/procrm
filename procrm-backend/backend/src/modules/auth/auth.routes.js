// src/modules/auth/auth.routes.js
const router     = require('express').Router();
const ctrl       = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/register-admin', ctrl.registerAdmin);
router.post('/login',          ctrl.login);
router.get('/me',              authenticate, ctrl.me);

module.exports = router;
