import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Modal } from 'antd';
import api from '../lib/api';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitation_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    
    try {
      const user = await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        invitation_code: formData.invitation_code,
      });
      
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        invitation_code: ''
      });
      setRegisteredUser(user);
    } catch (error) {
      api.handleError('Registration error:', error);
      setError(error.userMessage || error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>用户注册</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark mb-2">用户注册</h1>
          <p className="text-muted">创建一个新账户开始你的日语学习之旅</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6" role="alert">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-.633-1.964-.633-2.732 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-dark mb-2">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              className="input"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码（至少6位）"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-2">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div>
            <label htmlFor="invitation_code" className="block text-sm font-medium text-dark mb-2">邀请码</label>
            <input
              type="text"
              id="invitation_code"
              name="invitation_code"
              className="input"
              value={formData.invitation_code}
              onChange={handleChange}
              placeholder="请输入8位邀请码"
              maxLength={8}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-muted">
            已有账户？ <a href="/login" className="font-medium text-primary hover:text-blue-700">立即登录</a>
          </p>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted">
          <p>© 2026 日语学习网站</p>
        </div>
      </div>

      <Modal
        title="注册成功"
        open={Boolean(registeredUser)}
        onOk={() => router.push('/login')}
        onCancel={() => router.push('/login')}
        okText="去登录"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p className="text-dark">
          账号有效期至：
          <span className="font-semibold ml-1">
            {registeredUser?.account_expires_at ? new Date(registeredUser.account_expires_at).toLocaleString() : '-'}
          </span>
        </p>
      </Modal>
    </div>
  );
};

export default Register;
