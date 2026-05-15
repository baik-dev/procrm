// src/modules/settings/settings.controller.js
const svc  = require('./settings.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getSettings:    wrap(async (req, res) => res.json(await svc.getSettings(req.companyId))),
  updateSettings: wrap(async (req, res) => res.json(await svc.updateSettings(req.companyId, req.body))),
};
