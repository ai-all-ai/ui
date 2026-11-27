<script setup lang="ts">
// COUNTER-01 · Counter: a bounded number with − and + (as in velo). Outline (buttons outside the value) or inner
// (one pill, buttons inside); small or medium; `onDark`. Arrow keys change the value; typing is clamped to min/max.
// The -hover and -focus classes force a state for the brandbook only.
const props = withDefaults(
  defineProps<{
    label: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    variant?: 'outline' | 'inner';
    size?: 'small' | 'md';
    onDark?: boolean;
    disabled?: boolean;
    lessLabel?: string;
    moreLabel?: string;
  }>(),
  {
    min: 0,
    max: 99,
    step: 1,
    unit: '',
    variant: 'outline',
    size: 'md',
    onDark: false,
    disabled: false,
    lessLabel: 'Less',
    moreLabel: 'More',
  },
);
const model = defineModel<number>({ default: 0 });
const clamp = (v: number) => Math.min(props.max, Math.max(props.min, v));
const bump = (d: number) => {
  if (!props.disabled) model.value = clamp(model.value + d * props.step);
};
const onChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const parsed = Number(input.value.replace(',', '.'));
  model.value = Number.isFinite(parsed) ? clamp(parsed) : model.value;
  input.value = String(model.value);
};
</script>

<template>
  <div
    class="counter"
    :class="[
      `-${variant}`,
      { '-small': size === 'small', '-on-dark': onDark, '-disabled': disabled },
    ]"
  >
    <button
      type="button"
      class="btn"
      :aria-label="`${lessLabel}: ${label}`"
      :disabled="disabled || model <= min"
      @click="bump(-1)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12h12" /></svg>
    </button>
    <span class="value">
      <input
        class="input"
        type="text"
        inputmode="decimal"
        role="spinbutton"
        :aria-label="label"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="model"
        :value="model"
        :disabled="disabled"
        @change="onChange"
        @keydown.up.prevent="bump(1)"
        @keydown.down.prevent="bump(-1)"
      />
      <small v-if="unit" class="unit">{{ unit }}</small>
    </span>
    <button
      type="button"
      class="btn"
      :aria-label="`${moreLabel}: ${label}`"
      :disabled="disabled || model >= max"
      @click="bump(1)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 12h12M12 6v12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.counter {
  --counter-h: var(--control-height);
  --counter-ink: var(--color-ink);
  --counter-line: var(--color-line-strong);
  --counter-bg: var(--color-surface);
  --counter-hover: var(--color-accent-soft);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--counter-ink);
}
.counter {
  &.-on-dark {
    --counter-ink: var(--color-inverse-ink);
    --counter-line: var(--color-inverse-line);
    --counter-bg: transparent;
    --counter-hover: var(--color-inverse-soft);
  }
  &.-small {
    --counter-h: 2.25rem;
    font-size: var(--text-sm);
  }
  .btn {
    display: grid;
    flex: none;
    width: var(--counter-h);
    height: var(--counter-h);
    place-items: center;
    padding: 0;
    border: 1px solid var(--counter-line);
    border-radius: 50%;
    background: var(--counter-bg);
    color: inherit;
    cursor: pointer;
  }
}
.btn svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}
.btn:hover:not(:disabled),
.counter.-hover .btn:last-child {
  border-color: var(--counter-ink);
  background: var(--counter-hover);
}
.btn:focus-visible,
.counter.-focus .btn:last-child {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.counter {
  &.-on-dark .btn:focus-visible,
  &.-on-dark.-focus .btn:last-child {
    outline-color: var(--color-inverse-ink);
  }
}
.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.counter {
  .value {
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--space-1);
    min-width: 3ch;
  }
  .input {
    width: 4ch;
    min-height: auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    text-align: center;
  }
}
.input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
.counter {
  .unit {
    color: var(--color-ink-500);
  }
  &.-on-dark .unit {
    color: var(--color-inverse-ink-600);
  }
  &.-inner {
    gap: 0;
    height: var(--counter-h);
    padding: 0 var(--space-1);
    border: 1px solid var(--counter-line);
    border-radius: var(--radius-pill);
    background: var(--counter-bg);
  }
  &.-inner .btn {
    width: calc(var(--counter-h) - 0.5rem);
    height: calc(var(--counter-h) - 0.5rem);
    border-color: transparent;
  }
  &.-disabled {
    opacity: 0.5;
  }
}
</style>
