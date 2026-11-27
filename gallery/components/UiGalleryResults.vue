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
    <div class="head">
      <h3 id="gallery-results-title">
        Processing results <small>{{ results.length }}</small>
      </h3>
      <div class="all">
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
    <p class="hint">
      Sources are untouched until you replace them. The original is kept in <code>_backup/</code>.
    </p>
    <ul class="list">
      <li v-for="r in results" :key="`${r.action}/${r.folder}/${r.name}`" class="item">
        <button
          type="button"
          class="pair"
          aria-label="Compare before and after"
          :disabled="!!r.error"
          @click="emit('compare', r)"
        >
          <img :src="thumb(r, false)" alt="" loading="lazy" />
          <img v-if="!r.error" :src="thumb(r, true)" alt="" loading="lazy" />
        </button>
        <div class="info">
          <b>{{ r.name }}</b>
          <small>{{ NAMES[r.action] }} · {{ r.folder }}</small>
          <p v-if="r.error" class="error">{{ r.error }}</p>
          <p v-else-if="r.before && r.after">
            {{ galleryKb(r.before.size) }} → <b>{{ galleryKb(r.after.size) }}</b>
            <span :class="saved(r) > 0 ? '-good' : '-bad'">{{
              saved(r) > 0 ? `−${saved(r)}%` : `${saved(r)}%`
            }}</span>
          </p>
        </div>
        <div class="act">
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
.gallery-results {
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
}
.head h3 {
  margin: 0;
  font-size: var(--text-lead);
}
.head small {
  color: var(--color-ink-600);
  font-weight: 500;
}
.gallery-results {
  .all,
  .act {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }
  .hint {
    margin: 0.5rem 0;
    font-size: var(--text-sm);
    color: var(--color-ink-600);
  }
  .list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 0.6rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .item {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0.4rem 0.8rem;
    padding: 0.6rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
  .pair {
    display: grid;
    grid-template-columns: 4rem 4rem;
    gap: 2px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: zoom-in;
  }
}
.pair img {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  background: var(--color-surface-muted);
}
.gallery-results {
  .info {
    min-width: 0;
    font-size: var(--text-sm);
  }
}
.info b {
  overflow-wrap: anywhere;
}
.info small {
  display: block;
  color: var(--color-ink-600);
}
.info p {
  margin: 0.2rem 0 0;
}
.gallery-results {
  .act {
    grid-column: 1 / -1;
  }
  .error {
    color: var(--color-danger);
  }
}
.info .-good {
  color: var(--color-success);
  font-weight: 700;
}
.info .-bad {
  color: var(--color-danger);
  font-weight: 700;
}
</style>
