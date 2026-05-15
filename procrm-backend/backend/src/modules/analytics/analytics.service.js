// src/modules/analytics/analytics.service.js
const prisma = require('../../config/db');

async function getDashboard(user) {
  const cid = user.company_id;
  const isAdmin = user.role === 'admin';

  const leadWhere  = isAdmin ? { company_id: cid } : { company_id: cid, assigned_manager_id: user.id };
  const dealWhere  = isAdmin ? { company_id: cid } : { company_id: cid, assigned_manager_id: user.id };
  const taskWhere  = isAdmin ? { company_id: cid } : { company_id: cid, assigned_manager_id: user.id };

  const [
    totalLeads,
    activeLeads,
    wonDeals,
    lostDeals,
    totalDeals,
    totalTasks,
    overdueTasks,
    managersCount,
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: 'active' } }),
    prisma.deal.count({ where: { ...dealWhere, status: 'won' } }),
    prisma.deal.count({ where: { ...dealWhere, status: 'lost' } }),
    prisma.deal.findMany({ where: { ...dealWhere, status: 'won' }, select: { amount: true } }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: 'overdue' } }),
    isAdmin ? prisma.user.count({ where: { company_id: cid, role: 'manager' } }) : 0,
  ]);

  const totalRevenue = totalDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    total_leads: totalLeads,
    active_leads: activeLeads,
    won_deals: wonDeals,
    lost_deals: lostDeals,
    total_revenue: totalRevenue,
    tasks_count: totalTasks,
    overdue_tasks: overdueTasks,
    managers_count: managersCount,
  };
}

async function getFunnel(user) {
  const cid = user.company_id;
  const isAdmin = user.role === 'admin';

  const stages = await prisma.stage.findMany({
    where: { company_id: cid },
    orderBy: { position: 'asc' },
  });

  const result = await Promise.all(stages.map(async (stage) => {
    const leadWhere = isAdmin
      ? { company_id: cid, stage_id: stage.id }
      : { company_id: cid, stage_id: stage.id, assigned_manager_id: user.id };

    const dealWhere = isAdmin
      ? { company_id: cid, stage_id: stage.id }
      : { company_id: cid, stage_id: stage.id, assigned_manager_id: user.id };

    const [leads, deals] = await Promise.all([
      prisma.lead.count({ where: leadWhere }),
      prisma.deal.count({ where: dealWhere }),
    ]);

    return { stage_id: stage.id, stage_name: stage.name, color: stage.color, leads, deals };
  }));

  return result;
}

async function getManagersAnalytics(user) {
  const cid = user.company_id;

  if (user.role === 'manager') {
    // Only personal stats
    return getManagerStats(user.id, cid);
  }

  // Admin sees all managers
  const managers = await prisma.user.findMany({
    where: { company_id: cid, role: 'manager' },
    select: { id: true, name: true, email: true, status: true },
  });

  return Promise.all(managers.map(async (m) => {
    const stats = await getManagerStats(m.id, cid);
    return { manager: m, ...stats };
  }));
}

async function getManagerStats(managerId, companyId) {
  const [leads, activeLeads, deals, wonDeals, tasks, doneTasks] = await Promise.all([
    prisma.lead.count({ where: { company_id: companyId, assigned_manager_id: managerId } }),
    prisma.lead.count({ where: { company_id: companyId, assigned_manager_id: managerId, status: 'active' } }),
    prisma.deal.findMany({ where: { company_id: companyId, assigned_manager_id: managerId }, select: { amount: true, status: true } }),
    prisma.deal.count({ where: { company_id: companyId, assigned_manager_id: managerId, status: 'won' } }),
    prisma.task.count({ where: { company_id: companyId, assigned_manager_id: managerId } }),
    prisma.task.count({ where: { company_id: companyId, assigned_manager_id: managerId, status: 'done' } }),
  ]);

  const revenue = deals
    .filter(d => d.status === 'won')
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return {
    total_leads: leads,
    active_leads: activeLeads,
    total_deals: deals.length,
    won_deals: wonDeals,
    total_revenue: revenue,
    tasks_count: tasks,
    done_tasks: doneTasks,
  };
}

module.exports = { getDashboard, getFunnel, getManagersAnalytics };
