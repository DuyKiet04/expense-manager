import { Form, Input, Button, Typography, Row, Col, message, theme, Divider, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SmileOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [isMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axiosClient.post('/auth/register', {
        fullName: values.fullName,
        email: values.email,
        password: values.password
      });
      message.success("Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
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
  const RegisterVector = () => (
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none">
      {/* Background Elements */}
      <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="200" r="60" fill="rgba(255,255,255,0.05)"/>
      
      {/* Main Registration Illustration */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Person with document */}
        <circle cx="200" cy="150" r="40" fill="#6C63FF"/>
        <circle cx="190" cy="140" r="8" fill="white"/>
        <circle cx="210" cy="140" r="8" fill="white"/>
        <path d="M185 160 Q200 170 215 160" stroke="white" strokeWidth="3"/>
        
        {/* Document */}
        <rect x="230" y="120" width="60" height="80" rx="5" fill="white"/>
        <rect x="240" y="135" width="40" height="5" rx="2" fill="#6C63FF"/>
        <rect x="240" y="145" width="35" height="5" rx="2" fill="#E0E0E0"/>
        <rect x="240" y="155" width="30" height="5" rx="2" fill="#E0E0E0"/>
        <rect x="240" y="165" width="40" height="5" rx="2" fill="#6C63FF"/>
        
        {/* Success Elements */}
        <motion.circle
          cx="280"
          cy="100"
          r="15"
          fill="#4CAF50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
        <motion.path
          d="M275 100 L278 105 L285 95"
          stroke="white"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        />
      </motion.g>
    </svg>
  );

  const MobileRegisterVector = () => (
    <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
      {/* Mobile Registration Illustration */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Person */}
        <circle cx="100" cy="80" r="30" fill="#6C63FF"/>
        <circle cx="92" cy="72" r="5" fill="white"/>
        <circle cx="108" cy="72" r="5" fill="white"/>
        <path d="M95 90 Q100 95 105 90" stroke="white" strokeWidth="2"/>
        
        {/* Document */}
        <rect x="70" y="110" width="60" height="40" rx="5" fill="white" stroke="#6C63FF" strokeWidth="2"/>
        <rect x="80" y="120" width="40" height="3" rx="1" fill="#6C63FF"/>
        <rect x="80" y="126" width="35" height="3" rx="1" fill="#E0E0E0"/>
        <rect x="80" y="132" width="30" height="3" rx="1" fill="#E0E0E0"/>
        
        {/* Checkmark */}
        <motion.path
          d="M140 130 L145 135 L155 125"
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
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
          <Card style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: 24, 
            border: 'none', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
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
                  <MobileRegisterVector />
                </motion.div>
                <Title level={2} style={{ margin: 0, color: '#6C63FF', fontWeight: 700 }}>
                  ĐĂNG KÝ
                </Title>
                <Text type="secondary" style={{ fontSize: 16, color: '#666' }}>
                  Bắt đầu hành trình mới cùng chúng tôi
                </Text>
              </motion.div>

              <Form layout="vertical" size="large" onFinish={onFinish}>
                <motion.div variants={itemVariants}>
                  <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                    <Input 
                      prefix={<SmileOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Họ và tên" 
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
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input 
                      prefix={<MailOutlined style={{ color: '#6C63FF' }} />} 
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
                  <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }]}>
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
                    />
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Form.Item 
                    name="confirm" 
                    dependencies={['password']} 
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu' }, 
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Xác nhận mật khẩu" 
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
                        fontWeight: 'bold'
                      }}
                    >
                      TẠO TÀI KHOẢN
                    </Button>
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 30 }}>
                  <Text type="secondary" style={{ fontSize: 15 }}>Đã có tài khoản? </Text>
                  <Link to="/login" style={{ color: '#6C63FF', fontWeight: 'bold', fontSize: 15 }}>
                    Đăng nhập ngay
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
                <RegisterVector />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Title level={1} style={{ color: 'white', fontSize: '48px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
                Bắt đầu hành trình mới
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', lineHeight: 1.6, display: 'block', marginBottom: '40px', textAlign: 'center' }}>
                Tham gia cùng hàng ngàn người dùng khác để quản lý tài chính cá nhân hiệu quả hơn bao giờ hết.
              </Text>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {['Quản lý thông minh', 'Báo cáo chi tiết', 'An toàn tuyệt đối', 'Hoàn toàn miễn phí'].map((feature, index) => (
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

        {/* CỘT PHẢI: FORM ĐĂNG KÝ */}
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
                  color: '#6C63FF', 
                  fontWeight: 700,
                  fontSize: '32px'
                }}>
                  ĐĂNG KÝ
                </Title>
                <Text type="secondary" style={{ fontSize: 16, color: '#666' }}>
                  Điền thông tin chi tiết của bạn
                </Text>
              </motion.div>

              <Form layout="vertical" size="large" onFinish={onFinish}>
                <motion.div variants={itemVariants}>
                  <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                    <Input 
                      prefix={<SmileOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Họ và tên" 
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
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input 
                      prefix={<MailOutlined style={{ color: '#6C63FF' }} />} 
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
                  <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }]}>
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
                  <Form.Item 
                    name="confirm" 
                    dependencies={['password']} 
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu' }, 
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined style={{ color: '#6C63FF' }} />} 
                      placeholder="Xác nhận mật khẩu" 
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
                      TẠO TÀI KHOẢN
                    </Button>
                  </Form.Item>
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 30 }}>
                  <Text type="secondary" style={{ fontSize: 15 }}>Đã có tài khoản? </Text>
                  <Link to="/login" style={{ color: '#6C63FF', fontWeight: 'bold', fontSize: 15 }}>
                    Đăng nhập ngay
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

export default Register;