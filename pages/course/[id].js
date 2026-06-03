import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../components/layout/Navigation';
import Footer from '../../components/layout/Footer';
import { api } from '../../lib/api';

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState([]);

  useEffect(() => {
    if (id) {
      // 获取课程详情
      const fetchCourseDetail = async () => {
        try {
          setIsLoading(true);
          // 获取课程信息
          const courseResponse = await api.getCourseById(id);
          setCourse(courseResponse);
          
          // 获取课程的章节和小节
          const chaptersResponse = await api.getChapterList({ courseId: id });
          // 按照order字段排序章节
          const sortedChapters = (chaptersResponse || []).sort((a, b) => (a.order || 0) - (b.order || 0));
          // 对每个章节的小节也按照order字段排序
          const chaptersWithSortedSections = sortedChapters.map(chapter => ({
            ...chapter,
            sections: Array.isArray(chapter.sections) ? chapter.sections.sort((a, b) => (a.order || 0) - (b.order || 0)) : chapter.sections
          }));
          setChapters(chaptersWithSortedSections);
          
          // 默认展开所有章节
          const expandedKeys = chaptersWithSortedSections.map(chapter => chapter.id.toString());
          setExpandedChapters(expandedKeys);
        } catch (error) {
          console.error('获取课程详情失败:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourseDetail();
    }
  }, [id]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => {
      if (prev.includes(chapterId.toString())) {
        return prev.filter(id => id !== chapterId.toString());
      } else {
        return [...prev, chapterId.toString()];
      }
    });
  };

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navigation />
        <main>
          <section className="pt-24 pb-12 md:pt-32 md:pb-20">
            <div className="container">
              <div className="text-center py-20">
                <p className="text-gray-600">课程不存在</p>
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
        <title>{course.name} - 日语学习网站</title>
        <meta name="description" content={course.description} />
      </Head>
      
      <Navigation />
      
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container">
            {/* 课程头部信息 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{course.name}</h1>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${course.isFree === '是' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {course.isFree === '是' ? '免费' : '付费'}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {course.format}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      共 {chapters.length} 章
                    </span>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <a href="#chapters" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg transition-colors inline-block font-medium">
                    开始学习
                  </a>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">课程介绍</h2>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </div>
            </div>
            
            {/* 章节列表 */}
            <div id="chapters" className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">课程章节</h2>
              
              {(Array.isArray(chapters) && chapters.length === 0) ? (
                <p className="text-gray-600">暂无章节</p>
              ) : (
                <div className="space-y-6">
                  {(Array.isArray(chapters) ? chapters : []).map((chapter, chapterIndex) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* 章节标题 */}
                      <div 
                        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chapterIndex + 1}. {chapter.name}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            {chapter.sections?.length || 0} 讲
                          </span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-5 w-5 text-gray-600 transition-transform ${expandedChapters.includes(chapter.id.toString()) ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* 小节列表 */}
                      {expandedChapters.includes(chapter.id.toString()) && (
                        <div className="p-4 border-t border-gray-200">
                          {Array.isArray(chapter.sections) && chapter.sections.length > 0 ? (
                            <div className="space-y-3">
                              {chapter.sections.map((section, sectionIndex) => (
                                <div key={section.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                                      {section.order || sectionIndex + 1}
                                    </span>
                                    <span className="text-gray-800">{section.name}</span>
                                  </div>
                                  <a 
                                    href={`/course/${id}/section/${section.id}`} 
                                    className="text-primary hover:text-primary/80 text-sm font-medium"
                                  >
                                    查看
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm">暂无小节</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;