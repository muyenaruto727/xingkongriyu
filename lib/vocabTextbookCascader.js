function splitCommaList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function getTextbookIdentity(textbook) {
  if (!textbook) return null;
  return {
    id: String(textbook.id),
    name: String(textbook.name || ''),
  };
}

function findTextbookByIdOrName(textbooks, value) {
  const normalizedValue = String(value || '');
  return textbooks.find((textbook) => {
    const identity = getTextbookIdentity(textbook);
    return identity && (identity.id === normalizedValue || identity.name === normalizedValue);
  });
}

function findTextbookByLessonValue(textbooks, lessonValue) {
  const colonIndex = String(lessonValue).indexOf(':');
  if (colonIndex <= 0) {
    return null;
  }

  const textbookName = String(lessonValue).substring(0, colonIndex);
  return findTextbookByIdOrName(textbooks, textbookName);
}

function buildTextbookCascaderValue(textbookValues = [], lessonValues = [], textbooks = []) {
  const paths = [];
  const coveredTextbookKeys = new Set();

  lessonValues.forEach((lessonValue) => {
    const lesson = String(lessonValue);
    const textbook = findTextbookByLessonValue(textbooks, lesson);

    if (textbook) {
      const identity = getTextbookIdentity(textbook);
      coveredTextbookKeys.add(identity.id);
      coveredTextbookKeys.add(identity.name);
      paths.push([identity.id, lesson]);
      return;
    }

    paths.push([lesson]);
  });

  textbookValues.forEach((textbookValue) => {
    const value = String(textbookValue);
    const textbook = findTextbookByIdOrName(textbooks, value);
    const identity = getTextbookIdentity(textbook);
    const textbookPathValue = identity ? identity.id : value;

    if (identity) {
      if (coveredTextbookKeys.has(identity.id) || coveredTextbookKeys.has(identity.name)) {
        return;
      }
      coveredTextbookKeys.add(identity.id);
      coveredTextbookKeys.add(identity.name);
    } else if (coveredTextbookKeys.has(value)) {
      return;
    }

    paths.push([textbookPathValue]);
  });

  return paths;
}

module.exports = {
  buildTextbookCascaderValue,
  splitCommaList,
};
