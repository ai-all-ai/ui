<script setup lang="ts">
// IMG-01 · Image: width and height always set so the box is reserved before load (no layout shift).
// Lazy by default; `priority` loads it eagerly with high fetch priority for the first screen.
withDefaults(
  defineProps<{
    src: string;
    alt: string;
    width: number;
    height: number;
    srcset?: string;
    sizes?: string;
    priority?: boolean;
  }>(),
  { srcset: undefined, sizes: '100vw', priority: false },
);
</script>

<template>
  <img
    class="img"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :srcset="srcset"
    :sizes="srcset ? sizes : undefined"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
  />
</template>

<style scoped>
.img {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
