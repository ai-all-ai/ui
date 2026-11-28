// Gallery file logic (gallery/lib/ds.js): source folders, path safety, moves, applying results, served files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as ds from '../gallery/lib/ds.js';

// Each test gets a fresh project folder with the source folders it names, and removes it when it ends.
const fresh =
  (fn, roots = ['ds']) =>
  async () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-'));
    for (const r of roots) fs.mkdirSync(path.join(base, r));
    try {
      await fn(ds.galleryRoot(base, roots), base);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  };
const put = (file, bytes = 'x') => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
};
const at = (base, ...parts) => path.join(base, 'ds', ...parts);

test(
  'listing shows image folders with their files and skips dot and tool folders',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    put(at(base, 'logos', 'notes.txt'));
    put(at(base, 'shop', 'b.webp'));
    put(at(base, '_processed', 'trim', 'logos', 'a.png'));
    put(at(base, '.git', 'x.png'));
    const got = ds.listing(g);
    assert.deepEqual(
      got.map((f) => f.folder),
      ['ds/logos', 'ds/shop'],
    );
    assert.deepEqual(
      got[0].files.map((f) => f.name),
      ['a.png'],
    );
  }),
);

test('listing is empty when the source folders do not exist', () => {
  const g = ds.galleryRoot(path.join(os.tmpdir(), 'no-such-gallery-folder'), ['ds']);
  assert.deepEqual(ds.listing(g), []);
});

test(
  'two source folders are listed side by side, each with its own folders',
  fresh(
    (g, base) => {
      put(path.join(base, 'ds', 'logos', 'a.png'));
      put(path.join(base, 'images', 'hero.jpg'));
      put(path.join(base, 'images', 'gallery', 'b.png'));
      assert.deepEqual(
        ds.listing(g).map((f) => f.folder),
        ['ds/logos', 'images', 'images/gallery'],
      );
    },
    ['ds', 'images'],
  ),
);

test(
  'parseItems rejects a path that climbs out of the folder',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    assert.throws(
      () => ds.parseItems(g, [{ folder: 'ds/../logos', name: 'a.png' }]),
      /Invalid file/,
    );
    assert.throws(
      () => ds.parseItems(g, [{ folder: 'ds/logos', name: '../a.png' }]),
      /Invalid file/,
    );
  }),
);

test(
  'parseItems rejects a folder that is not listed and a non-image name',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    assert.throws(() => ds.parseItems(g, [{ folder: 'ds/nope', name: 'a.png' }]), /Invalid file/);
    assert.throws(() => ds.parseItems(g, [{ folder: 'ds/logos', name: 'a.txt' }]), /Invalid file/);
    assert.throws(() => ds.parseItems(g, []), /Choose from/);
  }),
);

test(
  'parseItems accepts files in the source folder itself',
  fresh((g, base) => {
    put(at(base, 'top.png'));
    assert.deepEqual(ds.parseItems(g, [{ folder: 'ds', name: 'top.png' }]), [
      { folder: 'ds', name: 'top.png' },
    ]);
  }),
);

test(
  'remove deletes one file and refuses a missing one',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    ds.remove(g, { folder: 'ds/logos', name: 'a.png' });
    assert.equal(fs.existsSync(at(base, 'logos', 'a.png')), false);
    assert.throws(
      () => ds.remove(g, { folder: 'ds/logos', name: 'a.png' }),
      (e) => e.statusCode === 404,
    );
  }),
);

test(
  'move carries files to another folder and skips a name already taken',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    put(at(base, 'logos', 'b.png'));
    put(at(base, 'shop', 'b.png'));
    const items = ds.parseItems(g, [
      { folder: 'ds/logos', name: 'a.png' },
      { folder: 'ds/logos', name: 'b.png' },
    ]);
    const r = ds.move(g, items, 'ds/shop');
    assert.deepEqual(r, { moved: ['a.png'], skipped: ['b.png'] });
    assert.equal(fs.existsSync(at(base, 'shop', 'a.png')), true);
    assert.equal(fs.existsSync(at(base, 'logos', 'a.png')), false);
  }),
);

test(
  'move refuses an unknown target folder',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    const items = ds.parseItems(g, [{ folder: 'ds/logos', name: 'a.png' }]);
    assert.throws(() => ds.move(g, items, '../etc'), /Unknown folder/);
  }),
);

test(
  'apply replaces the original and keeps a copy in _backup',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'), 'original');
    put(at(base, '_processed', 'optimize', 'logos', 'a.png'), 'smaller');
    const items = ds.parseItems(g, [{ folder: 'ds/logos', name: 'a.png' }]);
    ds.apply(g, 'optimize', items, ['a.png']);
    assert.equal(fs.readFileSync(at(base, 'logos', 'a.png'), 'utf8'), 'smaller');
    assert.equal(fs.readFileSync(at(base, '_backup', 'logos', 'a.png'), 'utf8'), 'original');
    assert.equal(fs.existsSync(at(base, '_processed', 'optimize', 'logos', 'a.png')), false);
  }),
);

test(
  'apply discards a result without touching the original',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'), 'original');
    put(at(base, '_processed', 'trim', 'logos', 'a.png'), 'trimmed');
    const items = ds.parseItems(g, [{ folder: 'ds/logos', name: 'a.png' }]);
    ds.apply(g, 'trim', items, ['a.png'], true);
    assert.equal(fs.readFileSync(at(base, 'logos', 'a.png'), 'utf8'), 'original');
    assert.equal(fs.existsSync(at(base, '_processed', 'trim', 'logos', 'a.png')), false);
  }),
);

test(
  'apply refuses an unknown action',
  fresh((g) => {
    assert.throws(() => ds.apply(g, 'rotate', [], []), /Unknown action/);
  }),
);

test(
  'results lists processed files by action and source folder',
  fresh((g, base) => {
    put(at(base, '_processed', 'bg', 'logos', 'a.png'));
    put(at(base, '_processed', 'trim', 'shop', 'b.webp'));
    put(at(base, '_processed', 'other', 'x.png'));
    put(at(base, 'logos', 'a.png'));
    const got = ds
      .results(g)
      .map((r) => `${r.action}/${r.folder}/${r.name}`)
      .sort();
    assert.deepEqual(got, ['bg/ds/logos/a.png', 'trim/ds/shop/b.webp']);
  }),
);

test('resultName turns a JPEG into a PNG only for background removal', () => {
  assert.equal(ds.resultName('bg', 'photo.JPG'), 'photo.png');
  assert.equal(ds.resultName('optimize', 'photo.jpg'), 'photo.jpg');
});

test(
  'servable serves images inside a source folder and refuses everything else',
  fresh((g, base) => {
    put(at(base, 'logos', 'a.png'));
    put(at(base, 'notes.txt'));
    put(path.join(base, 'secret.png'));
    assert.equal(ds.servable(g, 'ds/logos/a.png').type, 'image/png');
    assert.equal(ds.servable(g, 'ds/notes.txt'), null);
    assert.equal(ds.servable(g, 'ds/../secret.png'), null);
    assert.equal(ds.servable(g, 'secret.png'), null);
    assert.equal(ds.servable(g, 'ds/logos/missing.png'), null);
    assert.equal(ds.servable(g, 'ds/logos'), null);
  }),
);

test('the setting takes one folder or a comma-separated list, and refuses folders outside the project', () => {
  assert.deepEqual(ds.parseRoots('ds'), ['ds']);
  assert.deepEqual(ds.parseRoots('ds, images ,ds'), ['ds', 'images']);
  assert.deepEqual(ds.parseRoots(['ds', 'images/hero/']), ['ds', 'images/hero']);
  assert.throws(() => ds.parseRoots('../outside'), /inside the project/);
  assert.throws(() => ds.parseRoots('/abs/path'), /inside the project/);
  assert.throws(() => ds.parseRoots('ds,ds/sub'), /sits inside/);
  assert.throws(() => ds.parseRoots(' , '), /name at least one folder/);
});

test('backgroundMask fills only the flat colour connected to the edge', () => {
  // 3x3, opaque: white border, red centre. The border is removed, the centre stays.
  const w = 3;
  const h = 3;
  const data = new Uint8Array(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const centre = p === 4;
    data.set(centre ? [255, 0, 0, 255] : [255, 255, 255, 255], p * 4);
  }
  const mask = ds.backgroundMask(data, w, h, 8);
  assert.deepEqual([...mask], [1, 1, 1, 1, 0, 1, 1, 1, 1]);
});
