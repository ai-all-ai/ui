// Replaces originals with processed results (the original is copied to _backup/ first) or discards them.
import { defineEventHandler, readBody } from '#imports';
import { apply, parseItems } from '../../../lib/ds.js';
import { devOnly, sourceRoot, failed } from '../../utils/gallery';

export default defineEventHandler(async (event) => {
  devOnly();
  const root = sourceRoot(event);
  try {
    const body =
      (await readBody<{ action?: unknown; items?: unknown; out?: unknown; discard?: unknown }>(
        event,
      )) ?? {};
    const out = Array.isArray(body.out) ? body.out.map(String) : [];
    return apply(
      root,
      body.action as string,
      parseItems(root, body.items),
      out,
      Boolean(body.discard),
    );
  } catch (err) {
    return failed(err);
  }
});
