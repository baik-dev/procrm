// src/modules/deals/deals.controller.js
const svc = require('./deals.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getDeals:      wrap(async (req, res) => res.json(await svc.getDeals(req.user))),
  getDealById:   wrap(async (req, res) => res.json(await svc.getDealById(req.params.id, req.user))),
  createDeal:    wrap(async (req, res) => res.status(201).json(await svc.createDeal(req.user, req.body))),
  updateDeal:    wrap(async (req, res) => res.json(await svc.updateDeal(req.params.id, req.user, req.body))),
  deleteDeal:    wrap(async (req, res) => { await svc.deleteDeal(req.params.id, req.user); res.json({ success: true }); }),
  moveDealStage: wrap(async (req, res) => res.json(await svc.moveDealStage(req.params.id, req.user, req.body))),
};
