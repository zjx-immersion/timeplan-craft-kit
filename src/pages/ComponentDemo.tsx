/**
 * ComponentDemo - 组件演示页面
 * 
 * 📋 用途:
 * - 测试通用组件的功能
 * - 展示组件的使用方法
 * - 验证组件是否正常工作
 */

import React, { useState } from 'react';
import { Space, Card, Divider, Typography, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import {
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
} from '../components/common';

const { Title, Paragraph, Text } = Typography;

export const ComponentDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState<string>();
  const [dateValue, setDateValue] = useState<Dayjs | null>(null);

  const handleSubmit = () => {
    message.success('提交成功！');
    console.log({
      input: inputValue,
      select: selectValue,
      date: dateValue?.format('YYYY-MM-DD'),
    });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>通用组件演示</Title>
      <Paragraph>
        这是新创建的 5 个通用组件的演示页面，用于测试组件功能是否正常。
      </Paragraph>

      <Divider />

      {/* Button 演示 */}
      <Card title="Button 按钮组件" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button variant="outlined">默认按钮</Button>
          <Button type="primary">主要按钮</Button>
          <Button variant="dashed">虚线按钮</Button>
          <Button variant="text">文本按钮</Button>
          <Button variant="link">链接按钮</Button>
        </Space>

        <Divider />

        <Space wrap>
          <Button type="primary" size="large">
            大型按钮
          </Button>
          <Button type="primary" size="middle">
            中型按钮
          </Button>
          <Button type="primary" size="small">
            小型按钮
          </Button>
        </Space>

        <Divider />

        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />}>
            带图标
          </Button>
          <Button danger>危险按钮</Button>
          <Button disabled>禁用按钮</Button>
          <Button loading>加载中</Button>
          <Button ghost>幽灵按钮</Button>
        </Space>
      </Card>

      {/* Modal 演示 */}
      <Card title="Modal 对话框组件" style={{ marginBottom: 24 }}>
        <Space>
          <Button type="primary" onClick={() => setModalOpen(true)}>
            打开对话框
          </Button>
          <Text type="secondary">当前状态: {modalOpen ? '打开' : '关闭'}</Text>
        </Space>

        <Modal
          title="表单对话框"
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onOk={handleSubmit}
          onCancel={() => setModalOpen(false)}
          okText="提交"
          cancelText="取消"
          width={600}
        >
          <Space orientation="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>这是一个对话框示例</Text>
              <br />
              <Text type="secondary">可以在这里放置表单或其他内容</Text>
            </div>
          </Space>
        </Modal>
      </Card>

      {/* Input 演示 */}
      <Card title="Input 输入框组件" style={{ marginBottom: 24 }}>
        <Space vertical style={{ width: '100%' }} size="middle">
          <Input
            placeholder="基础输入框"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <Input
            placeholder="带前缀图标"
            prefix={<SearchOutlined />}
          />

          <Input
            placeholder="带后缀图标"
            suffix={<EditOutlined />}
          />

          <Input.Password placeholder="密码输入框" />

          <Input.Search
            placeholder="搜索输入框"
            onSearch={(value) => message.info(`搜索: ${value}`)}
            enterButton
          />

          <Input.TextArea
            rows={4}
            placeholder="文本域"
          />

          <Text type="secondary">当前输入值: {inputValue || '(空)'}</Text>
        </Space>
      </Card>

      {/* Select 演示 */}
      <Card title="Select 选择器组件" style={{ marginBottom: 24 }}>
        <Space vertical style={{ width: '100%' }} size="middle">
          <Select
            style={{ width: 200 }}
            placeholder="基础选择器"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { label: '选项 1', value: '1' },
              { label: '选项 2', value: '2' },
              { label: '选项 3', value: '3' },
            ]}
          />

          <Select
            style={{ width: 200 }}
            placeholder="支持搜索"
            showSearch
            allowClear
            options={[
              { label: 'Apple', value: 'apple' },
              { label: 'Banana', value: 'banana' },
              { label: 'Cherry', value: 'cherry' },
              { label: 'Date', value: 'date' },
            ]}
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
          />

          <Select
            style={{ width: 300 }}
            mode="multiple"
            placeholder="多选模式"
            options={[
              { label: '标签 1', value: 'tag1' },
              { label: '标签 2', value: 'tag2' },
              { label: '标签 3', value: 'tag3' },
              { label: '标签 4', value: 'tag4' },
            ]}
          />

          <Text type="secondary">当前选中: {selectValue || '(未选择)'}</Text>
        </Space>
      </Card>

      {/* DatePicker 演示 */}
      <Card title="DatePicker 日期选择器组件" style={{ marginBottom: 24 }}>
        <Space vertical style={{ width: '100%' }} size="middle">
          <DatePicker
            style={{ width: 200 }}
            placeholder="选择日期"
            value={dateValue}
            onChange={setDateValue}
          />

          <DatePicker
            style={{ width: 250 }}
            showTime
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm:ss"
          />

          <DatePicker.RangePicker
            style={{ width: 300 }}
            placeholder={['开始日期', '结束日期']}
          />

          <DatePicker.MonthPicker
            style={{ width: 200 }}
            placeholder="选择月份"
          />

          <DatePicker.YearPicker
            style={{ width: 200 }}
            placeholder="选择年份"
          />

          <DatePicker.WeekPicker
            style={{ width: 200 }}
            placeholder="选择周"
          />

          <Text type="secondary">
            当前日期: {dateValue ? dateValue.format('YYYY-MM-DD') : '(未选择)'}
          </Text>
        </Space>
      </Card>

      {/* 综合示例 */}
      <Card title="综合示例 - 表单" style={{ marginBottom: 24 }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>项目名称:</Text>
            <Input placeholder="请输入项目名称" style={{ marginTop: 8 }} />
          </div>

          <div>
            <Text strong>项目类型:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="请选择项目类型"
              options={[
                { label: '研发项目', value: 'dev' },
                { label: '运营项目', value: 'ops' },
                { label: '测试项目', value: 'test' },
              ]}
            />
          </div>

          <div>
            <Text strong>计划时间:</Text>
            <DatePicker.RangePicker
              style={{ width: '100%', marginTop: 8 }}
              placeholder={['开始日期', '结束日期']}
            />
          </div>

          <div>
            <Text strong>项目描述:</Text>
            <Input.TextArea
              rows={4}
              placeholder="请输入项目描述"
              style={{ marginTop: 8 }}
            />
          </div>

          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              创建项目
            </Button>
            <Button>取消</Button>
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default ComponentDemo;
