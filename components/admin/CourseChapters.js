import { useState, useEffect } from 'react';
import { Tree, Divider, Spin } from 'antd';
import api from '../../lib/api';

const CourseChapters = ({ courseId }) => {
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  // 获取章节列表
  const fetchChapters = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const response = await api.getChapterList({ courseId });
      const chapterData = Array.isArray(response) ? response : (response.data || []);
      setChapters(chapterData);
      // 展开所有节点
      const keys = chapterData.map(chapter => chapter.id.toString());
      setExpandedKeys(keys);
    } catch (error) {
      api.handleError('获取章节列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理章节展开/折叠
  const handleExpand = (keys) => {
    setExpandedKeys(keys);
  };

  // 处理小节点击
  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  // 初始化
  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  // 树形数据转换
  const treeData = chapters.map(chapter => ({
    title: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{chapter.name} ({chapter.sections?.length || 0}讲)</span>
      </div>
    ),
    key: chapter.id.toString(),
    children: chapter.sections?.sort((a, b) => (a.order || 0) - (b.order || 0)).map(section => ({
      title: (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            padding: '4px 0',
            color: selectedSection?.id === section.id ? '#1890ff' : 'inherit'
          }}
          onClick={() => handleSectionClick(section)}
        >
          <span>{section.order ? `${section.order.toString().padStart(2, '0')} | ` : ''}{section.name}</span>
        </div>
      ),
      key: section.id.toString()
    }))
  }));

  return (
    <div className="course-chapters">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">课程目录</h3>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Tree
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={handleExpand}
            showLine
          />
        )}
      </div>
      
      <Divider />
      
      {selectedSection && (
        <div className="section-content">
          <h4 className="text-xl font-bold mb-4">{selectedSection.name}</h4>
          {selectedSection.video_url ? (
            <div className="video-container mb-4">
              <video 
                src={selectedSection.video_url} 
                controls 
                className="w-full max-w-2xl"
              />
            </div>
          ) : (
            <div className="article-content mb-4">
              <p>{selectedSection.content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseChapters;
