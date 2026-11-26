<script setup lang="ts">
// TABS-01 · Tabs: switch between views of one block (madera, velo). Underline (a line under the active tab) or pill
// (a track with a filled active tab); small or medium; `onDark`. Arrow keys move between tabs. Panels stay with the
// page: give each panel id="<idPrefix>-<tab id>" (pass idPrefix) and role="tabpanel". is-hover/is-focus force a state for the brandbook.
const props = withDefaults(
  defineProps<{
    tabs: { id: string; label: string }[];
    label: string;
    variant?: 'underline' | 'pill';
    size?: 'small' | 'md';
    onDark?: boolean;
    idPrefix?: string;
  }>(),
  { variant: 'underline', size: 'md', onDark: false, idPrefix: undefined },
);
const model = defineModel<string>({ default: '' });
const autoId = useId();
const prefix = computed(() => props.idPrefix ?? autoId);
const list = ref<HTMLElement | null>(null);
const move = (d: number) => {
  const i = props.tabs.findIndex((t) => t.id === model.value);
  const next = props.tabs[(i + d + props.tabs.length) % props.tabs.length];
  if (!next) return;
  model.value = next.id;
  nextTick(() => list.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus());
};
</script>

<template>
  <div
    ref="list"
    class="tabs"
    :class="[`-${variant}`, { '-small': size === 'small', '-on-dark': onDark }]"
    role="tablist"
    :aria-label="label"
    @keydown.right.prevent="move(1)"
    @keydown.left.prevent="move(-1)"
  >
    <button
      v-for="t in tabs"
      :id="`${prefix}-tab-${t.id}`"
      :key="t.id"
      type="button"
      role="tab"
      class="tabs__tab"
      :aria-selected="model === t.id"
      :aria-controls="`${prefix}-${t.id}`"
      :tabindex="model === t.id ? 0 : -1"
      @click="model = t.id"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  --tabs-ink: var(--color-ink);
  --tabs-muted: var(--color-ink-600);
  --tabs-line: var(--color-line);
  --tabs-on-bg: var(--color-brand);
  --tabs-on-ink: var(--color-brand-contrast);
  --tabs-track: var(--color-accent-soft);
  display: flex;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs.-on-dark {
  --tabs-ink: var(--color-inverse-ink);
  --tabs-muted: var(--color-inverse-ink-600);
  --tabs-line: var(--color-inverse-line);
  --tabs-on-bg: var(--color-inverse-ink);
  --tabs-on-ink: var(--color-inverse);
  --tabs-track: var(--color-inverse-soft);
}
.tabs__tab {
  flex: none;
  min-height: 2.75rem;
  padding: 0 var(--space-4);
  border: 0;
  background: transparent;
  color: var(--tabs-muted);
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
.tabs__tab:hover,
.tabs.is-hover .tabs__tab:not([aria-selected='true']) {
  color: var(--tabs-ink);
}
.tabs__tab:focus-visible,
.tabs.is-focus .tabs__tab[aria-selected='true'] {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.tabs.-on-dark .tabs__tab:focus-visible,
.tabs.-on-dark.is-focus .tabs__tab[aria-selected='true'] {
  outline-color: var(--color-inverse-ink);
}
.tabs.-underline {
  gap: var(--space-2);
  border-bottom: 1px solid var(--tabs-line);
}
.tabs.-underline .tabs__tab {
  padding: 0 var(--space-2);
  border-bottom: 2px solid transparent;
}
.tabs.-underline .tabs__tab[aria-selected='true'] {
  border-bottom-color: var(--tabs-ink);
  color: var(--tabs-ink);
}
.tabs.-pill {
  gap: var(--space-1);
  padding: var(--space-1);
  border-radius: var(--radius-pill);
  background: var(--tabs-track);
  width: fit-content;
}
.tabs.-pill .tabs__tab {
  border-radius: var(--radius-pill);
}
.tabs.-pill .tabs__tab[aria-selected='true'] {
  background: var(--tabs-on-bg);
  color: var(--tabs-on-ink);
}
.tabs.-small .tabs__tab {
  min-height: 2.1rem;
  font-size: var(--text-sm);
}
</style>
