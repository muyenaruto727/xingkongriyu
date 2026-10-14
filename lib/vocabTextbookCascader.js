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

function buildLessonValue(textbookName, lessonName) {
  return `${textbookName}:${lessonName}`;
}

function buildUnitValue(textbookName, lessonName, unitName) {
  return `${textbookName}:${lessonName}:${unitName}`;
}

function buildTextbookCascaderOptions(textbooks = []) {
  return textbooks.map((textbook) => ({
    label: textbook.name,
    value: String(textbook.name),
    children: (textbook.lessons || []).map((lesson) => {
      const lessonValue = buildLessonValue(textbook.name, lesson.name);
      const units = Array.isArray(lesson.units) ? lesson.units : [];
      const option = {
        label: lesson.name,
        value: lessonValue,
      };

      if (units.length > 0) {
        option.children = units.map((unit) => ({
          label: unit.name,
          value: buildUnitValue(textbook.name, lesson.name, unit.name),
        }));
      }

      return option;
    }),
  }));
}

function findLessonPath(textbook, lessonValue) {
  const parts = String(lessonValue).split(':');
  if (!textbook || parts.length < 2) {
    return null;
  }

  const lessonName = parts[1];
  const lesson = (textbook.lessons || []).find((item) => item.name === lessonName);
  if (!lesson) {
    return null;
  }

  const lessonPathValue = buildLessonValue(textbook.name, lesson.name);
  if (parts.length >= 3) {
    return [String(textbook.name), lessonPathValue, lessonValue];
  }

  return [String(textbook.name), lessonPathValue];
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
      paths.push(findLessonPath(textbook, lesson) || [identity.id, lesson]);
      return;
    }

    paths.push([lesson]);
  });

  textbookValues.forEach((textbookValue) => {
    const value = String(textbookValue);
    const textbook = findTextbookByIdOrName(textbooks, value);
    const identity = getTextbookIdentity(textbook);
    const textbookPathValue = identity ? identity.name : value;

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

function formatTextbookCascaderDisplay(labels = []) {
  return labels.map((label) => String(label)).filter(Boolean).join(':');
}

function extractTextbookCascaderSelection(values = []) {
  const textbooks = [];
  const lessons = [];
  const flatValues = Array.isArray(values) ? values : [];

  flatValues.forEach((item) => {
    const path = Array.isArray(item) ? item : [item];
    if (path.length === 0) return;

    const textbookId = String(path[0]);
    if (!textbooks.includes(textbookId)) {
      textbooks.push(textbookId);
    }

    if (path.length > 1) {
      const leaf = String(path[path.length - 1]);
      if (!lessons.includes(leaf)) {
        lessons.push(leaf);
      }
    }
  });

  return { textbooks, lessons };
}

module.exports = {
  buildTextbookCascaderOptions,
  buildTextbookCascaderValue,
  extractTextbookCascaderSelection,
  formatTextbookCascaderDisplay,
  splitCommaList,
};
