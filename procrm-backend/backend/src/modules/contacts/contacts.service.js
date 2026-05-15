// src/modules/contacts/contacts.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

async function getContacts(user) {
  const where = { company_id: user.company_id };
  if (user.role === 'manager') {
    // Only contacts linked to leads assigned to this manager
    const myLeads = await prisma.lead.findMany({
      where: { company_id: user.company_id, assigned_manager_id: user.id },
      select: { id: true },
    });
    where.lead_id = { in: myLeads.map(l => l.id) };
  }
  return prisma.contact.findMany({
    where,
    include: { lead: { select: { id: true, name: true } } },
    orderBy: { created_at: 'desc' },
  });
}

async function createContact(user, data) {
  const { name, phone, email, lead_id } = data;
  if (!name) throw new AppError('name is required', 400);

  if (lead_id) {
    const lead = await prisma.lead.findFirst({ where: { id: lead_id, company_id: user.company_id } });
    if (!lead) throw new AppError('Lead not found in your company', 400);
  }

  return prisma.contact.create({
    data: { company_id: user.company_id, lead_id: lead_id || null, name, phone, email },
  });
}

async function updateContact(id, user, data) {
  const ct = await prisma.contact.findFirst({ where: { id, company_id: user.company_id } });
  if (!ct) throw new AppError('Contact not found', 404);
  const { name, phone, email } = data;
  return prisma.contact.update({ where: { id }, data: { name, phone, email } });
}

async function deleteContact(id, user) {
  const ct = await prisma.contact.findFirst({ where: { id, company_id: user.company_id } });
  if (!ct) throw new AppError('Contact not found', 404);
  await prisma.contact.delete({ where: { id } });
}

module.exports = { getContacts, createContact, updateContact, deleteContact };
