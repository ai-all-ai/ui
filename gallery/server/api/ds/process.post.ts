// Runs trim, background removal or optimisation into _processed/<action>/; sources stay untouched.
import { parseItems, processItems } from '../../../lib/ds.js';
import { devOnly, sourceRoot, failed } from '../../utils/gallery';

export default defineEventHandler(async (event) => {
  devOnly();
  const root = sourceRoot(event);
  try {
    const body =
      (await readBody<{ action?: unknown; items?: unknown; quality?: unknown; fuzz?: unknown }>(
        event,
      )) ?? {};
    const results = await processItems(root, body.action as string, parseItems(root, body.items), {
      quality: body.quality,
      fuzz: body.fuzz,
    });
    return { results };
  } catch (err) {
    return failed(err);
  }
});
