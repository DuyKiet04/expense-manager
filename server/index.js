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

// 👇 DANH SÁCH CÁC TRANG ĐƯỢC PHÉP TRUY CẬP (Tuyệt đối không thêm dấu / ở cuối)
const allowedOrigins = [
  "http://localhost:5173",                   
  "https://quanlitask.netlify.app"           
];

// 1. Cấu hình Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 2. Cấu hình Express CORS (Sửa lại cách viết cho chuẩn nhất)
app.use(cors({
    origin: function (origin, callback) {
        // Cho phép các request không có origin (như Postman, Mobile App) hoặc nằm trong list cho phép
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 3. Gắn Socket vào request
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