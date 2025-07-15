// src/utils/courseUtils.js

export const extractCourseIdFromSlug = (slug) => {
  if (!slug) return null;

  const numericId = parseInt(slug, 10);
  if (!isNaN(numericId)) {
    return String(numericId);
  }

  const match = slug.match(/-(\d+)$/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};