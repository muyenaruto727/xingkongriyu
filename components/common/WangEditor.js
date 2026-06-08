import { useState, useEffect, useCallback } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';

const WangEditor = ({ value, onChange, placeholder, style }) => {
  const [editor, setEditor] = useState(null);
  const [html, setHtml] = useState(value || '');
  const { height = '300px', ...containerStyle } = style || {};

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined && value !== html) {
      setHtml(value);
    }
  }, [value]);

  const toolbarConfig = {
    excludeKeys: ['group-video', 'fullScreen'],
  };

  const editorConfig = {
    placeholder: placeholder || '请输入内容...',
    autoFocus: false,
  };

  const handleChange = useCallback((editor) => {
    const newHtml = editor.getHtml();
    setHtml(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
  }, [onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [editor]);

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden', ...containerStyle }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        style={{ height, overflowY: 'auto' }}
      />
    </div>
  );
};

export default WangEditor;
