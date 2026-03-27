import React from 'react';

const SelectSingle = ({ 
  options, 
  value, 
  onChange, 
  placeholder = '请选择', 
  className = '',
  name,
  ...props 
}) => {
  return (
    <select 
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
};

export default SelectSingle;