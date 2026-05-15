// src/modules/tasks/tasks.routes.js
const router = require('express').Router();
const ctrl   = require('./tasks.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { injectTenant } = require('../../middleware/tenant.middleware');

router.use(authenticate, injectTenant);
router.get('/',              ctrl.getTasks);
router.post('/',             ctrl.createTask);
router.patch('/:id',         ctrl.updateTask);
router.patch('/:id/status',  ctrl.updateTaskStatus);
router.delete('/:id',        ctrl.deleteTask);

module.exports = router;
