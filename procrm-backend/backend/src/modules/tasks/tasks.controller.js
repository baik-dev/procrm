// src/modules/tasks/tasks.controller.js
const svc  = require('./tasks.service');
const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (err) { next(err); } };

module.exports = {
  getTasks:         wrap(async (req, res) => res.json(await svc.getTasks(req.user))),
  createTask:       wrap(async (req, res) => res.status(201).json(await svc.createTask(req.user, req.body))),
  updateTask:       wrap(async (req, res) => res.json(await svc.updateTask(req.params.id, req.user, req.body))),
  updateTaskStatus: wrap(async (req, res) => res.json(await svc.updateTaskStatus(req.params.id, req.user, req.body))),
  deleteTask:       wrap(async (req, res) => { await svc.deleteTask(req.params.id, req.user); res.json({ success: true }); }),
};
