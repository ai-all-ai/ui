<script setup lang="ts">
// GALLERY-01 · Source gallery of the site: browse, search, copy names or paths, select, move, delete and process the
// images of the source folder (gallery.folder, ds by default). Dev server only: outside dev it shows a short note.
import UiButton from '../../components/ui/UiButton.vue';
import UiCopyButton from '../../components/ui/UiCopyButton.vue';
import UiModal from '../../components/ui/UiModal.vue';
import UiIcon from '../../components/ui/UiIcon.vue';
import UiGalleryToolbar from './UiGalleryToolbar.vue';
import UiGalleryViewer, { type GalleryViewerItem } from './UiGalleryViewer.vue';
import UiGalleryResults from './UiGalleryResults.vue';
import {
  galleryEnc,
  galleryKb,
  galleryKey,
  type GalleryAction,
  type GalleryFolder,
  type GalleryResult,
} from './types';

const isDev = import.meta.dev;
const { data, refresh } = await useFetch<{
  available: boolean;
  rootPath: string;
  folders: GalleryFolder[];
}>('/api/ds', {
  server: false,
  default: () => ({ available: true, rootPath: '', folders: [] }),
});

const active = ref('all');
const query = ref('');
const mode = ref<'name' | 'path'>('name');
const themeChoice = computed({
  get: () => (dark.value ? 'dark' : 'light'),
  set: (v: string) => (dark.value = v === 'dark'),
});
const columnsChoice = computed({
  get: () => String(columns.value),
  set: (v: string) => (columns.value = Number(v) === 7 ? 7 : 4),
});
const folderChoice = computed({ get: () => active.value, set: (v: string) => (active.value = v) });
const columns = ref<4 | 7>(4);
const dark = ref(false);
const busy = ref(false);
const toast = ref('');
const results = ref<GalleryResult[]>([]);
const selected = ref(new Set<string>());
const viewIndex = ref(-1);
const compare = ref<GalleryResult | null>(null);
const pendingDelete = ref<{ folder: string; name: string } | null>(null);
const dims = reactive<Record<string, string>>({});
const quality = ref('80');
const fuzz = ref('8');
let timer: ReturnType<typeof setTimeout> | undefined;

const folders = computed(() => data.value?.folders ?? []);
const folderNames = computed(() => folders.value.map((f) => f.folder));
const shown = computed(() =>
  folders.value
    .filter((f) => active.value === 'all' || f.folder === active.value)
    .map((f) => ({
      ...f,
      files: f.files.filter((i) => i.name.toLowerCase().includes(query.value.trim().toLowerCase())),
    }))
    .filter((f) => f.files.length),
);
const total = computed(() => shown.value.reduce((n, f) => n + f.files.length, 0));
const flat = computed(() =>
  shown.value.flatMap((f) =>
    f.files.map((file) => ({
      folder: f.folder,
      name: file.name,
      size: file.size,
      key: galleryKey(f.folder, file.name),
    })),
  ),
);
const src = (folder: string, name: string) =>
  `/ds-files/${galleryEnc(folder)}/${encodeURIComponent(name)}`;
const textFor = (folder: string, name: string) =>
  mode.value === 'path' ? `${data.value?.rootPath}/${folder}/${name}` : name;
const selItems = () =>
  [...selected.value].map((k) => {
    const i = k.indexOf('/');
    return { folder: k.slice(0, i), name: k.slice(i + 1) };
  });

function notify(message: string) {
  toast.value = message;
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ''), 2600);
}

