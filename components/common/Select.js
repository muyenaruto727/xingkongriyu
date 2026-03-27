import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  options, 
  value = [], 
  onChange, 
  placeholder = '请选择',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 处理选项选择
  const handleOptionClick = (option) => {
    let newValue;
    if (value.includes(option)) {
      newValue = value.filter(item => item !== option);
    } else {
      newValue = [...value, option];
    }
    onChange(newValue);
  };
  
  // 处理标签删除
  const handleTagRemove = (option) => {
    const newValue = value.filter(item => item !== option);
    onChange(newValue);
  };
  
  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* 输入框和标签 */}
      <div 
        className={`flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-12 ${isOpen ? 'border-blue-500 ring-2 ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'hover:border-gray-400'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.map((option, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
            {option}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTagRemove(option);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div 
              key={option}
              className={`flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer`}
              onClick={() => handleOptionClick(option)}
            >
              <span>{option}</span>
              {value.includes(option) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;