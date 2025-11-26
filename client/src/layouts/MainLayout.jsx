import { Layout, Menu, Avatar, Dropdown, Space, Switch, theme, Drawer, Button, Grid, notification, Modal, Badge, List, Popover, Typography, Tag, Result, Spin } from 'antd';
import { 
  PieChartOutlined, DesktopOutlined, WalletOutlined, 
  UserOutlined, LogoutOutlined, TeamOutlined, 
  TagsOutlined, BellOutlined, CalendarOutlined,
  FileTextOutlined, SunOutlined, MoonOutlined, MenuOutlined,
  InfoCircleOutlined, WarningOutlined, FireOutlined, CheckCircleOutlined,
  CloseOutlined, GiftOutlined, RocketOutlined, DeleteOutlined, LockOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { io } from 'socket.io-client';
import axiosClient from '../api/axiosClient'; 
import dayjs from 'dayjs';

const { Header, Content, Footer, Sider } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const TYPE_STYLES = {
  INFO: { color: '#1890ff', icon: <InfoCircleOutlined />, label: 'Tin tức' },
  SUCCESS: { color: '#52c41a', icon: <CheckCircleOutlined />, label: 'Hoàn thành' },
  WARNING: { color: '#faad14', icon: <WarningOutlined />, label: 'Cảnh báo' },
  URGENT: { color: '#ff4d4f', icon: <FireOutlined />, label: 'Khẩn cấp' },
  PROMO: { color: '#722ed1', icon: <GiftOutlined />, label: 'Khuyến mãi' },
};

const MainLayout = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [notifDrawer, setNotifDrawer] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [viewData, setViewData] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [deletedIds, setDeletedIds] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem('deleted_notifications') || '[]')); } catch { return new Set(); } });
  const [readIds, setReadIds] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem('read_notifications') || '[]')); } catch { return new Set(); } });

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  let user = {};
  try { const userStr = localStorage.getItem('user'); user = userStr ? JSON.parse(userStr) : { fullName: "User", role: "USER" }; } catch (e) { localStorage.clear(); window.location.href = '/login'; }
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const visibleNotifications = notifications.filter(n => !deletedIds.has(n.id));
  const unreadCount = visibleNotifications.filter(n => !readIds.has(n.id)).length;

  // 1. KIỂM TRA HỆ THỐNG (Chạy mỗi khi F5 hoặc Login)
  const checkSystem = async () => {
    if (user.role === 'ADMIN') { setCheckingStatus(false); return; } 
    try {
        const res = await axiosClient.get('/notifications/system-status');
        const { maintenance, promo } = res.data;

        if (maintenance) {
            setMaintenanceData(maintenance);
            setIsModalVisible(false);
        } else {
            setMaintenanceData(null);
            
            // 👇 LOGIC QUAN TRỌNG: CÓ QUẢNG CÁO LÀ HIỆN (KHÔNG CHECK ĐÃ ĐỌC)
            if (promo) {
                setViewData(promo);
                setIsModalVisible(true);
            } else {
                // Nếu không có quảng cáo thì mới check popup tin thường chưa đọc
                const popupRes = await axiosClient.get('/notifications/popups');
                if (popupRes.data && popupRes.data.length > 0) { 
                    setViewData(popupRes.data[0]); 
                    setIsModalVisible(true); 
                }
            }
        }
    } catch (e) { console.error(e); } finally { setCheckingStatus(false); }
  };

  const fetchNotifications = async () => {
    try { const res = await axiosClient.get('/notifications'); setNotifications(res.data); } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    checkSystem(); 

    const socket = io('http://localhost:5000');
    socket.on('receive_notification', (data) => {
        if (user.role === 'ADMIN') return;
        setNotifications(prev => [data, ...prev]);
        
        if (data.type === 'URGENT') { setMaintenanceData(data); setIsModalVisible(false); } 
        else if (data.type === 'PROMO') { setViewData(data); setIsModalVisible(true); } 
        else {
            const style = TYPE_STYLES[data.type] || TYPE_STYLES.INFO;
            notification.open({
                message: <span style={{fontWeight: 'bold'}}>{data.title}</span>,
                description: "Bấm để xem...",
                icon: <span style={{color: style.color}}>{style.icon}</span>,
                placement: 'bottomRight',
                duration: 0,
                onClick: () => handleViewNotification(data)
            });
        }
    });

    socket.on('system_update', () => {
        console.log("♻️ Hệ thống cập nhật...");
        checkSystem(); 
    });

    return () => socket.disconnect();
  }, []);

  // Đánh dấu đã đọc
  const markAsRead = (item) => {
    if (!readIds.has(item.id)) {
        const newSet = new Set(readIds).add(item.id);
        setReadIds(newSet);
        localStorage.setItem('read_notifications', JSON.stringify([...newSet]));
    }
  };

  const handleViewNotification = (item) => {
    setViewData(item); setIsModalVisible(true); setNotifDrawer(false);
    markAsRead(item);
  };
  
  const handleDeleteNotification = (e, id) => {
    e.stopPropagation(); const newSet = new Set(deletedIds).add(id); setDeletedIds(newSet); localStorage.setItem('deleted_notifications', JSON.stringify([...newSet])); message.success("Đã xóa");
  };

  // Xử lý đóng Modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    
    if (viewData && viewData.type !== 'PROMO') {
        markAsRead(viewData);
    }
  };

  // --- MÀN HÌNH KHÓA ---
  if (maintenanceData && user.role !== 'ADMIN') {
    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? '#000' : '#f0f2f5', position: 'fixed', top: 0, left: 0, zIndex: 99999 }}>
            <Result
                status="500"
                icon={<LockOutlined style={{color: '#ff4d4f', fontSize: 80}} />}
                title={<span style={{color: isDarkMode?'white':'#333', fontSize: 32, fontWeight: 'bold'}}>HỆ THỐNG TẠM KHÓA</span>}
                subTitle={
                    <div style={{color: isDarkMode?'#ccc':'#666', fontSize: 18, maxWidth: 600, margin: '0 auto', background: isDarkMode?'#1f1f1f':'white', padding: 30, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                        <Tag color="red" style={{fontSize: 16, padding: '5px 15px', marginBottom: 20}}>⚠️ {maintenanceData.title}</Tag>
                        <div style={{whiteSpace: 'pre-line', lineHeight: 1.6}}>{maintenanceData.message}</div>
                        <div style={{marginTop: 30, fontSize: 14, color: '#888', borderTop: '1px solid #eee', paddingTop: 15}}>Vui lòng quay lại sau.</div>
                    </div>
                }
                extra={[<Button key="reload" type="primary" icon={<ReloadOutlined/>} onClick={() => window.location.reload()} size="large" style={{borderRadius: 8, height: 45, marginTop: 20}}>Kiểm tra lại</Button>, <Button key="logout" onClick={handleLogout} size="large" style={{borderRadius: 8, height: 45, marginTop: 20, marginLeft: 10}}>Đăng xuất</Button>]}
            />
        </div>
    );
  }

  // ... (NotificationList, Menu, BellButton giữ nguyên)
  const NotificationList = () => ( <List dataSource={visibleNotifications} renderItem={item => { const isRead = readIds.has(item.id); const typeInfo = TYPE_STYLES[item.type] || TYPE_STYLES.INFO; return (<List.Item onClick={() => handleViewNotification(item)} actions={[<Button type="text" size="small" icon={<DeleteOutlined style={{color:'#999'}} />} onClick={(e) => handleDeleteNotification(e, item.id)} />]} style={{ padding: '15px', cursor: 'pointer', transition: '0.3s', borderBottom: '1px solid #f0f0f0', background: isRead ? 'transparent' : (isDarkMode ? '#1f1f1f' : '#e6f7ff'), borderLeft: `4px solid ${typeInfo.color}` }}><List.Item.Meta avatar={<Badge dot={!isRead} offset={[0, 5]}><div style={{ fontSize: 24, color: typeInfo.color, marginTop: 5 }}>{typeInfo.icon}</div></Badge>} title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><Text strong={!isRead} style={{ fontSize: 14 }}>{item.title}</Text>{!isRead && <Tag color="red" style={{fontSize: 10, lineHeight: '18px', height: 20}}>MỚI</Tag>}</div>} description={<div><div style={{fontSize:13, color: isRead?'#999':(isDarkMode?'#ccc':'#555'), margin:'4px 0'}}>{item.message.substring(0, 50)}{item.message.length>50?'...':''}</div><div style={{fontSize:11, color: '#aaa'}}>{dayjs(item.createdAt).format('HH:mm DD/MM')}</div></div>} /></List.Item>); }} locale={{ emptyText: "Không có thông báo" }} /> );
  const userMenu = { items: [ { key: '/profile', label: 'Hồ sơ cá nhân', icon: <UserOutlined />, onClick: () => { navigate('/profile'); setOpenDrawer(false); } }, { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout, danger: true }, ] };
  const baseItems = [ { key: '/', icon: <PieChartOutlined />, label: 'Tổng quan' }, { key: '/expenses', icon: <WalletOutlined />, label: 'Quản lý chi tiêu' }, { key: '/tasks', icon: <DesktopOutlined />, label: 'Quản lý công việc' }, { key: '/calendar', icon: <CalendarOutlined />, label: 'Thời khóa biểu' } ];
  const menuItems = user.role === 'ADMIN' ? [ ...baseItems, { type: 'divider' }, { key: '/admin/users', icon: <TeamOutlined />, label: 'Quản trị người dùng', style: { color: '#ff4d4f' } }, { key: '/admin/categories', icon: <TagsOutlined />, label: 'Quản lý danh mục', style: { color: '#ff4d4f' } }, { key: '/admin/templates', icon: <FileTextOutlined />, label: 'Quản lý mẫu Task', style: { color: '#ff4d4f' } }, { key: '/admin/notifications', icon: <BellOutlined />, label: 'Gửi thông báo', style: { color: '#ff4d4f' } } ] : baseItems;
  const renderMenu = () => ( <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={(e) => { navigate(e.key); setOpenDrawer(false); }} style={{ background: isDarkMode ? '#000' : '#001529' }} /> );
  const BellButton = () => (<Badge count={unreadCount} overflowCount={99}><Button shape="circle" icon={<BellOutlined />} size="large" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onClick={() => { if (!screens.md) setNotifDrawer(true); }} /></Badge>);
  const promoModalStyle = { padding: 0, borderRadius: 24, overflow: 'hidden', background: isDarkMode ? 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)' : 'linear-gradient(to bottom, #ffffff, #f0f2f5)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' };
  const ctaButtonStyle = { borderRadius: 30, height: 50, fontSize: 18, fontWeight: 'bold', border: 'none', background: 'linear-gradient(135deg, #6C63FF 0%, #a855f7 100%)', boxShadow: '0 10px 20px -10px rgba(108, 99, 255, 0.5)', marginTop: 25, transition: 'all 0.3s ease' };
  const closeIconStyle = { position: 'absolute', top: 15, right: 15, zIndex: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%', padding: 8, backdropFilter: 'blur(4px)', cursor: 'pointer', transition: 'all 0.2s' };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {screens.md && <Sider theme="dark" width={220} style={{ background: isDarkMode ? '#000' : '#001529' }}><div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />{renderMenu()}</Sider>}
      {!screens.md && <Drawer title="Menu" placement="left" onClose={() => setOpenDrawer(false)} open={openDrawer} bodyStyle={{ padding: 0, background: isDarkMode ? '#000' : '#001529' }} headerStyle={{ background: token.colorBgContainer }} width={260}>{renderMenu()}</Drawer>}
      {!screens.md && (<Drawer title="Thông báo" placement="right" onClose={() => setNotifDrawer(false)} open={notifDrawer} width="85%" bodyStyle={{ padding: 0 }}><NotificationList /></Drawer>)}
      
      {checkingStatus && !maintenanceData ? (
         <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large"/></div>
      ) : (
         <Layout>
            <Header style={{ background: token.colorBgContainer, padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {!screens.md ? (<Button type="text" icon={<MenuOutlined />} onClick={() => setOpenDrawer(true)} style={{ fontSize: '18px' }} />) : <div />} 
              <Space size={20}>
                <Switch checked={isDarkMode} onChange={toggleTheme} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />
                {screens.md ? (<Popover content={<div style={{width: 350, maxHeight: 400, overflowY: 'auto'}}><NotificationList/></div>} title="Thông báo" trigger="click" placement="bottomRight"><div><BellButton/></div></Popover>) : (<BellButton/>)}
                <Dropdown menu={userMenu}><Space style={{ cursor: 'pointer' }}><Avatar src={user.avatar} style={{ backgroundColor: user.role === 'ADMIN' ? '#f56a00' : '#87d068' }} icon={<UserOutlined />} />{screens.md && <strong>{user.fullName}</strong>}</Space></Dropdown>
              </Space>
            </Header>
            <Content style={{ margin: screens.md ? '24px' : '10px' }}> <Outlet /> </Content>
            <Footer style={{ textAlign: 'center', fontSize: 12, padding: '10px 0' }}>Tạo bởi DuyKietDev ©2025</Footer>
         </Layout>
      )}

      <Modal title={null} footer={null} open={isModalVisible} onCancel={handleCloseModal} centered width={500} bodyStyle={promoModalStyle} closeIcon={null}>
        {viewData && (
            <div style={{ position: 'relative' }}>
                <CloseOutlined style={closeIconStyle} onClick={handleCloseModal} />
                {viewData.mediaUrl && (
                    <div style={{ position: 'relative', height: 0, paddingBottom: '60%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                        {viewData.mediaType === 'VIDEO' ? (<video controls autoPlay loop muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}><source src={viewData.mediaUrl} type="video/mp4" /></video>) : (<img src={viewData.mediaUrl} alt="Promo" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />)}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
                    </div>
                )}
                <div style={{ padding: '25px 30px 35px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 15, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, fontSize: 12, color: viewData.type === 'PROMO' ? '#a855f7' : TYPE_STYLES[viewData.type]?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{TYPE_STYLES[viewData.type]?.icon} {TYPE_STYLES[viewData.type]?.label || 'THÔNG BÁO'}</div>
                    <Title level={2} style={{ margin: '0 0 15px', color: isDarkMode ? 'white' : '#333', fontWeight: 800, lineHeight: 1.2 }}>{viewData.title}</Title>
                    <Text style={{ fontSize: 16, color: isDarkMode ? '#ccc' : '#555', lineHeight: 1.6, display: 'block', marginBottom: 10 }}>{viewData.message}</Text>
                    <Button type="primary" size="large" block onClick={handleCloseModal} style={ctaButtonStyle} icon={<RocketOutlined />}>{viewData.type === 'PROMO' ? 'Khám phá ưu đãi ngay!' : 'Đã hiểu, cảm ơn!'}</Button>
                </div>
            </div>
        )}
      </Modal>
    </Layout>
  );
};
export default MainLayout;