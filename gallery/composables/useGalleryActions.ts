// Server calls of the source gallery: delete, move, process, replace or discard results, and reload the lists.
import type { Ref } from 'vue';
import { $fetch } from '#imports';
import { galleryKey, type GalleryAction, type GalleryResult } from '../components/types';

export type GalleryItem = { folder: string; name: string };

export interface GalleryActionDeps {
  selected: Ref<Set<string>>;
  results: Ref<GalleryResult[]>;
  busy: Ref<boolean>;
  notify: (message: string) => void;
  selItems: () => GalleryItem[];
  clearSel: () => void;
  closeViewer: () => void;
  refresh: () => Promise<unknown>;
}

const resultKey = (r: GalleryResult) => `${r.action}/${r.folder}/${r.name}`;

export function useGalleryActions(d: GalleryActionDeps) {
  async function reload() {
    try {
      await d.refresh();
    } catch (e) {
      console.error('gallery: could not refresh the list', e);
    }
  }

  async function deleteFile(target: GalleryItem) {
    d.busy.value = true;
    try {
      await $fetch('/api/ds', { method: 'DELETE', body: target });
      d.selected.value.delete(galleryKey(target.folder, target.name));
      d.closeViewer();
      d.notify(`Deleted: ${target.name}`);
      await reload();
    } catch (e) {
      console.error('gallery: delete', e);
      d.notify(`Could not delete: ${target.name}`);
    } finally {
      d.busy.value = false;
    }
  }

  async function removeSelected() {
    const items = d.selItems();
    d.busy.value = true;
    let fail = 0;
    for (const it of items) {
      try {
        await $fetch('/api/ds', { method: 'DELETE', body: it });
      } catch {
        fail++;
      }
    }
    d.clearSel();
    d.busy.value = false;
    d.notify(fail ? `Deleted ${items.length - fail}, errors: ${fail}` : `Deleted: ${items.length}`);
    await reload();
  }

  async function moveSelected(to: string) {
    d.busy.value = true;
    try {
      const r = await $fetch<{ moved: string[]; skipped: string[] }>('/api/ds/move', {
        method: 'POST',
        body: { items: d.selItems(), to },
      });
      d.notify(
        `Moved: ${r.moved.length}${r.skipped.length ? `, skipped (name taken): ${r.skipped.length}` : ''}`,
      );
      d.clearSel();
      await reload();
    } catch (e) {
      console.error('gallery: move', e);
      d.notify('Could not move');
    } finally {
      d.busy.value = false;
    }
  }

  async function run(action: GalleryAction, params: { quality: number; fuzz: number }) {
    d.busy.value = true;
    try {
      const r = await $fetch<{ results: GalleryResult[] }>('/api/ds/process', {
        method: 'POST',
        body: { action, items: d.selItems(), ...params },
      });
      const ids = new Set(r.results.map(resultKey));
      d.results.value = [...r.results, ...d.results.value.filter((x) => !ids.has(resultKey(x)))];
      const bad = r.results.filter((x) => x.error).length;
      d.notify(
        `Done: ${r.results.length - bad}${bad ? `, errors: ${bad}` : ''}. Originals are untouched until you replace them.`,
      );
    } catch (e) {
      console.error('gallery: process', e);
      d.notify('Processing failed. See the dev server terminal.');
    } finally {
      d.busy.value = false;
    }
  }

  /** Replaces the originals with the results (discard = false) or drops the results (discard = true). */
  async function settle(list: GalleryResult[], discard: boolean) {
    if (!list.length) return;
    d.busy.value = true;
    try {
      for (const action of new Set(list.map((r) => r.action))) {
        const part = list.filter((r) => r.action === action);
        await $fetch('/api/ds/apply', {
          method: 'POST',
          body: {
            action,
            discard,
            items: part.map((r) => ({ folder: r.folder, name: r.name })),
            out: part.map((r) => r.out ?? r.name),
          },
        });
      }
      const gone = new Set(list.map(resultKey));
      d.results.value = d.results.value.filter((r) => !gone.has(resultKey(r)));
      d.closeViewer();
      d.notify(discard ? 'Results discarded' : 'Originals replaced');
      await reload();
    } catch (e) {
      console.error('gallery: apply', e);
      d.notify('Could not apply');
    } finally {
      d.busy.value = false;
    }
  }

  async function loadResults() {
    try {
      d.results.value = await $fetch<GalleryResult[]>('/api/ds/results');
    } catch {
      /* no results yet */
    }
  }

  return { reload, deleteFile, removeSelected, moveSelected, run, settle, loadResults };
}
