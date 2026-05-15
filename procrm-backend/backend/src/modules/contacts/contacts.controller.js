// src/modules/contacts/contacts.controller.js
const svc  = require('./contacts.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getContacts:   wrap(async (req, res) => res.json(await svc.getContacts(req.user))),
  createContact: wrap(async (req, res) => res.status(201).json(await svc.createContact(req.user, req.body))),
  updateContact: wrap(async (req, res) => res.json(await svc.updateContact(req.params.id, req.user, req.body))),
  deleteContact: wrap(async (req, res) => { await svc.deleteContact(req.params.id, req.user); res.json({ success: true }); }),
};
