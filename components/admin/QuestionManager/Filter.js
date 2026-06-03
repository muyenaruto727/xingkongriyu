
import { Input, Select } from 'antd';

const Filter = ({ level, type, id, onLevelChange, onTypeChange, onIdChange, onSearch, onReset }) => {
  const levels = ['', 'N1', 'N2', 'N3', 'N4', 'N5'];
  const questionTypes = [
    { id: '', name: '全部' },
    { id: 'vocabulary', name: '文字・語彙' },
    { id: 'grammar', name: '文法' },
    { id: 'reading', name: '読解' },
    { id: 'listening', name: '聴解' }
  ];

  return (
    <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">问题ID</label>
          <Input
            value={id}
            onChange={(e) => onIdChange(e.target.value)}
            placeholder="请输入问题ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">级别</label>
          <Select
            value={level}
            onChange={onLevelChange}
            style={{ width: '100%' }}
            placeholder="请选择级别"
          >
            {levels.map(lv => (
              <Select.Option key={lv} value={lv}>{lv || '全部'}</Select.Option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
          <Select
            value={type}
            onChange={onTypeChange}
            style={{ width: '100%' }}
            placeholder="请选择类型"
          >
            {questionTypes.map(type => (
              <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button 
          onClick={onReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
        <button 
          onClick={onSearch}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>
  );
};

export default Filter;