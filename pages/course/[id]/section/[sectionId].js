import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../../../../components/layout/Navigation';
import Footer from '../../../../components/layout/Footer';
import { api } from '../../../../lib/api';
import { renderAnnotatedTextToHtml } from '../../../../lib/courseSectionContent';
import { formatVocabularyField } from '../../../../lib/vocabularyOptions';
import {
  buildLinkedGrammarDetails,
  buildLinkedVocabularyDetails,
} from '../../../../lib/courseLinkedContent';

const renderContent = (html) => {
  if (!html) return null;
  const pattern = /<pre[^>]*>\s*<code(?:[^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
  const parts = [];
  let last = 0;
  let match;
  while ((match = pattern.exec(html))) {
    if (match.index > last) parts.push(<div key={`html-${last}`} dangerouslySetInnerHTML={{ __html: html.slice(last, match.index) }} />);
    const decoded = match[1]
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
    const isHtml = /<!doctype\s+html|<html[\s>]|<body[\s>]|<head[\s>]/i.test(decoded);
    if (isHtml) {
      parts.push(<iframe key={`frame-${match.index}`} title="HTML代码示例" sandbox="allow-scripts" srcDoc={decoded} className="w-full min-h-[480px] border border-gray-200 rounded-lg bg-white" />);
    } else {
      parts.push(<pre key={`code-${match.index}`} className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{decoded}</code></pre>);
    }
    last = pattern.lastIndex;
  }
  if (last < html.length) parts.push(<div key={`html-${last}`} dangerouslySetInnerHTML={{ __html: html.slice(last) }} />);
  return parts;
};

const SectionDetail = () => {
  const router = useRouter();
  const { id, sectionId } = router.query;
  const [section, setSection] = useState(null);
  const [course, setCourse] = useState(null);
  const [linkedItems, setLinkedItems] = useState([]);
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
            const contentType = foundSection.content_type || foundSection.contentType;
            if (contentType === 'vocabulary') {
              const response = await api.getVocabList({
                textbooks: foundSection.textbook || '',
                lessons: foundSection.lesson || '',
                limit: 10000,
              });
              setLinkedItems(Array.isArray(response) ? response : response.data || []);
            } else if (contentType === 'grammar') {
              const response = await api.getGrammarList({
                textbooks: foundSection.textbook || '',
                lessons: foundSection.lesson || '',
                limit: 100,
              });
              setLinkedItems(Array.isArray(response) ? response : response.data || []);
            } else {
              setLinkedItems([]);
            }
          } else {
            api.handleError('小节不存在');
          }
        } catch (error) {
          api.handleError('获取小节详情失败:', error);
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>{section.name} - {course.name} - 日语学习网站</title>
        <meta name="description" content={section.name} />
      </Head>
      
      <Navigation />
      
      <main className="flex min-h-screen flex-1">
        <section className="w-full pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="container max-w-6xl">
            {/* 面包屑导航 */}
            <div className="mb-6">
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
            <div className="course-content-stage">
            <div className="course-content-shell">
              {section.content && (!section.content_type || section.content_type === 'article') && (
                <div className="course-reading-content mb-8">
                  {renderContent(section.content)}
                </div>
              )}

              {['conversation', 'reading'].includes(section.content_type || section.contentType) && section.content && (
                <div className="course-annotated-surface mb-8">
                  <div
                    className="course-annotated-content"
                    dangerouslySetInnerHTML={{ __html: renderAnnotatedTextToHtml(section.content) }}
                  />
                </div>
              )}

              {(section.content_type || section.contentType) === 'vocabulary' && (
                <div className="mb-8 grid gap-3 md:grid-cols-2">
                  {linkedItems.map((item) => {
                    const details = buildLinkedVocabularyDetails(item);
                    return (
                      <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xl font-bold text-gray-900">{item.japanese}</div>
                            {details.pronunciation && <div className="text-sm text-gray-500">{details.pronunciation}</div>}
                          </div>
                          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                            {formatVocabularyField('level', item.level) || item.level}
                          </span>
                        </div>
                        <div className="mt-3 text-gray-700">{item.chinese}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {details.category && <span className="rounded bg-white px-2 py-1 text-gray-600 ring-1 ring-gray-200">词性: {details.category}</span>}
                          {details.pitchAccent && <span className="rounded bg-sky-50 px-2 py-1 text-sky-700 ring-1 ring-sky-100">声调: {details.pitchAccent}</span>}
                          {details.tags.map((tag) => <span key={tag} className="rounded bg-amber-50 px-2 py-1 text-amber-700 ring-1 ring-amber-100">{tag}</span>)}
                        </div>
                      </div>
                    );
                  })}
                  {linkedItems.length === 0 && <p className="text-gray-600">暂无关联词汇</p>}
                </div>
              )}

              {(section.content_type || section.contentType) === 'grammar' && (
                <div className="mb-8 space-y-3">
                  {linkedItems.map((item) => {
                    const details = buildLinkedGrammarDetails(item);
                    return (
                    <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{item.grammarPoint}</h2>
                        <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">{item.level}</span>
                      </div>
                      {(details.textbook || details.lesson) && <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500"><span className="rounded bg-white px-2 py-1 ring-1 ring-gray-200">教材: {details.textbook || '-'}</span>{details.lesson && <span className="rounded bg-white px-2 py-1 ring-1 ring-gray-200">课程: {details.lesson}</span>}</div>}
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {details.japaneseMeaning && <div className="rounded-md bg-white p-3"><p className="text-xs font-medium text-gray-400">日文释义</p><p className="mt-1 text-gray-700">{details.japaneseMeaning}</p></div>}
                        {details.chineseMeaning && <div className="rounded-md bg-white p-3"><p className="text-xs font-medium text-gray-400">中文释义</p><p className="mt-1 text-gray-700">{details.chineseMeaning}</p></div>}
                        {details.continuation && <div className="rounded-md bg-white p-3 md:col-span-2"><p className="text-xs font-medium text-gray-400">接续方式</p><p className="mt-1 font-mono text-gray-700">{details.continuation}</p></div>}
                        {details.attentionPoints && <div className="rounded-md bg-amber-50 p-3 md:col-span-2"><p className="text-xs font-medium text-amber-600">注意事项</p><p className="mt-1 text-gray-700">{details.attentionPoints}</p></div>}
                      </div>
                      {details.examples.length > 0 && <div className="mt-4"><p className="text-sm font-semibold text-gray-700">例句</p><ol className="mt-2 space-y-2">{details.examples.map((example, index) => <li key={`${item.id}-example-${index}`} className="rounded-md bg-white px-3 py-2 text-gray-700"><span className="mr-2 text-emerald-600">{index + 1}.</span>{example}</li>)}</ol></div>}
                      {details.exercises.length > 0 && <div className="mt-4"><p className="text-sm font-semibold text-gray-700">翻译练习</p><ol className="mt-2 space-y-2">{details.exercises.map((exercise, index) => <li key={`${item.id}-exercise-${index}`} className="rounded-md bg-white px-3 py-2"><p className="text-gray-700"><span className="mr-2 text-emerald-600">{index + 1}.</span>{exercise.question}</p>{exercise.answer && <p className="mt-2 border-t border-gray-100 pt-2 text-sm text-emerald-700"><span className="mr-2 font-medium">参考答案:</span>{exercise.answer}</p>}</li>)}</ol></div>}
                      {details.relatedGrammars.length > 0 && <div className="mt-4"><p className="text-sm font-semibold text-gray-700">关联语法</p><div className="mt-2 flex flex-wrap gap-2">{details.relatedGrammars.map((related) => <button key={`${item.id}-related-${related.id}`} type="button" onClick={() => router.push(`/grammar/${related.id}`)} className="rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-700 hover:bg-violet-100">{related.grammar}</button>)}</div></div>}
                    </div>
                    );
                  })}
                  {linkedItems.length === 0 && <p className="text-gray-600">暂无关联语法</p>}
                </div>
              )}

              {(section.videoUrl || section.video_url) && (
                <div className="mb-8">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src={section.videoUrl || section.video_url}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-lg"
                      title={section.name}
                    ></iframe>
                  </div>
                </div>
              )}
              
              {!section.content && !section.videoUrl && !section.video_url && !['vocabulary', 'grammar'].includes(section.content_type || section.contentType) && (
                <p className="text-gray-600 mb-8">暂无内容</p>
              )}
              </div>

              {/* 操作按钮 */}
              <div className="course-content-actions">
                <a href={`/course/${id}`} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium">
                  返回课程
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <style jsx global>{`
        .course-content-stage {
          width: 100%;
          max-width: 72rem;
          margin: 0 auto;
        }
        .course-content-shell {
          width: 100%;
          margin-bottom: 1.25rem;
        }
        .course-content-actions {
          display: flex;
          justify-content: flex-start;
        }
        .course-reading-content {
          box-sizing: border-box;
          width: 100%;
          min-height: clamp(22rem, calc(100vh - 17rem), 38rem);
          padding: 2rem;
          background: #ffffff;
          border: 1px solid #dbe7f0;
          border-radius: 0.5rem;
          color: #334155;
          font-size: 1rem;
          line-height: 1.9;
        }
        .course-reading-content > div,
        .course-reading-content p,
        .course-reading-content li {
          font-size: inherit !important;
          line-height: inherit !important;
        }
        .course-reading-content h1,
        .course-reading-content h2,
        .course-reading-content h3 {
          color: #1e293b;
          font-weight: 700;
          line-height: 1.35;
          margin: 0 0 1.25rem;
        }
        .course-reading-content h1 { font-size: 1.5rem !important; }
        .course-reading-content h2 { font-size: 1.25rem !important; }
        .course-reading-content h3 { font-size: 1.125rem !important; }
        .course-annotated-surface {
          box-sizing: border-box;
          width: 100%;
          min-height: clamp(22rem, calc(100vh - 17rem), 38rem);
          padding: 2rem;
          background: #ffffff;
          border: 1px solid #dbe7f0;
          border-radius: 0.5rem;
        }
        .course-annotated-content {
          color: #334155;
          font-size: 1.125rem;
          font-weight: 400;
          line-height: 1.9;
          letter-spacing: 0;
        }
        .course-annotated-content p {
          margin: 0 0 1rem;
        }
        .course-dialogue-line {
          display: grid;
          grid-template-columns: 2.25em 0.7em minmax(0, 1fr);
          column-gap: 0.12em;
          align-items: start;
          margin: 0 0 1.2rem;
        }
        .course-dialogue-speaker {
          min-width: 0;
          text-align: right;
          white-space: nowrap;
          font-weight: 700;
          color: #1e293b;
        }
        .course-dialogue-colon {
          text-align: center;
        }
        .course-dialogue-text {
          min-width: 0;
        }
        .course-annotated-content ruby {
          ruby-align: center;
        }
        .course-annotated-content rt {
          font-size: 0.34em;
          letter-spacing: 0.12em;
          color: #334155;
        }
        .course-section-emphasis {
          color: #2b8fc5;
        }
        @media (max-width: 640px) {
          .course-reading-content {
            font-size: 1rem;
            line-height: 1.8;
          }
          .course-annotated-surface {
            padding: 1.125rem;
            min-height: 22rem;
          }
          .course-reading-content {
            min-height: 22rem;
            padding: 1.125rem;
          }
          .course-annotated-content {
            font-size: 1rem;
            line-height: 1.85;
          }
          .course-dialogue-line {
            grid-template-columns: 1.9em 0.7em minmax(0, 1fr);
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SectionDetail;
