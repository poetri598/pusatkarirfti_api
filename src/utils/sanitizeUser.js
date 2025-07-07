export function sanitizeUser(userRow) {
  if (!userRow) return null;
  const { user_password: _pw, ...sanitized } = userRow;
  return sanitized;
}
