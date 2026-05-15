// src/modules/leads/leads.controller.js
const svc = require('./leads.service');

const wrap = fn => async (req, res, next) => {
  try { await fn(req, res); } catch (err) { next(err); }
};

module.exports = {
  getLeads:      wrap(async (req, res) => res.json(await svc.getLeads(req.user))),
  getLeadById:   wrap(async (req, res) => res.json(await svc.getLeadById(req.params.id, req.user))),
  createLead:    wrap(async (req, res) => res.status(201).json(await svc.createLead(req.user, req.body))),
  updateLead:    wrap(async (req, res) => res.json(await svc.updateLead(req.params.id, req.user, req.body))),
  deleteLead:    wrap(async (req, res) => { await svc.deleteLead(req.params.id, req.user); res.json({ success: true }); }),
  assignLead:    wrap(async (req, res) => res.json(await svc.assignLead(req.params.id, req.user, req.body))),
  moveLeadStage: wrap(async (req, res) => res.json(await svc.moveLeadStage(req.params.id, req.user, req.body))),
};
