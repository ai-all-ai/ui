// Lists the image folders of the source folder with their files.
import { existsSync } from 'node:fs';
import { listing } from '../../../lib/ds.js';
import { devOnly, sourceRoot, failed } from '../../utils/gallery';

export default defineEventHandler((event) => {
  devOnly();
  const root = sourceRoot(event);
  if (!existsSync(root)) return { available: false, rootPath: '', folders: [] };
  try {
    return { available: true, rootPath: root, folders: listing(root) };
  } catch (err) {
    return failed(err);
  }
});
