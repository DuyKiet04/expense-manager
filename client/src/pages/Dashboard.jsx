import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Button, Modal, Form, Input, InputNumber, message, List, Avatar, Empty, Grid, Tag } from 'antd';
import { WalletOutlined, ArrowUpOutlined, ArrowDownOutlined, BankOutlined, PlusOutlined, CalendarOutlined, ClockCircleOutlined, FireOutlined, CheckCircleOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axiosClient from '../api/axiosClient';
import { PageContainer, PageItem } from '../components/AnimationWrapper';
import { useNavigate } from 'react-router-dom';
import { ExpenseMapDisplay } from '../components/ExpenseMap';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { motion } from 'framer-motion';

dayjs.locale('vi');
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Màu sắc hiện đại
const COLORS = ['#4FD1C5', '#F6E05E', '#F687B3']; 
const GRADIENTS = {
  income: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  expense: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  balance: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  task: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [taskStats, setTaskStats] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [form] = Form.useForm();
  const [depositForm] = Form.useForm();

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const fetchData = async () => {
    try {
      const [resExp, resGoals, resTasks] = await Promise.all([
        axiosClient.get('/expenses'),
        axiosClient.get('/savings'),
        axiosClient.get('/tasks')
      ]);
      setExpenses(resExp.data);
      processFinanceData(resExp.data);
      setGoals(resGoals.data);
      processTaskData(resTasks.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  // Xử lý dữ liệu (Giữ nguyên logic)
  const processFinanceData = (transactions) => {
    let inc = 0, exp = 0;
    const monthlyData = {};
    transactions.forEach(t => {
      const val = Number(t.amount);
      const month = dayjs(t.date).format('MM/YYYY');
      if (!monthlyData[month]) monthlyData[month] = { name: month, Thu: 0, Chi: 0 };
      if (t.category.type === 'INCOME') { inc += val; monthlyData[month].Thu += val; }
      else if (t.category.type === 'EXPENSE') { exp += val; monthlyData[month].Chi += val; }
    });
    setStats({ income: inc, expense: exp, balance: inc - exp });
    setData(Object.values(monthlyData).reverse());
  };

  const processTaskData = (tasks) => {
    const statusCount = { 'DONE': 0, 'DOING': 0, 'TODO': 0 };
    const now = dayjs();
    const upcoming = tasks.filter(t => {
        if (!t.deadline) return false;
        statusCount[t.status] = (statusCount[t.status] || 0) + 1;
        return t.status !== 'DONE' && dayjs(t.deadline).isAfter(now);
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4); // Lấy 4 cái

    const todayCount = tasks.filter(t => t.status !== 'DONE' && dayjs(t.deadline).isSame(now, 'day')).length;
    setTodayTasksCount(todayCount);
    setUpcomingSchedule(upcoming);
    setTaskStats([
        { name: 'Hoàn thành', value: statusCount.DONE },
        { name: 'Đang làm', value: statusCount.DOING },
        { name: 'Chờ xử lý', value: statusCount.TODO },
    ]);
  };

  const handleCreateGoal = async (values) => { /* ... Logic cũ ... */
    try {
        const rawAmount = values.targetAmount.toString().replace(/,/g, '');
        await axiosClient.post('/savings', { ...values, targetAmount: parseFloat(rawAmount) });
        message.success("Tạo mục tiêu thành công!"); setIsGoalModalOpen(false); form.resetFields(); fetchData();
    } catch (e) { message.error("Lỗi"); }
  };

  const handleDeposit = async (values) => { /* ... Logic cũ ... */
    try {
        const rawAmount = values.amount.toString().replace(/,/g, '');
        await axiosClient.put(`/savings/${selectedGoal.id}/deposit`, { amount: parseFloat(rawAmount) });
        message.success("Nạp tiền thành công!"); setIsDepositModalOpen(false); fetchData();
    } catch (e) { message.error("Lỗi"); }
  };

  // Lời chào theo giờ
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <PageContainer>
      {/* --- HEADER SECTION --- */}
      <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
            <Title level={2} style={{ margin: 0 }}>{getGreeting()}, {user.fullName} 👋</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>Hôm nay là {dayjs().format('dddd, DD/MM/YYYY')}</Text>
        </div>
        <div style={{ marginTop: screens.md ? 0 : 15 }}>
            <Button type="primary" size="large" icon={<PlusOutlined />} style={{ borderRadius: 12, height: 45 }} onClick={() => navigate('/expenses')}>
                Ghi chép nhanh
            </Button>
        </div>
      </div>

      {/* --- STATS CARDS (THẺ NỔI) --- */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.5)', background: GRADIENTS.income, color: 'white', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.2, transform: 'rotate(15deg)' }}><WalletOutlined style={{ fontSize: 100, color: 'white' }} /></div>
                    <Statistic title={<span style={{color:'rgba(255,255,255,0.8)'}}>Tổng Thu Nhập</span>} value={stats.income} valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 28 }} prefix={<ArrowUpOutlined />} />
                </Card>
            </PageItem>
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 10px 30px -10px rgba(255, 154, 158, 0.5)', background: GRADIENTS.expense, color: 'white', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.2, transform: 'rotate(15deg)' }}><FireOutlined style={{ fontSize: 100, color: 'white' }} /></div>
                    <Statistic title={<span style={{color:'rgba(255,255,255,0.8)'}}>Tổng Chi Tiêu</span>} value={stats.expense} valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 28 }} prefix={<ArrowDownOutlined />} />
                </Card>
            </PageItem>
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <PageItem>
                <Card bordered={false} style={{ borderRadius: 20, boxShadow: '0 10px 30px -10px rgba(132, 250, 176, 0.4)', background: GRADIENTS.balance, color: 'white', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.2, transform: 'rotate(15deg)' }}><BankOutlined style={{ fontSize: 100, color: 'white' }} /></div>
                    <Statistic title={<span style={{color:'rgba(255,255,255,0.8)'}}>Số Dư</span>} value={stats.balance} valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 28 }} prefix={<CheckCircleOutlined />} />
                </Card>
            </PageItem>
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <PageItem>
                <Card hoverable onClick={() => navigate('/calendar')} bordered={false} style={{ borderRadius: 20, boxShadow: '0 10px 30px -10px rgba(161, 140, 209, 0.5)', background: GRADIENTS.task, color: 'white', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.2, transform: 'rotate(15deg)' }}><ClockCircleOutlined style={{ fontSize: 100, color: 'white' }} /></div>
                    <Statistic title={<span style={{color:'rgba(255,255,255,0.8)'}}>Deadline Hôm nay</span>} value={todayTasksCount} valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 28 }} suffix="việc" />
                </Card>
            </PageItem>
        </Col>
      </Row>

      {/* --- MAIN CONTENT --- */}
      <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
        {/* LEFT: CHARTS */}
        <Col xs={24} lg={16}>
            <PageItem>
                <Card title="📈 Phân tích tài chính" bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F687B3" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#F687B3" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                                <Tooltip formatter={(val)=>new Intl.NumberFormat('vi-VN').format(val)+'đ'} />
                                <Area type="monotone" dataKey="Thu" stroke="#4FD1C5" fillOpacity={1} fill="url(#colorThu)" />
                                <Area type="monotone" dataKey="Chi" stroke="#F687B3" fillOpacity={1} fill="url(#colorChi)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </PageItem>

            <PageItem style={{marginTop: 24}}>
                <Card title="🎯 Mục tiêu tiết kiệm" extra={<Button type="link" icon={<PlusOutlined/>} onClick={()=>setIsGoalModalOpen(true)}>Thêm</Button>} bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    {goals.length === 0 ? <Empty description="Chưa có mục tiêu" /> : (
                        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10 }}>
                            {goals.map(goal => {
                                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                                return (
                                    <div key={goal.id} style={{ minWidth: 250, padding: 20, background: '#f7fafc', borderRadius: 16, border: '1px solid #edf2f7' }}>
                                        <div style={{display:'flex', justifyContent:'space-between'}}>
                                            <Text strong>{goal.name}</Text>
                                            <TrophyOutlined style={{color:'#F6E05E'}} />
                                        </div>
                                        <Progress percent={percent} strokeColor="#4FD1C5" size="small" style={{margin:'15px 0'}}/>
                                        <div style={{display:'flex', justifyContent:'space-between', fontSize: 12, color:'#718096'}}>
                                            <span>{Number(goal.currentAmount).toLocaleString()}</span>
                                            <span>{Number(goal.targetAmount).toLocaleString()}</span>
                                        </div>
                                        <Button type="primary" size="small" block style={{marginTop: 15, borderRadius: 8}} onClick={()=>{setSelectedGoal(goal); setIsDepositModalOpen(true)}}>Nạp tiền</Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>
            </PageItem>
        </Col>

        {/* RIGHT: TASKS & SCHEDULE */}
        <Col xs={24} lg={8}>
            <PageItem>
                <Card title="Tiến độ công việc" bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: 200 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={taskStats} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {taskStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </PageItem>

            <PageItem style={{marginTop: 24}}>
                <Card title="Lịch trình sắp tới" extra={<Button type="link" onClick={()=>navigate('/calendar')}>Xem tất cả</Button>} bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <List
                        dataSource={upcomingSchedule}
                        renderItem={(item) => (
                            <List.Item style={{padding: '12px 0', borderBottom: '1px solid #f0f0f0'}}>
                                <List.Item.Meta
                                    avatar={<Avatar style={{ backgroundColor: '#E6FFFA', color: '#38B2AC' }} icon={<CalendarOutlined />} />}
                                    title={<Text strong>{item.title}</Text>}
                                    description={<div style={{fontSize: 12, color: '#A0AEC0'}}><ClockCircleOutlined/> {dayjs(item.deadline).format('HH:mm DD/MM')}</div>}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="Không có lịch" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    />
                </Card>
            </PageItem>
        </Col>
      </Row>

      {/* MAP SECTION */}
      <PageItem style={{marginTop: 30}}>
        <Card title="📍 Bản đồ chi tiêu" bordered={false} style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ height: 400, borderRadius: 12, overflow: 'hidden' }}>
                <ExpenseMapDisplay expenses={expenses.filter(e => e.category?.type === 'EXPENSE')} />
            </div>
        </Card>
      </PageItem>

      {/* MODALS - GIỮ NGUYÊN LOGIC */}
      <Modal title="Tạo mục tiêu" open={isGoalModalOpen} onCancel={()=>setIsGoalModalOpen(false)} footer={null} style={{borderRadius:16}}><Form onFinish={handleCreateGoal} layout="vertical"><Form.Item name="name" label="Tên" rules={[{required:true}]}><Input/></Form.Item><Form.Item name="targetAmount" label="Số tiền" rules={[{required:true}]}><InputNumber style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} parser={v=>v.replace(/\$\s?|(,*)/g,'')}/></Form.Item><Button type="primary" htmlType="submit" block>Lưu</Button></Form></Modal>
      <Modal title="Nạp tiền" open={isDepositModalOpen} onCancel={()=>setIsDepositModalOpen(false)} footer={null} style={{borderRadius:16}}><Form onFinish={handleDeposit} layout="vertical"><Form.Item name="amount" label="Số tiền" rules={[{required:true}]}><InputNumber style={{width:'100%'}} formatter={v=>`${v}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')} parser={v=>v.replace(/\$\s?|(,*)/g,'')}/></Form.Item><Button type="primary" htmlType="submit" block style={{background:'#52c41a', borderColor:'#52c41a'}}>Xác nhận</Button></Form></Modal>
    </PageContainer>
  );
};

export default Dashboard;