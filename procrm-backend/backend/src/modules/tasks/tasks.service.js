// src/modules/tasks/tasks.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

function baseWhere(user) {
  const where = { company_id: user.company_id };
  if (user.role === 'manager') where.assigned_manager_id = user.id;
  return where;
}

async function getTasks(user) {
  return prisma.task.findMany({
    where: baseWhere(user),
    include: {
      lead: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      assigned_manager: { select: { id: true, name: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

async function createTask(user, data) {
  const { title, description, deadline, lead_id, deal_id, assigned_manager_id } = data;
  if (!title) throw new AppError('title is required', 400);

  const managerId = user.role === 'admin' ? (assigned_manager_id || null) : user.id;

  return prisma.task.create({
    data: {
      company_id: user.company_id,
      assigned_manager_id: managerId,
      title,
      description: description || null,
      deadline: deadline ? new Date(deadline) : null,
      lead_id: lead_id || null,
      deal_id: deal_id || null,
      status: 'todo',
    },
    include: { lead: { select: { id: true, name: true } } },
  });
}

async function updateTask(id, user, data) {
  const task = await requireTaskAccess(id, user);
  const { title, description, deadline, status } = data;
  return prisma.task.update({
    where: { id },
    data: {
      title, description,
      deadline: deadline ? new Date(deadline) : undefined,
      status,
    },
  });
}

async function updateTaskStatus(id, user, { status }) {
  await requireTaskAccess(id, user);
  const validStatuses = ['todo', 'done', 'overdue'];
  if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);
  return prisma.task.update({ where: { id }, data: { status } });
}

async function deleteTask(id, user) {
  const task = await prisma.task.findFirst({ where: { id, company_id: user.company_id } });
  if (!task) throw new AppError('Task not found', 404);
  if (user.role !== 'admin' && task.assigned_manager_id !== user.id) {
    throw new AppError('Access denied', 403);
  }
  await prisma.task.delete({ where: { id } });
}

async function requireTaskAccess(id, user) {
  const task = await prisma.task.findFirst({ where: { id, ...baseWhere(user) } });
  if (!task) throw new AppError('Task not found or access denied', 404);
  return task;
}

module.exports = { getTasks, createTask, updateTask, updateTaskStatus, deleteTask };
