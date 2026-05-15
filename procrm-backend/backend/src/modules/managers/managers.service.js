// src/modules/managers/managers.service.js
const bcrypt  = require('bcryptjs');
const prisma  = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

const SAFE_SELECT = {
  id: true, company_id: true, name: true, email: true,
  role: true, status: true, created_at: true, updated_at: true,
};

async function getManagers(companyId) {
  return prisma.user.findMany({
    where: { company_id: companyId, role: 'manager' },
    select: SAFE_SELECT,
    orderBy: { created_at: 'desc' },
  });
}

async function createManager({ companyId, name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already taken', 409);

  const password_hash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { company_id: companyId, name, email, password_hash, role: 'manager', status: 'active' },
    select: SAFE_SELECT,
  });
}

async function updateManager({ id, companyId, data }) {
  await findManagerOrFail(id, companyId);
  const update = {};
  if (data.name)  update.name  = data.name;
  if (data.email) update.email = data.email;
  if (data.password) update.password_hash = await bcrypt.hash(data.password, 10);

  return prisma.user.update({
    where: { id },
    data: update,
    select: SAFE_SELECT,
  });
}

async function deactivateManager({ id, companyId }) {
  await findManagerOrFail(id, companyId);
  return prisma.user.update({
    where: { id },
    data: { status: 'inactive' },
    select: SAFE_SELECT,
  });
}

async function deleteManager({ id, companyId }) {
  await findManagerOrFail(id, companyId);
  await prisma.user.delete({ where: { id } });
}

// ── helpers ──────────────────────────────────────────────────────
async function findManagerOrFail(id, companyId) {
  const user = await prisma.user.findFirst({
    where: { id, company_id: companyId, role: 'manager' },
  });
  if (!user) throw new AppError('Manager not found', 404);
  return user;
}

module.exports = { getManagers, createManager, updateManager, deactivateManager, deleteManager };
