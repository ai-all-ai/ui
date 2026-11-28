<script setup lang="ts">
// Viewer of the source gallery: one image full screen with zoom, neighbours, selection and copy.
// A result shows before and after side by side. Native <dialog>, so focus stays inside and Escape closes it.
import { ref, computed, onMounted } from 'vue';
import UiButton from '../../components/ui/UiButton.vue';
import UiCopyButton from '../../components/ui/UiCopyButton.vue';

export interface GalleryViewerItem {
  key: string;
  name: string;
  src: string;
  before?: string;
  dims?: string;
  copy: string;
}

const props = defineProps<{
  items: GalleryViewerItem[];
  index: number;
  selected: Set<string>;
  isDev: boolean;
}>();
const emit = defineEmits<{
  close: [];
  'update:index': [number];
  toggle: [GalleryViewerItem];
  remove: [GalleryViewerItem];
}>();

const dialog = ref<HTMLDialogElement | null>(null);
const zoom = ref<'fit' | '1' | '2'>('1');
const item = computed(() => props.items[props.index]);
const go = (step: number) => {
  const next = props.index + step;
  if (next >= 0 && next < props.items.length) {
    zoom.value = '1';
    emit('update:index', next);
  }
};
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === '0') zoom.value = 'fit';
  else if (e.key === '1') zoom.value = '1';
  else if (e.key === '2') zoom.value = '2';
};
onMounted(() => dialog.value?.showModal());
</script>

<template>
  <dialog
    ref="dialog"
    class="gallery-viewer"
    aria-labelledby="gallery-viewer-title"
    @keydown="onKey"
    @close="emit('close')"
  >
    <div v-if="item" class="inner">
      <div class="bar">
        <span id="gallery-viewer-title" class="name"
          >{{ item.name }}
          <small>{{ item.dims }} · {{ index + 1 }} / {{ items.length }}</small></span
        >
        <div class="actions">
          <UiButton
            variant="outline"
            size="small"
            :aria-pressed="zoom === 'fit'"
            @click="zoom = 'fit'"
            >Fit</UiButton
          >
          <UiButton variant="outline" size="small" :aria-pressed="zoom === '1'" @click="zoom = '1'"
            >100%</UiButton
          >
          <UiButton variant="outline" size="small" :aria-pressed="zoom === '2'" @click="zoom = '2'"
            >200%</UiButton
          >
          <UiButton
            variant="outline"
            size="small"
            :aria-pressed="selected.has(item.key)"
            @click="emit('toggle', item)"
            >{{ selected.has(item.key) ? 'Selected' : 'Select' }}</UiButton
          >
          <UiCopyButton :value="item.copy" :label="`Copy ${item.name}`" />
          <UiButton v-if="isDev" variant="ghost" size="small" @click="emit('remove', item)"
            >Delete</UiButton
          >
          <UiButton
            variant="outline"
            size="small"
            :disabled="index <= 0"
            aria-label="Previous"
            @click="go(-1)"
            >‹</UiButton
          >
          <UiButton
            variant="outline"
            size="small"
            :disabled="index >= items.length - 1"
            aria-label="Next"
            @click="go(1)"
            >›</UiButton
          >
          <UiButton variant="primary" size="small" aria-label="Close" @click="dialog?.close()"
            >×</UiButton
          >
        </div>
      </div>
      <div class="canvas" :class="{ '-pair': item.before }">
        <figure v-if="item.before" class="pane">
          <figcaption>Before</figcaption>
          <img :src="item.before" alt="" :class="`-${zoom}`" />
        </figure>
        <figure class="pane">
          <figcaption v-if="item.before">After</figcaption>
          <img :key="item.key" :src="item.src" :alt="item.name" :class="`-${zoom}`" />
        </figure>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.gallery-viewer {
  width: 100vw;
  max-width: none;
  height: 100dvh;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--color-paper);
  color: var(--color-ink);
}
.gallery-viewer {
  &::backdrop {
    background: var(--color-dim);
  }
  .inner {
    display: flex;
    height: 100%;
    flex-direction: column;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-line);
  }
  .name {
    overflow-wrap: anywhere;
    font-weight: 700;
  }
}
.name small {
  margin-left: 0.4rem;
  font-weight: 400;
  color: var(--color-ink-600);
}
.gallery-viewer {
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
  }
  .canvas {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }
}
.canvas.-pair {
  gap: 2px;
}
.gallery-viewer {
  .pane {
    position: relative;
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    align-items: center;
    justify-content: center;
    margin: 0;
  }
}
.pane figcaption {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-pill);
  background: var(--color-dim);
  color: var(--color-inverse-ink);
  font-size: var(--text-xs);
}
.pane img {
  display: block;
  margin: auto;
}
.pane img.-fit {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
