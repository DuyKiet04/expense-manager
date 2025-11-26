import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Typography, Timeline, Select, Upload, Image, Tag, Tooltip, Popconfirm, Switch, Space } from 'antd';
import { SendOutlined, BellOutlined, InfoCircleOutlined, UploadOutlined, VideoCameraOutlined, WarningOutlined, FireOutlined, CheckCircleOutlined, HistoryOutlined, ReloadOutlined, DeleteOutlined, GiftOutlined, EyeOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const NOTI_TYPES = {
  INFO: { label: 'Tin tức', color: 'blue', icon: <InfoCircleOutlined />, bg: '#e6f7ff' },
  SUCCESS: { label: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined />, bg: '#f6ffed' },
  WARNING: { label: 'Cảnh báo', color: 'orange', icon: <WarningOutlined />, bg: '#fff7e6' },
  URGENT: { label: 'Khẩn cấp', color: 'red', icon: <FireOutlined />, bg: '#fff1f0' },
  PROMO: { label: 'Quảng cáo', color: 'purple', icon: <GiftOutlined />, bg: '#f9f0ff' },
};

const AdminNotifications = () => {
  const [form] = Form.useForm();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]); 

  // State Preview
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewType, setPreviewType] = useState('INFO');

  const fetchHistory = async () => {
    try { const res = await axiosClient.get('/admin/notifications'); setHistory(res.data); } catch (e) {}
  };
  useEffect(() => { fetchHistory(); }, []);

  const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));

  const handleSend = async (values) => {
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('message', values.message);
        formData.append('type', values.type);
        // Gửi giá trị isPopup (true/false)
        formData.append('isPopup', values.isPopup || false); 
        
        if (fileList.length > 0) formData.append('media', fileList[0].originFileObj);

        await axiosClient.post('/admin/notifications', formData, { headers: { "Content-Type": "multipart/form-data" } });
        
        message.success("Đã phát thông báo!");
        fetchHistory();
        form.resetFields();
        setFileList([]);
        setPreviewTitle(''); setPreviewMessage('');
    } catch (error) { message.error("Gửi thất bại"); } finally { setLoading(false); }
  };

  const handleResend = (item) => {
    form.setFieldsValue({ title: item.title, message: item.message, type: item.type, isPopup: item.isPopup });
    setPreviewTitle(item.title); setPreviewMessage(item.message); setPreviewType(item.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    message.info("Đã sao chép nội dung cũ.");
  };

  const handleDelete = async (id) => {
    try { await axiosClient.delete(`/admin/notifications/${id}`); message.success("Đã xóa"); fetchHistory(); } catch (e) { message.error("Lỗi xóa"); }
  };

  return (
    <PageContainer>
        <Title level={3} style={{marginBottom: 20}}><BellOutlined/> Trung tâm Quảng cáo & Thông báo</Title>
        <Row gutter={24}>
            {/* CỘT TRÁI: SOẠN THẢO */}
            <Col xs={24} md={10}>
                <PageItem>
                    <Card title="📢 Soạn tin mới" bordered={false} style={{borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
                        <Form form={form} layout="vertical" onFinish={handleSend} initialValues={{ type: 'INFO', isPopup: false }} size="large">
                            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input onChange={e=>setPreviewTitle(e.target.value)}/></Form.Item>
                            <Form.Item name="type" label="Loại tin">
                                <Select onChange={setPreviewType}>
                                    {Object.keys(NOTI_TYPES).map(k => <Option key={k} value={k}><Tag color={NOTI_TYPES[k].color}>{NOTI_TYPES[k].label}</Tag></Option>)}
                                </Select>
                            </Form.Item>
                            
                            {/* 👇 TÙY CHỌN POPUP BẮT BUỘC 👇 */}
                            <Form.Item name="isPopup" valuePropName="checked" style={{marginBottom: 15}}>
                                <div style={{background: '#f0f5ff', padding: 10, borderRadius: 8, display:'flex', alignItems:'center', gap: 10, border: '1px solid #adc6ff'}}>
                                    <Switch /> 
                                    <span style={{fontSize: 13, fontWeight: 500}}>Bắt buộc hiện Popup khi User đăng nhập?</span>
                                </div>
                            </Form.Item>

                            <Form.Item name="message" label="Nội dung" rules={[{ required: true }]}><Input.TextArea rows={3} onChange={e=>setPreviewMessage(e.target.value)}/></Form.Item>
                            <Form.Item label="Hình ảnh / Video"><Upload listType="picture" fileList={fileList} onChange={handleFileChange} beforeUpload={()=>false} maxCount={1}><Button icon={<UploadOutlined />}>Chọn Media</Button></Upload></Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SendOutlined />} block size="large" loading={loading} style={{borderRadius: 8}}>Phát sóng ngay</Button>
                        </Form>
                    </Card>
                </PageItem>

                <PageItem style={{marginTop: 20}}>
                    <Card title="👁️ Xem trước" bordered={false} style={{borderRadius: 16, background: '#f9f9f9'}}>
                        <div style={{ display:'flex', gap: 10, alignItems:'start' }}>
                            <div style={{fontSize: 24, color: NOTI_TYPES[previewType]?.color}}>{NOTI_TYPES[previewType]?.icon}</div>
                            <div>
                                <div style={{fontWeight:'bold'}}>{previewTitle || 'Tiêu đề...'}</div>
                                <div style={{fontSize:13, color:'#666'}}>{previewMessage || 'Nội dung...'}</div>
                            </div>
                        </div>
                    </Card>
                </PageItem>
            </Col>
            
            {/* CỘT PHẢI: LỊCH SỬ */}
            <Col xs={24} md={14}>
                <PageItem>
                    <Card title="Lịch sử phát sóng" bordered={false} style={{borderRadius: 16, height: '100%'}}>
                        <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 10 }}>
                            <Timeline mode="left">
                                {history.map((item, idx) => (
                                    <Timeline.Item key={item.id} color={NOTI_TYPES[item.type]?.color} dot={NOTI_TYPES[item.type]?.icon}>
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: '#fff', padding: 15, borderRadius: 12, border: '1px solid #f0f0f0', position: 'relative' }}>
                                            <Space style={{position: 'absolute', top: 10, right: 10}}>
                                                <Tooltip title="Phát lại"><Button type="text" icon={<ReloadOutlined />} size="small" style={{ color: '#1890ff' }} onClick={() => handleResend(item)} /></Tooltip>
                                                <Popconfirm title="Xóa?" onConfirm={()=>handleDelete(item.id)}><Button type="text" icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
                                            </Space>
                                            <div style={{fontWeight:'bold', marginRight: 50}}>{item.title}</div>
                                            <div style={{fontSize: 11, color: '#888', marginBottom: 5}}>{dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}</div>
                                            <div>{item.message}</div>
                                            <div style={{marginTop: 8, display:'flex', gap: 5}}>
                                                {item.mediaUrl && <Tag color="blue">{item.mediaType === 'VIDEO' ? 'Video' : 'Hình ảnh'}</Tag>}
                                                {item.isPopup && <Tag color="red" icon={<EyeOutlined />}>Popup bắt buộc</Tag>}
                                            </div>
                                        </motion.div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </div>
                    </Card>
                </PageItem>
            </Col>
        </Row>
    </PageContainer>
  );
};
export default AdminNotifications;