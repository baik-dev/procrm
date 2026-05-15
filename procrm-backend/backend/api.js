// api.js — ProCRM Frontend API Helper
// Include this file in your HTML before procrm.html scripts:
//   <script src="api.js"></script>

const API_BASE = 'http://localhost:3000/api'; // change to your production URL

// ── Token management ─────────────────────────────────────────────
function getToken() { return localStorage.getItem('procrm_token'); }
function setToken(t) { localStorage.setItem('procrm_token', t); }
function clearToken() { localStorage.removeItem('procrm_token'); }

// ── Core request helper ───────────────────────────────────────────
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const patch  = (path, body)  => request('PATCH',  path, body);
const del    = (path)        => request('DELETE', path);

// ── AUTH ──────────────────────────────────────────────────────────
async function login(email, password) {
  const data = await post('/auth/login', { email, password });
  setToken(data.token);
  return data;
}

async function registerAdmin(name, email, password, company_name) {
  const data = await post('/auth/register-admin', { name, email, password, company_name });
  setToken(data.token);
  return data;
}

async function getMe() { return get('/auth/me'); }

function logout() { clearToken(); }

// ── MANAGERS ─────────────────────────────────────────────────────
async function getManagers()                   { return get('/managers'); }
async function createManager(data)             { return post('/managers', data); }
async function updateManager(id, data)         { return patch(`/managers/${id}`, data); }
async function deactivateManager(id)           { return patch(`/managers/${id}/deactivate`); }
async function deleteManager(id)               { return del(`/managers/${id}`); }

// ── LEADS ────────────────────────────────────────────────────────
async function getLeads()                      { return get('/leads'); }
async function getLeadById(id)                 { return get(`/leads/${id}`); }
async function createLead(data)                { return post('/leads', data); }
async function updateLead(id, data)            { return patch(`/leads/${id}`, data); }
async function deleteLead(id)                  { return del(`/leads/${id}`); }
async function assignLead(id, manager_id)      { return patch(`/leads/${id}/assign`, { assigned_manager_id: manager_id }); }
async function moveLeadStage(id, stage_id)     { return patch(`/leads/${id}/stage`, { stage_id }); }

// ── DEALS ────────────────────────────────────────────────────────
async function getDeals()                      { return get('/deals'); }
async function getDealById(id)                 { return get(`/deals/${id}`); }
async function createDeal(data)                { return post('/deals', data); }
async function updateDeal(id, data)            { return patch(`/deals/${id}`, data); }
async function deleteDeal(id)                  { return del(`/deals/${id}`); }
async function moveDealStage(id, stage_id)     { return patch(`/deals/${id}/stage`, { stage_id }); }

// ── TASKS ────────────────────────────────────────────────────────
async function getTasks()                      { return get('/tasks'); }
async function createTask(data)                { return post('/tasks', data); }
async function updateTask(id, data)            { return patch(`/tasks/${id}`, data); }
async function updateTaskStatus(id, status)    { return patch(`/tasks/${id}/status`, { status }); }
async function deleteTask(id)                  { return del(`/tasks/${id}`); }

// ── CONTACTS ─────────────────────────────────────────────────────
async function getContacts()                   { return get('/contacts'); }
async function createContact(data)             { return post('/contacts', data); }
async function updateContact(id, data)         { return patch(`/contacts/${id}`, data); }
async function deleteContact(id)               { return del(`/contacts/${id}`); }

// ── MESSAGES ─────────────────────────────────────────────────────
async function getMessages(leadId)             { return get(`/messages/${leadId}`); }
async function sendMessage(lead_id, text, sender_type = 'manager') {
  return post('/messages', { lead_id, text, sender_type });
}

// ── PIPELINES & STAGES ───────────────────────────────────────────
async function getPipelines()                  { return get('/pipelines'); }
async function getStages()                     { return get('/pipelines/stages'); }
async function createStage(data)               { return post('/pipelines/stages', data); }
async function updateStage(id, data)           { return patch(`/pipelines/stages/${id}`, data); }
async function deleteStage(id)                 { return del(`/pipelines/stages/${id}`); }

// ── SETTINGS ─────────────────────────────────────────────────────
async function getSettings()                   { return get('/settings'); }
async function updateSettings(data)            { return patch('/settings', data); }

// ── ANALYTICS ────────────────────────────────────────────────────
async function getAnalyticsDashboard()         { return get('/analytics/dashboard'); }
async function getAnalyticsFunnel()            { return get('/analytics/funnel'); }
async function getAnalyticsManagers()          { return get('/analytics/managers'); }

// ── Export as global API object ───────────────────────────────────
window.API = {
  // token
  getToken, setToken, clearToken,
  // auth
  login, registerAdmin, getMe, logout,
  // managers
  getManagers, createManager, updateManager, deactivateManager, deleteManager,
  // leads
  getLeads, getLeadById, createLead, updateLead, deleteLead, assignLead, moveLeadStage,
  // deals
  getDeals, getDealById, createDeal, updateDeal, deleteDeal, moveDealStage,
  // tasks
  getTasks, createTask, updateTask, updateTaskStatus, deleteTask,
  // contacts
  getContacts, createContact, updateContact, deleteContact,
  // messages
  getMessages, sendMessage,
  // pipelines
  getPipelines, getStages, createStage, updateStage, deleteStage,
  // settings
  getSettings, updateSettings,
  // analytics
  getAnalyticsDashboard, getAnalyticsFunnel, getAnalyticsManagers,
};
