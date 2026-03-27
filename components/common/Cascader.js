import React, { useState, useRef, useEffect } from 'react';

const Cascader = ({ 
  options, 
  value = [], 
  onChange, 
  placeholder = '请选择',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [activeLevel, setActiveLevel] = useState(0);
  const [menuData, setMenuData] = useState([]);
  const [activePath, setActivePath] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (options && options.length > 0) {
      setMenuData([options]);
    }
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveLevel(0);
        setMenuData([options]);
        setActivePath([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [options]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveLevel(0);
      setMenuData([options]);
      setActivePath([]);
    }
  };

  const handleOptionClick = (option, level) => {
    if (option.children && option.children.length > 0) {
      // 展开子菜单
      const newMenuData = [...menuData];
      // 无论当前层级是什么，都展开子菜单
      newMenuData.splice(level + 1);
      newMenuData.push(option.children);
      setMenuData(newMenuData);
      setActiveLevel(level + 1);
      setActivePath([...activePath.slice(0, level), option.value]);
    }
  };

  const handleCheckboxChange = (option) => {
    let newSelected;
    if (selected.includes(option.value)) {
      newSelected = selected.filter(item => item !== option.value);
    } else {
      newSelected = [...selected, option.value];
    }
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  const handleRemove = (value) => {
    const newSelected = selected.filter(item => item !== value);
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  const handleMenuBack = (level) => {
    if (level > 0) {
      const newMenuData = menuData.slice(0, level);
      setMenuData(newMenuData);
      setActiveLevel(level - 1);
      setActivePath(activePath.slice(0, level - 1));
    }
  };

  const getOptionLabel = (value) => {
    // 处理包含教材信息的课程value
    if (value.includes(':')) {
      const [textbookId, lesson] = value.split(':');
      const textbook = options.find(opt => opt.value === textbookId);
      if (textbook) {
        return `${textbook.label} - ${lesson}`;
      }
    }
    
    // 查找普通选项的标签
    const findLabel = (options) => {
      for (const option of options) {
        if (option.value === value) {
          return option.label;
        }
        if (option.children) {
          const found = findLabel(option.children);
          if (found) return found;
        }
      }
      return value;
    };
    return findLabel(options);
  };

  const renderMenu = (items, level) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="cascader-menu" key={level}>
        {level > 0 && (
          <div 
            className="cascader-menu-header px-4 py-2 border-b border-gray-200 flex items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleMenuBack(level)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-gray-400 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {level > 1 ? getOptionLabel(activePath[level - 2]) : '教材'}
          </div>
        )}
        <div className="cascader-menu-content">
          {items.map(option => (
            <div key={option.value} className="cascader-option">
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(option);
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span 
                  className={`flex-grow cursor-pointer ${option.children && option.children.length > 0 ? 'font-medium' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (option.children && option.children.length > 0) {
                      handleOptionClick(option, level);
                    } else {
                      handleCheckboxChange(option);
                    }
                  }}
                >
                  {option.label}
                </span>
                {option.children && option.children.length > 0 && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-gray-400 cursor-pointer"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionClick(option, level);
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 在客户端添加CSS样式
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .cascader-menu {
          flex: 0 0 200px;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
        }
        
        .cascader-menu:last-child {
          border-right: none;
        }
        
        .cascader-menu-content {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .cascader-option:hover {
          background-color: #f3f4f6;
        }
        
        .cascader-menu-header {
          font-size: 14px;
          font-weight: 500;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* 已选标签 */}
      <div 
        className={`flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-12 ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-gray-400'}`}
        onClick={handleToggle}
      >
        {selected.length > 0 ? (
          selected.map(item => (
            <span key={item} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
              {getOptionLabel(item)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 p-0.5"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex">
            {menuData.map((items, index) => renderMenu(items, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cascader;