// src/modules/pipelines/pipelines.service.js
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errorHandler');

async function getPipelines(companyId) {
  return prisma.pipeline.findMany({
    where: { company_id: companyId },
    include: { stages: { orderBy: { position: 'asc' } } },
  });
}

async function getStages(companyId) {
  return prisma.stage.findMany({
    where: { company_id: companyId },
    orderBy: { position: 'asc' },
  });
}

async function createStage(companyId, { pipeline_id, name, color, position }) {
  if (!pipeline_id || !name) throw new AppError('pipeline_id and name are required', 400);
  const pipeline = await prisma.pipeline.findFirst({ where: { id: pipeline_id, company_id: companyId } });
  if (!pipeline) throw new AppError('Pipeline not found', 404);

  return prisma.stage.create({
    data: {
      company_id: companyId,
      pipeline_id,
      name,
      color: color || '#4f8ef7',
      position: position || 0,
    },
  });
}

async function updateStage(id, companyId, data) {
  const stage = await prisma.stage.findFirst({ where: { id, company_id: companyId } });
  if (!stage) throw new AppError('Stage not found', 404);
  const { name, color, position } = data;
  return prisma.stage.update({ where: { id }, data: { name, color, position } });
}

async function deleteStage(id, companyId) {
  const stage = await prisma.stage.findFirst({ where: { id, company_id: companyId } });
  if (!stage) throw new AppError('Stage not found', 404);

  const inUse = await prisma.lead.findFirst({ where: { stage_id: id } }) ||
                await prisma.deal.findFirst({ where: { stage_id: id } });
  if (inUse) throw new AppError('Stage is in use by leads or deals', 409);

  await prisma.stage.delete({ where: { id } });
}

module.exports = { getPipelines, getStages, createStage, updateStage, deleteStage };
