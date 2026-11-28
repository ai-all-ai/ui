<script setup lang="ts">
// TAG-01 · Tag: a short label or category; small or medium. -hover and -focus force a state for the brandbook.
// Tag: Solid, outline or muted; a link when `href` is set; `onDark` for dark bands.
withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'muted';
    size?: 'small' | 'md';
    href?: string;
    onDark?: boolean;
  }>(),
  { variant: 'muted', size: 'md', href: undefined, onDark: false },
);
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    class="tag"
    :class="[
      variant === 'muted' ? '' : `-${variant}`,
      { '-small': size === 'small', '-on-dark': onDark },
    ]"
    :href="href"
  >
    <slot />
  </component>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.2rem 0.65rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
  background: var(--color-accent-soft);
  color: var(--color-ink-700);
}
.tag {
  &.-solid {
    background: var(--color-brand);
    color: var(--color-brand-contrast);
  }
  &.-outline {
    background: transparent;
    border-color: var(--color-line-strong);
    color: var(--color-ink);
  }
  &.-solid.-on-dark {
    background: var(--color-inverse-ink);
    color: var(--color-inverse);
  }
  &.-outline.-on-dark {
    border-color: var(--color-inverse-line);
    color: var(--color-inverse-ink);
  }
  &.-on-dark:not(.-solid, .-outline) {
    background: var(--color-inverse-soft);
    color: var(--color-inverse-ink);
  }
  &.-small {
    padding: 0.05rem 0.5rem;
    font-size: 0.6875rem;
  }
  &:focus-visible,
  &.-focus {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
  &:hover,
  &.-hover {
    border-color: var(--color-ink);
  }
}
</style>
