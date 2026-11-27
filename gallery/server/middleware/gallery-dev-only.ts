// The gallery changes files in the site folder (move, delete, process): it is dev only.
import { defineEventHandler, createError } from '#imports';
export default defineEventHandler((event) => {
  if (import.meta.dev) return;
  if (event.path.startsWith('/api/ds') || event.path.startsWith('/ds-files/')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' });
  }
});
