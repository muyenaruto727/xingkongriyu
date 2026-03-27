import React from 'react';

const Textarea = ({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  className = '',
  rows = 4,
  ...props 
}) => {
  return (
    <textarea 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    />
  );
};

export default Textarea;