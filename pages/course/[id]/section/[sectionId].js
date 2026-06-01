import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../../../components/layout/Navigation';
import Footer from '../../../../components/layout/Footer';
import { api } from '../../../../lib/api';

const SectionDetail = () => {
  const router = useRouter();
  const { id, sectionId } = router.query;
  const [section, setSection] = useState(null);
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && sectionId) {
      // 获取小节详情
      const fetchSectionDetail = async () => {
        try {
          setIsLoading(true);
          
          // 获取课程信息
          const courseResponse = await api.getCourseById(id);
          setCourse(courseResponse);
          
          // 获取章节和小节信息
          const chaptersResponse = await api.getChapterList({ courseId: id });
          const allChapters = chaptersResponse || [];
          
          // 遍历所有章节，找到对应的小节
          let foundSection = null;
          for (const chapter of allChapters) {
            if (chapter.sections) {
              const section = chapter.sections.find(s => s.id == sectionId);
              if (section) {
                foundSection = section;
                break;
              }
            }
          }
          
          if (foundSection) {
            setSection(foundSection);
          } else {
            console.error('小节不存在');
          }
        } catch (error) {
          console.error('获取小节详情失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSectionDetail();
    }
  }, [id, sectionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigation />
        <main>
          <section className="pt-24 pb-12 md:pt-32 md:pb-20">
            <div className="container">
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">加载中...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!section || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigation />
        <main>
          <section className="pt-24 pb-12 md:pt-32 md:pb-20">
            <div className="container">
              <div className="text-center py-20">
                <p className="text-gray-600">小节不存在</p>
                <a href={`/course/${id}`} className="mt-4 inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                  返回课程
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{section.name} - {course.name} - 日语学习网站</title>
        <meta name="description" content={section.name} />
      </Head>
      
      <Navigation />
      
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            {/* 面包屑导航 */}
            <div className="mb-8">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <a href="/" className="text-gray-700 hover:text-primary">首页</a>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <a href={`/course/${id}`} className="ml-2 text-gray-700 hover:text-primary">{course.name}</a>
                    </div>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="ml-2 text-gray-500">{section.name}</span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            {/* 小节内容 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{section.name}</h1>
              
              {section.content && (
                <div className="prose max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              )}
              
              {section.videoUrl && (
                <div className="mb-8">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src={section.videoUrl} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-lg"
                      title={section.name}
                    ></iframe>
                  </div>
                </div>
              )}
              
              {!section.content && !section.videoUrl && (
                <p className="text-gray-600 mb-8">暂无内容</p>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-between">
              <a href={`/course/${id}`} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                返回课程
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SectionDetail;