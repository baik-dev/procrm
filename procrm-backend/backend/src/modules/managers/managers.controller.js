// src/modules/managers/managers.controller.js
const svc = require('./managers.service');

async function getManagers(req, res, next) {
  try {
    const data = await svc.getManagers(req.companyId);
    res.json(data);
  } catch (err) { next(err); }
}

async function createManager(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }
    const data = await svc.createManager({ companyId: req.companyId, name, email, password });
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function updateManager(req, res, next) {
  try {
    const data = await svc.updateManager({ id: req.params.id, companyId: req.companyId, data: req.body });
    res.json(data);
  } catch (err) { next(err); }
}

async function deactivateManager(req, res, next) {
  try {
    const data = await svc.deactivateManager({ id: req.params.id, companyId: req.companyId });
    res.json(data);
  } catch (err) { next(err); }
}

async function deleteManager(req, res, next) {
  try {
    await svc.deleteManager({ id: req.params.id, companyId: req.companyId });
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getManagers, createManager, updateManager, deactivateManager, deleteManager };
