<script setup lang="ts">
// Responsive image. Reads the variant manifest written by `npm run images`
// (app/data/image-variants.json) and builds srcset from the -400/-800/-1200 WebP files.
// Images without a manifest entry (SVG, small files) render as a plain <img>.
// Paths are site paths; asset() puts them under the base URL.
import { computed } from 'vue';
import variants from '~/data/image-variants.json';
import imageSizes from '~/data/image-sizes.json';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    sizes?: string;
    loading?: 'lazy' | 'eager';
    fetchpriority?: 'high' | 'low' | 'auto';
  }>(),
  { alt: '', sizes: '100vw', loading: undefined, fetchpriority: undefined },
);

// Intrinsic size from app/data/image-sizes.json, so the browser reserves the box before load.
const dims = computed<[number, number] | undefined>(
  () => (imageSizes as Record<string, [number, number]>)[props.src],
);

const widths = computed<number[]>(() => (variants as Record<string, number[]>)[props.src] ?? []);

// The original stays as the largest candidate, so high-DPR screens still get full resolution
// (the variants stop at 1200w).
const srcset = computed(() =>
  widths.value.length
    ? [
        ...widths.value.map((w) => `${asset(props.src.replace(/\.webp$/, `-${w}.webp`))} ${w}w`),
        `${asset(props.src)} 2400w`,
      ].join(', ')
    : undefined,
);
</script>

<template>
  <img
    v-bind="$attrs"
    :width="$attrs.width ?? dims?.[0]"
    :height="$attrs.height ?? dims?.[1]"
    :src="asset(src)"
    :srcset="srcset"
    :sizes="srcset ? props.sizes : undefined"
    :alt="alt"
    :loading="loading"
    :fetchpriority="fetchpriority"
    decoding="async"
  />
</template>
