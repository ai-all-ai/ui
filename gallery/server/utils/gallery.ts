// Shared helpers of the gallery API: the source root of the site and the error mapping.
import { resolve } from 'node:path';
import { DsError } from '../../lib/ds.js';

/** The source folder of the site (process.cwd() + gallery.folder). */
export const sourceRoot = (event: Parameters<typeof useRuntimeConfig>[0]) =>
  resolve(process.cwd(), useRuntimeConfig(event).gallery.folder);

/** The gallery exists on the dev server only: everything else answers 404. */
export const devOnly = () => {
  if (!import.meta.dev) throw createError({ statusCode: 404, statusMessage: 'Not Found' });
};

/** Turns a DsError from lib/ds.js into an HTTP error; anything else is a server error. */
export const failed = (err: unknown): never => {
  if (err instanceof DsError)
    throw createError({ statusCode: err.statusCode, statusMessage: err.message });
  throw err;
};
