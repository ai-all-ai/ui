// Moves files to another folder of the source folder; a name already taken there is skipped.
import { defineEventHandler, readBody } from '#imports';
import { move, parseItems } from '../../../lib/ds.js';
import { devOnly, sourceRoot, failed } from '../../utils/gallery';

export default defineEventHandler(async (event) => {
  devOnly();
  const root = sourceRoot(event);
  try {
    const body = (await readBody<{ items?: unknown; to?: unknown }>(event)) ?? {};
    return move(root, parseItems(root, body.items), body.to);
  } catch (err) {
    return failed(err);
  }
});
