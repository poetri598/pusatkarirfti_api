export const toNullableInt = (value, fallback) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};
