// src/modules/analytics/analytics.controller.js
const svc  = require('./analytics.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getDashboard:        wrap(async (req, res) => res.json(await svc.getDashboard(req.user))),
  getFunnel:           wrap(async (req, res) => res.json(await svc.getFunnel(req.user))),
  getManagersAnalytics:wrap(async (req, res) => res.json(await svc.getManagersAnalytics(req.user))),
};
