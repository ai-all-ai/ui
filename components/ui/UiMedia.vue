<!-- MEDIA-01: a photo, or a neutral placeholder of the same size while the real photo is not there yet (src empty).
     ratio sets the box (e.g. "16 / 10"); -fill stretches to the parent height; -round adds the md radius.
     Placeholder: an empty grey box with the house icon (MEDIA-01). scene="<name>" draws a SCENE-01 illustration instead, only where a block asks for one. -->
<script setup lang="ts">
import type { SceneName } from '~/data/scenes';

const props = withDefaults(
  defineProps<{
    src?: string;
    alt: string;
    ratio?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    scene?: SceneName | 'none';
  }>(),
  { src: '', ratio: '16 / 10', width: 1200, height: 750, priority: false, scene: undefined },
);
// Placeholders stay empty grey boxes with the house icon. A drawn scene only when a block asks for one by name.
const sceneName = computed(() => (props.scene === 'none' ? undefined : props.scene));
</script>

<template>
  <img
    v-if="src"
    class="media"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :style="ratio === 'auto' ? undefined : { aspectRatio: ratio }"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
  />
  <div
    v-else
    class="media -empty"
    role="img"
    :aria-label="alt"
    :style="ratio === 'auto' ? undefined : { aspectRatio: ratio }"
  >
    <UiScene v-if="sceneName" :name="sceneName" />
    <UiIcon v-else name="house" class="media__icon" />
  </div>
</template>

<style scoped>
.media {
  display: block;
  width: 100%;
  object-fit: cover;
  background: var(--color-placeholder);
}
.media.-empty {
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--color-ink-500);
}
.media.-empty > .scene {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
}
.media__icon {
  font-size: clamp(1.5rem, 8%, 3rem);
  opacity: 0.55;
}
.media.-fill {
  height: 100%;
}
.media.-round {
  border-radius: var(--radius-md);
}
</style>
