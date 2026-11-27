// Deletes one file from the source folder.
import { parseItems, remove } from '../../../lib/ds.js';
import { devOnly, sourceRoot, failed } from '../../utils/gallery';

export default defineEventHandler(async (event) => {
  devOnly();
  const root = sourceRoot(event);
  try {
    const body = await readBody(event);
    const [item] = parseItems(root, [body]);
    remove(root, item);
    return { ok: true };
  } catch (err) {
    return failed(err);
  }
});
