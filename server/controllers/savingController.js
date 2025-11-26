const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Lấy danh sách mục tiêu của User
exports.getGoals = async (req, res) => {
  const goals = await prisma.savingGoal.findMany({
    where: { userId: req.user.id }
  });
  res.json(goals);
};

// 2. Tạo mục tiêu mới
exports.createGoal = async (req, res) => {
  try {
    console.log("📥 Dữ liệu nhận được:", req.body); // Log xem Frontend gửi gì lên

    const { name, targetAmount, deadline } = req.body;

    // --- XỬ LÝ AN TOÀN SỐ TIỀN ---
    let finalAmount = 0;
    if (targetAmount) {
        // Chuyển hết thành chuỗi -> Xóa dấu phẩy -> Chuyển lại thành số
        const stringAmount = targetAmount.toString();
        const cleanString = stringAmount.replace(/,/g, ''); 
        finalAmount = parseFloat(cleanString);
    }

    if (isNaN(finalAmount)) {
        return res.status(400).json({ message: "Số tiền không hợp lệ!" });
    }
    // ------------------------------

    const newGoal = await prisma.savingGoal.create({
      data: {
        name,
        targetAmount: finalAmount, // Dùng số đã làm sạch
        userId: req.user.id,
        deadline: deadline ? new Date(deadline) : null
      }
    });

    console.log("✅ Đã lưu mục tiêu vào DB:", newGoal);
    res.status(201).json(newGoal);

  } catch (error) {
    console.error("🔥 LỖI SERVER CHI TIẾT:", error); // Hiện lỗi đỏ lòm ở Terminal để biết đường sửa
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 3. Nạp tiền vào mục tiêu (Deposit)
exports.deposit = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    // 1. Tìm xem đã có danh mục "Tiết kiệm" chưa
    let savingCategory = await prisma.category.findFirst({
      where: { type: 'SAVING' }
    });

    // 2. Nếu chưa có, server TỰ ĐỘNG TẠO luôn (để không bị lỗi)
    if (!savingCategory) {
      savingCategory = await prisma.category.create({
        data: { name: 'Tiết kiệm chung', type: 'SAVING' }
      });
    }

    // 3. Cộng tiền vào hũ
    const updatedGoal = await prisma.savingGoal.update({
      where: { id: parseInt(id) },
      data: {
        currentAmount: { increment: parseFloat(amount) }
      }
    });

    // 4. Ghi lại lịch sử giao dịch (Dùng ID danh mục vừa tìm được)
    await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        note: `Nạp tiết kiệm: ${updatedGoal.name}`,
        userId: req.user.id,
        categoryId: savingCategory.id, // <--- LẤY ID CHUẨN TỪ BƯỚC 1 HOẶC 2
        date: new Date()
      }
    });

    res.json(updatedGoal);
  } catch (error) {
    console.log("Lỗi nạp tiền:", error);
    res.status(500).json({ message: "Lỗi nạp tiền", error: error.message });
  }
};