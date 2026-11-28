<script setup lang="ts">
import { ref, useId } from 'vue';

// Accordion: questions that open one at a time (opening one closes the rest) on native <details>.
// Variants: card (default), plain (lines between) and accent (the open question is filled). `open` is the index
// open at start; `exclusive: false` lets several stay open.
const props = withDefaults(
  defineProps<{
    items: { q: string; a: string }[];
    open?: number;
    variant?: 'card' | 'plain' | 'accent';
    exclusive?: boolean;
  }>(),
  { open: -1, variant: 'card', exclusive: true },
);
const group = useId();
const root = ref<HTMLElement | null>(null);
// The shared name makes browsers close the others; this handler does the same where `name` is not supported.
const onToggle = (e: Event) => {
  const el = e.target as HTMLDetailsElement;
  if (!props.exclusive || !el.open) return;
  root.value?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => {
    if (d !== el) d.open = false;
  });
};
</script>

<template>
  <div ref="root" class="faq" :class="variant === 'card' ? '' : `-${variant}`">
    <details
      v-for="(it, i) in items"
      :key="it.q"
      class="item"
      :name="exclusive ? group : undefined"
      :open="open === i || undefined"
      @toggle="onToggle"
    >
      <summary class="q">
        <span>{{ it.q }}</span>
        <svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <p class="a">{{ it.a }}</p>
    </details>
  </div>
</template>

<style scoped>
.faq {
  display: grid;
  gap: var(--space-2);

  .item {
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    &[open] .chev {
      transform: rotate(180deg);
    }
  }

  .q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-6);
    color: var(--color-ink);
    font-weight: 600;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    &:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: -2px;
      border-radius: var(--radius-lg);
    }
  }

  .chev {
    flex: none;
    width: 1.1rem;
    height: 1.1rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    transition: transform 180ms ease;
  }

  .a {
    margin: 0;
    padding: 0 var(--space-6) var(--space-4);
    color: var(--color-ink-600);
    line-height: 1.6;
  }

  &.-plain {
    gap: 0;

    .item {
      border: 0;
      border-bottom: 1px solid var(--color-line);
      border-radius: 0;
      background: none;
    }

    .q {
      padding: var(--space-3) 0;
    }

    .a {
      padding: 0 0 var(--space-3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chev {
      transition: none;
    }
  }

  &.-accent .item[open] {
    overflow: hidden;
    border-color: var(--color-brand);

    .q {
      background: var(--color-brand);
      color: var(--color-brand-contrast);
    }

    .a {
      padding-top: var(--space-4);
    }
  }
}
</style>
