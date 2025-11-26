const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Lấy danh sách (Đã có sẵn, giữ nguyên)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany(); // <--- LẤY HẾT, KHÔNG LỌC
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh mục" });
  }
};

// 2. Sửa hàm tạo mới (Nhận thêm type)
exports.createCategory = async (req, res) => {
  try {
    console.log("Dữ liệu nhận được:", req.body); // Log để kiểm tra

    const { name, type } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name) {
      return res.status(400).json({ message: "Tên danh mục không được để trống" });
    }

    const newCat = await prisma.category.create({
      data: {
        name,
        // Nếu không chọn loại, mặc định là Chi tiêu (EXPENSE)
        type: type || 'EXPENSE' 
      }
    });
    
    // Nếu có socket thì phát, không thì thôi (tránh lỗi crash nếu chưa config socket ở file này)
    if (req.io) {
        req.io.emit('data_updated', { type: 'CATEGORY', action: 'CREATE' });
    }

    res.status(201).json(newCat);
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    res.status(500).json({ message: "Lỗi tạo danh mục", error: error.message });
  }
};

// 3. Xóa danh mục (THÊM MỚI)
exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Thực hiện 2 bước trong 1 giao dịch
    await prisma.$transaction([
      // Bước 1: Xóa tất cả khoản chi thuộc danh mục này trước
      prisma.expense.deleteMany({
        where: { categoryId: id }
      }),
      
      // Bước 2: Sau khi sạch sẽ thì xóa danh mục
      prisma.category.delete({
        where: { id: id }
      })
    ]);

    // Báo cho mọi người biết có thay đổi (Realtime)
    if (req.io) {
        req.io.emit('data_updated', { type: 'CATEGORY', action: 'DELETE' });
    }

    res.json({ message: "Đã xóa danh mục và các dữ liệu liên quan" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi server khi xóa danh mục" });
  }
};