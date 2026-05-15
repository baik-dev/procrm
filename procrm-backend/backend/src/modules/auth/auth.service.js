// src/modules/auth/auth.service.js
const bcrypt             = require('bcryptjs');
const prisma             = require('../../config/db');
const { generateToken }  = require('../../utils/generateToken');
const { AppError }       = require('../../utils/errorHandler');

const DEFAULT_STAGES = [
  { name: 'Новый лид',  color: '#4f8ef7', position: 1 },
  { name: 'Связались',  color: '#a78bfa', position: 2 },
  { name: 'Переговоры', color: '#f59e0b', position: 3 },
  { name: 'Выиграли',   color: '#22c55e', position: 4 },
  { name: 'Проиграли',  color: '#ef4444', position: 5 },
];

async function registerAdmin({ name, email, password, company_name }) {
  // Check duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const password_hash = await bcrypt.hash(password, 10);

  // Run everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create company
    const company = await tx.company.create({
      data: { name: company_name, plan: 'basic' }
    });

    // 2. Create admin user
    const user = await tx.user.create({
      data: {
        company_id: company.id,
        name,
        email,
        password_hash,
        role: 'admin',
        status: 'active',
      },
      select: { id: true, company_id: true, name: true, email: true, role: true, status: true }
    });

    // 3. Set company owner
    await tx.company.update({
      where: { id: company.id },
      data: { owner_admin_id: user.id }
    });

    // 4. Default pipeline + stages
    const pipeline = await tx.pipeline.create({
      data: { company_id: company.id, name: 'Основная воронка' }
    });

    for (const s of DEFAULT_STAGES) {
      await tx.stage.create({
        data: { company_id: company.id, pipeline_id: pipeline.id, ...s }
      });
    }

    // 5. Default settings
    const defaults = {
      crm_name: company_name + ' CRM',
      timezone: 'Asia/Almaty',
      currency: 'KZT',
      language: 'ru',
    };
    for (const [key, value] of Object.entries(defaults)) {
      await tx.setting.create({ data: { company_id: company.id, key, value } });
    }

    return { user, company };
  });

  const token = generateToken({ id: result.user.id, company_id: result.user.company_id });
  return { token, user: result.user };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);
  if (user.status === 'inactive') throw new AppError('Account is deactivated', 403);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const safeUser = {
    id: user.id,
    company_id: user.company_id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  const token = generateToken({ id: user.id, company_id: user.company_id });
  return { token, user: safeUser };
}

module.exports = { registerAdmin, login };
