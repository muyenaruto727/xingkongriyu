function addCountLine(lines, label, count) {
  if (count > 0) {
    lines.push(`${label}：${count} 条`);
  }
}

function buildVocabularyImportSummary({
  totalCount = 0,
  validCount = 0,
  duplicateInFileCount = 0,
  duplicateInDatabaseCount = 0,
  importedCount = 0,
  fallbackMode = false,
} = {}) {
  const lines = [
    `文件数据：${totalCount} 条`,
    `有效数据：${validCount} 条`,
  ];

  addCountLine(lines, '文件内重复', duplicateInFileCount);
  addCountLine(lines, '数据库已存在', duplicateInDatabaseCount);
  lines.push(`成功导入：${importedCount} 条`);

  if (fallbackMode) {
    lines.push('提示：数据库去重检查失败，已改为直接导入有效数据。');
  }

  return lines;
}

module.exports = {
  buildVocabularyImportSummary,
};
