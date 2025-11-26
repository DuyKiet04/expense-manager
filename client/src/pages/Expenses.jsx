import { useEffect, useState } from 'react';
import { Table, Button, Card, Tag, Modal, Form, Input, InputNumber, Select, message, Typography, Upload, Image, Space, Segmented, Row, Col, List, Avatar, Grid, Checkbox, Statistic, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, UploadOutlined, PaperClipOutlined, DownloadOutlined, EnvironmentOutlined, UnorderedListOutlined, WalletOutlined, BarChartOutlined, FileTextOutlined, GlobalOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { MapPicker, ExpenseMapDisplay } from '../components/ExpenseMap';
import { PageContainer, PageItem } from '../components/AnimationWrapper';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Màu Gradient cho từng loại (Đồng bộ với Dashboard)
const TAB_STYLES = {
  EXPENSE: { color: '#f56a00', bg: '#fff7e6', icon: <FireOutlined />, label: 'Chi tiêu' },
  INCOME: { color: '#52c41a', bg: '#f6ffed', icon: <WalletOutlined />, label: 'Thu nhập' },
  SAVING: { color: '#1890ff', bg: '#e6f7ff', icon: <BankOutlined />, label: 'Tiết kiệm' },
  DEBT_LENT: { color: '#722ed1', bg: '#f9f0ff', icon: <SwapRightOutlined />, label: 'Cho vay' },
  DEBT_BORROWED: { color: '#eb2f96', bg: '#fff0f6', icon: <SwapLeftOutlined />, label: 'Đi vay' },
};

// Import thêm icon bị thiếu
import { FireOutlined, BankOutlined, SwapRightOutlined, SwapLeftOutlined } from '@ant-design/icons';

const Expenses = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('EXPENSE'); 
  const [fileList, setFileList] = useState([]); 
  const [viewMode, setViewMode] = useState('LIST'); 
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, resCat] = await Promise.all([axiosClient.get('/expenses'), axiosClient.get('/categories')]);
      setData(resData.data);
      setCategories(resCat.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));
  const dummyRequest = ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0);

  const handleAdd = async (values) => {
    try {
      const formData = new FormData();
      formData.append('amount', values.amount);
      formData.append('note', values.note);
      formData.append('categoryId', values.categoryId);
      formData.append('isFamily', values.isFamily || false);
      if (fileList.length > 0) formData.append('image', fileList[0].originFileObj);
      if (selectedLocation) {
          formData.append('lat', selectedLocation.lat);
          formData.append('lng', selectedLocation.lng);
          formData.append('address', selectedAddress); 
      }
      await axiosClient.post('/expenses', formData, { headers: { "Content-Type": "multipart/form-data" } });
      message.success("Thêm thành công");
      setIsModalOpen(false); form.resetFields(); setFileList([]); setSelectedLocation(null); setSelectedAddress(''); fetchData();
    } catch (error) { message.error("Lỗi thêm mới"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Xóa khoản này?")) { await axiosClient.delete(`/expenses/${id}`); fetchData(); }
  };

  const handleExport = () => {
    const dataToExport = filteredData.map(item => ({
      'Ngày': dayjs(item.date).format('DD/MM/YYYY'), 'Nội dung': item.note, 'Số tiền': item.amount, 'Danh mục': item.category?.name, 'Địa chỉ': item.address
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `ChiTieu_${activeTab}.xlsx`);
  };

  const filteredData = data.filter(item => {
    if (item.category?.type !== activeTab) return false;
    const s = searchText.toLowerCase();
    return item.note?.toLowerCase().includes(s) || item.amount?.toString().includes(s) || item.category?.name?.toLowerCase().includes(s);
  });

  const filteredCategories = categories.filter(c => c.type === activeTab);
  const totalAmount = filteredData.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const columns = [
    { title: 'Ngày', dataIndex: 'date', width: 110, render: t => <Text type="secondary">{dayjs(t).format('DD/MM/YY')}</Text> },
    { title: 'Nội dung', dataIndex: 'note', render: (t, r) => <div><Text strong>{t}</Text>{r.address && <div style={{fontSize: 11, color:'#888'}}><EnvironmentOutlined/> {r.address}</div>}</div> },
    { title: 'Số tiền', dataIndex: 'amount', render: v => <span style={{color: activeTab==='INCOME'?'green':'#cf1322', fontWeight: 700}}>{Number(v).toLocaleString()} đ</span> },
    { title: 'Danh mục', dataIndex: 'category', render: c => <Tag color="blue" style={{borderRadius: 10}}>{c?.name}</Tag>, responsive: ['md'] },
    { title: 'Ảnh', dataIndex: 'imageUrl', align: 'center', render: (url) => url ? <Image width={35} height={35} src={url} style={{borderRadius: 6, objectFit: 'cover'}} /> : <PaperClipOutlined style={{ color: '#eee' }} /> },
    { title: '', align: 'center', width: 60, render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={()=>handleDelete(r.id)} /> }
  ];

  return (
    <PageContainer>
      {/* HEADER & STATS */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 20, background: 'linear-gradient(135deg, #6C63FF 0%, #4834d4 100%)', color: 'white', height: 120, display: 'flex', alignItems: 'center' }}>
                    <Statistic 
                        title={<span style={{color: 'rgba(255,255,255,0.8)'}}>Tổng tiền ({TAB_STYLES[activeTab]?.label})</span>} 
                        value={totalAmount} 
                        prefix={<WalletOutlined />} 
                        suffix="đ" 
                        valueStyle={{ color: 'white', fontSize: 32, fontWeight: 'bold' }} 
                    />
                </Card>
            </PageItem>
        </Col>
        <Col xs={24} md={12}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 20, background: 'white', height: 120, display: 'flex', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <Statistic 
                        title="Số lượng giao dịch" 
                        value={filteredData.length} 
                        prefix={<FileTextOutlined style={{ color: '#6C63FF' }} />} 
                        valueStyle={{ color: '#333', fontSize: 32, fontWeight: 'bold' }} 
                    />
                </Card>
            </PageItem>
        </Col>
      </Row>

      {/* MAIN CONTENT CARD */}
      <PageItem>
        <Card 
            bordered={false} 
            style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}
            bodyStyle={{ padding: screens.md ? 24 : 12 }}
        >
            {/* 1. TABS CHỌN LOẠI TIỀN */}
            <div style={{ marginBottom: 24, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 5 }}>
                {Object.keys(TAB_STYLES).map(key => {
                    const isActive = activeTab === key;
                    return (
                        <Button 
                            key={key}
                            type={isActive ? 'primary' : 'text'}
                            icon={TAB_STYLES[key].icon}
                            onClick={() => setActiveTab(key)}
                            style={{ 
                                marginRight: 10, 
                                borderRadius: 20, 
                                height: 40, 
                                padding: '0 20px',
                                background: isActive ? (key === 'EXPENSE' ? '#ff4d4f' : key === 'INCOME' ? '#52c41a' : '#1890ff') : 'transparent',
                                color: isActive ? 'white' : '#666',
                                fontWeight: 500,
                                border: isActive ? 'none' : '1px solid #f0f0f0'
                            }}
                        >
                            {TAB_STYLES[key].label}
                        </Button>
                    )
                })}
            </div>

            {/* 2. TOOLBAR (SEARCH & BUTTONS) */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Input 
                    size="large" 
                    placeholder="🔍 Tìm kiếm nội dung, số tiền..." 
                    style={{ flex: 1, minWidth: 200, borderRadius: 12, background: '#f9f9f9', border: 'none' }} 
                    onChange={e => setSearchText(e.target.value)} 
                />
                <div style={{ display: 'flex', gap: 10 }}>
                    {screens.md && (
                        <>
                            <Segmented options={[{ label: 'Danh sách', value: 'LIST', icon: <UnorderedListOutlined /> }, { label: 'Bản đồ', value: 'MAP', icon: <EnvironmentOutlined /> }]} onChange={setViewMode} style={{ background: '#f0f0f0' }} />
                            <Button size="large" icon={<DownloadOutlined />} onClick={handleExport} style={{ borderRadius: 12 }}>Excel</Button>
                        </>
                    )}
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ borderRadius: 12, boxShadow: '0 4px 14px rgba(108, 99, 255, 0.3)' }}>
                        {screens.md ? 'Thêm giao dịch' : 'Thêm'}
                    </Button>
                </div>
            </div>

            {/* 3. CONTENT (LIST OR MAP) */}
            {viewMode === 'MAP' ? (
                <div style={{ height: 500, borderRadius: 12, overflow: 'hidden' }}><ExpenseMapDisplay expenses={filteredData} /></div>
            ) : (
                screens.md ? (
                    <Table dataSource={filteredData} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} />
                ) : (
                    <List itemLayout="horizontal" dataSource={filteredData} loading={loading} renderItem={(item) => (
                        <List.Item 
                            actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={()=>handleDelete(item.id)} />]} 
                            style={{ background: '#f9fafb', marginBottom: 12, padding: 16, borderRadius: 16, border: '1px solid #f0f0f0' }}
                        >
                            <List.Item.Meta 
                                avatar={item.imageUrl ? <Avatar src={item.imageUrl} shape="square" size={48} style={{borderRadius: 8}} /> : <Avatar style={{backgroundColor: TAB_STYLES[activeTab]?.color || '#ccc', borderRadius: 8}} icon={TAB_STYLES[activeTab]?.icon} size={48} />} 
                                title={<div style={{display:'flex',justifyContent:'space-between', alignItems:'center'}}><span style={{fontSize: 15, fontWeight: 600}}>{item.note}</span><span style={{color:activeTab==='INCOME'?'#52c41a':'#ff4d4f', fontWeight:'bold', fontSize: 15}}>{Number(item.amount).toLocaleString()}</span></div>} 
                                description={<div style={{marginTop: 4}}><Tag style={{borderRadius: 4}}>{item.category?.name}</Tag> <span style={{fontSize:12, color:'#999'}}>{dayjs(item.date).format('DD/MM')}</span>{item.address && <div style={{fontSize:11, color:'#888', marginTop: 4, display:'flex', alignItems:'center'}}><EnvironmentOutlined style={{marginRight:4}}/> {item.address}</div>}</div>} 
                            />
                        </List.Item>
                    )} />
                )
            )}
        </Card>
      </PageItem>

      {/* MODAL ADD */}
      <Modal title="Thêm giao dịch mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600} style={{ top: 50, borderRadius: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Row gutter={16}><Col span={12}><Form.Item name="amount" label="Số tiền" rules={[{ required: true }]}><InputNumber style={{width: '100%', borderRadius: 8}} size="large" formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v=>v.replace(/\$\s?|(,*)/g, '')} addonAfter="VNĐ"/></Form.Item></Col><Col span={12}><Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}><Select size="large" style={{borderRadius: 8}}>{filteredCategories.map(c=><Option key={c.id} value={c.id}>{c.name}</Option>)}</Select></Form.Item></Col></Row>
          <Form.Item name="note" label="Ghi chú"><Input size="large" style={{borderRadius: 8}}/></Form.Item>
          {activeTab === 'EXPENSE' && <Form.Item name="isFamily" valuePropName="checked"><Checkbox>Chi cho Gia đình</Checkbox></Form.Item>}
          <Form.Item label="Hình ảnh"><Upload listType="picture" fileList={fileList} onChange={handleFileChange} customRequest={dummyRequest} maxCount={1} accept="image/*"><Button icon={<UploadOutlined />} size="large" style={{borderRadius: 8, width: '100%'}}>Chọn ảnh / Chụp ảnh</Button></Upload></Form.Item>
          <Form.Item label="Vị trí"><div style={{ border: '1px solid #d9d9d9', borderRadius: 12, overflow: 'hidden' }}><MapPicker onLocationSelect={setSelectedLocation} onAddressSelect={(addr) => setSelectedAddress(addr)} /></div>{selectedAddress && <div style={{color:'green', fontSize: 12, marginTop: 5}}><EnvironmentOutlined/> {selectedAddress}</div>}</Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{borderRadius: 12, height: 45, fontWeight: 'bold'}}>Lưu lại</Button>
        </Form>
      </Modal>
    </PageContainer>
  );
};
export default Expenses;