// src/app.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { errorHandler } = require('./utils/errorHandler');

// Routes
const authRoutes      = require('./modules/auth/auth.routes');
const managersRoutes  = require('./modules/managers/managers.routes');
const leadsRoutes     = require('./modules/leads/leads.routes');
const dealsRoutes     = require('./modules/deals/deals.routes');
const contactsRoutes  = require('./modules/contacts/contacts.routes');
const tasksRoutes     = require('./modules/tasks/tasks.routes');
const messagesRoutes  = require('./modules/messages/messages.routes');
const pipelinesRoutes = require('./modules/pipelines/pipelines.routes');
const settingsRoutes  = require('./modules/settings/settings.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: '*',       // tighten in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── API Routes ──────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/managers',  managersRoutes);
app.use('/api/leads',     leadsRoutes);
app.use('/api/deals',     dealsRoutes);
app.use('/api/contacts',  contactsRoutes);
app.use('/api/tasks',     tasksRoutes);
app.use('/api/messages',  messagesRoutes);
app.use('/api/pipelines', pipelinesRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
