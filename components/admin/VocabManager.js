import React, { useState, useEffect } from 'react';
import { TEXTBOOKS, CATEGORIES, PITCH_ACCENTS, LEVELS, TAGS } from '../../config/config';
import { api } from '../../lib/api';
import { handleApiError, logError } from '../../utils.js';
import { Cascader, Select, Input, Pagination } from 'antd';
import Modal from '../common/Modal';
import PaginationTable from '../common/PaginationTable';

const VocabManager = ({ showToast }) => {
  const [vocabList, setVocabList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // 表单状态
  const [vocabForm, setVocabForm] = useState({
    japanese: '',
    pronunciation: '',
    category: [],
    pitchAccent: [],
    chinese: '',
    level: '',
    examples: [''],
    tag: '日常',
    textbooks: [],
    lessons: []
  });

  // 搜索状态
  const [searchForm, setSearchForm] = useState({
    japanese: '',
    pronunciation: '',
    level: '',
    textbooks: [],
    lessons: [],
    tag: ''
  });

  // 转换教材数据为级联选择格式，为课程生成唯一的value
  const cascaderOptions = TEXTBOOKS.map(textbook => ({
    label: textbook.name,
    value: textbook.id,
    children: textbook.lessons.map(lesson => ({
      label: `${textbook.name}:${lesson}`, // 课程标签包含教材信息，避免重复显示
      value: `${textbook.id}:${lesson}` // 生成唯一的课程ID，包含教材信息
    }))
  }));

  // 组件挂载时加载词汇列表
  useEffect(() => {
    fetchVocabList(true);
  }, []);

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setVocabForm(prev => ({ ...prev, [name]: value }));
  };

  // 处理搜索表单变化
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    console.log('handleSearchChange called with name:', name, 'value:', value);
    setSearchForm(prev => {
      const newSearchForm = { ...prev, [name]: value };
      console.log('Search form updated:', newSearchForm);
      return newSearchForm;
    });
  };

  // 处理教材选择
  const handleTextbookChange = (textbookId) => {
    const newTextbooks = searchForm.textbooks.includes(textbookId)
      ? searchForm.textbooks.filter(id => id !== textbookId)
      : [...searchForm.textbooks, textbookId];
    
    setSearchForm(prev => ({
      ...prev,
      textbooks: newTextbooks,
      lessons: prev.lessons.filter(lesson => {
        const lessonTextbook = TEXTBOOKS.find(t => t.lessons.includes(lesson));
        return newTextbooks.includes(lessonTextbook?.id);
      })
    }));
  };

  // 处理课程选择
  const handleLessonChange = (lesson) => {
    setSearchForm(prev => ({
      ...prev,
      lessons: prev.lessons.includes(lesson)
        ? prev.lessons.filter(l => l !== lesson)
        : [...prev.lessons, lesson]
    }));
  };

  // 处理表单教材选择
  const handleFormTextbookChange = (textbookId) => {
    if (!vocabForm.textbooks.includes(textbookId)) {
      setVocabForm(prev => ({
        ...prev,
        textbooks: [...prev.textbooks, textbookId]
      }));
    }
  };

  // 处理表单课程选择
  const handleFormLessonChange = (lesson, textbookId) => {
    const uniqueLessonValue = `${textbookId}:${lesson}`;
    if (!vocabForm.lessons.includes(uniqueLessonValue)) {
      setVocabForm(prev => ({
        ...prev,
        lessons: [...prev.lessons, uniqueLessonValue]
      }));
    }
  };

  // 表单验证
  const validateForm = () => {
    if (!vocabForm.japanese.trim()) {
      showToast('请输入日文', 'error');
      return false;
    }
    if (!vocabForm.pronunciation.trim()) {
      showToast('请输入发音', 'error');
      return false;
    }
    if (!vocabForm.chinese.trim()) {
      showToast('请输入中文', 'error');
      return false;
    }
    if (!vocabForm.level) {
      showToast('请选择级别', 'error');
      return false;
    }
    if (!vocabForm.tag) {
      showToast('请选择标签', 'error');
      return false;
    }
    if (vocabForm.category.length === 0) {
      showToast('请选择类别', 'error');
      return false;
    }
    if (vocabForm.pitchAccent.length === 0) {
      showToast('请选择声调', 'error');
      return false;
    }
    if (vocabForm.textbooks.length === 0 && vocabForm.lessons.length === 0) {
      showToast('请选择教材和课程', 'error');
      return false;
    }
    if (vocabForm.examples.length === 0 || !vocabForm.examples.some(example => example.trim())) {
      showToast('请至少输入一个例句', 'error');
      return false;
    }
    return true;
  };

  // 处理添加词汇
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { pitchAccent, category, ...vocabData } = vocabForm;
      
      // 处理课程值，提取纯课程名称和教材ID
      const lessons = [];
      const textbooksFromLessons = new Set(vocabForm.textbooks);
      
      vocabForm.lessons.forEach(lessonValue => {
        if (lessonValue.includes(':')) {
          const [textbookId, lessonName] = lessonValue.split(':');
          lessons.push(lessonName);
          textbooksFromLessons.add(textbookId);
        } else {
          lessons.push(lessonValue);
        }
      });
      
      const textbooks = Array.from(textbooksFromLessons);
      
      await api.createVocab({
        ...vocabData,
        category: category.join(','),
        pitch_accent: pitchAccent.join(','),
        textbook: textbooks.length > 0 ? textbooks.join(',') : '',
        lesson: lessons.length > 0 ? lessons.join(',') : '',
        examples: vocabForm.examples.filter(example => example.trim())
      });
      
      showToast('词汇添加成功', 'success');
      // 重置表单
      resetForm();
      // 重置搜索条件
      setSearchForm({
        japanese: '',
        pronunciation: '',
        level: '',
        textbooks: [],
        lessons: [],
        tag: ''
      });
      // 重新加载词汇列表，使用空的搜索条件
      fetchVocabList(true);
      // 最后关闭模态框
      setShowModal(false);
    } catch (error) {
      logError(error, 'Add Vocabulary');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理编辑词汇
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { pitchAccent, category, ...vocabData } = vocabForm;
      
      // 处理课程值，提取纯课程名称
      const lessons = vocabForm.lessons.map(lessonValue => {
        if (lessonValue.includes(':')) {
          return lessonValue.split(':')[1];
        }
        return lessonValue;
      });
      
      await api.updateVocab(currentEditId, {
        ...vocabData,
        category: category.join(','),
        pitch_accent: pitchAccent.join(','),
        textbook: vocabForm.textbooks.length > 0 ? vocabForm.textbooks.join(',') : '',
        lesson: lessons.length > 0 ? lessons.join(',') : '',
        examples: vocabForm.examples.filter(example => example.trim())
      });
      
      showToast('词汇更新成功', 'success');
      // 重置表单
      resetForm();
      // 重新加载词汇列表，使用空的搜索条件
      fetchVocabList(true);
      // 最后关闭模态框
      setShowModal(false);
    } catch (error) {
      logError(error, 'Update Vocabulary');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除词汇
  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await api.deleteVocab(currentEditId);
      
      showToast('词汇删除成功', 'success');
      setShowDeleteConfirm(false);
      setCurrentEditId(null);
      // 重新加载词汇列表，使用空的搜索条件
      fetchVocabList(true);
    } catch (error) {
      logError(error, 'Delete Vocabulary');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载词汇列表
  const fetchVocabList = async (useEmptyFilters = false, customLimit = null) => {
    setIsLoading(true);
    try {
      console.log('Fetching vocab list with useEmptyFilters:', useEmptyFilters);
      console.log('Current search form:', searchForm);
      // 构建查询参数
      const params = {
        page: currentPage,
        limit: customLimit || itemsPerPage
      };
      
      if (!useEmptyFilters) {
        // 确保读取最新的 searchForm 状态
        if (searchForm.level && searchForm.level !== '') {
          params.level = searchForm.level;
          console.log('Added level parameter:', searchForm.level);
        }
        if (searchForm.tag && searchForm.tag !== '') {
          params.tag = searchForm.tag;
          console.log('Added tag parameter:', searchForm.tag);
        }
        if (searchForm.japanese && searchForm.japanese !== '') {
          params.search = searchForm.japanese;
          console.log('Added search parameter for japanese:', searchForm.japanese);
        }
        if (searchForm.pronunciation && searchForm.pronunciation !== '') {
          params.search = searchForm.pronunciation;
          console.log('Added search parameter for pronunciation:', searchForm.pronunciation);
        }
        if (searchForm.textbooks && searchForm.textbooks.length > 0) {
          params.textbooks = searchForm.textbooks;
          console.log('Added textbooks parameter:', searchForm.textbooks);
        }
        if (searchForm.lessons && searchForm.lessons.length > 0) {
          params.lessons = searchForm.lessons;
          console.log('Added lessons parameter:', searchForm.lessons);
        }
      }
      console.log('Query params:', params);
      
      const data = await api.getVocabList(params);
      
      if (typeof setVocabList === 'function') {
        // 处理不同的数据结构
        if (Array.isArray(data)) {
          setVocabList(data);
          setTotalItems(data.length);
        } else if (data.data) {
          setVocabList(data.data);
          setTotalItems(data.total || 0);
        } else {
          setVocabList([]);
          setTotalItems(0);
        }
      }
    } catch (error) {
      logError(error, 'Fetch Vocabulary');
      handleApiError(error, showToast);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (vocab) => {
    setCurrentEditId(vocab.id);
    setIsEditMode(true);
    
    // 处理教材数据
    const textbooks = typeof vocab.textbook === 'string' ? vocab.textbook.split(',').map(item => item.trim()).filter(Boolean) : [];
    
    // 处理课程数据，确保格式为"教材ID:课程名称"
    const lessons = typeof vocab.lesson === 'string' ? 
      vocab.lesson.split(',').map(item => item.trim()).filter(Boolean).map(lesson => {
        // 尝试找到对应的教材ID
        let textbookId = textbooks[0]; // 默认使用第一个教材
        // 这里可以根据实际情况进行更复杂的匹配逻辑
        return `${textbookId}:${lesson}`;
      }) : [];
    
    setVocabForm({
      japanese: vocab.japanese || '',
      pronunciation: vocab.pronunciation || '',
      category: typeof vocab.category === 'string' ? vocab.category.split(',').map(item => item.trim()).filter(Boolean) : [],
      pitchAccent: typeof vocab.pitch_accent === 'string' ? vocab.pitch_accent.split(',').map(item => item.trim()).filter(Boolean) : [],
      chinese: vocab.chinese || '',
      level: vocab.level || '',
      examples: vocab.examples ? (Array.isArray(vocab.examples) ? vocab.examples : [vocab.examples]) : [''],
      tag: vocab.tag || '日常',
      textbooks: textbooks,
      lessons: lessons
    });
    setShowModal(true);
  };

  // 打开删除确认模态框
  const openDeleteConfirm = (id) => {
    setCurrentEditId(id);
    setShowDeleteConfirm(true);
  };

  // 重置表单
  const resetForm = () => {
    setVocabForm({
      japanese: '',
      pronunciation: '',
      category: [],
      pitchAccent: [],
      chinese: '',
      level: '',
      examples: [''],
      tag: '日常',
      textbooks: [],
      lessons: []
    });
    setCurrentEditId(null);
  };

  // 批量导入
  const handleBatchImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          let data;

          // 解析文件内容
          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            // 简单的 CSV 解析
            const rows = content.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(header => header.trim().replace(/"/g, ''));
            data = rows.slice(1).map(row => {
              // 处理带引号的 CSV 行
              const values = [];
              let currentValue = '';
              let inQuotes = false;
              for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(currentValue);
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              values.push(currentValue);
              
              const obj = {};
              headers.forEach((header, index) => {
                let value = values[index]?.trim().replace(/"/g, '');
                // 处理多个例句（用分号分隔）
                if (header === 'examples' && value) {
                  obj[header] = value.split(';').filter(item => item.trim());
                } 
                // 处理多个教材（用分号分隔）
                else if (header === 'textbooks' && value) {
                  obj[header] = value.split(';').filter(item => item.trim());
                }
                // 处理多个课程（用分号分隔）
                else if (header === 'lessons' && value) {
                  obj[header] = value.split(';').filter(item => item.trim());
                }
                // 处理多个类别（用分号分隔）
                else if (header === 'category' && value) {
                  obj[header] = value.split(';').filter(item => item.trim());
                }
                // 处理多个声调（用分号分隔）
                else if (header === 'pitchAccent' && value) {
                  obj[header] = value.split(';').filter(item => item.trim());
                } else {
                  obj[header] = value;
                }
              });
              return obj;
            });
          } else {
            showToast('不支持的文件格式', 'error');
            return;
          }

          // 验证数据格式
          if (!Array.isArray(data)) {
            showToast('文件内容格式错误', 'error');
            return;
          }

          // 过滤掉模板中的示例数据（日文为空的条目）
          let filteredData = data.filter(item => item.japanese && item.japanese.trim());
          
          if (filteredData.length === 0) {
            showToast('没有有效的数据可导入', 'error');
            return;
          }
          
          // 过滤掉重复数据（根据日文和发音的组合判断）
          const seen = new Set();
          filteredData = filteredData.filter(item => {
            const key = `${item.japanese}-${item.pronunciation}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          });
          
          if (filteredData.length === 0) {
            showToast('没有有效的数据可导入', 'error');
            return;
          }

          // 发送批量导入请求
          await api.importVocab({ batch: filteredData });

          showToast('批量导入成功', 'success');
          fetchVocabList(true);
        } catch (error) {
          logError(error, 'Batch Import');
          showToast('文件解析失败', 'error');
        } finally {
          setIsLoading(false);
          // 重置文件输入
          e.target.value = '';
        }
      };
      reader.readAsText(file);
    } catch (error) {
      logError(error, 'Batch Import');
      showToast('批量导入失败', 'error');
      setIsLoading(false);
      // 重置文件输入
      e.target.value = '';
    }
  };

  // 下载词汇模板（JSON格式）
  const downloadVocabTemplate = () => {
    const template = [
      {
        "japanese": "例えば",
        "pronunciation": "たとえば",
        "chinese": "例如",
        "level": "N5",
        "tag": "日常",
        "category": ["副词"],
        "pitchAccent": ["⓪"],
        "examples": ["例えば、日本語の勉強は毎日する必要があります。", "例えば、この本はとても面白いです。"],
        "textbooks": ["综合日语1", "大家的日语初级上"],
        "lessons": ["综合日语1:第1课", "大家的日语初级上:第3课"]
      },
      {
        "japanese": "勉強する",
        "pronunciation": "べんきょうする",
        "chinese": "学习",
        "level": "N5",
        "tag": "学习",
        "category": ["自他II"],
        "pitchAccent": ["①"],
        "examples": ["私は毎日日本語を勉強しています。", "彼は一生懸命勉強しています。"],
        "textbooks": ["综合日语1"],
        "lessons": ["综合日语1:第1课"]
      }
    ];

    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `vocabulary_template_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    showToast('模板下载成功', 'success');
  };

  // 下载词汇模板（CSV格式）
  const downloadVocabTemplateCSV = () => {
    const headers = ['japanese', 'pronunciation', 'chinese', 'level', 'tag', 'category', 'pitchAccent', 'examples', 'textbooks', 'lessons'];
    const rows = [
      ['例えば', 'たとえば', '例如', 'N5', '日常', '副词', '⓪', '例えば、日本語の勉強は毎日する必要があります。;例えば、この本はとても面白いです。', '综合日语1;大家的日语初级上', '综合日语1:第1课;大家的日语初级上:第3课'],
      ['勉強する', 'べんきょうする', '学习', 'N5', '学习', '自他II', '①', '私は毎日日本語を勉強しています。;彼は一生懸命勉強しています。', '综合日语1', '综合日语1:第1课']
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `vocabulary_template_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    showToast('模板下载成功', 'success');
  };

  // 批量下载
  const handleBatchDownload = async () => {
    setIsLoading(true);
    try {
      // 获取用户选择的下载选项
      const downloadOption = document.querySelector('input[name="download-option"]:checked')?.value || 'all';
      const downloadFormat = document.querySelector('input[name="download-format"]:checked')?.value || 'json';

      if (downloadOption === 'paginated') {
        // 分页下载逻辑
        showToast('分页下载功能开发中', 'info');
        setShowDownloadModal(false);
        setIsLoading(false);
        return;
      }

      // 构建查询参数
      const params = {
        page: 1,
        limit: 10000 // 限制最大下载量
      };

      // 如果选择的是当前筛选条件的数据，则添加筛选参数
      if (downloadOption === 'filtered') {
        if (searchForm.level && searchForm.level !== '') {
          params.level = searchForm.level;
        }
        if (searchForm.tag && searchForm.tag !== '') {
          params.tag = searchForm.tag;
        }
        if (searchForm.japanese && searchForm.japanese !== '') {
          params.search = searchForm.japanese;
        }
        if (searchForm.pronunciation && searchForm.pronunciation !== '') {
          params.search = searchForm.pronunciation;
        }
        if (searchForm.textbooks && searchForm.textbooks.length > 0) {
          params.textbooks = searchForm.textbooks;
        }
        if (searchForm.lessons && searchForm.lessons.length > 0) {
          params.lessons = searchForm.lessons;
        }
      }

      // 发送 API 请求获取数据
      const data = await api.exportVocab(params);
      const vocabData = Array.isArray(data) ? data : (data.data || []);

        let content, mimeType, fileName;

        if (downloadFormat === 'json') {
          // 转换为JSON字符串
          content = JSON.stringify(vocabData, null, 2);
          mimeType = 'application/json';
          fileName = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;
        } else {
          // 转换为CSV格式
          const headers = ['japanese', 'pronunciation', 'chinese', 'level', 'tag', 'category', 'pitchAccent', 'examples', 'textbooks', 'lessons'];
          const rows = vocabData.map(item => [
            item.japanese || '',
            item.pronunciation || '',
            item.chinese || '',
            item.level || '',
            item.tag || '',
            Array.isArray(item.category) ? item.category.join(';') : (item.category || ''),
            Array.isArray(item.pitchAccent) ? item.pitchAccent.join(';') : (item.pitchAccent || (Array.isArray(item.pitch_accent) ? item.pitch_accent.join(';') : (item.pitch_accent || ''))),
            Array.isArray(item.examples) ? item.examples.join(';') : (item.examples || ''),
            Array.isArray(item.textbooks) ? item.textbooks.join(';') : (item.textbooks || (Array.isArray(item.textbook) ? item.textbook.join(';') : (item.textbook || ''))),
            Array.isArray(item.lessons) ? item.lessons.join(';') : (item.lessons || (Array.isArray(item.lesson) ? item.lesson.join(';') : (item.lesson || '')))
          ]);

          content = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
          ].join('\n');
          mimeType = 'text/csv;charset=utf-8;';
          fileName = `vocabulary_${new Date().toISOString().split('T')[0]}.csv`;
        }

        // 创建下载链接
        const blob = new Blob([content], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        showToast('批量下载成功', 'success');
        setShowDownloadModal(false);
    } catch (error) {
      logError(error, 'Batch Download');
      showToast('批量下载失败', 'error');
      setShowDownloadModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-end mb-6 gap-4">
        <button 
          onClick={() => {
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加词汇
        </button>
        <button 
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
        >
          批量导入
        </button>
        <button 
          onClick={() => setShowDownloadModal(true)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
        >
          批量下载
        </button>
      </div>
      
      {/* 搜索表单 */}
      <div className="mb-6 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-medium text-dark mb-4">搜索条件</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">日文</label>
            <Input 
              type="text" 
              name="japanese" 
              value={searchForm.japanese} 
              onChange={handleSearchChange} 
              placeholder="请输入日文"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">发音</label>
            <Input 
              type="text" 
              name="pronunciation" 
              value={searchForm.pronunciation} 
              onChange={handleSearchChange} 
              placeholder="请输入发音"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">级别</label>
            <Select
              options={LEVELS.map(level => ({ value: level, label: level }))}
              value={searchForm.level}
              onChange={(value) => setSearchForm(prev => ({ ...prev, level: value }))}
              placeholder="请选择级别"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-2">标签</label>
            <Select
              options={TAGS.map(tag => ({ value: tag, label: tag }))}
              value={searchForm.tag}
              onChange={(value) => setSearchForm(prev => ({ ...prev, tag: value }))}
              placeholder="请选择标签"
              style={{ width: '100%' }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark mb-2">教材/课程</label>
            <Cascader
              options={cascaderOptions}
              value={[...searchForm.textbooks, ...searchForm.lessons]}
              onChange={(values) => {
                // 简化过滤逻辑，只根据值是否包含':'来分离教材和课程
                const textbooks = values.filter(value => !value.includes(':'));
                const lessons = values.filter(value => value.includes(':'));
                // 直接更新状态，确保UI能够正确反映选择
                setSearchForm({
                  ...searchForm,
                  textbooks,
                  lessons
                });
              }}
              placeholder="请选择教材和课程"
              multiple
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
      
      {/* 搜索和重置按钮 */}
      <div className="flex justify-end gap-4 mb-6">
        <button 
          onClick={() => {
            setSearchForm({
              japanese: '',
              pronunciation: '',
              level: '',
              textbooks: [],
              lessons: [],
              tag: ''
            });
            // 重置后重新加载词汇列表，使用空的搜索条件
            fetchVocabList(true);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
        <button 
          onClick={() => {
            console.log('Search button clicked, current searchForm:', searchForm);
            fetchVocabList();
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>
      
      <PaginationTable
        data={vocabList}
        columns={[
          {
            title: 'ID',
            render: (row, index) => index + 1,
            cellClassName: 'text-dark'
          },
          {
            title: '日文',
            key: 'japanese',
            cellClassName: 'text-dark font-medium'
          },
          {
            title: '发音',
            key: 'pronunciation',
            render: (row) => row.pronunciation || '-',
            cellClassName: 'text-muted'
          },
          {
            title: '中文',
            key: 'chinese',
            cellClassName: 'text-dark'
          },
          {
            title: '类别',
            render: (row) => {
              let categories = row.category;
              if (typeof categories === 'string') {
                try {
                  const parsed = JSON.parse(categories);
                  if (Array.isArray(parsed)) {
                    categories = parsed;
                  } else if (typeof parsed === 'object') {
                    categories = Object.values(parsed);
                  } else {
                    categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                  }
                } catch (e) {
                  categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                }
              }
              if (Array.isArray(categories) && categories.length > 0) {
                return categories.join(', ');
              } else if (categories) {
                return categories;
              }
              return '-';
            },
            cellClassName: 'text-sm'
          },
          {
            title: '声调',
            render: (row) => {
              let categories = row.pitch_accent;
              if (typeof categories === 'string') {
                try {
                  const parsed = JSON.parse(categories);
                  if (Array.isArray(parsed)) {
                    categories = parsed;
                  } else if (typeof parsed === 'object') {
                    categories = Object.values(parsed);
                  } else {
                    categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                  }
                } catch (e) {
                  categories = categories.split(',').map(item => item.trim()).filter(Boolean);
                }
              }
              if (Array.isArray(categories) && categories.length > 0) {
                return (
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat, i) => (
                      <span key={i} className="bg-blue-100 text-primary px-2 py-1 rounded text-xs">{cat}</span>
                    ))}
                  </div>
                );
              } else if (categories) {
                return <span className="bg-blue-100 text-primary px-2 py-1 rounded text-xs">{categories}</span>;
              }
              return '-';
            },
            cellClassName: 'text-sm'
          },
          {
            title: '级别',
            key: 'level',
            render: (row) => row.level || '-',
            cellClassName: 'text-dark'
          },
          {
            title: '标签',
            key: 'tag',
            render: (row) => <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{row.tag || '日常'}</span>,
            cellClassName: 'text-sm'
          },
          {
            title: '操作',
            render: (row) => (
              <div className="flex gap-4">
                <button 
                  onClick={() => openEditModal(row)}
                  className="px-3 py-1 text-blue-600 rounded text-xs hover:text-blue-700 transition-colors"
                >
                  编辑
                </button>
                <button 
                  onClick={() => openDeleteConfirm(row.id)}
                  className="px-3 py-1 text-red-600 rounded text-xs hover:text-red-700 transition-colors"
                >
                  删除
                </button>
              </div>
            ),
            cellClassName: 'text-sm'
          }
        ]}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onLimitChange={(newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
          // 立即使用新的limit值，而不是依赖于状态更新
          fetchVocabList(false, newLimit);
        }}
        emptyMessage="暂无词汇"
        emptyIcon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
      
      {/* 词汇模态框 */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑词汇' : '添加词汇'}
        confirmText={isLoading ? (isEditMode ? '更新中...' : '添加中...') : '保存'}
        onConfirm={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        size="xl"
      >
        <form onSubmit={isEditMode ? handleSubmitEdit : handleSubmitAdd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">日文 <span className="text-red-500">*</span></label>
              <Input type="text" name="japanese" value={vocabForm.japanese} onChange={handleFormChange} placeholder="请输入日文" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">发音 <span className="text-red-500">*</span></label>
              <Input type="text" name="pronunciation" value={vocabForm.pronunciation} onChange={handleFormChange} placeholder="请输入发音" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">教材/课程 <span className="text-red-500">*</span></label>
              <Cascader
                options={cascaderOptions}
                value={[...vocabForm.textbooks, ...vocabForm.lessons]}
                onChange={(values) => {
                  console.log('Cascader onChange triggered with values:', values);
                  // 简化过滤逻辑，只根据值是否包含':'来分离教材和课程
                  const textbooks = values.filter(value => !value.includes(':'));
                  const lessons = values.filter(value => value.includes(':'));
                  console.log('Separated textbooks:', textbooks);
                  console.log('Separated lessons:', lessons);
                  // 直接更新状态，确保UI能够正确反映选择
                  setVocabForm({
                    ...vocabForm,
                    textbooks,
                    lessons
                  });
                  console.log('Vocab form updated');
                }}
                placeholder="请选择教材和课程"
                multiple
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">类别 <span className="text-red-500">*</span></label>
              <Select
                mode="multiple"
                options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                value={vocabForm.category}
                onChange={(value) => {
                  setVocabForm(prev => ({
                    ...prev,
                    category: value
                  }));
                }}
                placeholder="请选择类别"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">声调 <span className="text-red-500">*</span></label>
              <Select
                mode="multiple"
                options={PITCH_ACCENTS.map(pa => ({ value: pa, label: pa }))}
                value={vocabForm.pitchAccent}
                onChange={(value) => {
                  setVocabForm(prev => ({
                    ...prev,
                    pitchAccent: value
                  }));
                }}
                placeholder="请选择声调"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">中文 <span className="text-red-500">*</span></label>
              <Input type="text" name="chinese" value={vocabForm.chinese} onChange={handleFormChange} placeholder="请输入中文" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">级别 <span className="text-red-500">*</span></label>
              <Select
                options={LEVELS.map(level => ({ value: level, label: level }))}
                value={vocabForm.level}
                onChange={(value) => setVocabForm(prev => ({ ...prev, level: value }))}
                placeholder="请选择级别"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">标签 <span className="text-red-500">*</span></label>
              <Select
                options={TAGS.map(tag => ({ value: tag, label: tag }))}
                value={vocabForm.tag}
                onChange={(value) => setVocabForm(prev => ({ ...prev, tag: value }))}
                placeholder="请选择标签"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">例句 <span className="text-red-500">*</span></label>
            {vocabForm.examples.map((example, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input 
                  type="text" 
                  value={example} 
                  onChange={(e) => {
                    const newExamples = [...vocabForm.examples];
                    newExamples[index] = e.target.value;
                    setVocabForm(prev => ({ ...prev, examples: newExamples }));
                  }}
                  className="flex-grow" 
                  placeholder="请输入例句"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newExamples = vocabForm.examples.filter((_, i) => i !== index);
                    setVocabForm(prev => ({ ...prev, examples: newExamples }));
                  }}
                  className="px-3 py-1 text-gray-600 hover:text-red-600 rounded flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setVocabForm(prev => ({ ...prev, examples: [...prev.examples, ''] }))}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              添加例句
            </button>
          </div>
        </form>
      </Modal>
      
      {/* 删除确认模态框 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        confirmText={isLoading ? '删除中...' : '删除'}
        cancelText="取消"
        onConfirm={confirmDelete}
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700">确定要删除这个词汇吗？此操作不可撤销。</p>
        </div>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="批量导入词汇"
        confirmText="关闭"
        onConfirm={() => setShowImportModal(false)}
        size="lg"
      >
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-dark mb-4">导入说明</h4>
            <p className="text-gray-600 mb-4">请按照以下步骤进行批量导入：</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
              <li>下载导入模板文件</li>
              <li>按照模板格式填写真实词汇数据</li>
              <li>上传填写好的文件进行导入</li>
            </ol>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 className="font-medium text-blue-800 mb-2">填写说明：</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>多个例句</strong>：在 JSON 模板中使用数组格式，在 CSV 模板中用分号 (;) 分隔</li>
                <li><strong>多本教材</strong>：在 JSON 模板中使用数组格式，在 CSV 模板中用分号 (;) 分隔</li>
                <li><strong>多个课程</strong>：在 JSON 模板中使用数组格式，在 CSV 模板中用分号 (;) 分隔</li>
                <li><strong>多个类别</strong>：在 JSON 模板中使用数组格式，在 CSV 模板中用分号 (;) 分隔</li>
                <li><strong>多个声调</strong>：在 JSON 模板中使用数组格式，在 CSV 模板中用分号 (;) 分隔</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h5 className="font-medium text-green-800 mb-2">温馨提示：</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>模板中的示例数据会被自动过滤，无需手动删除</li>
                <li>请确保填写的数据符合下拉选项的要求</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-dark mb-4">下载模板</h4>
            <div className="flex gap-4">
              <button 
                onClick={downloadVocabTemplate}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                下载 JSON 模板
              </button>
              <button 
                onClick={downloadVocabTemplateCSV}
                className="px-4 py-2 border border-gray-300 rounded-lg text-dark hover:bg-gray-50 transition-colors"
              >
                下载 CSV 模板
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-dark mb-4">上传文件</h4>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-500');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500');
                const file = e.dataTransfer.files[0];
                if (file && (file.name.endsWith('.json') || file.name.endsWith('.csv'))) {
                  // 创建一个模拟的 input 事件
                  const inputEvent = {
                    target: {
                      files: [file],
                      value: ''
                    }
                  };
                  handleBatchImport(inputEvent);
                } else {
                  showToast('不支持的文件格式', 'error');
                }
              }}
              onClick={() => document.getElementById('vocab-import-input').click()}
            >
              <input 
                type="file" 
                id="vocab-import-input" 
                accept=".json,.csv" 
                className="hidden"
                onChange={handleBatchImport}
              />
              <div className="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <button 
                  type="button"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mb-2"
                >
                  点击上传文件
                </button>
                <p className="text-sm text-gray-500">或拖拽文件到此处</p>
                <p className="mt-2 text-sm text-gray-500">支持 JSON 和 CSV 格式</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 批量下载模态框 */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="批量下载词汇"
        confirmText="下载"
        onConfirm={handleBatchDownload}
        size="lg"
      >
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-dark mb-4">下载选项</h4>
            <p className="text-gray-600 mb-4">请选择下载方式：</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="download-all" 
                  name="download-option" 
                  value="all" 
                  defaultChecked
                />
                <label htmlFor="download-all" className="ml-2 text-gray-700">
                  下载所有数据（最多 10,000 条）
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="download-filtered" 
                  name="download-option" 
                  value="filtered"
                />
                <label htmlFor="download-filtered" className="ml-2 text-gray-700">
                  下载当前筛选条件的数据
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="download-paginated" 
                  name="download-option" 
                  value="paginated"
                />
                <label htmlFor="download-paginated" className="ml-2 text-gray-700">
                  分页下载（适合大量数据）
                </label>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-medium text-dark mb-4">下载格式</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="format-json" 
                  name="download-format" 
                  value="json" 
                  defaultChecked
                />
                <label htmlFor="format-json" className="ml-2 text-gray-700">
                  JSON 格式（推荐）
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="format-csv" 
                  name="download-format" 
                  value="csv"
                />
                <label htmlFor="format-csv" className="ml-2 text-gray-700">
                  CSV 格式
                </label>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  提示：如果数据量较大，建议使用分页下载方式，避免浏览器卡顿。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VocabManager;
