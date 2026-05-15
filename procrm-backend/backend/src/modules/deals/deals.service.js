// src/modules/deals/deals.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

function baseWhere(user) {
  const where = { company_id: user.company_id };
  if (user.role === 'manager') where.assigned_manager_id = user.id;
  return where;
}

async function getDeals(user) {
  return prisma.deal.findMany({
    where: baseWhere(user),
    include: {
      lead: { select: { id: true, name: true } },
      assigned_manager: { select: { id: true, name: true } },
      stage: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

async function getDealById(id, user) {
  const deal = await prisma.deal.findFirst({
    where: { id, ...baseWhere(user) },
    include: {
      lead: true,
      assigned_manager: { select: { id: true, name: true } },
      stage: true,
      tasks: true,
    },
  });
  if (!deal) throw new AppError('Deal not found or access denied', 404);
  return deal;
}

async function createDeal(user, data) {
  const { title, lead_id, amount, stage_id, status, assigned_manager_id } = data;
  if (!title) throw new AppError('title is required', 400);

  const managerId = user.role === 'admin' ? (assigned_manager_id || null) : user.id;

  // Validate lead belongs to same company if provided
  if (lead_id) {
    const lead = await prisma.lead.findFirst({ where: { id: lead_id, company_id: user.company_id } });
    if (!lead) throw new AppError('Lead not found in your company', 400);
  }

  return prisma.deal.create({
    data: {
      company_id: user.company_id,
      lead_id: lead_id || null,
      assigned_manager_id: managerId,
      title,
      amount: amount || 0,
      stage_id: stage_id || null,
      status: status || 'open',
    },
    include: { stage: true, assigned_manager: { select: { id: true, name: true } } },
  });
}

async function updateDeal(id, user, data) {
  await requireDealAccess(id, user);
  const { title, amount, status, stage_id, lead_id } = data;
  return prisma.deal.update({
    where: { id },
    data: { title, amount, status, stage_id, lead_id },
    include: { stage: true },
  });
}

async function deleteDeal(id, user) {
  if (user.role !== 'admin') throw new AppError('Only admins can delete deals', 403);
  const deal = await prisma.deal.findFirst({ where: { id, company_id: user.company_id } });
  if (!deal) throw new AppError('Deal not found', 404);
  await prisma.deal.delete({ where: { id } });
}

async function moveDealStage(id, user, { stage_id }) {
  await requireDealAccess(id, user);
  const stage = await prisma.stage.findFirst({ where: { id: stage_id, company_id: user.company_id } });
  if (!stage) throw new AppError('Stage not found', 400);
  return prisma.deal.update({ where: { id }, data: { stage_id }, include: { stage: true } });
}

async function requireDealAccess(id, user) {
  const deal = await prisma.deal.findFirst({ where: { id, ...baseWhere(user) } });
  if (!deal) throw new AppError('Deal not found or access denied', 404);
  return deal;
}

module.exports = { getDeals, getDealById, createDeal, updateDeal, deleteDeal, moveDealStage };
