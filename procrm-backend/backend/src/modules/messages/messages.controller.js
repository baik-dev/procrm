// src/modules/messages/messages.controller.js
const svc  = require('./messages.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getMessages:   wrap(async (req, res) => res.json(await svc.getMessages(req.params.leadId, req.user))),
  createMessage: wrap(async (req, res) => res.status(201).json(await svc.createMessage(req.user, req.body))),
};
