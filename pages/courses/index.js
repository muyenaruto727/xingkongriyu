import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import { api } from '../../lib/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取已上架的课程
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCourseList({ status: '上架' });
        setCourses(response.data || []);
      } catch (error) {
        api.handleError('获取课程失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>课程列表 - 日语学习网站</title>
        <meta name="description" content="日语学习课程列表，提供各种日语学习课程" />
      </Head>
      
      <Navigation />
      
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">课程列表</h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                浏览我们的课程，选择适合您的学习内容，开始您的日语学习之旅
              </p>
            </div>
            
            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">暂无课程</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Array.isArray(courses) ? courses : []).map((course, index) => {
                  // 为每个课程生成不同的颜色
                  const colors = [
                    { bg: 'bg-teal-100', text: 'text-teal-600', button: 'bg-teal-500 hover:bg-teal-600' },
                    { bg: 'bg-orange-100', text: 'text-orange-600', button: 'bg-orange-500 hover:bg-orange-600' },
                    { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-500 hover:bg-blue-600' },
                    { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-500 hover:bg-green-600' },
                    { bg: 'bg-purple-100', text: 'text-purple-600', button: 'bg-purple-500 hover:bg-purple-600' },
                    { bg: 'bg-pink-100', text: 'text-pink-600', button: 'bg-pink-500 hover:bg-pink-600' }
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={course.id} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className={`${color.bg} ${color.text} rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800">{course.name}</h4>
                      <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
                      <div className="flex justify-between items-center mb-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.isFree === '是' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {course.isFree === '是' ? '免费' : '付费'}
                        </span>
                        <span className="text-gray-600 text-sm">{course.format}</span>
                      </div>
                      <a href={`/course/${course.id}`} className={`${color.button} text-white px-6 py-3 rounded-lg transition-colors inline-block font-medium w-full text-center`}>查看课程</a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
