import React from 'react';
import { Input, Select } from 'antd';

const QuestionForm = ({ formData, onFormChange, onOptionChange, onSubmit, isEdit, onCancel }) => {
  const levels = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const questionTypes = [
    { id: 'vocabulary', name: '文字・語彙', nameJp: 'もじ・ごい' },
    { id: 'grammar', name: '文法', nameJp: 'ぶんぽう' },
    { id: 'reading', name: '読解', nameJp: 'どっかい' },
    { id: 'listening', name: '聴解', nameJp: 'ちょうかい' }
  ];

  const getCategoryOptions = (type, level) => {
    const options = {
      vocabulary: [
        { value: 'kanji_reading', label: '汉字读法' },
        { value: 'kanji_writing', label: '汉字书写', disabled: level === 'N1' },
        { value: 'word_formation', label: '词语构成', disabled: ['N1', 'N3', 'N4', 'N5'].includes(level) },
        { value: 'context', label: '前后关系' },
        { value: 'synonym', label: '近义替换' },
        { value: 'usage', label: '用法', disabled: level === 'N5' }
      ],
      grammar: [
        { value: 'sentence_grammar_1', label: '句子语法1' },
        { value: 'sentence_grammar_2', label: '句子语法2' },
        { value: 'text_grammar', label: '文章语法' }
      ],
      reading: [
        { value: 'short_content', label: '内容理解（短篇）' },
        { value: 'medium_content', label: '内容理解（中篇）' },
        { value: 'long_content', label: '内容理解（长篇）', disabled: ['N2', 'N4', 'N5'].includes(level) },
        { value: 'comprehensive', label: '综合理解', disabled: ['N3', 'N4', 'N5'].includes(level) },
        { value: 'argument_long', label: '论点理解（长篇）', disabled: ['N3', 'N4', 'N5'].includes(level) },
        { value: 'information_search', label: '信息检索' }
      ],
      listening: [
        { value: 'problem_understanding', label: '问题理解' },
        { value: 'key_understanding', label: '重点理解' },
        { value: 'summary_understanding', label: '概要理解', disabled: ['N4', 'N5'].includes(level) },
        { value: 'language_expression', label: '语言表达', disabled: ['N1', 'N2'].includes(level) },
        { value: 'immediate_response', label: '及时应答' },
        { value: 'comprehensive_understanding', label: '综合理解', disabled: ['N3', 'N4', 'N5'].includes(level) }
      ]
    };
    return options[type] || [];
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">题目类型 *</label>
          <Select
            name="question_type"
            value={formData.question_type}
            onChange={(value) => onFormChange({ target: { name: 'question_type', value } })}
            style={{ width: '100%' }}
            placeholder="请选择题目类型"
            required
          >
            {questionTypes.map(type => (
              <Select.Option key={type.id} value={type.id}>
                {type.name} ({type.nameJp})
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">级别 *</label>
          <Select
            name="level"
            value={formData.level}
            onChange={(value) => onFormChange({ target: { name: 'level', value } })}
            style={{ width: '100%' }}
            placeholder="请选择级别"
            required
          >
            {levels.map(level => (
              <Select.Option key={level} value={level}>{level}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">类别</label>
          <Select
            name="category"
            value={formData.category}
            onChange={(value) => onFormChange({ target: { name: 'category', value } })}
            style={{ width: '100%' }}
            placeholder="请选择类别"
          >
            <Select.Option value="">请选择类别</Select.Option>
            {getCategoryOptions(formData.question_type, formData.level).map(option => (
              <Select.Option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
                {option.disabled && ' (当前级别不可用)'}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">真题</label>
          <Select
            name="is_real_exam"
            value={formData.is_real_exam}
            onChange={(value) => onFormChange({ target: { name: 'is_real_exam', value } })}
            style={{ width: '100%' }}
            placeholder="请选择"
          >
            <Select.Option value={true}>是</Select.Option>
            <Select.Option value={false}>否</Select.Option>
          </Select>
        </div>
      </div>

      {formData.question_type === 'listening' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">音频URL</label>
          <Input
            name="audio_url"
            value={formData.audio_url}
            onChange={onFormChange}
            placeholder="请输入音频URL"
          />
        </div>
      )}

      {formData.question_type === 'reading' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文章内容</label>
          <Input.TextArea
            name="passage"
            value={formData.passage}
            onChange={onFormChange}
            rows={6}
            placeholder="请输入文章内容"
          />
        </div>
      )}

      {formData.question_type === 'grammar' && formData.category === 'text_grammar' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">文章内容</label>
          <Input.TextArea
            name="grammarPassage"
            value={formData.grammarPassage}
            onChange={onFormChange}
            rows={6}
            placeholder="请输入文章内容"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">题目内容 *</label>
        <Input.TextArea
          name="question_text"
          value={formData.question_text}
          onChange={onFormChange}
          rows={3}
          placeholder="请输入题目内容"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">选项 *</label>
        {formData.options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className="w-8 text-center text-sm font-medium text-gray-700">
              {String.fromCharCode(65 + index)}
            </span>
            <Input
              value={option}
              onChange={(e) => onOptionChange(index, e.target.value)}
              style={{ flex: 1, marginLeft: 8 }}
              placeholder={`选项 ${String.fromCharCode(65 + index)}`}
              required
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">正确答案 *</label>
        <Select
          name="correct_answer"
          value={formData.correct_answer}
          onChange={(value) => onFormChange({ target: { name: 'correct_answer', value } })}
          style={{ width: '100%' }}
          placeholder="请选择正确答案"
          required
        >
          {formData.options.map((_, index) => (
            <Select.Option key={index} value={index}>
              {String.fromCharCode(65 + index)}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">解析</label>
        <Input.TextArea
          name="explanation"
          value={formData.explanation}
          onChange={onFormChange}
          rows={4}
          placeholder="请输入解析内容"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEdit ? '更新' : '创建'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;