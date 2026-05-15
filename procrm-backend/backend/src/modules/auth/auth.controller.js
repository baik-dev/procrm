// src/modules/auth/auth.controller.js
const authService = require('./auth.service');

async function registerAdmin(req, res, next) {
  try {
    const { name, email, password, company_name } = req.body;
    if (!name || !email || !password || !company_name) {
      return res.status(400).json({ error: 'name, email, password, company_name are required' });
    }
    const data = await authService.registerAdmin({ name, email, password, company_name });
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (err) { next(err); }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { registerAdmin, login, me };
