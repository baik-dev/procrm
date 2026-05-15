// src/modules/messages/messages.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

async function getMessages(leadId, user) {
  // Check lead access
  const where = { id: leadId, company_id: user.company_id };
  if (user.role === 'manager') where.assigned_manager_id = user.id;

  const lead = await prisma.lead.findFirst({ where });
  if (!lead) throw new AppError('Lead not found or access denied', 404);

  return prisma.message.findMany({
    where: { lead_id: leadId, company_id: user.company_id },
    orderBy: { created_at: 'asc' },
  });
}

async function createMessage(user, { lead_id, text, sender_type }) {
  if (!lead_id || !text) throw new AppError('lead_id and text are required', 400);

  const where = { id: lead_id, company_id: user.company_id };
  if (user.role === 'manager') where.assigned_manager_id = user.id;
  const lead = await prisma.lead.findFirst({ where });
  if (!lead) throw new AppError('Lead not found or access denied', 404);

  return prisma.message.create({
    data: {
      company_id: user.company_id,
      lead_id,
      sender_type: sender_type || 'manager',
      text,
    },
  });
}

module.exports = { getMessages, createMessage };
