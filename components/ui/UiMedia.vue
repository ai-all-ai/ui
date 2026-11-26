<script setup lang="ts">
// MEDIA-01 · Media frame: a photo cropped to a fixed ratio, or a grey placeholder with an icon until the photo exists.
withDefaults(
  defineProps<{ src?: string; alt: string; ratio?: string; priority?: boolean; round?: boolean }>(),
  { src: undefined, ratio: '4 / 3', priority: false, round: false },
);
</script>

<template>
  <div class="media" :class="{ '-empty': !src, '-round': round }" :style="{ aspectRatio: ratio }">
    <img
      v-if="src"
      class="media__img"
      :src="src"
      :alt="alt"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : undefined"
      decoding="async"
    />
    <span v-else class="media__empty" role="img" :aria-label="alt">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1 1 0 100-.01" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
.media {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--color-placeholder);
}
.media.-round {
  border-radius: var(--radius-lg);
}
.media__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media__empty {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--color-ink-400);
}
.media__empty svg {
  width: 2.5rem;
  height: 2.5rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
}
</style>
