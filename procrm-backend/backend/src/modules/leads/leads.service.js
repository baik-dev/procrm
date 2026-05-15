// src/modules/leads/leads.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

function baseWhere(user) {
  const where = { company_id: user.company_id };
  if (user.role === 'manager') {
    where.assigned_manager_id = user.id;
  }
  return where;
}

async function getLeads(user) {
  return prisma.lead.findMany({
    where: baseWhere(user),
    include: {
      assigned_manager: { select: { id: true, name: true, email: true } },
      stage: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

async function getLeadById(id, user) {
  const lead = await prisma.lead.findFirst({
    where: { id, ...baseWhere(user) },
    include: {
      assigned_manager: { select: { id: true, name: true, email: true } },
      stage: true,
      deals: true,
      contacts: true,
      tasks: { include: { assigned_manager: { select: { id: true, name: true } } } },
      messages: { orderBy: { created_at: 'asc' } },
    },
  });
  if (!lead) throw new AppError('Lead not found or access denied', 404);
  return lead;
}

async function createLead(user, data) {
  const { name, phone, email, source, status, stage_id, assigned_manager_id } = data;
  if (!name) throw new AppError('name is required', 400);

  // Manager cannot assign to someone else
  const managerId = user.role === 'admin'
    ? (assigned_manager_id || null)
    : user.id;

  // Validate manager belongs to same company
  if (managerId) {
    const mgr = await prisma.user.findFirst({
      where: { id: managerId, company_id: user.company_id, role: 'manager' }
    });
    if (!mgr) throw new AppError('Assigned manager not found in your company', 400);
  }

  return prisma.lead.create({
    data: {
      company_id: user.company_id,
      assigned_manager_id: managerId,
      name, phone, email, source,
      status: status || 'new',
      stage_id: stage_id || null,
    },
    include: { assigned_manager: { select: { id: true, name: true } }, stage: true },
  });
}

async function updateLead(id, user, data) {
  await requireLeadAccess(id, user);
  const { name, phone, email, source, status, stage_id } = data;
  return prisma.lead.update({
    where: { id },
    data: { name, phone, email, source, status, stage_id },
    include: { assigned_manager: { select: { id: true, name: true } }, stage: true },
  });
}

async function deleteLead(id, user) {
  if (user.role !== 'admin') throw new AppError('Only admins can delete leads', 403);
  const lead = await prisma.lead.findFirst({ where: { id, company_id: user.company_id } });
  if (!lead) throw new AppError('Lead not found', 404);
  await prisma.lead.delete({ where: { id } });
}

async function assignLead(id, user, { assigned_manager_id }) {
  if (user.role !== 'admin') throw new AppError('Only admins can assign leads', 403);
  const lead = await prisma.lead.findFirst({ where: { id, company_id: user.company_id } });
  if (!lead) throw new AppError('Lead not found', 404);

  if (assigned_manager_id) {
    const mgr = await prisma.user.findFirst({
      where: { id: assigned_manager_id, company_id: user.company_id, role: 'manager' }
    });
    if (!mgr) throw new AppError('Manager not found in your company', 400);
  }

  return prisma.lead.update({
    where: { id },
    data: { assigned_manager_id: assigned_manager_id || null },
    include: { assigned_manager: { select: { id: true, name: true } } },
  });
}

async function moveLeadStage(id, user, { stage_id }) {
  await requireLeadAccess(id, user);
  // Validate stage belongs to same company
  const stage = await prisma.stage.findFirst({ where: { id: stage_id, company_id: user.company_id } });
  if (!stage) throw new AppError('Stage not found in your company', 400);

  return prisma.lead.update({
    where: { id },
    data: { stage_id },
    include: { stage: true },
  });
}

// ── helpers ──────────────────────────────────────────────────────
async function requireLeadAccess(id, user) {
  const lead = await prisma.lead.findFirst({ where: { id, ...baseWhere(user) } });
  if (!lead) throw new AppError('Lead not found or access denied', 404);
  return lead;
}

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead, assignLead, moveLeadStage };
