/**
 * 登录页面
 * 
 * 功能：
 * - 用户登录
 * - 自动Token管理
 * - 登录后跳转
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;

export const Login: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  /**
   * 处理登录
   */
  const handleLogin = async (values: { username: string; password: string }) => {
    const success = await login(values.username, values.password);
    if (success) {
      message.success('登录成功');
      navigate('/');
    }
  };

  /**
   * 处理注册
   */
  const handleRegister = async (values: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }) => {
    const success = await register(
      values.email,
      values.username,
      values.password,
      values.displayName
    );
    if (success) {
      message.success('注册成功');
      navigate('/');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card 
        style={{ width: 400 }}
        title={<div style={{ textAlign: 'center', fontSize: 24 }}>TimePlan Craft Kit</div>}
      >
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as 'login' | 'register')}>
          <TabPane tab="登录" key="login">
            <Form
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名或邮箱' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名或邮箱"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isLoading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="注册" key="register">
            <Form
              name="register"
              onFinish={handleRegister}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 50, message: '用户名最多50个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 8, message: '密码至少8个字符' },
                  { 
                    pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])/, 
                    message: '密码必须包含数字、字母和特殊字符'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="密码（至少8字符，含数字、字母、特殊字符）"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="displayName"
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="显示名称（可选）"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={isLoading}
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};
