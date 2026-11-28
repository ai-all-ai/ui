// File logic of the /ui/ds gallery: folders, files, path safety and image actions.
// No Nuxt imports, so the tests run it with plain Node. Handlers turn DsError into an HTTP error.
import fs from 'node:fs';
import path from 'node:path';

export const IMG = /\.(png|webp|jpe?g|svg|avif|gif)$/i;
export const RASTER = /\.(png|webp|jpe?g|avif|gif)$/i;
export const PROCESSED = '_processed';
export const BACKUP = '_backup';
export const ACTIONS = ['trim', 'bg', 'optimize'];
const HIDDEN = new Set([PROCESSED, BACKUP]);
const MAX_ITEMS = 500;

export class DsError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * The gallery root: the project folder (base) and the source folders inside it (roots, from the setting).
 * A folder is named by its path from the project root, so files of two source folders never clash.
 */
export const galleryRoot = (base, roots) => ({ base, roots });

/** The project folder with symlinks resolved, or '' when it does not exist. */
export const realRoot = (root) => (fs.existsSync(root.base) ? fs.realpathSync(root.base) : '');

/** The source folder a path starts with (ds for ds/logos), or null when it is outside the gallery. */
const topOf = (root, folder) =>
  root.roots.find((r) => folder === r || folder.startsWith(`${r}/`)) ?? null;

/**
 * The setting as a list: one name or a comma-separated list, relative to the project root.
 * Names must be plain folders inside the project, and no name may sit inside another one.
 */
export const parseRoots = (value) => {
  const list = [
    ...new Set(
      (Array.isArray(value) ? value : String(value ?? 'ds').split(','))
        .map((s) => String(s).trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, ''))
        .filter(Boolean),
    ),
  ];
  if (!list.length) throw new Error('gallery folder: name at least one folder');
  for (const r of list) {
    if (r.startsWith('/') || r.split('/').includes('..') || r.startsWith('.')) {
      throw new Error(`gallery folder "${r}": use a folder inside the project`);
    }
    if (list.some((o) => o !== r && r.startsWith(`${o}/`))) {
      throw new Error(
        `gallery folder "${r}" sits inside "${list.find((o) => r.startsWith(`${o}/`))}"`,
      );
    }
  }
  return list;
};

/** Every source folder and the folders under it (relative to the project root, with "/"), sorted. */
export const listFolders = (root) => {
  const base = realRoot(root);
  if (!base) return [];
  const out = [];
  const walk = (dir, name) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || HIDDEN.has(entry.name)) continue;
      const sub = `${name}/${entry.name}`;
      out.push(sub);
      walk(path.join(dir, entry.name), sub);
    }
  };
  for (const top of root.roots) {
    const dir = path.join(base, top);
    if (!fs.existsSync(dir)) continue;
    out.push(top);
    walk(dir, top);
  }
  return out.sort();
};

export const listFiles = (root, folder) => {
  const dir = path.join(realRoot(root), folder);
  return fs
    .readdirSync(dir)
    .filter((n) => IMG.test(n))
    .sort()
    .map((name) => ({ name, size: fs.statSync(path.join(dir, name)).size }));
};

/** Folders that hold images, with their files: the gallery's listing. */
export const listing = (root) => {
  if (!realRoot(root)) return [];
  return listFolders(root)
    .map((folder) => ({ folder, files: listFiles(root, folder) }))
    .filter((f) => f.files.length);
};

const plainName = (name) =>
  typeof name === 'string' && name.length > 0 && name === name.split(/[\\/]/).pop();

export const assertFolder = (root, folder) => {
  if (listFolders(root).includes(folder)) return folder;
  throw new DsError(400, 'Unknown folder');
};

/** Checks a list of { folder, name } from the client: known folder, plain image file name. */
export const parseItems = (root, value) => {
  if (!Array.isArray(value) || !value.length || value.length > MAX_ITEMS) {
    throw new DsError(400, `Choose from 1 to ${MAX_ITEMS} files`);
  }
  const folders = new Set(listFolders(root));
  return value.map((item) => {
    const { folder, name } = item ?? {};
    if (typeof folder !== 'string' || !folders.has(folder) || !plainName(name) || !IMG.test(name)) {
      throw new DsError(400, 'Invalid file');
    }
    return { folder, name };
  });
};

