const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy danh sách toàn bộ người dùng (trừ mật khẩu)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        _count: {
          select: { expenses: true, tasks: true } // Đếm xem họ đã tạo bao nhiêu dữ liệu
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);

    // Dùng transaction để xóa sạch TẤT CẢ dữ liệu liên quan trước khi xóa người
    await prisma.$transaction([
      // 1. Xóa các khoản chi tiêu
      prisma.expense.deleteMany({ where: { userId } }),
      
      // 2. Xóa các công việc
      prisma.task.deleteMany({ where: { userId } }),
      
      // 3. 👇 QUAN TRỌNG: Xóa các mục tiêu tiết kiệm (Lỗi do thiếu dòng này)
      prisma.savingGoal.deleteMany({ where: { userId } }),

      // 4. Cuối cùng mới xóa User
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: "Đã xóa người dùng và toàn bộ dữ liệu liên quan" });
  } catch (error) {
    console.error("Lỗi xóa user:", error); 
    // Trả về lỗi chi tiết để dễ debug
    res.status(500).json({ message: "Lỗi xóa người dùng", error: error.message });
  }
};

// 3. Thay đổi quyền (Cấp quyền Admin hoặc hạ xuống User)
exports.changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'ADMIN' hoặc 'USER'
  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    res.json({ message: "Đã cập nhật quyền thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật quyền" });
  }
};
exports.getNotifications = async (req, res) => {
  try {
    const history = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' } // Mới nhất lên đầu
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải lịch sử" });
  }
};

// 5. Gửi thông báo mới (Lưu DB + Phát Socket)
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, type ,isPopup } = req.body;
    
    let mediaUrl = null;
    let mediaType = null;

    // Xử lý file upload
    if (req.file) {
      mediaUrl = req.file.path;
      // Kiểm tra xem là ảnh hay video dựa vào đuôi file hoặc mimetype
      // Cloudinary thường trả về resource_type
      const isVideo = req.file.mimetype.startsWith('video');
      mediaType = isVideo ? 'VIDEO' : 'IMAGE';
    }

    // 1. Lưu vào Database
    const newNoti = await prisma.notification.create({
      data: { 
        title, message, type, mediaUrl, mediaType,
        isPopup: isPopup === 'true' || isPopup === true // Chuyển sang boolean
      }
    
    });

    // 2. Phát sóng Real-time
    if (req.io) {
      req.io.emit('receive_notification', newNoti);
    }

    res.status(201).json(newNoti);
  } catch (error) {
    console.error("Lỗi gửi thông báo:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Xóa trong DB
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });
    
    // 👇 QUAN TRỌNG: Báo cho toàn hệ thống biết là có tin vừa bị xóa
    // Để máy User tự động kiểm tra lại xem hết bảo trì chưa
    if (req.io) {
        req.io.emit('system_update'); 
    }

    res.json({ message: "Đã xóa và cập nhật hệ thống" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa thông báo" });
  }
};

exports.getUnreadPopups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy các thông báo có isPopup = true MÀ user chưa có trong bảng NotificationRead
    const popups = await prisma.notification.findMany({
      where: {
        isPopup: true,
        reads: {
          none: { userId: userId } // Chưa có bản ghi nào của user này
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(popups);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy popup" });
  }
};

// 8. Đánh dấu đã đọc (User bấm "Đã hiểu")
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifId } = req.body;

    await prisma.notificationRead.create({
      data: {
        userId: userId,
        notifId: parseInt(notifId)
      }
    });

    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    // Lỗi P2002 là lỗi trùng lặp (đã đọc rồi), ta cứ trả về success
    if (error.code === 'P2002') return res.json({ message: "Đã đọc rồi" });
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getSystemStatus = async (req, res) => {
  try {
    // 1. BẢO TRÌ: Lấy tin KHẨN CẤP mới nhất (Bắt buộc khóa)
    const maintenance = await prisma.notification.findFirst({
      where: { type: 'URGENT' },
      orderBy: { createdAt: 'desc' }
    });

    // 2. QUẢNG CÁO: Lấy tin QUẢNG CÁO mới nhất
    // (Bỏ điều kiện isPopup đi, cứ là PROMO thì mặc định là Popup dính)
    const promo = await prisma.notification.findFirst({
      where: { type: 'PROMO' }, 
      orderBy: { createdAt: 'desc' }
    });

    res.json({ maintenance, promo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};