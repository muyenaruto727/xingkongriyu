import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import { api } from '../lib/api';

const LearningCenter = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await api.getCourseList({ status: '上架' });
        console.log(response)
        // API返回的数据格式是 { data: [...], total: 4, page: 1, limit: 10 }
        setCourses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('获取课程列表失败:', error);
        setCourses([]);
      }
    };

    getCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>学习中心 - 星空日语</title>
        <meta name="description" content="学习中心，提供词汇学习、语法学习和已上架课程" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Navigation />
      
      <main className="flex-grow">
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            {/* 第一排：日语入门、词汇学习和语法学习卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card
                title="日语入门"
                description="了解日语基础知识，包括假名、发音和基础问候语，为后续学习打下基础。"
                buttonText="开始学习"
                buttonUrl="/learning-center/introduction"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
                iconBg="bg-blue-100"
                iconText="text-blue-600"
                buttonBg="bg-blue-500 hover:bg-blue-600"
              />
              <Card
                title="词汇学习"
                description="学习日语基础词汇，包括常用单词、短语和表达方式，扩大词汇量。"
                buttonText="开始学习"
                buttonUrl="/learning-center/vocabulary"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                iconBg="bg-green-100"
                iconText="text-green-600"
                buttonBg="bg-green-500 hover:bg-green-600"
              />
              <Card
                title="语法学习"
                description="掌握日语语法规则，理解句子结构和表达方式，提高语言应用能力。"
                buttonText="开始学习"
                buttonUrl="/learning-center/grammar"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                iconBg="bg-purple-100"
                iconText="text-purple-600"
                buttonBg="bg-purple-500 hover:bg-purple-600"
              />
            </div>
            
            {/* 第二排及后面：后台管理系统配置的已上架课程，一排显示3个 */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800">精品课程</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(Array.isArray(courses) ? courses : []).map((course, index) => {
                // 为每个课程生成不同的颜色
                const colors = [
                  { bg: 'bg-teal-100', text: 'text-teal-600', button: 'bg-teal-500 hover:bg-teal-600' },
                  { bg: 'bg-orange-100', text: 'text-orange-600', button: 'bg-orange-500 hover:bg-orange-600' },
                  { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-500 hover:bg-blue-600' },
                  { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-500 hover:bg-green-600' },
                  { bg: 'bg-purple-100', text: 'text-purple-600', button: 'bg-purple-500 hover:bg-purple-600' },
                  { bg: 'bg-red-100', text: 'text-red-600', button: 'bg-red-500 hover:bg-red-600' }
                ];
                const color = colors[index % colors.length];
                
                return (
                  <Card
                    key={course.id}
                    title={course.name}
                    description={course.description}
                    buttonText="查看课程"
                    buttonUrl={`/course/${course.id}`}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                    iconBg={color.bg}
                    iconText={color.text}
                    buttonBg={color.button}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearningCenter;