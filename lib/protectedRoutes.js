const PROTECTED_ROUTE_PREFIXES = [
  '/learning-center',
  '/practice-center',
  '/exam',
  '/tools',
];

function stripQueryAndHash(path = '') {
  return String(path).split(/[?#]/, 1)[0] || '/';
}

function isProtectedRoute(path = '') {
  const pathname = stripQueryAndHash(path);

  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function getSafeLoginRedirect(value) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== 'string') return '/';
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return '/';
  if (stripQueryAndHash(candidate) === '/login') return '/';

  return candidate;
}

module.exports = {
  PROTECTED_ROUTE_PREFIXES,
  getSafeLoginRedirect,
  isProtectedRoute,
};
