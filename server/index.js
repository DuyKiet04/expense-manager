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
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);

// 👇 DANH SÁCH CÁC TRANG ĐƯỢC PHÉP TRUY CẬP
const allowedOrigins = [
  "http://localhost:5173",                   // Cho phép máy tính của bạn
  "https://quanlitask.netlify.app",          // Link Netlify chính
  "https://www.quanlitask.netlify.app"       // Link Netlify (dự phòng có www)
];

// 1. Cấu hình Socket.io (Realtime)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 2. Cấu hình Express CORS (API)
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Cho phép đủ các lệnh
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 3. Gắn Socket vào request (Middleware quan trọng)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route để kiểm tra server sống hay chết
app.get('/', (req, res) => {
  res.send('Server Expense Manager is RUNNING!');
});

// Socket lắng nghe
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});