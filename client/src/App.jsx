import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Import context vừa tạo
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import CalendarPage from './pages/CalendarPage';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminTaskTemplates from './pages/AdminTaskTemplates';
import AdminNotifications from './pages/AdminNotifications';
import MainLayout from './layouts/MainLayout';
import { useEffect } from 'react';

// Tạo một Component con để tách logic Theme ra
const AppContent = () => {
  const { isDarkMode } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  // Đổi màu nền body của trình duyệt
  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#141414' : '#f0f2f5';
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm, // Thuật toán tự đổi màu
        token: {
          colorPrimary: '#6C63FF', // Màu tím thương hiệu
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: {
            // Chỉnh màu nền Layout cho khớp
            bodyBg: isDarkMode ? '#141414' : '#f0f2f5',
            headerBg: isDarkMode ? '#1f1f1f' : '#ffffff',
            siderBg: isDarkMode ? '#000000' : '#001529',
          },
          Card: {
            colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/categories" element={<AdminCategories />} />
            <Route path="admin/templates" element={<AdminTaskTemplates />} />
            <Route path="admin/notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;