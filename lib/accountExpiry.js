const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  DISABLED: 'disabled',
};

function isAccountExpired(accountExpiresAt, now = new Date()) {
  if (!accountExpiresAt) {
    return false;
  }

  return new Date(accountExpiresAt).getTime() <= now.getTime();
}

function resolveAccountStatus(user = {}, now = new Date()) {
  if (user.status && user.status !== ACCOUNT_STATUS.ACTIVE) {
    return user.status;
  }

  return isAccountExpired(user.account_expires_at, now)
    ? ACCOUNT_STATUS.EXPIRED
    : ACCOUNT_STATUS.ACTIVE;
}

module.exports = {
  ACCOUNT_STATUS,
  isAccountExpired,
  resolveAccountStatus,
};
