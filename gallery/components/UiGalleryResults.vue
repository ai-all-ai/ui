<script setup lang="ts">
// GALLERY-04 · Results of the source gallery: processed images waiting to replace the originals, with the size change.
import UiButton from '../../components/ui/UiButton.vue';
import { galleryEnc, galleryKb, type GalleryResult } from './types';

const props = defineProps<{ results: GalleryResult[]; busy: boolean }>();
const emit = defineEmits<{
  compare: [GalleryResult];
  apply: [GalleryResult[]];
  discard: [GalleryResult[]];
}>();

const NAMES: Record<string, string> = {
  trim: 'Trim margins',
  bg: 'Remove background',
  optimize: 'Optimise',
};
const saved = (r: GalleryResult) =>
  r.before && r.after ? Math.round((1 - r.after.size / r.before.size) * 100) : 0;
const thumb = (r: GalleryResult, done: boolean) =>
  done
    ? `/ds-files/_processed/${r.action}/${galleryEnc(r.folder)}/${encodeURIComponent(r.out ?? r.name)}?t=${r.after?.size ?? 0}`
    : `/ds-files/${galleryEnc(r.folder)}/${encodeURIComponent(r.name)}`;
const ok = () => props.results.filter((r) => !r.error);
</script>

<template>
  <section class="gallery-results" aria-labelledby="gallery-results-title">
    <div class="gallery-results__head">
      <h3 id="gallery-results-title">
        Processing results <small>{{ results.length }}</small>
      </h3>
      <div class="gallery-results__all">
        <UiButton
          variant="outline"
          size="small"
          :disabled="busy || !ok().length"
          @click="emit('apply', ok())"
          >Replace all originals</UiButton
        >
        <UiButton variant="outline" size="small" :disabled="busy" @click="emit('discard', ok())"
          >Discard all</UiButton
        >
      </div>
    </div>
    <p class="gallery-results__hint">
      Sources are untouched until you replace them. The original is kept in <code>_backup/</code>.
    </p>
    <ul class="gallery-results__list">
      <li
        v-for="r in results"
        :key="`${r.action}/${r.folder}/${r.name}`"
        class="gallery-results__item"
      >
        <button
          type="button"
          class="gallery-results__pair"
          aria-label="Compare before and after"
          :disabled="!!r.error"
          @click="emit('compare', r)"
        >
          <img :src="thumb(r, false)" alt="" loading="lazy" />
          <img v-if="!r.error" :src="thumb(r, true)" alt="" loading="lazy" />
        </button>
        <div class="gallery-results__info">
          <b>{{ r.name }}</b>
          <small>{{ NAMES[r.action] }} · {{ r.folder }}</small>
          <p v-if="r.error" class="gallery-results__error">{{ r.error }}</p>
          <p v-else-if="r.before && r.after">
            {{ galleryKb(r.before.size) }} → <b>{{ galleryKb(r.after.size) }}</b>
            <span :class="saved(r) > 0 ? '-good' : '-bad'">{{
              saved(r) > 0 ? `−${saved(r)}%` : `${saved(r)}%`
            }}</span>
          </p>
        </div>
        <div class="gallery-results__act">
          <UiButton
            variant="outline"
            size="small"
            :disabled="busy || !!r.error"
            @click="emit('apply', [r])"
            >Replace</UiButton
          >
          <UiButton variant="ghost" size="small" :disabled="busy" @click="emit('discard', [r])"
            >Discard</UiButton
          >
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.gallery-results {
  margin-top: var(--space-6);
}
.gallery-results__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.gallery-results__head h3 {
  margin: 0;
  font-size: var(--text-lead);
}
.gallery-results__head small {
  color: var(--color-ink-600);
  font-weight: 500;
}
.gallery-results__all,
.gallery-results__act {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.gallery-results__hint {
  margin: 0.5rem 0;
  font-size: var(--text-sm);
  color: var(--color-ink-600);
}
.gallery-results__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.gallery-results__item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.4rem 0.8rem;
  padding: 0.6rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.gallery-results__pair {
  display: grid;
  grid-template-columns: 4rem 4rem;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}
.gallery-results__pair img {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  background: var(--color-surface-muted);
}
.gallery-results__info {
  min-width: 0;
  font-size: var(--text-sm);
}
.gallery-results__info b {
  overflow-wrap: anywhere;
}
.gallery-results__info small {
  display: block;
  color: var(--color-ink-600);
}
.gallery-results__info p {
  margin: 0.2rem 0 0;
}
.gallery-results__act {
  grid-column: 1 / -1;
}
.gallery-results__error {
  color: var(--color-danger);
}
.gallery-results__info .-good {
  color: var(--color-success);
  font-weight: 700;
}
.gallery-results__info .-bad {
  color: var(--color-danger);
  font-weight: 700;
}
</style>
