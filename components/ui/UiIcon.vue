<script setup lang="ts">
import { computed } from 'vue';

// ICON-01 · Line icon on a 24px grid, 1.5 stroke, colour from currentColor. Decorative unless `label` is passed.
export type UiIconName =
  | 'check'
  | 'copy'
  | 'close'
  | 'plus'
  | 'minus'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'info'
  | 'search'
  | 'image';
const props = defineProps<{ name: UiIconName; label?: string }>();
const paths: Record<UiIconName, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-right': 'M9 6l6 6-6 6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  info: 'M12 11v6M12 7.5v.5M3 12a9 9 0 1018 0 9 9 0 00-18 0z',
  search: 'M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L20 20',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1 1 0 100-.01',
};
const d = computed(() => paths[props.name]);
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  flex: none;
}
</style>
