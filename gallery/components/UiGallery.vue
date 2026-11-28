<script setup lang="ts">
import '../../templates/kit-header.css';
// GALLERY-01 · Source gallery of the site: browse, search, copy names or paths, select, move, delete and process the
// images of the source folder (gallery.folder, ds by default). Dev server only: outside dev it shows a short note.
import { ref, computed, nextTick, onMounted, onBeforeUnmount, reactive } from 'vue';
import { useFetch } from '#imports';
import UiButton from '../../components/ui/UiButton.vue';
import UiCopyButton from '../../components/ui/UiCopyButton.vue';
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

const active = ref<string | null>(null);
const query = ref('');
const searchHover = ref(false);
const searchFocus = ref(false);
const searchRequested = ref(false);
const searchButton = ref<HTMLButtonElement | null>(null);
const searchField = ref<HTMLInputElement | null>(null);
const searchExpanded = computed(
  () => searchHover.value || searchFocus.value || searchRequested.value,
);
function hoverSearch(event: PointerEvent) {
  if (event.pointerType === 'mouse') searchHover.value = true;
}
async function openSearch() {
  searchRequested.value = true;
  await nextTick();
  searchField.value?.focus();
}
function closeSearch() {
  searchHover.value = false;
  searchRequested.value = false;
  searchButton.value?.focus();
}
const mode = ref<'name' | 'path'>('name');
const themeChoice = computed({
  get: () => (dark.value ? 'dark' : 'light'),
  set: (v: string) => (dark.value = v === 'dark'),
});
const columnsChoice = computed({
  get: () => String(columns.value),
  set: (v: string) => (columns.value = Number(v) === 12 ? 12 : Number(v) === 7 ? 7 : 4),
});
const columns = ref<4 | 7 | 12>(4);
const dark = ref(false);
const busy = ref(false);
const toast = ref('');
const results = ref<GalleryResult[]>([]);
const selected = ref(new Set<string>());
const viewIndex = ref(-1);
const compare = ref<GalleryResult | null>(null);
const pendingDelete = ref<{ folder: string; name: string } | null>(null);
const confirmation = ref<HTMLElement | null>(null);
const dims = reactive<Record<string, string>>({});
const quality = ref('80');
const fuzz = ref('8');
let timer: ReturnType<typeof setTimeout> | undefined;

