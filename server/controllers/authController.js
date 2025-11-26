const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "bi_mat_khong_bat_mi"; // Nên đưa vào .env

// 1. Chức năng Đăng ký
exports.register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào Database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: "USER" // Mặc định là user thường
      }
    });

    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 2. Chức năng Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 👉 LOG 1: Xem Server có nhận được email/pass từ Client gửi lên không
    console.log("------------------------------------------------");
    console.log("1. Yêu cầu đăng nhập từ:", email);
    console.log("2. Mật khẩu nhận được:", password);

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // 👉 LOG 2: Xem có tìm thấy user trong Database không
    if (!user) {
      console.log("❌ LỖI: Không tìm thấy email này trong Database!");
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
    }
    console.log("3. Đã tìm thấy user trong DB (ID):", user.id);
    console.log("   - Mật khẩu mã hóa trong DB:", user.password);

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    
    // 👉 LOG 3: Xem so sánh mật khẩu đúng hay sai
    console.log("4. Kết quả so sánh mật khẩu:", isMatch ? "ĐÚNG" : "SAI");

    if (!isMatch) {
      console.log("❌ LỖI: Mật khẩu không khớp!");
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Tạo Token
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    console.log("✅ THÀNH CÔNG: Đã cấp Token!");

    res.json({ 
      message: "Đăng nhập thành công!", 
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role ,avatar: user.avatar}
    });
  } catch (error) {
    console.log("🔥 LỖI SERVER NGHIÊM TRỌNG:", error); // Xem lỗi crash
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log("-----------------------------------------");
    console.log("📡 Đang nhận yêu cầu Update Profile...");
    
    // 1. Kiểm tra xem file có đến nơi không
    if (req.file) {
      console.log("✅ CÓ FILE ẢNH: ", req.file.path);
    } else {
      console.log("❌ KHÔNG CÓ FILE ẢNH! (req.file là undefined)");
    }

    // 2. Kiểm tra dữ liệu chữ (Tên)
    console.log("📝 Dữ liệu Body:", req.body);

    const userId = req.user.id;
    const { fullName } = req.body;
    let avatarUrl;

    if (req.file) {
      avatarUrl = req.file.path;
    }

    // 3. Thực hiện update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        fullName,
        ...(avatarUrl && { avatar: avatarUrl }) 
      },
    });

    console.log("💾 Đã lưu vào DB:", updatedUser.avatar);
    console.log("-----------------------------------------");

    const { password: p, ...userData } = updatedUser;
    res.json({ message: "Cập nhật thành công", user: userData });

  } catch (error) {
    console.error("🔥 LỖI CONTROLLER:", error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  }
};

    // Trả về thông tin mới (bỏ password)
   
//   try {
//     const userId = req.user.id; // Lấy ID từ token
//     const { fullName, avatar } = req.body;

//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         fullName,
//         avatar
//       }
//     });

//     // Trả về thông tin user mới để frontend cập nhật lại
//     res.json({ 
//       message: "Cập nhật thành công!", 
//       user: { 
//         id: updatedUser.id, 
//         email: updatedUser.email, 
//         fullName: updatedUser.fullName, 
//         avatar: updatedUser.avatar, 
//         role: updatedUser.role 
//       } 
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
//   }
// };