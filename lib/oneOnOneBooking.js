const CONTACT_TYPE_LABELS = {
  phone: '手机号',
  email: '邮箱',
  wechat: '微信号',
};

function trimText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeContactValue(value) {
  return trimText(value).toLowerCase();
}

function normalizeBookingInput(input = {}) {
  const contactType = trimText(input.contactType);
  const contactValue = trimText(input.contactValue);

  return {
    name: trimText(input.name),
    contactType,
    contactValue,
    normalizedContact: normalizeContactValue(contactValue),
    contactLabel: CONTACT_TYPE_LABELS[contactType] || '',
    goal: trimText(input.goal),
    preferredTime: trimText(input.preferredTime),
  };
}

function buildDuplicateKey(input = {}) {
  const normalized = normalizeBookingInput(input);
  if (!normalized.contactType || !normalized.normalizedContact) {
    return '';
  }

  return `${normalized.contactType}:${normalized.normalizedContact}`;
}

function validateBookingInput(input = {}) {
  const normalized = normalizeBookingInput(input);

  if (!normalized.name) {
    return { valid: false, message: '请填写称呼' };
  }

  if (!CONTACT_TYPE_LABELS[normalized.contactType]) {
    return { valid: false, message: '请选择联系方式类型' };
  }

  if (!normalized.contactValue) {
    return { valid: false, message: '请至少留下一种联系方式' };
  }

  if (normalized.contactType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.contactValue)) {
    return { valid: false, message: '请填写正确的邮箱地址' };
  }

  if (normalized.contactType === 'phone' && !/^[0-9+\-\s()]{6,24}$/.test(normalized.contactValue)) {
    return { valid: false, message: '请填写正确的手机号' };
  }

  if (normalized.contactType === 'wechat' && normalized.contactValue.length < 2) {
    return { valid: false, message: '请填写正确的微信号' };
  }

  return {
    valid: true,
    value: {
      ...normalized,
      duplicateKey: buildDuplicateKey(normalized),
    },
  };
}

module.exports = {
  CONTACT_TYPE_LABELS,
  buildDuplicateKey,
  normalizeBookingInput,
  validateBookingInput,
};
