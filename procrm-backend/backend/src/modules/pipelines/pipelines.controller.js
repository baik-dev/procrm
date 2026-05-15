// src/modules/pipelines/pipelines.controller.js
const svc  = require('./pipelines.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getPipelines: wrap(async (req, res) => res.json(await svc.getPipelines(req.companyId))),
  getStages:    wrap(async (req, res) => res.json(await svc.getStages(req.companyId))),
  createStage:  wrap(async (req, res) => res.status(201).json(await svc.createStage(req.companyId, req.body))),
  updateStage:  wrap(async (req, res) => res.json(await svc.updateStage(req.params.id, req.companyId, req.body))),
  deleteStage:  wrap(async (req, res) => { await svc.deleteStage(req.params.id, req.companyId); res.json({ success: true }); }),
};
