import React from 'react';

const QuestionList = ({ questions, onEdit, onDelete }) => {
  const questionTypes = [
    { id: 'vocabulary', name: '文字・語彙' },
    { id: 'grammar', name: '文法' },
    { id: 'reading', name: '読解' },
    { id: 'listening', name: '聴解' }
  ];

  const getTypeName = (typeId) => {
    const type = questionTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">题目</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">级别</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">是否真题</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {questions.map((question, index) => (
            <tr key={question.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-dark">{question.id}</td>
              <td className="px-6 py-4 text-sm text-dark max-w-xs truncate" title={question.question_text}>
                {question.question_text || '无题目'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                {getTypeName(question.question_type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                {question.level || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                {question.is_real_exam ? '是' : '否'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(question)}
                  className="text-primary hover:text-blue-700 mr-3"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                暂无题目数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionList;