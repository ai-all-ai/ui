// Lists the processed results waiting in _processed/.
import { results } from '../../../lib/ds.js';
import { devOnly, sourceRoot } from '../../utils/gallery';

export default defineEventHandler((event) => {
  devOnly();
  return results(sourceRoot(event));
});