/* selection */
function toggle(key: string) {
  const next = new Set(selected.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selected.value = next;
}
const selectAll = () => (selected.value = new Set(flat.value.map((f) => f.key)));
const clearSel = () => (selected.value = new Set());

async function copySelected() {
  const text = selItems()
    .map((i) => textFor(i.folder, i.name))
    .join('\n');
  try {
    await navigator.clipboard.writeText(text);
    notify(`Copied: ${selected.value.size}`);
  } catch {
    notify('Could not copy');
  }
}

/* viewer */
const viewerItems = computed<GalleryViewerItem[]>(() =>
  compare.value
    ? [
        {
          key: 'cmp',
          name: compare.value.name,
          src: `/ds-files/_processed/${compare.value.action}/${galleryEnc(compare.value.folder)}/${encodeURIComponent(compare.value.out ?? compare.value.name)}?t=${compare.value.after?.size ?? 0}`,
          before: src(compare.value.folder, compare.value.name),
          dims: compare.value.after
            ? `${galleryKb(compare.value.before?.size ?? 0)} → ${galleryKb(compare.value.after.size)}`
            : '',
          copy: compare.value.name,
        },
      ]
    : flat.value.map((f) => ({
        key: f.key,
        name: f.name,
        src: src(f.folder, f.name),
        dims: `${dims[f.key] || ''} · ${galleryKb(f.size)}`,
        copy: textFor(f.folder, f.name),
      })),
);
const viewIdx = computed({
  get: () => (compare.value ? 0 : viewIndex.value),
  set: (v: number) => (viewIndex.value = v),
});
const viewOpen = computed(() => !!compare.value || viewIndex.value >= 0);
const closeViewer = () => {
  viewIndex.value = -1;
  compare.value = null;
};
const viewerRemove = (it: GalleryViewerItem) => {
  const i = it.key.indexOf('/');
  pendingDelete.value = { folder: it.key.slice(0, i), name: it.key.slice(i + 1) };
};

/* server actions */
async function reload() {
  try {
    await refresh();
  } catch (e) {
    console.error('gallery: could not refresh the list', e);
  }
}
async function confirmDelete() {
  const target = pendingDelete.value;
  if (!target) return;
  pendingDelete.value = null;
  busy.value = true;
  try {
    await $fetch('/api/ds', { method: 'DELETE', body: target });
    selected.value.delete(galleryKey(target.folder, target.name));
    closeViewer();
    notify(`Deleted: ${target.name}`);
    await reload();
  } catch (e) {
    console.error('gallery: delete', e);
    notify(`Could not delete: ${target.name}`);
  } finally {
    busy.value = false;
  }
}
async function removeSelected() {
  const items = selItems();
  busy.value = true;
  let fail = 0;
  for (const it of items) {
    try {
      await $fetch('/api/ds', { method: 'DELETE', body: it });
    } catch {
      fail++;
    }
  }
  clearSel();
  busy.value = false;
  notify(fail ? `Deleted ${items.length - fail}, errors: ${fail}` : `Deleted: ${items.length}`);
  await reload();
}
async function moveSelected(to: string) {
  busy.value = true;
  try {
    const r = await $fetch<{ moved: string[]; skipped: string[] }>('/api/ds/move', {
      method: 'POST',
      body: { items: selItems(), to },
    });
    notify(
      `Moved: ${r.moved.length}${r.skipped.length ? `, skipped (name taken): ${r.skipped.length}` : ''}`,
    );
    clearSel();
    await reload();
  } catch (e) {
    console.error('gallery: move', e);
    notify('Could not move');
  } finally {
    busy.value = false;
  }
}
async function run(action: GalleryAction, params: { quality: number; fuzz: number }) {
  busy.value = true;
  try {
    const r = await $fetch<{ results: GalleryResult[] }>('/api/ds/process', {
      method: 'POST',
      body: { action, items: selItems(), ...params },
    });
    const ids = new Set(r.results.map((x) => `${x.action}/${x.folder}/${x.name}`));
    results.value = [
      ...r.results,
      ...results.value.filter((x) => !ids.has(`${x.action}/${x.folder}/${x.name}`)),
    ];
    const bad = r.results.filter((x) => x.error).length;
    notify(
      `Done: ${r.results.length - bad}${bad ? `, errors: ${bad}` : ''}. Originals are untouched until you replace them.`,
    );
  } catch (e) {
    console.error('gallery: process', e);
    notify('Processing failed. See the dev server terminal.');
  } finally {
    busy.value = false;
  }
}
async function settle(list: GalleryResult[], discard: boolean) {
  if (!list.length) return;
  busy.value = true;
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
    const gone = new Set(list.map((r) => `${r.action}/${r.folder}/${r.name}`));
    results.value = results.value.filter((r) => !gone.has(`${r.action}/${r.folder}/${r.name}`));
    closeViewer();
    notify(discard ? 'Results discarded' : 'Originals replaced');
    await reload();
  } catch (e) {
    console.error('gallery: apply', e);
    notify('Could not apply');
  } finally {
    busy.value = false;
  }
}
onMounted(async () => {
  if (!isDev) return;
  try {
    results.value = await $fetch<GalleryResult[]>('/api/ds/results');
  } catch {
    /* no results yet */
  }
});
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <div class="gallery" :class="{ '-dark': dark, '-cols-7': columns === 7 }">
    <p v-if="!isDev" class="gallery__note">
      The source gallery is available on the local dev server only.
    </p>
    <template v-else>
      <header class="gallery__top">
        <div class="gallery__head">
          <div class="gallery__titles">
            <p class="gallery__eyebrow">
              @ai.all/ui · DS7 <a class="gallery__back" href="/ui">← Brandbook</a>
            </p>
            <h1 class="gallery__title">Source files</h1>
          </div>
          <div class="gallery__modes">
            <UiChips
              v-model="mode"
              legend="Show"
              inline
              :options="[
                { value: 'name', label: 'Name' },
                { value: 'path', label: 'Path' },
              ]"
              variant="segment"
              size="small"
            />
            <UiChips
              v-model="themeChoice"
              legend="Background"
              inline
              :options="[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]"
              variant="segment"
              size="small"
            />
            <UiChips
              v-model="columnsChoice"
              legend="Columns"
              inline
              :options="[
                { value: '4', label: '4 per row' },
                { value: '7', label: '7 per row' },
              ]"
              variant="segment"
              size="small"
            />
          </div>
        </div>
        <p class="gallery__count">
          Shown: {{ total }}. Select with the circle on a card (Shift selects a range). Click a
          picture to view it.
        </p>
        <p v-if="data && !data.available" class="gallery__warn">
          The source folder was not found: check <code>gallery.folder</code> in nuxt.config.
        </p>
        <div class="gallery__bar">
          <UiChips
            class="gallery__tabs"
            v-model="folderChoice"
            legend="Folder"
            inline
            :options="[
              { value: 'all', label: 'All' },
              ...folders.map((f) => ({
                value: f.folder,
                label: `${f.folder} (${f.files.length})`,
              })),
            ]"
            variant="segment"
            size="small"
          />
          <input
            v-model="query"
            type="search"
            class="gallery__search"
            placeholder="Search by name"
            aria-label="Search by name"
          />
        </div>
        <UiGalleryToolbar
          v-model:quality="quality"
          v-model:fuzz="fuzz"
          :count="selected.size"
          :total="total"
          :folders="folderNames"
          :busy="busy"
          :is-dev="isDev"
          @all="selectAll"
          @clear="clearSel"
          @copy="copySelected"
          @remove="removeSelected"
          @move="moveSelected"
          @run="run"
        />
      </header>

      <section
        v-for="f in shown"
        :id="`gallery-${galleryEnc(f.folder).replace(/\//g, '-')}`"
        :key="f.folder"
        class="gallery__section"
      >
        <h3>
          {{ f.folder }} <small>{{ f.files.length }}</small>
        </h3>
        <ul class="gallery__grid">
          <li v-for="i in f.files" :key="i.name">
            <article
              class="gallery__card"
              :class="{ '-sel': selected.has(galleryKey(f.folder, i.name)) }"
            >
              <button
                type="button"
                class="gallery__preview"
                :aria-label="`Open image ${i.name}`"
                @click="viewIndex = flat.findIndex((x) => x.key === galleryKey(f.folder, i.name))"
              >
                <span class="gallery__pic"
                  ><img
                    :src="src(f.folder, i.name)"
                    :alt="i.name"
                    loading="lazy"
                    @load="
                      dims[galleryKey(f.folder, i.name)] =
                        `${($event.target as HTMLImageElement).naturalWidth}×${($event.target as HTMLImageElement).naturalHeight}`
                    "
                /></span>
              </button>
              <button
                type="button"
                class="gallery__check"
                :aria-pressed="selected.has(galleryKey(f.folder, i.name))"
                :aria-label="`Select ${i.name}`"
                @click="toggle(galleryKey(f.folder, i.name))"
              >
                ✓
              </button>
              <span class="gallery__name">{{ i.name }}</span>
              <span class="gallery__meta"
                >{{ dims[galleryKey(f.folder, i.name)] || '…' }} · {{ galleryKb(i.size) }}</span
              >
              <div class="gallery__actions">
                <UiCopyButton
                  :value="textFor(f.folder, i.name)"
                  :label="`Copy ${mode === 'name' ? 'name' : 'path'}: ${textFor(f.folder, i.name)}`"
                />
                <UiButton
                  variant="ghost"
                  size="small"
                  :disabled="busy"
                  :aria-label="`Delete ${i.name}`"
                  @click="pendingDelete = { folder: f.folder, name: i.name }"
                >
                  <UiIcon name="close" />
                </UiButton>
              </div>
            </article>
          </li>
        </ul>
      </section>
      <p v-if="data && data.available && !shown.length" class="gallery__warn">Nothing found.</p>

      <UiGalleryResults
        v-if="results.length"
        :results="results"
        :busy="busy"
        @compare="compare = $event"
        @apply="settle($event, false)"
        @discard="settle($event, true)"
      />

      <UiGalleryViewer
        v-if="viewOpen"
        v-model:index="viewIdx"
        :items="viewerItems"
        :selected="selected"
        :is-dev="!compare"
        @close="closeViewer"
        @toggle="(it) => toggle(it.key)"
        @remove="viewerRemove"
      />

      <UiModal
        :open="!!pendingDelete"
        title="Delete this file?"
        size="small"
        @close="pendingDelete = null"
      >
        <p>
          {{ pendingDelete?.name }} is removed from {{ pendingDelete?.folder }}. This cannot be
          undone.
        </p>
        <template #foot>
          <UiButton variant="outline" @click="pendingDelete = null">Cancel</UiButton>
          <UiButton variant="primary" @click="confirmDelete">Delete</UiButton>
        </template>
      </UiModal>
    </template>

    <div class="gallery__toast" :class="{ '-on': toast }" role="status" aria-live="polite">
      {{ toast }}
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  gap: 1rem;
  padding: var(--space-6) 0;
  background: var(--color-paper);
  color: var(--color-ink);
}
.gallery__top {
  display: grid;
  gap: 0.6rem;
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 0.5rem 0;
  background: var(--color-paper);
}
.gallery__eyebrow {
  margin: 0;
  font-size: var(--text-xs);
  text-transform: uppercase;
  color: var(--color-ink-600);
}
.gallery__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2) var(--space-4);
}
.gallery__back {
  margin-left: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-ink-600);
  text-decoration: underline;
  text-underline-offset: 0.2em;
  text-transform: none;
  letter-spacing: 0;
}
.gallery__back:hover {
  color: var(--color-ink);
}
.gallery__title {
  margin: 0;
  font-size: var(--text-lead);
}
.gallery__modes,
.gallery__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--space-4);
}
/* each group reads as one line: the label on the left, the segments on the right */
.gallery__modes :deep(.chips),
.gallery__tabs :deep(.chips) {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.gallery__modes :deep(.chips__legend),
.gallery__tabs :deep(.chips__legend) {
  margin: 0;
  white-space: nowrap;
}
.gallery__tabs {
  flex: none;
}
.gallery__search {
  flex: 1 1 12rem;
  max-width: 20rem;
  min-height: 2.1rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: inherit;
  font: inherit;
}
.gallery__count,
.gallery__note,
.gallery__warn {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-ink-600);
}
.gallery__section h3 {
  margin: var(--space-4) 0 var(--space-2);
  font-size: var(--text-lead);
}
.gallery__section h3 small {
  color: var(--color-ink-600);
  font-weight: 500;
}
.gallery__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}
.gallery.-cols-7 .gallery__grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
@media (max-width: 1000px) {
  .gallery__grid,
  .gallery.-cols-7 .gallery__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .gallery__grid,
  .gallery.-cols-7 .gallery__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.gallery__card {
  position: relative;
  display: grid;
  gap: 0.3rem;
  height: 100%;
  padding: 0.45rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.gallery__card:hover,
.gallery__card:focus-within,
.gallery__card.-sel {
  border-color: var(--color-brand);
}
.gallery__preview {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}
.gallery__pic {
  display: grid;
  aspect-ratio: 1 / 1;
  place-items: center;
  overflow: hidden;
  border-radius: 0.3rem;
  background: var(--color-surface-muted);
}
.gallery.-dark .gallery__pic {
  background: var(--color-inverse);
}
.gallery__pic img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.gallery__check {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  width: 1.7rem;
  height: 1.7rem;
  border: 2px solid var(--color-surface);
  border-radius: 50%;
  background: var(--color-veil);
  color: transparent;
  font-weight: 700;
  cursor: pointer;
}
.gallery__check[aria-pressed='true'] {
  background: var(--color-brand);
  color: var(--color-brand-contrast);
}
.gallery__name {
  font-size: var(--text-sm);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.gallery__meta {
  font-size: var(--text-xs);
  color: var(--color-ink-600);
}
.gallery__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
}
.gallery__toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translate(-50%, 1rem);
  max-width: 90vw;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-inverse);
  color: var(--color-inverse-ink);
  font-size: var(--text-sm);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.2s,
    transform 0.2s;
  overflow-wrap: anywhere;
}
.gallery__toast.-on {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
