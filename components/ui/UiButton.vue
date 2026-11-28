<script setup lang="ts">
// Default button; primary, secondary, outline, ghost or link are opt-in; small and big are opt-in; `onDark` for dark bands.
// States: hover, active (pressed), focus-visible, disabled, loading. The -hover, -active and -focus
// classes force a state for the brandbook only. Icons go in the slot (UiIcon); `square` makes an icon-only button.
withDefaults(
  defineProps<{
    href?: string;
    variant?:
      | 'primary'
      | 'secondary'
      | 'bright'
      | 'light'
      | 'outline'
      | 'ghost'
      | 'transparent'
      | 'link';
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
    variant: undefined,
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
    data-ui-button
    :class="[
      variant ? `-${variant}` : '',
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
  appearance: none;
  box-sizing: border-box;
  margin: 0;
  vertical-align: middle;
  text-align: center;
  text-transform: none;
  letter-spacing: inherit;
  --btn-bg: var(--ui-button-background, var(--color-ink));
  --btn-ink: var(--ui-button-color, var(--color-paper));
  --btn-line: transparent;
  --btn-bg-hover: var(--ui-button-hover-background, var(--color-ink-700));
  --btn-ink-hover: var(--ui-button-hover-color, var(--btn-ink));
  --btn-line-hover: var(--btn-line);
  --btn-ring: var(--focus-ring);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  --btn-height: var(--control-height);
  min-height: var(--btn-height);
  padding: 0 var(--ui-button-padding-inline, var(--space-6));
  border: 1px solid var(--btn-line);
  border-radius: var(--radius-pill);
  background: var(--btn-bg);
  color: var(--btn-ink);
  font: inherit;
  font-size: var(--ui-button-font-size, var(--text-base));
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

  & :deep(svg) {
    width: 1.15em;
    height: 1.15em;
    flex: none;
  }

  /* Variants on light surfaces */
  &.-primary {
    --btn-bg: var(--ui-button-primary-background, var(--color-brand));
    --btn-ink: var(--ui-button-primary-color, var(--color-brand-contrast));
    --btn-bg-hover: var(--ui-button-primary-hover-background, var(--color-brand-hover));
    --btn-ink-hover: var(--ui-button-primary-hover-color, var(--btn-ink));
  }
  &.-secondary {
    --btn-ink-hover: var(--ui-button-secondary-hover-color, var(--btn-ink));
    --btn-bg: var(--ui-button-secondary-background, var(--color-accent-soft));
    --btn-ink: var(--ui-button-secondary-color, var(--color-ink));
    --btn-bg-hover: var(--ui-button-secondary-hover-background, var(--color-line));
  }
  &.-bright {
    --btn-bg: var(--ui-button-bright-background, var(--color-ink-700));
    --btn-ink: var(--ui-button-bright-color, var(--color-surface));
    --btn-bg-hover: var(--ui-button-bright-hover-background, var(--color-ink));
    --btn-ink-hover: var(--ui-button-bright-hover-color, var(--btn-ink));
  }
  &.-light {
    --btn-bg: var(--ui-button-light-background, var(--color-surface));
    --btn-ink: var(--ui-button-light-color, var(--color-ink));
    --btn-bg-hover: var(--ui-button-light-hover-background, var(--color-surface-muted));
    --btn-ink-hover: var(--ui-button-light-hover-color, var(--btn-ink));
  }
  &.-outline {
    --btn-ink-hover: var(--btn-ink);
    --btn-bg: var(--color-surface);
    --btn-ink: var(--color-ink);
    --btn-line: var(--color-line-strong);
    --btn-bg-hover: var(--color-surface);
    --btn-line-hover: var(--color-ink);
  }
  &.-ghost {
    --btn-ink-hover: var(--btn-ink);
    --btn-bg: transparent;
    --btn-ink: var(--color-ink);
    --btn-bg-hover: var(--color-accent-soft);
  }
  &.-transparent {
    --btn-bg: transparent;
    --btn-ink: var(--ui-button-transparent-color, var(--color-ink));
    --btn-bg-hover: var(--ui-button-transparent-hover-background, var(--color-accent-soft));
    --btn-ink-hover: var(--ui-button-transparent-hover-color, var(--btn-ink));
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

  /* Variants on dark surfaces */
  &.-on-dark {
    --btn-ring: var(--color-inverse-ink);
  }
  &.-on-dark:not(.-secondary, .-bright, .-light, .-outline, .-ghost, .-transparent, .-link) {
    --btn-ink-hover: var(--btn-ink);
    --btn-bg: var(--ui-button-inverse-background, var(--color-inverse-ink));
    --btn-ink: var(--ui-button-inverse-color, var(--color-inverse));
    --btn-bg-hover: var(--ui-button-inverse-hover-background, var(--color-inverse-ink-600));
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
  &.-transparent.-on-dark {
    --btn-ink: var(--color-inverse-ink);
    --btn-bg-hover: var(--color-inverse-soft);
    --btn-ink-hover: var(--color-inverse-ink);
  }
  &.-link.-on-dark {
    --btn-ink: var(--color-inverse-ink);
    --btn-ink-hover: var(--color-inverse-ink-600);
  }

  /* Sizes and shapes */
  &.-small {
    --btn-height: var(--control-height-small, 2.25rem);
    padding: 0 var(--ui-button-small-padding-inline, var(--space-4));
    font-size: var(--ui-button-small-font-size, var(--text-sm));
  }
  &.-big {
    --btn-height: var(--control-height-big, 3.25rem);
    padding: 0 var(--ui-button-big-padding-inline, var(--space-8));
    font-size: var(--ui-button-big-font-size, var(--text-lead));
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
    width: var(--btn-height);
    padding: 0;
  }

  /* States */
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

  @media (prefers-reduced-motion: reduce) {
    & {
      transition: none;
    }
    &:active,
    &.-active {
      transform: none;
    }
    .spinner {
      animation-duration: 2s;
    }
  }
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