/**
 * Absolute path of an item, optionally under a tool folder (_processed/<action>, _backup) of its source folder.
 * Never outside that source folder.
 */
export const itemPath = (root, item, sub = '') => {
  const base = realRoot(root);
  if (!base) throw new DsError(404, 'Source folder not found');
  const top = topOf(root, item.folder);
  if (!top) throw new DsError(400, 'Invalid path');
  const dir = path.join(base, top);
  const inside = item.folder.slice(top.length).replace(/^\//, '');
  const file = path.resolve(dir, sub, inside, item.name);
  if (!file.startsWith(dir + path.sep)) throw new DsError(400, 'Invalid path');
  return file;
};

export const sourceFile = (root, item) => {
  const file = itemPath(root, item);
  if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
    throw new DsError(404, `File not found: ${item.name}`);
  }
  return file;
};

const ensureDir = (file) => fs.mkdirSync(path.dirname(file), { recursive: true });

export const remove = (root, item) => {
  fs.unlinkSync(sourceFile(root, item));
};

/** Moves files to another folder; a name already taken there is skipped. */
export const move = (root, items, to) => {
  const target = assertFolder(root, to);
  const moved = [];
  const skipped = [];
  for (const item of items) {
    if (item.folder === target) continue;
    const from = sourceFile(root, item);
    const dest = itemPath(root, { folder: target, name: item.name });
    if (fs.existsSync(dest)) {
      skipped.push(item.name);
      continue;
    }
    ensureDir(dest);
    fs.renameSync(from, dest);
    moved.push(item.name);
  }
  return { moved, skipped };
};

export const assertAction = (action) => {
  if (!ACTIONS.includes(action)) throw new DsError(400, 'Unknown action');
  return action;
};

/** Name of the result file: background removal turns a JPEG into a PNG (it needs transparency). */
export const resultName = (action, name) =>
  action === 'bg' && /\.jpe?g$/i.test(name) ? name.replace(/\.jpe?g$/i, '.png') : name;

/** Replaces originals with processed results (the original goes to _backup/ first) or discards the results. */
export const apply = (root, action, items, outs = [], discard = false) => {
  assertAction(action);
  const applied = [];
  items.forEach((item, i) => {
    const outName = outs[i] || item.name;
    if (!plainName(outName) || !IMG.test(outName)) throw new DsError(400, 'Invalid result name');
    const done = itemPath(root, { folder: item.folder, name: outName }, `${PROCESSED}/${action}`);
    if (!fs.existsSync(done)) throw new DsError(404, `No result: ${item.name}`);
    if (discard) {
      fs.unlinkSync(done);
      return;
    }
    const orig = sourceFile(root, item);
    const target = itemPath(root, { folder: item.folder, name: outName });
    if (target === orig) {
      const backup = itemPath(root, item, BACKUP);
      ensureDir(backup);
      if (!fs.existsSync(backup)) fs.copyFileSync(orig, backup);
    }
    fs.renameSync(done, target);
    applied.push(outName);
  });
  return { applied };
};

/** Results waiting in <source folder>/_processed/<action>/, found by walking each processed tree itself. */
export const results = (root) => {
  const base = realRoot(root);
  if (!base) return [];
  const out = [];
  for (const top of root.roots) {
    const dir = path.join(base, top, PROCESSED);
    if (!fs.existsSync(dir)) continue;
    for (const action of fs.readdirSync(dir)) {
      if (!ACTIONS.includes(action)) continue;
      const walk = (at, rel) => {
        for (const entry of fs.readdirSync(at, { withFileTypes: true })) {
          const abs = path.join(at, entry.name);
          if (entry.isDirectory()) walk(abs, rel ? `${rel}/${entry.name}` : entry.name);
          else if (IMG.test(entry.name)) {
            out.push({ action, folder: rel ? `${top}/${rel}` : top, name: entry.name });
          }
        }
      };
      walk(path.join(dir, action), '');
    }
  }
  return out.sort((a, b) =>
    `${a.action}/${a.folder}/${a.name}`.localeCompare(`${b.action}/${b.folder}/${b.name}`),
  );
};

