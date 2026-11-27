// Gallery file logic (gallery/lib/ds.js): folders, path safety, moves, applying results, served files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as ds from '../gallery/lib/ds.js';

// Each test gets its own fresh source folder and removes it when it ends.
const fresh = (fn) => async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-'));
  const src = path.join(root, 'ds');
  fs.mkdirSync(src);
  try {
    await fn(src);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};
const put = (file, bytes = 'x') => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
};

test(
  'listing shows image folders with their files and skips dot and tool folders',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    put(path.join(src, 'logos', 'notes.txt'));
    put(path.join(src, 'shop', 'b.webp'));
    put(path.join(src, '_processed', 'trim', 'logos', 'a.png'));
    put(path.join(src, '.git', 'x.png'));
    const got = ds.listing(src);
    assert.deepEqual(
      got.map((f) => f.folder),
      ['logos', 'shop'],
    );
    assert.deepEqual(
      got[0].files.map((f) => f.name),
      ['a.png'],
    );
  }),
);

test('listing is empty when the source folder does not exist', () => {
  assert.deepEqual(ds.listing(path.join(os.tmpdir(), 'no-such-gallery-folder')), []);
});

test(
  'parseItems rejects a path that climbs out of the folder',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    assert.throws(
      () => ds.parseItems(src, [{ folder: '../logos', name: 'a.png' }]),
      /Invalid file/,
    );
    assert.throws(
      () => ds.parseItems(src, [{ folder: 'logos', name: '../a.png' }]),
      /Invalid file/,
    );
  }),
);

test(
  'parseItems rejects a folder that is not listed and a non-image name',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    assert.throws(() => ds.parseItems(src, [{ folder: 'nope', name: 'a.png' }]), /Invalid file/);
    assert.throws(() => ds.parseItems(src, [{ folder: 'logos', name: 'a.txt' }]), /Invalid file/);
    assert.throws(() => ds.parseItems(src, []), /Choose from/);
  }),
);

test(
  'parseItems accepts files in the source folder itself',
  fresh((src) => {
    put(path.join(src, 'top.png'));
    assert.deepEqual(ds.parseItems(src, [{ folder: '.', name: 'top.png' }]), [
      { folder: '.', name: 'top.png' },
    ]);
  }),
);

test(
  'remove deletes one file and refuses a missing one',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    ds.remove(src, { folder: 'logos', name: 'a.png' });
    assert.equal(fs.existsSync(path.join(src, 'logos', 'a.png')), false);
    assert.throws(
      () => ds.remove(src, { folder: 'logos', name: 'a.png' }),
      (e) => e.statusCode === 404,
    );
  }),
);

test(
  'move carries files to another folder and skips a name already taken',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    put(path.join(src, 'logos', 'b.png'));
    put(path.join(src, 'shop', 'b.png'));
    const items = ds.parseItems(src, [
      { folder: 'logos', name: 'a.png' },
      { folder: 'logos', name: 'b.png' },
    ]);
    const r = ds.move(src, items, 'shop');
    assert.deepEqual(r, { moved: ['a.png'], skipped: ['b.png'] });
    assert.equal(fs.existsSync(path.join(src, 'shop', 'a.png')), true);
    assert.equal(fs.existsSync(path.join(src, 'logos', 'a.png')), false);
  }),
);

test(
  'move refuses an unknown target folder',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    const items = ds.parseItems(src, [{ folder: 'logos', name: 'a.png' }]);
    assert.throws(() => ds.move(src, items, '../etc'), /Unknown folder/);
  }),
);

test(
  'apply replaces the original and keeps a copy in _backup',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'), 'original');
    put(path.join(src, '_processed', 'optimize', 'logos', 'a.png'), 'smaller');
    const items = ds.parseItems(src, [{ folder: 'logos', name: 'a.png' }]);
    ds.apply(src, 'optimize', items, ['a.png']);
    assert.equal(fs.readFileSync(path.join(src, 'logos', 'a.png'), 'utf8'), 'smaller');
    assert.equal(fs.readFileSync(path.join(src, '_backup', 'logos', 'a.png'), 'utf8'), 'original');
    assert.equal(fs.existsSync(path.join(src, '_processed', 'optimize', 'logos', 'a.png')), false);
  }),
);

test(
  'apply discards a result without touching the original',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'), 'original');
    put(path.join(src, '_processed', 'trim', 'logos', 'a.png'), 'trimmed');
    const items = ds.parseItems(src, [{ folder: 'logos', name: 'a.png' }]);
    ds.apply(src, 'trim', items, ['a.png'], true);
    assert.equal(fs.readFileSync(path.join(src, 'logos', 'a.png'), 'utf8'), 'original');
    assert.equal(fs.existsSync(path.join(src, '_processed', 'trim', 'logos', 'a.png')), false);
  }),
);

test(
  'apply refuses an unknown action',
  fresh((src) => {
    assert.throws(() => ds.apply(src, 'rotate', [], []), /Unknown action/);
  }),
);

test(
  'results lists processed files by action and folder',
  fresh((src) => {
    put(path.join(src, '_processed', 'bg', 'logos', 'a.png'));
    put(path.join(src, '_processed', 'trim', 'shop', 'b.webp'));
    put(path.join(src, '_processed', 'other', 'x.png'));
    put(path.join(src, 'logos', 'a.png'));
    const got = ds
      .results(src)
      .map((r) => `${r.action}/${r.folder}/${r.name}`)
      .sort();
    assert.deepEqual(got, ['bg/logos/a.png', 'trim/shop/b.webp']);
  }),
);

test('resultName turns a JPEG into a PNG only for background removal', () => {
  assert.equal(ds.resultName('bg', 'photo.JPG'), 'photo.png');
  assert.equal(ds.resultName('optimize', 'photo.jpg'), 'photo.jpg');
});

test(
  'servable serves images inside the folder and refuses everything else',
  fresh((src) => {
    put(path.join(src, 'logos', 'a.png'));
    put(path.join(src, 'notes.txt'));
    put(path.join(src, '..', 'secret.png'));
    assert.equal(ds.servable(src, 'logos/a.png').type, 'image/png');
    assert.equal(ds.servable(src, 'notes.txt'), null);
    assert.equal(ds.servable(src, '../secret.png'), null);
    assert.equal(ds.servable(src, 'logos/missing.png'), null);
    assert.equal(ds.servable(src, 'logos'), null);
  }),
);

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
