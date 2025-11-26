// client/src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  // 👇 SỬA LẠI DÒNG NÀY (Dùng dấu : và dấu ,)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào mỗi lần gọi (nếu đã đăng nhập)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;