/* image actions (sharp is loaded only when an action runs) */

const loadSharp = async () => {
  try {
    return (await import('sharp')).default;
  } catch {
    throw new DsError(501, 'Install sharp to process images: npm i -D sharp');
  }
};

export const measure = async (file) => {
  const size = fs.statSync(file).size;
  if (!RASTER.test(file)) return { size, w: 0, h: 0 };
  const sharp = await loadSharp();
  const { width, height } = await sharp(file).metadata();
  return { size, w: width ?? 0, h: height ?? 0 };
};

/** Pixels of a flat background connected to the edges: flood fill from the border, tolerance in %. */
export const backgroundMask = (data, width, height, fuzz) => {
  const ref = [data[0], data[1], data[2]];
  const limit = (fuzz / 100) * 255 * Math.sqrt(3);
  const seen = new Uint8Array(width * height);
  const stack = [];
  const near = (p) => {
    const i = p * 4;
    if (data[i + 3] === 0) return true;
    return Math.hypot(data[i] - ref[0], data[i + 1] - ref[1], data[i + 2] - ref[2]) <= limit;
  };
  const push = (p) => {
    if (!seen[p] && near(p)) {
      seen[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % width;
    if (x > 0) push(p - 1);
    if (x < width - 1) push(p + 1);
    if (p >= width) push(p - width);
    if (p < width * (height - 1)) push(p + width);
  }
  return seen;
};

const processImage = async (action, src, out, { quality, fuzz }) => {
  const sharp = await loadSharp();
  if (action === 'bg') {
    const { data, info } = await sharp(src)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const mask = backgroundMask(data, info.width, info.height, fuzz);
    for (let p = 0; p < mask.length; p++) if (mask[p]) data[p * 4 + 3] = 0;
    const png = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await sharp(png)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(out);
    return;
  }
  let img = sharp(src, { animated: false });
  if (action === 'trim') img = img.trim({ threshold: 10 });
  if (/\.png$/i.test(src)) img = img.png({ compressionLevel: 9, effort: 10 });
  else if (/\.jpe?g$/i.test(src)) img = img.jpeg({ quality, mozjpeg: true, progressive: true });
  else if (/\.webp$/i.test(src)) img = img.webp({ quality, effort: 6 });
  else if (/\.avif$/i.test(src)) img = img.avif({ quality });
  else img = img.gif();
  await img.toFile(out);
};

/** Runs an action into _processed/<action>/; sources stay untouched. */
export const processItems = async (root, action, items, params = {}) => {
  assertAction(action);
  const quality = Math.min(100, Math.max(30, Math.round(Number(params.quality) || 80)));
  const fuzz = Math.min(40, Math.max(0, Number(params.fuzz) || 8));
  const out = [];
  for (const item of items) {
    const src = sourceFile(root, item);
    if (!RASTER.test(item.name)) {
      out.push({ ...item, action, error: 'SVG and animations are not processed' });
      continue;
    }
    const outName = resultName(action, item.name);
    const dest = itemPath(root, { folder: item.folder, name: outName }, `${PROCESSED}/${action}`);
    ensureDir(dest);
    try {
      await processImage(action, src, dest, { quality, fuzz });
    } catch (err) {
      if (err instanceof DsError) throw err;
      out.push({ ...item, action, error: String(err?.message ?? err).slice(0, 200) });
      continue;
    }
    out.push({
      ...item,
      action,
      out: outName,
      before: await measure(src),
      after: await measure(dest),
    });
  }
  return out;
};

const TYPES = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

/** A file under a source folder for the preview, with its type; null for anything else (outside, not an image, missing). */
export const servable = (root, rel) => {
  const base = realRoot(root);
  const top = typeof rel === 'string' ? topOf(root, rel) : null;
  if (!base || !top) return null;
  // inside the source folder the file lives in, not just inside the project folder
  const dir = path.join(base, top) + path.sep;
  const file = path.resolve(base, rel);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!file.startsWith(dir) || !type || !fs.existsSync(file)) return null;
  const real = fs.realpathSync(file);
  if (!real.startsWith(dir) || !fs.statSync(real).isFile()) return null;
  return { file: real, type };
};
