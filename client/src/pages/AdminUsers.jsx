import { useEffect, useState } from 'react';
import { Table, Tag, Card, Avatar, Typography, Button, message, Popconfirm, Select, Space, Row, Col, Statistic, List, Grid } from 'antd';
import { UserOutlined, DeleteOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper'; // Import hiệu ứng

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const screens = useBreakpoint();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/users');
      setUsers(res.data);
    } catch (error) { message.error("Lỗi tải danh sách"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    try { await axiosClient.delete(`/admin/users/${id}`); message.success("Đã xóa"); fetchUsers(); } catch (e) { message.error("Lỗi"); }
  };

  const handleChangeRole = async (id, newRole) => {
    try { await axiosClient.put(`/admin/users/${id}/role`, { role: newRole }); message.success("Đã đổi quyền"); fetchUsers(); } catch (e) { message.error("Lỗi"); }
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;

  const columns = [
    { title: 'Người dùng', key: 'user', render: (_, r) => <Space><Avatar icon={<UserOutlined />} src={r.avatar} /><div style={{display:'flex', flexDirection:'column'}}><span style={{fontWeight:600}}>{r.fullName}</span><span style={{fontSize:12, color:'#888'}}>{r.email}</span></div></Space> },
    { title: 'Thống kê', render: (_, r) => <Tag>{r._count.expenses} chi tiêu • {r._count.tasks} task</Tag> },
    { title: 'Quyền', key: 'role', render: (_, r) => <Select defaultValue={r.role} style={{width:100}} onChange={(v)=>handleChangeRole(r.id,v)} disabled={r.id===currentUser.id} bordered={false}><Option value="USER"><Tag color="blue">User</Tag></Option><Option value="ADMIN"><Tag color="red">Admin</Tag></Option></Select> },
    { title: '', render: (_, r) => <Popconfirm title="Xóa?" onConfirm={()=>handleDelete(r.id)} disabled={r.id===currentUser.id}><Button danger type="text" icon={<DeleteOutlined/>} disabled={r.id===currentUser.id}/></Popconfirm> }
  ];

  return (
    <PageContainer>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} md={12}>
            <PageItem>
                <Card bordered={false} className="gradient-card" style={{ borderRadius: 12 }} bodyStyle={{padding: screens.md?24:12}}>
                    <Statistic title="Tổng User" value={totalUsers} prefix={<TeamOutlined />} />
                </Card>
            </PageItem>
        </Col>
        <Col xs={12} md={12}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 12 }} bodyStyle={{padding: screens.md?24:12}}>
                    <Statistic title="Admin" value={adminCount} prefix={<CrownOutlined style={{color:'#ff4d4f'}} />} />
                </Card>
            </PageItem>
        </Col>
      </Row>

      <PageItem>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} title={<Title level={4} style={{ margin:0 }}>Danh sách người dùng</Title>}>
            {screens.md ? (
                <Table dataSource={users} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} />
            ) : (
                <List itemLayout="horizontal" dataSource={users} loading={loading} renderItem={(item) => (
                    <List.Item actions={[
                        <Select defaultValue={item.role} size="small" onChange={(v)=>handleChangeRole(item.id,v)} disabled={item.id===currentUser.id}><Option value="USER">User</Option><Option value="ADMIN">Admin</Option></Select>,
                        <Popconfirm title="Xóa?" onConfirm={()=>handleDelete(item.id)} disabled={item.id===currentUser.id}><Button danger size="small" icon={<DeleteOutlined/>} disabled={item.id===currentUser.id}/></Popconfirm>
                    ]}>
                        <List.Item.Meta 
                            avatar={<Avatar icon={<UserOutlined />} src={item.avatar} style={{backgroundColor: item.role==='ADMIN'?'#ff4d4f':'#1890ff'}}/>}
                            title={item.fullName}
                            description={<div><div style={{fontSize:11}}>{item.email}</div><Tag style={{marginTop:4}}>{item._count.expenses} Chi tiêu</Tag></div>}
                        />
                    </List.Item>
                )} />
            )}
        </Card>
      </PageItem>
    </PageContainer>
  );
};
export default AdminUsers;