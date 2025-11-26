const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Lấy danh sách chi tiêu
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await prisma.expense.findMany({
      where: { userId: userId },
      include: { category: true },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu", error: error.message });
  }
};

// 2. Thêm chi tiêu mới (Đã xử lý lỗi FormData)
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, categoryId, note, date, lat, lng, address, isFamily } = req.body;

    // --- XỬ LÝ DỮ LIỆU ---
    const cleanAmount = amount ? parseFloat(amount.toString().replace(/,/g, '')) : 0;
    const cleanCategoryId = parseInt(categoryId);
    
    // Xử lý tọa độ (tránh lỗi NaN)
    const cleanLat = (lat && lat !== 'undefined' && lat !== 'null') ? parseFloat(lat) : null;
    const cleanLng = (lng && lng !== 'undefined' && lng !== 'null') ? parseFloat(lng) : null;
    
    const cleanIsFamily = isFamily === 'true';

    let imageUrl = null;
    if (req.file) imageUrl = req.file.path;

    // --- LƯU VÀO DB ---
    const newExpense = await prisma.expense.create({
      data: {
        amount: cleanAmount,
        categoryId: cleanCategoryId,
        userId: userId,
        note: note || "",
        date: date ? new Date(date) : new Date(),
        imageUrl: imageUrl,
        isFamily: cleanIsFamily,
        lat: cleanLat,
        lng: cleanLng,
        address: address || null
      }
    });

    res.status(201).json({ message: "Thêm thành công!", expense: newExpense });

  } catch (error) {
    console.error("🔥 LỖI SERVER:", error);
    res.status(500).json({ message: "Lỗi thêm chi tiêu", error: error.message });
  }
};

// 3. Xóa chi tiêu (CÁI BẠN ĐANG THIẾU)
exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    const userId = req.user.id;

    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });

    if (!expense || expense.userId !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa mục này!" });
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    res.json({ message: "Đã xóa thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa", error: error.message });
  }
};