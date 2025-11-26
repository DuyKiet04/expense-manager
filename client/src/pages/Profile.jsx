import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Avatar, Typography, message, Tag, Upload, Grid, Row, Col, Divider, Statistic } from 'antd';
import { UserOutlined, SaveOutlined, UploadOutlined, MailOutlined, CalendarOutlined, SafetyCertificateOutlined, CheckCircleOutlined, WalletOutlined, CheckSquareOutlined, CameraOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  // State lưu thống kê cá nhân
  const [stats, setStats] = useState({ expenseCount: 0, taskCount: 0, joinedDays: 0 });
  
  const [fileList, setFileList] = useState([]); 
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const avatarUrl = Form.useWatch('avatar', form); 

  // Load dữ liệu thống kê thực tế
  useEffect(() => {
    const loadData = async () => {
        try {
            form.setFieldsValue({ fullName: user.fullName, email: user.email });
            
            // Gọi API để đếm số liệu (Nếu muốn chính xác thì Backend nên có API riêng, đây là cách "chữa cháy" frontend)
            const [resExp, resTask] = await Promise.all([
                axiosClient.get('/expenses'),
                axiosClient.get('/tasks')
            ]);
            
            // Tính số ngày tham gia
            const joinedDate = dayjs(user.createdAt || new Date());
            const diffDays = dayjs().diff(joinedDate, 'day');

            setStats({
                expenseCount: resExp.data.length,
                taskCount: resTask.data.filter(t => t.status === 'DONE').length,
                joinedDays: diffDays
            });
        } catch(e) {}
    };
    loadData();
  }, [user]);

  const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));
  const dummyRequest = ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      if (fileList.length > 0) formData.append('avatar', fileList[0].originFileObj);

      const res = await axiosClient.put('/auth/profile', formData, { headers: { "Content-Type": "multipart/form-data" } });
      message.success("Cập nhật thành công!");
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setFileList([]);
      window.location.reload(); 
    } catch (error) { message.error("Lỗi cập nhật"); } finally { setLoading(false); }
  };

  const previewImage = fileList.length > 0 ? URL.createObjectURL(fileList[0].originFileObj) : user.avatar;

  return (
    <PageContainer>
        {/* PHẦN 1: ẢNH BÌA NGHỆ THUẬT */}
        <PageItem>
            <div style={{ 
                height: 200, 
                background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)', 
                borderRadius: 24,
                position: 'relative',
                marginBottom: -80, // Kỹ thuật đẩy nội dung đè lên ảnh bìa
                boxShadow: '0 10px 30px rgba(132, 250, 176, 0.3)'
            }}>
                {/* Họa tiết trang trí */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: 20, left: 40, color: 'white', fontSize: 24, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    Hồ sơ cá nhân
                </div>
            </div>
        </PageItem>

        <div style={{ padding: '0 20px' }}>
            <Row gutter={[24, 24]}>
                {/* PHẦN 2: CỘT TRÁI - THÔNG TIN & THỐNG KÊ */}
                <Col xs={24} md={8}>
                    <PageItem>
                        <Card 
                            bordered={false} 
                            style={{ borderRadius: 24, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                        >
                            {/* Avatar nổi */}
                            <div style={{ position: 'relative', display: 'inline-block', marginTop: -60 }}>
                                <Avatar 
                                    size={120} 
                                    src={previewImage} 
                                    icon={<UserOutlined />} 
                                    style={{ 
                                        backgroundColor: 'white', 
                                        border: '6px solid white',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
                                    }}
                                />
                                <div style={{ position: 'absolute', bottom: 5, right: 5, background: '#52c41a', width: 24, height: 24, borderRadius: '50%', border: '3px solid white' }}></div>
                            </div>
                            
                            <Title level={3} style={{ marginTop: 10, marginBottom: 5 }}>{user.fullName}</Title>
                            <Tag color={user.role === 'ADMIN' ? 'volcano' : 'geekblue'} style={{ borderRadius: 10, padding: '2px 10px' }}>
                                {user.role === 'ADMIN' ? '👑 Administrator' : 'Member'}
                            </Tag>

                            {/* Thống kê nhanh */}
                            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'space-around', background: '#f9f9f9', padding: '15px 0', borderRadius: 16 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <Statistic title="Ngày tham gia" value={stats.joinedDays} suffix="ngày" valueStyle={{fontSize: 18, fontWeight: 'bold'}} />
                                </div>
                                <div style={{ width: 1, background: '#e8e8e8' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <Statistic title="Giao dịch" value={stats.expenseCount} valueStyle={{fontSize: 18, fontWeight: 'bold', color: '#cf1322'}} />
                                </div>
                                <div style={{ width: 1, background: '#e8e8e8' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <Statistic title="Task xong" value={stats.taskCount} valueStyle={{fontSize: 18, fontWeight: 'bold', color: '#52c41a'}} />
                                </div>
                            </div>

                            <Divider dashed style={{ margin: '20px 0' }} />

                            <div style={{ textAlign: 'left', padding: '0 10px' }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>THÔNG TIN LIÊN HỆ</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 36, height: 36, background: '#e6f7ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff' }}><MailOutlined /></div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888' }}>Email</div>
                                        <div style={{ fontWeight: 500 }}>{user.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, background: '#f6ffed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52c41a' }}><CalendarOutlined /></div>
                                    <div>
                                        <div style={{ fontSize: 12, color: '#888' }}>Ngày đăng ký</div>
                                        <div style={{ fontWeight: 500 }}>{dayjs(user.createdAt).format('DD/MM/YYYY')}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </PageItem>
                </Col>

                {/* PHẦN 3: CỘT PHẢI - FORM CHỈNH SỬA */}
                <Col xs={24} md={16}>
                    <PageItem>
                        <Card 
                            title="⚙️ Cài đặt tài khoản" 
                            bordered={false} 
                            style={{ borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}
                        >
                            <Form form={form} layout="vertical" onFinish={handleUpdate} size="large">
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label="Họ và tên hiển thị" name="fullName" rules={[{ required: true }]}>
                                            <Input prefix={<UserOutlined style={{color:'#bfbfbf'}}/>} style={{ borderRadius: 12 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Email đăng nhập" name="email" help="Email dùng để định danh, không thể thay đổi.">
                                            <Input prefix={<MailOutlined style={{color:'#bfbfbf'}}/>} disabled style={{ borderRadius: 12, color: '#555', cursor: 'not-allowed' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Cập nhật ảnh đại diện">
                                    <div style={{ border: '2px dashed #d9d9d9', padding: 20, borderRadius: 16, textAlign: 'center', background: '#fafafa' }}>
                                        <Upload 
                                            listType="picture" 
                                            fileList={fileList} 
                                            onChange={handleFileChange} 
                                            customRequest={dummyRequest} 
                                            maxCount={1} 
                                            accept="image/*"
                                            showUploadList={{ showRemoveIcon: true }}
                                        >
                                            {fileList.length < 1 && (
                                                <Button icon={<CameraOutlined />} style={{ borderRadius: 12, height: 40 }}>
                                                    Chọn ảnh từ thiết bị
                                                </Button>
                                            )}
                                        </Upload>
                                        <div style={{ marginTop: 10, color: '#888', fontSize: 12 }}>
                                            Hỗ trợ: .PNG, .JPG (Max 2MB)
                                        </div>
                                    </div>
                                </Form.Item>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                    <Button size="large" style={{ borderRadius: 12 }} onClick={() => window.location.reload()}>Hủy bỏ</Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        icon={<SaveOutlined />} 
                                        loading={loading} 
                                        size="large"
                                        style={{ borderRadius: 12, padding: '0 30px', background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)', border: 'none' }}
                                    >
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </Form>
                        </Card>
                    </PageItem>
                </Col>
            </Row>
        </div>
    </PageContainer>
  );
};

export default Profile;