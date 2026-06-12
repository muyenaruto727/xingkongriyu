import { useState, useEffect } from 'react';
import { CATEGORIES, PITCH_ACCENTS, LEVELS, TAGS } from '../../config/config';
import { api } from '../../lib/api';
import { logError } from '../../utils.js';
import { message, Cascader, Select, Input, Pagination, Upload, Modal } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import PaginationTable from '../common/PaginationTable';

const VocabManager = () => {
  const [vocabList, setVocabList] = useState([]);
  const [textbooks, setTextbooks] = useState([]);
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

  // 转换教材数据为级联选择格式
  // lesson value 使用教材名:课程名，确保选中后 Tag 显示 "综合日语1:第5课"
  const cascaderOptions = textbooks.map(textbook => ({
    label: textbook.name,
    value: textbook.id,
    children: (textbook.lessons || []).map(lesson => ({
      label: `${textbook.name}:${lesson.name}`,
      value: `${textbook.name}:${lesson.name}`
    }))
  }));

  // 将 textbooks/lessons 状态转为 Cascader 所需的路径数组格式
  // 选中课程时，教材ID作为路径前缀已包含，不再单独生成 tag
  const buildCascaderValue = (tbIds, lessons) => {
    const paths = [];
    // 提取已选课程对应的教材ID
    const lessonTbIds = new Set();
    lessons.forEach(lesson => {
      const colonIdx = lesson.indexOf(':');
      if (colonIdx > 0) {
        const tbName = lesson.substring(0, colonIdx);
        const tb = textbooks.find(t => t.name === tbName);
        if (tb) {
          lessonTbIds.add(String(tb.id));
          paths.push([String(tb.id), lesson]);
        } else {
          paths.push([lesson]);
        }
      } else {
        paths.push([lesson]);
      }
    });
    // 只添加未被任何课程覆盖的独立教材选择
    tbIds.forEach(tid => {
      if (!lessonTbIds.has(String(tid))) {
        paths.push([String(tid)]);
      }
    });
    return paths;
  };

  // 获取教材列表
  const fetchTextbooks = async () => {
    try {
      const data = await api.getTextbookList();
      setTextbooks(data);
    } catch (error) {
    }
  };

  // 组件挂载时加载词汇列表和教材列表
  useEffect(() => {
    fetchVocabList(true);
    fetchTextbooks();
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
      message.error('请输入日文');
      return false;
    }
    if (!vocabForm.pronunciation.trim()) {
      message.error('请输入发音');
      return false;
    }
    if (!vocabForm.chinese.trim()) {
      message.error('请输入中文');
      return false;
    }
    if (!vocabForm.level) {
      message.error('请选择级别');
      return false;
    }
    if (!vocabForm.tag) {
      message.error('请选择标签');
      return false;
    }
    if (vocabForm.category.length === 0) {
      message.error('请选择类别');
      return false;
    }
    if (vocabForm.pitchAccent.length === 0) {
      message.error('请选择声调');
      return false;
    }
    if (vocabForm.textbooks.length === 0 && vocabForm.lessons.length === 0) {
      message.error('请选择教材和课程');
      return false;
    }
    if (vocabForm.examples.length === 0 || !vocabForm.examples.some(example => example.trim())) {
      message.error('请至少输入一个例句');
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
      
      // 处理教材ID，确保包含所有课程中提到的教材
      const textbooksFromLessons = new Set(vocabForm.textbooks);
      
      vocabForm.lessons.forEach(lessonValue => {
        if (lessonValue.includes(':')) {
          const [textbookId] = lessonValue.split(':');
          textbooksFromLessons.add(textbookId);
        }
      });
      
      const textbooks = Array.from(textbooksFromLessons);
      
      await api.createVocab({
        ...vocabData,
        category: category.join(','),
        pitch_accent: pitchAccent.join(','),
        textbook: textbooks.length > 0 ? textbooks.join(',') : '',
        lesson: vocabForm.lessons.length > 0 ? vocabForm.lessons.join(',') : '',
        examples: vocabForm.examples.filter(example => example.trim())
      });
      
      message.success('词汇添加成功');
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
      
      await api.updateVocab(currentEditId, {
        ...vocabData,
        category: category.join(','),
        pitch_accent: pitchAccent.join(','),
        textbook: vocabForm.textbooks.length > 0 ? vocabForm.textbooks.join(',') : '',
        lesson: vocabForm.lessons.length > 0 ? vocabForm.lessons.join(',') : '',
        examples: vocabForm.examples.filter(example => example.trim())
      });
      
      message.success('词汇更新成功');
      // 重置表单
      resetForm();
      // 重新加载词汇列表，使用空的搜索条件
      fetchVocabList(true);
      // 最后关闭模态框
      setShowModal(false);
    } catch (error) {
      logError(error, 'Update Vocabulary');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除词汇
  const confirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await api.deleteVocab(currentEditId);
      
      message.success('词汇删除成功');
      setShowDeleteConfirm(false);
      setCurrentEditId(null);
      // 重新加载词汇列表，使用空的搜索条件
      fetchVocabList(true);
    } catch (error) {
      logError(error, 'Delete Vocabulary');
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
        // 检查课程是否已经包含教材ID
        if (lesson.includes(':')) {
          // 如果课程已经包含教材ID，直接返回
          return lesson;
        } else {
          // 如果课程不包含教材ID，尝试找到对应的教材ID
          // 这里简单使用第一个教材，实际应用中可能需要更复杂的匹配逻辑
          let textbookId = textbooks[0];
          return textbookId ? `${textbookId}:${lesson}` : lesson;
        }
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

  // 批量导入（从文件输入）
  const handleBatchImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 调用通用的批量导入函数
    await handleBatchImportFromFile(file, e.target);
  };

  // 批量导入（从拖拽上传）
  const handleBatchImportFromDragger = async (file) => {
    // 调用通用的批量导入函数
    await handleBatchImportFromFile(file);
  };

  // 通用的批量导入函数
  const handleBatchImportFromFile = async (file, inputElement = null) => {
    setIsLoading(true);
    message.info('开始处理文件...');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          message.info('解析文件中...');
          const content = event.target.result;
          let data;

          // 解析文件内容
          if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else if (file.name.endsWith('.csv')) {
            // 简单的 CSV 解析
            message.info('解析CSV文件...');
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
            message.error('不支持的文件格式');
            setIsLoading(false);
            if (inputElement) inputElement.value = '';
            return;
          }

          // 验证数据格式
          if (!Array.isArray(data)) {
            message.error('文件内容格式错误');
            setIsLoading(false);
            if (inputElement) inputElement.value = '';
            return;
          }

          // 过滤掉模板中的示例数据（日文为空的条目）
          message.info(`验证数据格式，共 ${data.length} 条数据...`);
          let filteredData = data.filter(item => item.japanese && item.japanese.trim());
          
          if (filteredData.length === 0) {
            message.error('没有有效的数据可导入');
            setIsLoading(false);
            if (inputElement) inputElement.value = '';
            return;
          }
          
          // 过滤掉重复数据（根据日文和发音的组合判断）
          message.info('过滤掉重复数据...');
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
            message.error('没有有效的数据可导入');
            setIsLoading(false);
            if (inputElement) inputElement.value = '';
            return;
          }

          // 与数据库中已有的词汇进行去重
          try {
            message.info('与数据库中已有的词汇进行去重...');
            const existingVocab = await api.getVocabList({ limit: 10000 });
            const existingKeys = new Set();
            
            if (Array.isArray(existingVocab)) {
              existingVocab.forEach(vocab => {
                if (vocab.japanese && vocab.pronunciation) {
                  const key = `${vocab.japanese}-${vocab.pronunciation}`;
                  existingKeys.add(key);
                }
              });
            } else if (existingVocab.data) {
              existingVocab.data.forEach(vocab => {
                if (vocab.japanese && vocab.pronunciation) {
                  const key = `${vocab.japanese}-${vocab.pronunciation}`;
                  existingKeys.add(key);
                }
              });
            }

            // 过滤掉与数据库中重复的词汇
            const uniqueData = filteredData.filter(item => {
              const key = `${item.japanese}-${item.pronunciation}`;
              return !existingKeys.has(key);
            });

            if (uniqueData.length === 0) {
              message.info('所有数据都已存在，没有新数据可导入');
              setIsLoading(false);
              if (inputElement) inputElement.value = '';
              return;
            } 

            // 发送批量导入请求
            message.info(`正在导入 ${uniqueData.length} 条新数据...`);
            await api.importVocab({ batch: uniqueData });

            if (uniqueData.length < filteredData.length) {
              message.success(`已过滤掉 ${filteredData.length - uniqueData.length} 条重复数据，成功导入 ${uniqueData.length} 条新数据`);
            } else {
              message.success(`成功导入 ${uniqueData.length} 条新数据`);
            }
          } catch (error) {
            logError(error, 'Batch Import Deduplication');
            // 如果去重失败，仍然尝试导入数据
            message.info(`直接导入 ${filteredData.length} 条数据...`);
            await api.importVocab({ batch: filteredData });
            message.success(`成功导入 ${filteredData.length} 条数据`);
          }

          message.info('刷新词汇列表...');
          await fetchVocabList(true);
        } catch (error) {
          logError(error, 'Batch Import');
          message.error('文件解析失败');
        } finally {
          setIsLoading(false);
          // 重置文件输入
          if (inputElement) inputElement.value = '';
        }
      };
      reader.readAsText(file);
    } catch (error) {
      logError(error, 'Batch Import');
      message.error('批量导入失败');
      setIsLoading(false);
      // 重置文件输入
      if (inputElement) inputElement.value = '';
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
      },
      {
        "japanese": "食べる",
        "pronunciation": "たべる",
        "chinese": "吃",
        "level": "N5",
        "tag": "日常",
        "category": ["他I"],
        "pitchAccent": ["②"],
        "examples": ["私は毎日三食食べます。", "彼はりんごを食べています。"],
        "textbooks": ["综合日语1"],
        "lessons": ["综合日语1:第2课"]
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

    message.success('模板下载成功');
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

    message.success('模板下载成功');
  };

  // 批量下载
  const handleBatchDownload = async () => {
    setIsLoading(true);
    try {
      // 获取用户选择的下载选项
      const downloadOption = document.querySelector('input[name="download-option"]:checked')?.value || 'all';

      if (downloadOption === 'paginated') {
        // 分页下载逻辑
        await handlePaginatedDownload();
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

      // 转换为JSON字符串
      const content = JSON.stringify(vocabData, null, 2);
      const mimeType = 'application/json';
      const fileName = `vocabulary_${new Date().toISOString().split('T')[0]}.json`;

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

      message.success('批量下载成功');
      setShowDownloadModal(false);
    } catch (error) {
      logError(error, 'Batch Download');
      message.error('批量下载失败');
      setShowDownloadModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 分页下载处理
  const handlePaginatedDownload = async () => {
    try {
      // 获取用户自定义的每页大小和页码
      const pageSize = parseInt(document.getElementById('page-size')?.value || '1000', 10);
      const pageNumber = parseInt(document.getElementById('page-number')?.value || '1', 10);

      // 构建查询参数
      const params = {
        page: pageNumber,
        limit: pageSize
      };

      // 添加筛选参数
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

      // 获取指定页码的数据
      message.info(`开始下载第 ${pageNumber} 页，每页 ${pageSize} 条数据`);
      const pageData = await api.exportVocab(params);
      const vocabData = Array.isArray(pageData) ? pageData : (pageData.data || []);
      const totalItems = pageData.total || 0;
      const totalPages = Math.ceil(totalItems / pageSize);

      // 转换为 JSON 字符串
      const content = JSON.stringify(vocabData, null, 2);
      const mimeType = 'application/json';
      const fileName = `vocabulary_${new Date().toISOString().split('T')[0]}_page_${pageNumber}_size_${pageSize}.json`;

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

      message.success(`分页下载成功，共下载 ${vocabData.length} 条数据（第 ${pageNumber}/${totalPages} 页）`);
      setShowDownloadModal(false);
    } catch (error) {
      logError(error, 'Paginated Download');
      message.error('分页下载失败');
      setShowDownloadModal(false);
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
              value={buildCascaderValue(searchForm.textbooks, searchForm.lessons)}
              onChange={(values) => {
                // Ant Design 5 Cascader 在 multiple 模式下返回路径数组的数组
                // 例如选择 "综合日语1:第5课" → values = [["1", "1:第5课"]]
                const textbooks = [];
                const lessons = [];
                const flatValues = Array.isArray(values) ? values : [];
                flatValues.forEach(item => {
                  const path = Array.isArray(item) ? item : [item];
                  if (path.length > 0) {
                    // 路径第一个元素是教材ID
                    if (!textbooks.includes(String(path[0]))) {
                      textbooks.push(String(path[0]));
                    }
                    // 路径最后一个元素是叶子节点（课程）
                    if (path.length > 1) {
                      const leaf = String(path[path.length - 1]);
                      if (!lessons.includes(leaf)) {
                        lessons.push(leaf);
                      }
                    }
                  }
                });
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
            // 清空搜索表单
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
            title: '序号',
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
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          resetForm();
        }}
        title={isEditMode ? '编辑词汇' : '添加词汇'}
        width={900}
        onOk={isEditMode ? handleSubmitEdit : handleSubmitAdd}
        okText="保存"
        cancelText="取消"
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
                value={buildCascaderValue(vocabForm.textbooks || [], vocabForm.lessons || [])}
                onChange={(values) => {
                  console.log('Cascader onChange triggered with values:', values);
                  // 处理Cascader的多选值格式
                  const textbooksSet = new Set();
                  const lessons = [];
                  
                  values.forEach(path => {
                    if (path.length === 2) {
                      const [textbookId, lessonValue] = path;
                      textbooksSet.add(textbookId);
                      lessons.push(lessonValue);
                    }
                  });
                  
                  const textbooks = Array.from(textbooksSet);
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
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        title="确认删除"
        onOk={confirmDelete}
        okButtonProps={{ danger: true, loading: isLoading }}
        cancelText="取消"
      >
        <p className="text-gray-700">确定要删除这个词汇吗？此操作不可撤销。</p>
      </Modal>

      {/* 批量导入模态框 */}
      <Modal
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        title="批量导入词汇"
        footer={null}
        width={600}
      >
        <div className="mb-6">
          <h4 className="text-lg font-medium text-dark mb-4">下载模板</h4>
          <button 
            onClick={downloadVocabTemplate}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            下载 JSON 模板
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-medium text-dark mb-4">上传文件</h4>
          <Upload.Dragger
            name="file"
            accept=".json"
            multiple={false}
            beforeUpload={(file) => {
              if (!file.name.endsWith('.json')) {
                message.error('仅支持 JSON 格式文件');
                return false;
              }
              // 调用批量导入函数
              handleBatchImportFromDragger(file);
              return false; // 阻止自动上传
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个 JSON 文件上传
            </p>
          </Upload.Dragger>
        </div>
      </Modal>

      {/* 批量下载模态框 */}
      <Modal
        open={showDownloadModal}
        onCancel={() => setShowDownloadModal(false)}
        title="批量下载词汇"
        onOk={handleBatchDownload}
        okText="下载"
        okButtonProps={{ loading: isLoading }}
        width={600}
      >
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
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
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
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
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
                onChange={(e) => {
                  const paginatedOptions = document.getElementById('paginated-options');
                  if (paginatedOptions) {
                    paginatedOptions.style.display = e.target.value === 'paginated' ? 'block' : 'none';
                  }
                }}
              />
              <label htmlFor="download-paginated" className="ml-2 text-gray-700">
                分页下载（适合大量数据）
              </label>
            </div>
            <div className="ml-8 space-y-4" id="paginated-options" style={{ display: 'none' }}>
              <div>
                <label htmlFor="page-size" className="block text-sm font-medium text-gray-700 mb-1">
                  每页大小
                </label>
                <input 
                  type="number" 
                  id="page-size" 
                  min="1" 
                  max="5000" 
                  defaultValue="1000" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="page-number" className="block text-sm font-medium text-gray-700 mb-1">
                  下载页码
                </label>
                <input 
                  type="number" 
                  id="page-number" 
                  min="1" 
                  defaultValue="1" 
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
      </Modal>
    </div>
  );
};

export default VocabManager;
