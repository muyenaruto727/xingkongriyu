import React from 'react';
import Head from 'next/head';
import Dashboard from '../../components/admin/Dashboard';

const AdminDashboard = () => {
  return (
    <div>
      <Head>
        <title>后台管理 - 日语学习网站</title>
        <meta name="description" content="后台管理系统" />
      </Head>
      <Dashboard />
    </div>
  );
};

export default AdminDashboard;