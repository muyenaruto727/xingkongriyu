const VALID_LEVELS = new Set(['N1', 'N2', 'N3', 'N4', 'N5']);
const VALID_SECTIONS = new Set(['vocabulary', 'grammar', 'reading', 'listening']);

function createError(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

function validateExamGenerateRequest(body = {}) {
  const { level, sections } = body;

  if (!level || !Array.isArray(sections) || sections.length === 0) {
    return createError('MISSING_PARAMS', 'Missing required parameters');
  }

  if (!VALID_LEVELS.has(level)) {
    return createError('INVALID_LEVEL', 'Invalid level');
  }

  const normalizedSections = [];
  for (const section of sections) {
    if (!VALID_SECTIONS.has(section)) {
      return createError('INVALID_SECTION', 'Invalid section');
    }
    if (!normalizedSections.includes(section)) {
      normalizedSections.push(section);
    }
  }

  return {
    value: {
      level,
      sections: normalizedSections,
    },
  };
}

module.exports = {
  VALID_LEVELS,
  VALID_SECTIONS,
  validateExamGenerateRequest,
};
