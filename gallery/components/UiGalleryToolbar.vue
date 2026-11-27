<script setup lang="ts">
// GALLERY-02 · Bulk actions of the source gallery: select, copy, process, move, delete. Process and file actions are dev only.
import UiButton from '../../components/ui/UiButton.vue';
import UiSelect from '../../components/ui/UiSelect.vue';
import type { GalleryAction } from './types';

const props = defineProps<{
  count: number;
  total: number;
  folders: string[];
  busy: boolean;
  isDev: boolean;
}>();
const emit = defineEmits<{
  all: [];
  clear: [];
  copy: [];
  remove: [];
  move: [to: string];
  run: [action: GalleryAction, params: { quality: number; fuzz: number }];
}>();

const quality = defineModel<string>('quality', { default: '80' });
const fuzz = defineModel<string>('fuzz', { default: '8' });
const to = ref('');
const off = computed(() => !props.count || props.busy);
const params = () => ({ quality: Number(quality.value), fuzz: Number(fuzz.value) });
const qualityOptions = ['60', '70', '80', '90'].map((v) => ({ value: v, label: v }));
const fuzzOptions = ['4', '8', '15', '25'].map((v) => ({ value: v, label: `${v}%` }));
const folderOptions = computed(() => props.folders.map((f) => ({ value: f, label: f })));
</script>

<template>
  <div class="gallery-toolbar" role="toolbar" aria-label="Bulk actions">
    <div class="gallery-toolbar__row gallery-toolbar__row--actions">
      <span class="gallery-toolbar__count"
        ><b>{{ count }}</b> selected of {{ total }}</span
      >
      <UiButton variant="outline" size="small" @click="emit('all')">Select all</UiButton>
      <UiButton variant="outline" size="small" :disabled="!count" @click="emit('clear')"
        >Clear</UiButton
      >
      <UiButton variant="outline" size="small" :disabled="off" @click="emit('copy')">Copy</UiButton>
      <template v-if="isDev">
        <UiButton
          variant="outline"
          size="small"
          :disabled="off"
          @click="emit('run', 'trim', params())"
          >Trim margins</UiButton
        >
        <UiButton
          variant="outline"
          size="small"
          :disabled="off"
          @click="emit('run', 'bg', params())"
          >Remove background</UiButton
        >
        <UiButton
          variant="outline"
          size="small"
          :disabled="off"
          @click="emit('run', 'optimize', params())"
          >Optimise</UiButton
        >
        <UiButton variant="ghost" size="small" :disabled="off" @click="emit('remove')"
          >Delete</UiButton
        >
      </template>
      <span v-if="busy" class="gallery-toolbar__busy" role="status">Processing…</span>
    </div>
    <div v-if="isDev" class="gallery-toolbar__row gallery-toolbar__row--settings">
      <UiSelect v-model="fuzz" label="Background tolerance" :options="fuzzOptions" />
      <UiSelect v-model="quality" label="JPEG quality" :options="qualityOptions" />
      <UiSelect v-model="to" label="Move to" placeholder="Choose folder" :options="folderOptions" />
      <UiButton variant="outline" size="small" :disabled="off || !to" @click="emit('move', to)"
        >Move</UiButton
      >
    </div>
  </div>
</template>
<style scoped>
.gallery-toolbar {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}
/* one row for the buttons (centred on one line), one row for the settings (the fields share a baseline, the Move button sits on it) */
.gallery-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.gallery-toolbar__row--settings {
  align-items: end;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-line);
}
.gallery-toolbar__row--settings :deep(.select) {
  min-width: 11rem;
}
.gallery-toolbar__count {
  margin-right: var(--space-2);
  font-size: var(--text-sm);
}
.gallery-toolbar__busy {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--color-ink-600);
}
</style>
