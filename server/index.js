const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const savingRoutes = require('./routes/savingRoutes');
const templateRoutes = require('./routes/templateRoutes');
const notificationRoutes = require('./routes/notificationRoutes')

dotenv.config();
const app = express();

const web = 'https://quanlitask.netlify.app/';
// Tạo Server Socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: web, // Link Frontend của bạn
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: web, // Cho phép Netlify gọi API
    credentials: true
}
));
app.use(express.json());

// 👇👇👇 ĐOẠN QUAN TRỌNG: GẮN SOCKET VÀO REQUEST 👇👇👇
// Nếu thiếu đoạn này -> Lỗi 500 khi gửi thông báo
app.use((req, res, next) => {
  req.io = io;
  next();
});
// 👆👆👆 ----------------------------------------- 👆👆👆

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/templates', templateRoutes);

// Socket lắng nghe
io.on('connection', (socket) => {
  console.log(`⚡ Có người kết nối: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log('🔥 Ngắt kết nối');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server Socket đang chạy tại http://localhost:${PORT}`);
});