<script setup lang="ts">
// BTN-01..05 · Button: primary, secondary, outline, ghost or link; small, medium or big; `onDark` for dark bands.
// States: hover, active (pressed), focus-visible, disabled, loading. The -hover, -active and -focus
// classes force a state for the brandbook only. Icons go in the slot (UiIcon); `square` makes an icon-only button.
withDefaults(
  defineProps<{
    href?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'small' | 'md' | 'big';
    onDark?: boolean;
    block?: boolean;
    square?: boolean;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    href: undefined,
    variant: 'primary',
    size: 'md',
    onDark: false,
    block: false,
    square: false,
    loading: false,
    disabled: false,
    type: 'button',
  },
);
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="btn"
    :class="[
      `-${variant}`,
      size === 'md' ? '' : `-${size}`,
      { '-on-dark': onDark, '-block': block, '-square': square, '-loading': loading },
    ]"
    :href="href && !disabled ? href : undefined"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled || loading"
    :aria-disabled="href && disabled ? 'true' : undefined"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
.btn {
  --btn-bg: var(--color-brand);
  --btn-ink: var(--color-brand-contrast);
  --btn-line: transparent;
  --btn-bg-hover: var(--color-brand-hover);
  --btn-ink-hover: var(--btn-ink);
  --btn-line-hover: var(--btn-line);
  --btn-ring: var(--focus-ring);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--space-6);
  border: 1px solid var(--btn-line);
  border-radius: var(--radius-pill);
  background: var(--btn-bg);
  color: var(--btn-ink);
  font: inherit;
  font-size: var(--text-base);
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    transform 120ms ease;
}
.btn {
  & :deep(svg) {
    width: 1.15em;
    height: 1.15em;
    flex: none;
  }
}
/* Variants on light surfaces */
.btn {
  &.-secondary {
    --btn-bg: var(--color-accent-soft);
    --btn-ink: var(--color-ink);
    --btn-bg-hover: var(--color-line);
  }
  &.-outline {
    --btn-bg: var(--color-surface);
    --btn-ink: var(--color-ink);
    --btn-line: var(--color-line-strong);
    --btn-bg-hover: var(--color-surface);
    --btn-line-hover: var(--color-ink);
  }
  &.-ghost {
    --btn-bg: transparent;
    --btn-ink: var(--color-ink);
    --btn-bg-hover: var(--color-accent-soft);
  }
  &.-link {
    --btn-bg: transparent;
    --btn-ink: var(--color-brand);
    --btn-bg-hover: transparent;
    --btn-ink-hover: var(--color-brand-hover);
    min-height: auto;
    padding: 0;
    border-radius: var(--radius-sm);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}
/* Variants on dark surfaces */
.btn {
  &.-on-dark {
    --btn-ring: var(--color-inverse-ink);
  }
  &.-primary.-on-dark {
    --btn-bg: var(--color-inverse-ink);
    --btn-ink: var(--color-inverse);
    --btn-bg-hover: var(--color-inverse-ink-600);
  }
  &.-secondary.-on-dark {
    --btn-bg: var(--color-inverse-soft);
    --btn-ink: var(--color-inverse-ink);
    --btn-bg-hover: var(--color-inverse-line);
  }
  &.-outline.-on-dark {
    --btn-bg: transparent;
    --btn-ink: var(--color-inverse-ink);
    --btn-line: var(--color-inverse-line);
    --btn-bg-hover: var(--color-inverse-soft);
    --btn-line-hover: var(--color-inverse-ink);
  }
  &.-ghost.-on-dark {
    --btn-ink: var(--color-inverse-ink);
    --btn-bg-hover: var(--color-inverse-soft);
  }
  &.-link.-on-dark {
    --btn-ink: var(--color-inverse-ink);
    --btn-ink-hover: var(--color-inverse-ink-600);
  }
}
/* Sizes and shapes */
.btn {
  &.-small {
    min-height: 2.25rem;
    padding: 0 var(--space-4);
    font-size: var(--text-sm);
  }
  &.-big {
    min-height: 3.25rem;
    padding: 0 var(--space-8);
    font-size: var(--text-lead);
  }
  &.-link.-small,
  &.-link.-big {
    min-height: auto;
    padding: 0;
  }
  &.-block {
    width: 100%;
  }
  &.-square {
    width: var(--control-height);
    padding: 0;
  }
  &.-square.-small {
    width: 2.25rem;
  }
  &.-square.-big {
    width: 3.25rem;
  }
}
/* States */
.btn {
  &:hover,
  &.-hover {
    border-color: var(--btn-line-hover);
    background: var(--btn-bg-hover);
    color: var(--btn-ink-hover);
  }
  &:active,
  &.-active {
    transform: translateY(1px) scale(0.98);
  }
  &:focus-visible,
  &.-focus {
    outline: 2px solid var(--btn-ring);
    outline-offset: 2px;
  }
  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
  &.-loading {
    opacity: 1;
    cursor: progress;
  }
  .spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: btn-spin 700ms linear infinite;
  }
}
@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
  .btn:active,
  .btn.-active {
    transform: none;
  }
  .spinner {
    animation-duration: 2s;
  }
}
</style>
