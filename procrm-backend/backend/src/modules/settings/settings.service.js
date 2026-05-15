// src/modules/settings/settings.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

async function getSettings(companyId) {
  const rows = await prisma.setting.findMany({ where: { company_id: companyId } });
  // Convert array of key/value rows to plain object
  return rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
}

async function updateSettings(companyId, updates) {
  const results = {};
  for (const [key, value] of Object.entries(updates)) {
    await prisma.setting.upsert({
      where: { company_id_key: { company_id: companyId, key } },
      create: { company_id: companyId, key, value: String(value) },
      update: { value: String(value) },
    });
    results[key] = value;
  }
  return getSettings(companyId);
}

module.exports = { getSettings, updateSettings };
