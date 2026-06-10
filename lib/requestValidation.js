function getSingleQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseIntegerParam(value, options) {
  const {
    name,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    defaultValue,
  } = options;
  const singleValue = getSingleQueryValue(value);

  if (singleValue === undefined || singleValue === null || singleValue === '') {
    return defaultValue === undefined ? { value: undefined } : { value: defaultValue };
  }

  const parsed = Number.parseInt(String(singleValue), 10);
  if (!Number.isInteger(parsed) || String(parsed) !== String(singleValue) || parsed < min || parsed > max) {
    return { error: `Invalid ${name}` };
  }

  return { value: parsed };
}

function parseTextParam(value, options) {
  const {
    name,
    required = false,
    maxLength = Number.MAX_SAFE_INTEGER,
  } = options;
  const singleValue = getSingleQueryValue(value);
  const text = String(singleValue || '').trim();

  if (!text) {
    return required ? { error: `Missing ${name}` } : { value: '' };
  }

  if (text.length > maxLength) {
    return { error: `${name.charAt(0).toUpperCase()}${name.slice(1)} too long` };
  }

  return { value: text };
}

module.exports = {
  getSingleQueryValue,
  parseIntegerParam,
  parseTextParam,
};
