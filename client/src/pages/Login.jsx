import { Form, Input, Button, Typography, Row, Col, message, theme, Divider, Space, Card } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookFilled, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', values);
      message.success('Đăng nhập thành công!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    }
  };

  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const slideInLeft = {
    hidden: { x: -80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const slideInRight = {
    hidden: { x: 80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Vector Illustrations
  const FinanceVector = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none">
      {/* Background Circles */}
      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="200" r="60" fill="rgba(255,255,255,0.05)"/>
      
      {/* Main Finance Illustration */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Piggy Bank */}
        <circle cx="200" cy="150" r="40" fill="#6C63FF"/>
        <circle cx="190" cy="140" r="8" fill="white"/>
        <circle cx="210" cy="140" r="8" fill="white"/>
        <path d="M185 160 Q200 170 215 160" stroke="white" strokeWidth="3"/>
        
        {/* Money Lines */}
        <motion.path
          d="M120 80 L150 60"
          stroke="#4CAF50"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.path
          d="M280 100 L310 80"
          stroke="#FF9800"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
        <motion.path
          d="M80 200 L110 180"
          stroke="#2196F3"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        />
        
        {/* Charts */}
        <rect x="250" y="120" width="4" height="20" fill="#4CAF50"/>
        <rect x="260" y="110" width="4" height="30" fill="#4CAF50"/>
        <rect x="270" y="100" width="4" height="40" fill="#4CAF50"/>
        <rect x="280" y="115" width="4" height="25" fill="#4CAF50"/>
      </motion.g>
    </svg>
  );

  const MobileFinanceVector = () => (
    <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
      {/* Mobile Finance Illustration */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Wallet */}
        <rect x="60" y="70" width="80" height="60" rx="10" fill="#6C63FF"/>
        <rect x="70" y="80" width="60" height="40" rx="5" fill="#4834d4"/>
        
        {/* Money */}
        <rect x="75" y="85" width="50" height="8" rx="4" fill="#4CAF50"/>
        <rect x="75" y="98" width="40" height="8" rx="4" fill="#FF9800"/>
        <rect x="75" y="111" width="45" height="8" rx="4" fill="#2196F3"/>
        
        {/* Chart */}
        <path d="M40 140 L60 120 L80 140 L100 110 L120 130 L140 100 L160 120" 
              stroke="white" strokeWidth="3" fill="none"/>
      </motion.g>
    </svg>
  );

  // Mobile View với hình ảnh vector
  if (isMobile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 24,
              border: 'none',
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Header với hình ảnh vector cho mobile */}
              <motion.div 
                variants={itemVariants} 
                style={{ 
                  textAlign: 'center', 
                  marginBottom: 30,
                  padding: '20px 0'
                }}
              >
                <motion.div
                  variants={floatAnimation}
                  animate="animate"
                  style={{
                    width: 140,
                    height: 140,
                    background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 15px 30px rgba(108, 99, 255, 0.4)'
                  }}
                >
                  <MobileFinanceVector />
                </motion.div>
                <Title level={2} style={{ margin: 0, fontWeight: 700 , color: '#6C63FF' }}>
                  ĐĂNG NHẬP
                </Title>
                <Text type="secondary" style={{ fontSize: 16, color: '#666' }}>
                  Chào mừng trở lại
                </Text>
              </motion.div>

              <Form layout="vertical" size="large" onFinish={onFinish}>
                <motion.div variants={itemVariants}>
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input 
                      prefix={<UserOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Email" 
                      style={{ 
                        borderRadius: 16, 
                        height: 56,
                        border: '2px solid #f0f0f0',
                        background: '#fafafa',
                        fontSize: 16,
                        padding: '0 16px'
                      }} 
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Mật khẩu" 
                      style={{ 
                        borderRadius: 16, 
                        height: 56,
                        border: '2px solid #f0f0f0',
                        background: '#fafafa',
                        fontSize: 16,
                        padding: '0 16px'
                      }}
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                  <Link to="/forgot-password" style={{ color: '#6C63FF', fontWeight: 600, fontSize: 14 }}>
                    Quên mật khẩu?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      loading={loading}
                      style={{ 
                        height: 56, 
                        borderRadius: 16, 
                        background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)', 
                        border: 'none', 
                        boxShadow: '0 8px 25px rgba(108, 99, 255, 0.5)',
                        fontSize: 16,
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      ĐĂNG NHẬP
                    </Button>
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider style={{ color: '#888', fontSize: 14, borderColor: '#f0f0f0' }}>
                    Hoặc tiếp tục với
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Space size={15} style={{width: '100%', justifyContent: 'center'}}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        icon={<GoogleOutlined />} 
                        style={{ 
                          height: 50, 
                          width: 50,
                          borderRadius: 16,
                          border: '2px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white'
                        }}
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        icon={<FacebookFilled style={{ color: '#1877f2' }} />} 
                        style={{ 
                          height: 50, 
                          width: 50,
                          borderRadius: 16,
                          border: '2px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white'
                        }}
                      />
                    </motion.div>
                  </Space>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 30 }}>
                  <Text type="secondary" style={{ fontSize: 15 }}>Chưa có tài khoản? </Text>
                  <Link to="/register" style={{ color: '#6C63FF', fontWeight: 'bold', fontSize: 15 }}>
                    Đăng ký ngay
                  </Link>
                </motion.div>
              </Form>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Desktop View với hình ảnh vector
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }}>
      <Row style={{ height: '100%' }}>
        {/* CỘT TRÁI: HÌNH ẢNH VECTOR VÀ NỘI DUNG */}
        <Col xs={0} md={12} lg={14} style={{ 
          position: 'relative',
          background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          overflow: 'hidden'
        }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            style={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              color: 'white',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* Vector Illustration Container */}
            <motion.div
              variants={floatAnimation}
              animate="animate"
              style={{ 
                textAlign: 'center',
                marginBottom: 60
              }}
            >
              <div style={{
                width: 400,
                height: 300,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 40px',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <FinanceVector />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Title level={1} style={{ color: 'white', fontSize: '48px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
                Quản lý tài chính thông minh
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', lineHeight: 1.6, display: 'block', marginBottom: '40px', textAlign: 'center' }}>
                Theo dõi chi tiêu, lập ngân sách và đạt được mục tiêu tài chính của bạn 
                với công cụ quản lý tài chính cá nhân hiện đại.
              </Text>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {['Theo dõi chi tiêu', 'Lập ngân sách', 'Phân tích thông minh', 'Báo cáo tự động'].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      background: 'white', 
                      borderRadius: '50%', 
                      marginRight: '12px' 
                    }}></div>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }}></div>
        </Col>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
        <Col xs={24} md={12} lg={10} style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '60px 40px',
          background: 'white'
        }}>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            style={{ 
              width: '100%', 
              maxWidth: 420
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
                <Title level={2} style={{ 
                  marginBottom: 8, 
                   
                  fontWeight: 700,
                  fontSize: '32px',
                  color:'#6C63FF',
                  textAlign: 'center'
                }}>
                  ĐĂNG NHẬP
                </Title>
                <Text type="secondary" style={{ fontSize: 16, color: '#666' , display: 'flex' , justifyContent: 'center'}}>
                  Truy cập vào tài khoản của bạn
                </Text>
              </motion.div>

              <Form layout="vertical" size="large" onFinish={onFinish}>
                <motion.div variants={itemVariants}>
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input 
                      prefix={<UserOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Email" 
                      style={{ 
                        borderRadius: 16, 
                        height: 56,
                        border: '2px solid #f0f0f0',
                        background: '#fafafa',
                        fontSize: 16,
                        padding: '0 16px',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#6C63FF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)';
                        e.target.style.background = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#f0f0f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = '#fafafa';
                      }}
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Mật khẩu" 
                      style={{ 
                        borderRadius: 16, 
                        height: 56,
                        border: '2px solid #f0f0f0',
                        background: '#fafafa',
                        fontSize: 16,
                        padding: '0 16px',
                        transition: 'all 0.3s'
                      }}
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#6C63FF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.1)';
                        e.target.style.background = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#f0f0f0';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = '#fafafa';
                      }}
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Link to="/forgot-password" style={{ color: '#6C63FF', fontWeight: 600 }}>
                    Quên mật khẩu?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      loading={loading}
                      style={{ 
                        height: 56, 
                        borderRadius: 16, 
                        background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)', 
                        border: 'none', 
                        boxShadow: '0 8px 25px rgba(108, 99, 255, 0.5)',
                        fontSize: 16,
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 30px rgba(108, 99, 255, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 25px rgba(108, 99, 255, 0.5)';
                      }}
                    >
                      ĐĂNG NHẬP
                    </Button>
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Divider style={{ color: '#888', fontSize: 14, borderColor: '#f0f0f0' }}>
                    Hoặc tiếp tục với
                  </Divider>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Space size={15} style={{width: '100%', justifyContent: 'center'}}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        icon={<GoogleOutlined />} 
                        style={{ 
                          height: 50, 
                          borderRadius: 16,
                          border: '2px solid #ddd',
                          fontWeight: 500,
                          padding: '0 24px'
                        }}
                      >
                        Làm cho đẹp
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        icon={<FacebookFilled style={{ color: '#1877f2' }} />} 
                        style={{ 
                          height: 50, 
                          borderRadius: 16,
                          border: '2px solid #ddd',
                          fontWeight: 500,
                          padding: '0 24px'
                        }}
                      >
                        Làm cho xinh
                      </Button>
                    </motion.div>
                  </Space>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 30 }}>
                  <Text type="secondary" style={{ fontSize: 15 }}>Chưa có tài khoản? </Text>
                  <Link to="/register" style={{ color: '#6C63FF', fontWeight: 'bold', fontSize: 15 }}>
                    Đăng ký ngay
                  </Link>
                </motion.div>
              </Form>
            </motion.div>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;