import { useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Tag, Grid, List, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper'; // Import hiệu ứng

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Title } = Typography;

const AdminTaskTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();

  const fetchTemplates = async () => { const res = await axiosClient.get('/templates'); setTemplates(res.data); };
  useEffect(() => { fetchTemplates(); }, []);

  const handleAdd = async (values) => { await axiosClient.post('/templates', values); message.success("Đã thêm"); setIsModalOpen(false); form.resetFields(); fetchTemplates(); };
  const handleDelete = async (id) => { if(window.confirm("Xóa?")) { await axiosClient.delete(`/templates/${id}`); fetchTemplates(); } };

  const columns = [
    { title: 'Tên mẫu', dataIndex: 'name', render: t => <b>{t}</b> },
    { title: 'Ưu tiên', dataIndex: 'defaultPriority', render: p => <Tag color={p==='HIGH'?'red':p==='MEDIUM'?'orange':'green'}>{p}</Tag> },
    { title: '', align:'right', render: (_, r) => <Button danger icon={<DeleteOutlined/>} onClick={()=>handleDelete(r.id)} type="text"/> }
  ];

  return (
    <PageContainer className="container-max-800" style={{maxWidth: 800, margin: '0 auto'}}>
        <PageItem>
            <Card title={<Title level={4} style={{margin:0}}><FileTextOutlined /> Mẫu công việc</Title>} extra={<Button type="primary" icon={<PlusOutlined/>} onClick={()=>setIsModalOpen(true)}>Thêm</Button>} bordered={false} style={{borderRadius:12}}>
            {screens.md ? <Table dataSource={templates} columns={columns} rowKey="id" /> : 
                <List dataSource={templates} renderItem={(item) => (
                    <List.Item actions={[<Button danger icon={<DeleteOutlined/>} onClick={()=>handleDelete(item.id)} type="text"/>]}>
                        <List.Item.Meta title={item.name} description={<Tag color={item.defaultPriority==='HIGH'?'red':item.defaultPriority==='MEDIUM'?'orange':'green'}>{item.defaultPriority}</Tag>} />
                    </List.Item>
                )} />
            }
            </Card>
        </PageItem>
        <Modal title="Thêm mẫu" open={isModalOpen} onCancel={()=>setIsModalOpen(false)} footer={null}><Form form={form} layout="vertical" onFinish={handleAdd}><Form.Item name="name" label="Tên" rules={[{required:true}]}><Input /></Form.Item><Form.Item name="defaultPriority" label="Ưu tiên" initialValue="MEDIUM"><Select><Option value="LOW">Thấp</Option><Option value="MEDIUM">Vừa</Option><Option value="HIGH">Cao</Option></Select></Form.Item><Button type="primary" htmlType="submit" block>Lưu</Button></Form></Modal>
    </PageContainer>
  );
};
export default AdminTaskTemplates;