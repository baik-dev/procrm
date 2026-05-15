// src/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { name: 'Новый лид',    color: '#4f8ef7', position: 1 },
  { name: 'Связались',    color: '#a78bfa', position: 2 },
  { name: 'Переговоры',   color: '#f59e0b', position: 3 },
  { name: 'Выиграли',     color: '#22c55e', position: 4 },
  { name: 'Проиграли',    color: '#ef4444', position: 5 },
];

async function createCompanyWithAdmin({ adminName, adminEmail, adminPassword, companyName }) {
  const password_hash = await bcrypt.hash(adminPassword, 10);

  // 1. Create company (without owner yet)
  const company = await prisma.company.create({
    data: { name: companyName, plan: 'pro' }
  });

  // 2. Create admin user
  const admin = await prisma.user.create({
    data: {
      company_id: company.id,
      name: adminName,
      email: adminEmail,
      password_hash,
      role: 'admin',
      status: 'active',
    }
  });

  // 3. Set owner
  await prisma.company.update({
    where: { id: company.id },
    data: { owner_admin_id: admin.id }
  });

  // 4. Create default pipeline + stages
  const pipeline = await prisma.pipeline.create({
    data: { company_id: company.id, name: 'Основная воронка' }
  });

  const stages = [];
  for (const s of DEFAULT_STAGES) {
    const stage = await prisma.stage.create({
      data: { company_id: company.id, pipeline_id: pipeline.id, ...s }
    });
    stages.push(stage);
  }

  // 5. Default settings
  const defaultSettings = {
    crm_name: companyName + ' CRM',
    timezone: 'Asia/Almaty',
    currency: 'KZT',
    language: 'ru',
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.create({
      data: { company_id: company.id, key, value }
    });
  }

  return { company, admin, pipeline, stages };
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── ALPHA company ────────────────────────────────────────────
  const { company: alpha, stages: alphaStages } = await createCompanyWithAdmin({
    adminName: 'Alpha Admin',
    adminEmail: 'admin@alpha.com',
    adminPassword: '123456',
    companyName: 'Alpha Corp',
  });
  console.log(`✅ Company created: ${alpha.name} (${alpha.id})`);

  // Alpha manager
  const alphaManager = await prisma.user.create({
    data: {
      company_id: alpha.id,
      name: 'Alpha Manager',
      email: 'manager@alpha.com',
      password_hash: await bcrypt.hash('123456', 10),
      role: 'manager',
      status: 'active',
    }
  });
  console.log(`✅ Manager created: ${alphaManager.email}`);

  // Alpha leads
  const alphaLead1 = await prisma.lead.create({
    data: {
      company_id: alpha.id,
      assigned_manager_id: alphaManager.id,
      name: 'Иван Петров',
      phone: '+7 777 100 0001',
      email: 'ivan@example.com',
      source: 'website',
      status: 'active',
      stage_id: alphaStages[0].id,
    }
  });

  const alphaLead2 = await prisma.lead.create({
    data: {
      company_id: alpha.id,
      assigned_manager_id: alphaManager.id,
      name: 'Мария Сидорова',
      phone: '+7 777 100 0002',
      email: 'maria@example.com',
      source: 'instagram',
      status: 'active',
      stage_id: alphaStages[1].id,
    }
  });

  const alphaLead3 = await prisma.lead.create({
    data: {
      company_id: alpha.id,
      name: 'Алексей Козлов',
      phone: '+7 777 100 0003',
      source: 'referral',
      status: 'active',
      stage_id: alphaStages[2].id,
    }
  });

  // Alpha deals
  await prisma.deal.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead1.id,
      assigned_manager_id: alphaManager.id,
      title: 'Продажа Premium подписки',
      amount: 150000,
      stage_id: alphaStages[2].id,
      status: 'open',
    }
  });

  await prisma.deal.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead2.id,
      assigned_manager_id: alphaManager.id,
      title: 'Корпоративный пакет',
      amount: 500000,
      stage_id: alphaStages[3].id,
      status: 'won',
    }
  });

  // Alpha tasks
  await prisma.task.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead1.id,
      assigned_manager_id: alphaManager.id,
      title: 'Позвонить клиенту',
      description: 'Уточнить детали договора',
      deadline: new Date(Date.now() + 86400000),
      status: 'todo',
    }
  });

  await prisma.task.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead3.id,
      title: 'Отправить КП',
      deadline: new Date(Date.now() - 86400000),
      status: 'overdue',
    }
  });

  // Alpha contacts
  await prisma.contact.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead1.id,
      name: 'Иван Петров',
      phone: '+7 777 100 0001',
      email: 'ivan@example.com',
    }
  });

  // Alpha messages
  await prisma.message.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead1.id,
      sender_type: 'client',
      text: 'Здравствуйте, хочу узнать о ваших услугах',
    }
  });
  await prisma.message.create({
    data: {
      company_id: alpha.id,
      lead_id: alphaLead1.id,
      sender_type: 'manager',
      text: 'Здравствуйте! Рады помочь. Расскажите, что вас интересует?',
    }
  });

  console.log(`✅ Alpha leads, deals, tasks, contacts seeded`);

  // ── BETA company ─────────────────────────────────────────────
  const { company: beta, stages: betaStages } = await createCompanyWithAdmin({
    adminName: 'Beta Admin',
    adminEmail: 'admin@beta.com',
    adminPassword: '123456',
    companyName: 'Beta Solutions',
  });
  console.log(`✅ Company created: ${beta.name} (${beta.id})`);

  // Beta leads (completely separate data)
  await prisma.lead.create({
    data: {
      company_id: beta.id,
      name: 'Нурлан Абенов',
      phone: '+7 701 200 0001',
      email: 'nurlan@beta-client.com',
      source: 'linkedin',
      status: 'active',
      stage_id: betaStages[0].id,
    }
  });

  await prisma.lead.create({
    data: {
      company_id: beta.id,
      name: 'Айгерим Жакупова',
      phone: '+7 701 200 0002',
      source: 'website',
      status: 'active',
      stage_id: betaStages[1].id,
    }
  });

  await prisma.deal.create({
    data: {
      company_id: beta.id,
      title: 'Beta Enterprise Deal',
      amount: 2000000,
      stage_id: betaStages[1].id,
      status: 'open',
    }
  });

  console.log(`✅ Beta leads and deals seeded`);

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo accounts:');
  console.log('  admin@alpha.com   / 123456  (Admin, Alpha Corp)');
  console.log('  manager@alpha.com / 123456  (Manager, Alpha Corp)');
  console.log('  admin@beta.com    / 123456  (Admin, Beta Solutions)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
