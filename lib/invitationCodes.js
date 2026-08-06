const crypto = require('crypto');

const INVITATION_CODE_LENGTH = 8;
const INVITATION_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const INVITATION_DURATIONS = [
  { days: 7, label: '7日' },
  { days: 30, label: '30日' },
  { days: 90, label: '90日' },
  { days: 365, label: '365日' },
];

function normalizeInvitationDuration(value) {
  const days = Number.parseInt(value, 10);
  return INVITATION_DURATIONS.some((item) => item.days === days) ? days : null;
}

function generateInvitationCode() {
  let code = '';
  for (let index = 0; index < INVITATION_CODE_LENGTH; index += 1) {
    const randomIndex = crypto.randomInt(0, INVITATION_CODE_ALPHABET.length);
    code += INVITATION_CODE_ALPHABET[randomIndex];
  }
  return code;
}

function normalizeInvitationCode(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
}

function isValidInvitationCodeFormat(value) {
  return /^[A-Za-z0-9]{8}$/.test(normalizeInvitationCode(value));
}

function calculateAccountExpiry(startDate, durationDays) {
  const days = normalizeInvitationDuration(durationDays);
  if (!days) {
    return null;
  }

  const expiresAt = new Date(startDate);
  expiresAt.setUTCDate(expiresAt.getUTCDate() + days);
  return expiresAt;
}

module.exports = {
  INVITATION_CODE_ALPHABET,
  INVITATION_CODE_LENGTH,
  INVITATION_DURATIONS,
  calculateAccountExpiry,
  generateInvitationCode,
  isValidInvitationCodeFormat,
  normalizeInvitationCode,
  normalizeInvitationDuration,
};
