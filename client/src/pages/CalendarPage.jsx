import { useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Modal, Form, Input, Select, TimePicker, message, Typography, Grid } from 'antd';
import { PlusOutlined, EnvironmentOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

dayjs.locale('vi');
const localizer = dayjsLocalizer(dayjs);
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint(); // Lấy kích thước màn hình

  const fetchTasks = async () => {
    try {
      const res = await axiosClient.get('/tasks');
      const calendarEvents = res.data
        .filter(task => task.deadline) 
        .map(task => {
            const startDate = new Date(task.deadline);
            const endDate = dayjs(startDate).add(2, 'hour').toDate();
            return {
                id: task.id,
                title: task.title,
                start: startDate,
                end: endDate,
                desc: task.description,
                priority: task.priority
            };
        });
      setEvents(calendarEvents);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAddClass = async (values) => {
    try {
        const today = dayjs();
        const currentDayOfWeek = today.day(); 
        const targetDayOfWeek = parseInt(values.dayOfWeek);
        
        let diff = targetDayOfWeek - currentDayOfWeek;
        if (targetDayOfWeek === 0) diff = 7 - currentDayOfWeek;
        
        const targetDate = today.add(diff, 'day');
        const timeStart = values.time;
        const finalDateTime = targetDate.hour(timeStart.hour()).minute(timeStart.minute()).second(0).toDate();
        const description = `Phòng: ${values.room} | GV: ${values.teacher}`;

        await axiosClient.post('/tasks', {
            title: `[Học] ${values.subject}`,
            deadline: finalDateTime,
            description: description,
            priority: 'HIGH'
        });
        message.success("Đã thêm lịch học!"); setIsModalOpen(false); form.resetFields(); fetchTasks();
    } catch (error) { message.error("Lỗi thêm lịch học"); }
  };

  const EventComponent = ({ event }) => (
    <div style={{ fontSize: 12 }}>
        <strong>{event.title}</strong>
        {event.desc && <div style={{ fontSize: 10, opacity: 0.9 }}>{event.desc}</div>}
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Responsive */}
      <div style={{ 
          display: 'flex', 
          flexDirection: screens.md ? 'row' : 'column', // Mobile xếp dọc
          justifyContent: 'space-between', 
          alignItems: screens.md ? 'center' : 'flex-start',
          marginBottom: 16,
          gap: 10
      }}>
        <div>
           <Title level={3} style={{ margin: 0 }}>
             <CalendarOutlined style={{ marginRight: 10, color: '#6C63FF' }} />
             Thời khóa biểu
           </Title>
           <Text type="secondary">Lịch học & sự kiện</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ borderRadius: 8 }} block={!screens.md}>
            Thêm lịch học
        </Button>
      </div>
      
      <div style={{ 
          flex: 1, 
          background: 'white', 
          padding: screens.md ? 20 : 10, 
          borderRadius: 16, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden'
      }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          // 👇 THÔNG MINH: Nếu là Mobile -> Hiện dạng Danh sách (Agenda), PC -> Hiện dạng Tuần
          defaultView={screens.md ? 'week' : 'agenda'} 
          views={['month', 'week', 'day', 'agenda']}
          style={{ height: '100%' }}
          components={{ event: EventComponent }}
          messages={{ next: "Sau", previous: "Trước", today: "Hôm nay", month: "Tháng", week: "Tuần", day: "Ngày", agenda: "DS Lịch" }}
          eventPropGetter={(event) => ({
              style: {
                  backgroundColor: event.priority === 'HIGH' ? '#6C63FF' : '#00C49F',
                  borderRadius: 6, border: 'none'
              }
          })}
        />
      </div>

      <Modal title="Thêm lịch học mới" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={screens.md ? 500 : '100%'} style={{top: screens.md?100:0}}>
        <Form form={form} layout="vertical" onFinish={handleAddClass}>
          <Form.Item name="subject" label="Tên môn học" rules={[{ required: true }]}><Input placeholder="VD: Tiếng Anh..." /></Form.Item>
          <div style={{ display: 'flex', gap: 10 }}>
            <Form.Item name="dayOfWeek" label="Thứ" style={{ flex: 1 }} rules={[{ required: true }]}>
                <Select placeholder="Chọn"><Option value="1">Thứ 2</Option><Option value="2">Thứ 3</Option><Option value="3">Thứ 4</Option><Option value="4">Thứ 5</Option><Option value="5">Thứ 6</Option><Option value="6">Thứ 7</Option><Option value="0">Chủ nhật</Option></Select>
            </Form.Item>
            <Form.Item name="time" label="Giờ" style={{ flex: 1 }} rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Chọn" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Form.Item name="room" label="Phòng" style={{ flex: 1 }}><Input prefix={<EnvironmentOutlined />} placeholder="P.101" /></Form.Item>
            <Form.Item name="teacher" label="GV" style={{ flex: 1 }}><Input prefix={<UserOutlined />} placeholder="Cô Lan" /></Form.Item>
          </div>
          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>Lưu vào lịch</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarPage;