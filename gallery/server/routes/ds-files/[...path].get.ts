// Serves one image of the source folder (or of _processed/) to the gallery. Dev only.
import { defineEventHandler, createError, setHeader, sendStream, getRouterParam } from '#imports';
import { createReadStream } from 'node:fs';
import { servable } from '../../../lib/ds.js';
import { devOnly, sourceRoot } from '../../utils/gallery';

export default defineEventHandler((event) => {
  devOnly();
  const rel = decodeURIComponent(getRouterParam(event, 'path') || '');
  const found = servable(sourceRoot(event), rel);
  if (!found) throw createError({ statusCode: 404 });
  setHeader(event, 'content-type', found.type);
  setHeader(event, 'cache-control', 'no-cache');
  return sendStream(event, createReadStream(found.file));
});
