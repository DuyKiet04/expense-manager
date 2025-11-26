import { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Tag, Typography, Grid, List, Row, Col, Statistic, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, TagsOutlined, AppstoreOutlined, WalletOutlined, BankOutlined, SwapRightOutlined, SwapLeftOutlined, FireOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Cấu hình màu sắc và icon cho từng loại danh mục
const TYPE_CONFIG = {
  EXPENSE: { color: '#ff4d4f', bg: '#fff1f0', label: 'Chi tiêu', icon: <FireOutlined /> },
  INCOME: { color: '#52c41a', bg: '#f6ffed', label: 'Thu nhập', icon: <WalletOutlined /> },
  SAVING: { color: '#faad14', bg: '#fff7e6', label: 'Tiết kiệm', icon: <BankOutlined /> },
  DEBT_LENT: { color: '#722ed1', bg: '#f9f0ff', label: 'Cho vay', icon: <SwapRightOutlined /> },
  DEBT_BORROWED: { color: '#eb2f96', bg: '#fff0f6', label: 'Đi vay', icon: <SwapLeftOutlined /> },
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (values) => {
    try {
      await axiosClient.post('/categories', values);
      message.success("Thêm danh mục thành công!");
      setIsModalOpen(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      message.error("Lỗi thêm mới");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) {
      try {
        await axiosClient.delete(`/categories/${id}`);
        message.success("Đã xóa");
        fetchCategories();
      } catch (error) {
        message.error("Không thể xóa danh mục đang có dữ liệu!");
      }
    }
  };

  // Đếm số lượng danh mục
  const totalCats = categories.length;
  const expenseCats = categories.filter(c => c.type === 'EXPENSE').length;
  const incomeCats = categories.filter(c => c.type === 'INCOME').length;

  // Cột cho Table (Desktop)
  const columns = [
    { 
      title: 'Tên danh mục', 
      dataIndex: 'name', 
      render: (t, r) => (
        <div style={{display:'flex', alignItems:'center', gap: 10}}>
            <div style={{ 
                width: 32, height: 32, borderRadius: 8, 
                background: TYPE_CONFIG[r.type]?.bg || '#f5f5f5', 
                color: TYPE_CONFIG[r.type]?.color || '#666',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {TYPE_CONFIG[r.type]?.icon || <AppstoreOutlined />}
            </div>
            <Text strong>{t}</Text>
        </div>
      ) 
    },
    { 
      title: 'Loại', 
      dataIndex: 'type', 
      render: (t) => (
        <Tag color={TYPE_CONFIG[t]?.color} style={{ borderRadius: 12, padding: '2px 10px' }}>
            {TYPE_CONFIG[t]?.label || t}
        </Tag>
      ) 
    },
    { 
      title: '', 
      align: 'right', 
      render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} /> 
    }
  ];

  return (
    <PageContainer>
        {/* Header Thống kê */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
                <PageItem>
                    <Card bordered={false} className="gradient-card" style={{ borderRadius: 16, height: 100, display:'flex', alignItems:'center' }}>
                        <Statistic title="Tổng danh mục" value={totalCats} prefix={<AppstoreOutlined />} valueStyle={{ color: 'white' }} />
                    </Card>
                </PageItem>
            </Col>
            <Col xs={12} sm={8}>
                <PageItem>
                    <Card bordered={false} style={{ borderRadius: 16, height: 100, background: '#fff1f0' }}>
                        <Statistic title="Mục Chi tiêu" value={expenseCats} prefix={<FireOutlined />} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </PageItem>
            </Col>
            <Col xs={12} sm={8}>
                <PageItem>
                    <Card bordered={false} style={{ borderRadius: 16, height: 100, background: '#f6ffed' }}>
                        <Statistic title="Mục Thu nhập" value={incomeCats} prefix={<WalletOutlined />} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </PageItem>
            </Col>
        </Row>

        {/* Danh sách chính */}
        <PageItem>
            <Card 
                bordered={false} 
                style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                title={<Title level={4} style={{ margin: 0 }}><TagsOutlined /> Quản lý danh mục</Title>}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 12, boxShadow: '0 4px 10px rgba(24, 144, 255, 0.3)' }} onClick={() => setIsModalOpen(true)}>
                        Thêm mới
                    </Button>
                }
            >
                {screens.md ? (
                    // DESKTOP: HIỆN BẢNG
                    <Table 
                        dataSource={categories} 
                        columns={columns} 
                        rowKey="id" 
                        loading={loading}
                        pagination={{ pageSize: 8 }} 
                    />
                ) : (
                    // MOBILE: HIỆN DANH SÁCH THẺ
                    <List
                        dataSource={categories}
                        loading={loading}
                        renderItem={(item) => (
                            <List.Item 
                                actions={[<Button danger type="text" icon={<DeleteOutlined/>} onClick={()=>handleDelete(item.id)}/>]}
                                style={{ padding: '12px 0' }}
                            >
                                <List.Item.Meta 
                                    avatar={
                                        <div style={{ 
                                            width: 40, height: 40, borderRadius: 12, 
                                            background: TYPE_CONFIG[item.type]?.bg, 
                                            color: TYPE_CONFIG[item.type]?.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                                        }}>
                                            {TYPE_CONFIG[item.type]?.icon}
                                        </div>
                                    }
                                    title={<Text strong>{item.name}</Text>}
                                    description={<Tag color={TYPE_CONFIG[item.type]?.color}>{TYPE_CONFIG[item.type]?.label}</Tag>}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="Chưa có danh mục" /> }}
                    />
                )}
            </Card>
        </PageItem>
        
        {/* Modal Thêm mới */}
        <Modal 
            title="✨ Thêm danh mục mới" 
            open={isModalOpen} 
            onCancel={()=>setIsModalOpen(false)} 
            footer={null}
            style={{ borderRadius: 16 }}
        >
            <Form form={form} onFinish={handleAdd} layout="vertical" size="large">
                <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục!' }]}>
                    <Input placeholder="Ví dụ: Mua sắm, Lương tháng..." style={{ borderRadius: 8 }} />
                </Form.Item>
                
                <Form.Item name="type" label="Loại danh mục" initialValue="EXPENSE" rules={[{ required: true }]}>
                    <Select style={{ borderRadius: 8 }}>
                        <Option value="EXPENSE">💸 Chi tiêu (Ăn uống, Mua sắm...)</Option>
                        <Option value="INCOME">💰 Thu nhập (Lương, Thưởng...)</Option>
                        <Option value="SAVING">🐷 Tiết kiệm</Option>
                        <Option value="DEBT_LENT">🤝 Cho vay</Option>
                        <Option value="DEBT_BORROWED">🏦 Đi vay</Option>
                    </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" block style={{ borderRadius: 12, height: 45, marginTop: 10 }}>
                    Lưu lại
                </Button>
            </Form>
        </Modal>
    </PageContainer>
  );
};

export default AdminCategories;