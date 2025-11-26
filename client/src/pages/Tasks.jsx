import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Tag, Modal, Form, Input, DatePicker, Select, message, Typography, Empty, Grid, Dropdown, Avatar, Tooltip, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, ToTopOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';
import { PageContainer, PageItem } from '../components/AnimationWrapper';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Cấu hình màu sắc cho từng cột
const COLUMNS = {
  TODO: { title: 'Cần làm', color: '#faad14', bg: '#fffbe6', icon: <ToTopOutlined /> },
  DOING: { title: 'Đang thực hiện', color: '#1890ff', bg: '#e6f7ff', icon: <SyncOutlined spin /> },
  DONE: { title: 'Đã hoàn thành', color: '#52c41a', bg: '#f6ffed', icon: <CheckCircleOutlined /> }
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get('/tasks');
      setTasks(res.data);
      setFilteredTasks(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchTasks(); }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const results = tasks.filter(t => t.title.toLowerCase().includes(lowerSearch) || t.description?.toLowerCase().includes(lowerSearch));
    setFilteredTasks(results);
  }, [searchText, tasks]);

  const updateStatus = async (id, status) => {
    try {
        await axiosClient.put(`/tasks/${id}/status`, { status });
        message.success("Đã cập nhật trạng thái"); 
        fetchTasks();
    } catch (e) { message.error("Lỗi cập nhật"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa công việc này?")) { 
        await axiosClient.delete(`/tasks/${id}`); 
        fetchTasks(); 
    }
  };

  const handleAdd = async (values) => {
    try {
        await axiosClient.post('/tasks', values);
        message.success("Đã tạo công việc mới");
        setIsModalOpen(false); 
        form.resetFields(); 
        fetchTasks();
    } catch (e) { message.error("Lỗi tạo mới"); }
  };

  // Component thẻ Task đơn lẻ
  const TaskCard = ({ task }) => (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card 
            bordered={false}
            style={{ marginBottom: 12, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
            bodyStyle={{ padding: 16 }}
            actions={[
                task.status !== 'TODO' && <Tooltip title="Quay lại"><Button type="text" size="small" icon={<ToTopOutlined />} onClick={() => updateStatus(task.id, 'TODO')} /></Tooltip>,
                task.status !== 'DOING' && <Tooltip title="Đang làm"><Button type="text" size="small" style={{color: '#1890ff'}} icon={<SyncOutlined />} onClick={() => updateStatus(task.id, 'DOING')} /></Tooltip>,
                task.status !== 'DONE' && <Tooltip title="Hoàn thành"><Button type="text" size="small" style={{color: '#52c41a'}} icon={<CheckCircleOutlined />} onClick={() => updateStatus(task.id, 'DONE')} /></Tooltip>,
                <Tooltip title="Xóa"><Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(task.id)} /></Tooltip>
            ].filter(Boolean)} // Lọc bỏ các nút null
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Tag color={task.priority === 'HIGH' ? '#ff4d4f' : task.priority === 'MEDIUM' ? 'orange' : 'green'} style={{ borderRadius: 4, marginRight: 0 }}>
                    {task.priority === 'HIGH' ? '🔥 Gấp' : task.priority === 'MEDIUM' ? '⚡ Vừa' : '🌱 Thấp'}
                </Tag>
                {task.deadline && (
                    <Tag icon={<ClockCircleOutlined />} color="default" style={{ borderRadius: 4, border: 'none', background: '#f5f5f5' }}>
                        {dayjs(task.deadline).format('DD/MM')}
                    </Tag>
                )}
            </div>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4, textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? '#999' : '#333' }}>
                {task.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }} ellipsis={{ tooltip: task.description }}>
                {task.description || "Không có mô tả"}
            </Text>
        </Card>
    </motion.div>
  );

  // Component Cột Kanban
  const KanbanColumn = ({ status }) => {
    const columnData = filteredTasks.filter(t => t.status === status);
    const config = COLUMNS[status];

    return (
      <Col xs={24} md={8} style={{ marginBottom: 24 }}>
        <div style={{ background: '#f4f5f7', padding: '16px', borderRadius: 16, height: '100%' }}>
            {/* Header Cột */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar shape="square" size="small" style={{ backgroundColor: config.color }} icon={config.icon} />
                    <Title level={5} style={{ margin: 0, color: '#333' }}>{config.title}</Title>
                </div>
                <Badge count={columnData.length} style={{ backgroundColor: 'white', color: config.color, boxShadow: 'none' }} />
            </div>

            {/* Danh sách Card */}
            <div style={{ minHeight: 200 }}>
                {columnData.length === 0 ? (
                    <Empty description="Trống" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ opacity: 0.5, marginTop: 40 }} />
                ) : (
                    columnData.map(task => <TaskCard key={task.id} task={task} />)
                )}
            </div>
        </div>
      </Col>
    );
  };

  return (
    <PageContainer>
      {/* HEADER & SEARCH */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>Quản lý công việc</Title>
            <Text type="secondary">Theo dõi tiến độ và deadline</Text>
        </div>
        <div style={{ display: 'flex', gap: 10, flex: screens.md ? '0 0 auto' : '1 1 100%' }}>
            <Input 
                size="large" 
                placeholder="🔍 Tìm công việc..." 
                style={{ borderRadius: 12, border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minWidth: 200 }} 
                onChange={e => setSearchText(e.target.value)}
            />
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ borderRadius: 12, height: 40, boxShadow: '0 4px 14px rgba(24, 144, 255, 0.3)' }}>
                {screens.md ? "Thêm mới" : "Thêm"}
            </Button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <Row gutter={[20, 20]}>
        <KanbanColumn status="TODO" />
        <KanbanColumn status="DOING" />
        <KanbanColumn status="DONE" />
      </Row>

      {/* MODAL ADD TASK */}
      <Modal title="Thêm công việc mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={500} style={{ borderRadius: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="title" label="Tên công việc" rules={[{ required: true }]}><Input size="large" placeholder="VD: Hoàn thành báo cáo..." style={{ borderRadius: 8 }}/></Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết"><Input.TextArea rows={3} style={{ borderRadius: 8 }}/></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="priority" label="Độ ưu tiên" initialValue="MEDIUM">
                    <Select size="large" style={{ borderRadius: 8 }}>
                        <Option value="LOW">🌱 Thấp</Option>
                        <Option value="MEDIUM">⚡ Trung bình</Option>
                        <Option value="HIGH">🔥 Cao</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="deadline" label="Hạn chót">
                    <DatePicker style={{ width: '100%', borderRadius: 8 }} size="large" format="DD/MM/YYYY" />
                </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 12, marginTop: 10, fontWeight: 'bold' }}>Tạo công việc</Button>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Tasks;