const folders = computed(() => data.value?.folders ?? []);
const folderNames = computed(() => folders.value.map((f) => f.folder));
const shown = computed(() =>
  folders.value
    .filter((f) => active.value === null || f.folder === active.value)
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
async function requestDelete(folder: string, name: string) {
  pendingDelete.value = { folder, name };
  await nextTick();
  confirmation.value?.focus();
}
const viewerRemove = (it: GalleryViewerItem) => {
  closeViewer();
  const i = it.key.indexOf('/');
  void requestDelete(it.key.slice(0, i), it.key.slice(i + 1));
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
  <div class="gallery" :class="{ '-dark': dark, '-cols-7': columns === 7, '-cols-12': columns === 12 }">
    <p v-if="!isDev" class="note">The source gallery is available on the local dev server only.</p>
    <template v-else>
      <header class="top kithead">
        <div class="heading">
          <div
            class="controls"
            :class="{ '-searching': searchExpanded, '-has-selection': selected.size }"
            role="group"
            aria-label="Gallery controls"
          >
            <button
              v-if="selected.size"
              type="button"
              class="tool -selection"
              :aria-label="`Actions (${selected.size})`"
              title="Actions"
              popovertarget="gallery-settings"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="5" cy="12" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
              </svg>
              {{ selected.size }}
            </button>
            <button
              type="button"
              class="tool"
              aria-label="Settings"
              title="Settings"
              popovertarget="gallery-settings"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M10 3h4l.5 2.4 1.7.9 2.3-.8 2 3.5-1.8 1.6v2l1.8 1.6-2 3.5-2.3-.8-1.7.9L14 20h-4l-.5-2.2-1.7-.9-2.3.8-2-3.5 1.8-1.6v-2L3.5 9l2-3.5 2.3.8 1.7-.9L10 3Z"
                />
                <circle cx="12" cy="11.5" r="2.5" />
              </svg>
            </button>
            <div
              class="finder"
              :class="{ '-expanded': searchExpanded }"
              @pointerenter="hoverSearch"
              @pointerleave="searchHover = false"
              @keydown.esc.stop="closeSearch"
            >
              <button
                ref="searchButton"
                type="button"
                class="tool"
                aria-label="Search"
                title="Search"
                :class="{ '-active': query.trim() }"
                aria-controls="gallery-search"
                :aria-expanded="searchExpanded"
                @click="openSearch"
              >
                <UiIcon name="search" />
              </button>
              <input
                id="gallery-search"
                ref="searchField"
                v-model="query"
                type="search"
                class="search"
                placeholder="Search by name"
                aria-label="Search by name"
                :inert="!searchExpanded"
                @focus="searchFocus = true"
                @blur="
                  searchFocus = false;
                  searchRequested = false;
                "
              />
            </div>
          </div>
          <div class="titles">
            <p class="eyebrow">
              @ai.all/ui · DS7 <a class="link -back" href="/ui?tab=tools">← Brandbook</a>
            </p>
            <h1 class="title">Source files</h1>
            <p v-if="selected.size" class="selection-line">
              <b>{{ selected.size }}</b> selected of {{ total }}
              <button type="button" class="link selection-clear" @click="clearSel">Clear selection</button>
            </p>
          </div>
        </div>
        <div id="gallery-settings" class="kit-drawer" popover aria-label="Gallery settings">
          <div class="drawer-head">
            <h2>Settings</h2>
            <button
              type="button"
              class="drawer-close"
              aria-label="Close settings"
              popovertarget="gallery-settings"
              popovertargetaction="hide"
            >
              <UiIcon name="close" />
            </button>
          </div>
          <div class="drawer-fields">
            <button
              type="button"
              class="tool"
              popovertarget="gallery-settings"
              popovertargetaction="hide"
              @click="openSearch"
            >
              Search files
            </button>
            <label class="setting"
              >Copy
              <select v-model="mode">
                <option value="name">Name</option>
                <option value="path">Path</option>
              </select>
            </label>
            <label class="setting"
              >Background
              <select v-model="themeChoice">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label class="setting"
              >Columns
              <select v-model="columnsChoice">
                <option value="4">4 per row</option>
                <option value="7">7 per row</option>
                <option value="12">12 per row</option>
              </select>
            </label>
            <button
              type="button"
              class="tool"
              :disabled="!total"
              popovertarget="gallery-settings"
              popovertargetaction="hide"
              @click="selectAll"
            >
              Select all shown
            </button>
            <h3 class="actions">Actions</h3>
            <p v-if="!selected.size" class="note">Select files to use bulk actions.</p>
            <UiGalleryToolbar
              v-if="selected.size"
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
          </div>
        </div>
        <p v-if="data && !data.available" class="warn">
          The source folder was not found: check <code>gallery.folder</code> in nuxt.config.
        </p>
        <nav class="links folders" aria-label="Folders">
          <button type="button" class="link" :aria-pressed="active === null" @click="active = null">
            All ({{ total }})
          </button>
          <button
            v-for="folder in folders"
            :key="folder.folder"
            type="button"
            class="link"
            :aria-pressed="active === folder.folder"
            @click="active = folder.folder"
          >
            {{ folder.folder }} ({{ folder.files.length }})
          </button>
        </nav>
        <div
          v-if="pendingDelete"
          ref="confirmation"
          class="confirm"
          role="group"
          aria-label="Confirm file deletion"
          tabindex="-1"
          @keydown.esc="pendingDelete = null"
        >
          <p role="status">Delete {{ pendingDelete.name }} from {{ pendingDelete.folder }}?</p>
          <UiButton variant="outline" @click="pendingDelete = null">Cancel</UiButton>
          <UiButton variant="primary" @click="confirmDelete">Delete</UiButton>
        </div>
      </header>

      <section
        v-for="f in shown"
        :id="`gallery-${galleryEnc(f.folder).replace(/\//g, '-')}`"
        :key="f.folder"
        class="section"
      >
        <h3>
          {{ f.folder }} <small>{{ f.files.length }}</small>
        </h3>
        <ul class="grid">
          <li v-for="i in f.files" :key="i.name">
            <article class="card" :class="{ '-sel': selected.has(galleryKey(f.folder, i.name)) }">
              <button
                type="button"
                class="preview"
                :aria-label="`Open image ${i.name}`"
                @click="viewIndex = flat.findIndex((x) => x.key === galleryKey(f.folder, i.name))"
              >
                <span class="pic"
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
                class="check"
                :aria-pressed="selected.has(galleryKey(f.folder, i.name))"
                :aria-label="`Select ${i.name}`"
                @click="toggle(galleryKey(f.folder, i.name))"
              >
                ✓
              </button>
              <span class="name">{{ i.name }}</span>
              <span class="meta"
                >{{ dims[galleryKey(f.folder, i.name)] || '…' }} · {{ galleryKb(i.size) }}</span
              >
              <div class="actions">
                <UiCopyButton
                  :value="textFor(f.folder, i.name)"
                  :label="`Copy ${mode === 'name' ? 'name' : 'path'}: ${textFor(f.folder, i.name)}`"
                />
                <UiButton
                  variant="ghost"
                  size="small"
                  :disabled="busy"
                  :aria-label="`Delete ${i.name}`"
                  @click="requestDelete(f.folder, i.name)"
                >
                  <UiIcon name="close" />
                </UiButton>
              </div>
            </article>
          </li>
        </ul>
      </section>
      <p v-if="data && data.available && !shown.length" class="warn">Nothing found.</p>

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
    </template>

    <div class="toast" :class="{ '-on': toast }" role="status" aria-live="polite">
      {{ toast }}
    </div>
  </div>
</template>

<style scoped>
.gallery {
  display: grid;
  gap: 1rem;
  padding: 0 0 var(--space-6);
  background: var(--color-paper);
  color: var(--color-ink);
}
.gallery {
  --gallery-control-size: 2.25rem;
}
.controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.controls {
  position: relative;
  max-width: 100%;
  margin: 0;
  box-sizing: border-box;
  color: var(--color-ink);
  z-index: 10;
  gap: var(--space-1);
  padding-inline-start: 2.75rem;
  position: absolute;
  inset: -2.75rem auto auto 0;
  block-size: 2.25rem;
}

.controls .tool {
  --icon-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-width: var(--gallery-control-size);
  min-height: var(--gallery-control-size);
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
}
.kit-drawer .actions {
  margin: 0;
}
.controls .tool:hover,
.controls .tool.-active {
  background: var(--color-accent-soft);
}
.controls .tool svg {
  display: block;
  width: var(--icon-size);
  height: var(--icon-size);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
}
.selection-line {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-ink-600);
}
.selection-clear {
  margin-inline-start: var(--space-2);
  border: 0;
  background: none;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}
.controls .tool.-selection {
  position: absolute;
  inset-inline-start: 0;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-accent-soft);
}
.finder {
  display: flex;
  align-items: center;
  min-width: 0;
}
.gallery .finder .search {
  width: 0;
  min-width: 0;
  min-height: 0;
  height: 0;
  padding: 0;
  border-width: 0;
  visibility: hidden;
  transition:
    width 180ms ease,
    padding 180ms ease;
}
.gallery .finder.-expanded .search {
  height: var(--controls-height);
  box-sizing: border-box;
  width: min(12rem, 40vw);
  padding-inline: var(--space-2);
  border-width: 1px;
  visibility: visible;
}
@media (prefers-reduced-motion: reduce) {
  .gallery .finder .search {
    transition: none;
  }
}
.gallery {
  .search {
    width: 100%;
    box-sizing: border-box;
    min-height: 2.1rem;
    padding: 0.3rem 0.8rem;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: inherit;
    font: inherit;
  }
  .note,
  .warn {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
  }
}
.section h3 {
  margin: var(--space-4) 0 var(--space-2);
  font-size: var(--text-lead);
}
.section h3 small {
  color: var(--color-ink-600);
  font-weight: 500;
}
.gallery {
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--grid-gutter);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &.-cols-7 .grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  &.-cols-12 .grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}
@media (max-width: 1000px) {
  .grid,
  .gallery.-cols-7 .grid,
  .gallery.-cols-12 .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid,
  .gallery.-cols-7 .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.gallery {
  .card {
    position: relative;
    display: grid;
    gap: 0.3rem;
    height: 100%;
    padding: 0.45rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
}
.card:hover,
.card:focus-within,
.card.-sel {
  border-color: var(--color-brand);
}
.card.-sel .pic {
  outline: 3px solid var(--color-brand);
  outline-offset: -3px;
}
.gallery {
  .preview {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
  }
  .pic {
    display: grid;
    aspect-ratio: 1 / 1;
    place-items: center;
    overflow: hidden;
    border-radius: 0.3rem;
    background: var(--color-surface-muted);
  }
  &.-dark .pic {
    background: var(--color-inverse);
  }
}
.pic img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.gallery {
  .check {
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
}
.check[aria-pressed='true'] {
  background: var(--color-brand);
  color: var(--color-brand-contrast);
}
.gallery {
  .name {
    font-size: var(--text-sm);
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .meta {
    font-size: var(--text-xs);
    color: var(--color-ink-600);
  }
  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
  }
  .toast {
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
}
.toast.-on {
  opacity: 1;
  transform: translate(-50%, 0);
}

.confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  overflow-wrap: anywhere;
}
.confirm p {
  margin: 0;
  min-width: 0;
}
</style>
