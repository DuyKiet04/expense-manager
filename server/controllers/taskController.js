const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy danh sách công việc
exports.getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải công việc" });
  }
};

// Tạo công việc mới
exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const newTask = await prisma.task.create({
      data: {
        userId: req.user.id,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        priority: priority || 'MEDIUM',
        status: 'TODO' // Mặc định là Cần làm
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo công việc" });
  }
};

// Cập nhật trạng thái (Kéo thả task)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status = TODO, DOING, hoặc DONE

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};

// Xóa công việc
exports.deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Đã xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa" });
  }
};