const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy danh sách mẫu
exports.getTemplates = async (req, res) => {
  const templates = await prisma.taskTemplate.findMany();
  res.json(templates);
};

// Tạo mẫu mới
exports.createTemplate = async (req, res) => {
  const { name, defaultPriority } = req.body;
  const newTemplate = await prisma.taskTemplate.create({
    data: { name, defaultPriority }
  });
  res.status(201).json(newTemplate);
};

// Xóa mẫu
exports.deleteTemplate = async (req, res) => {
  await prisma.taskTemplate.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Đã xóa" });
};