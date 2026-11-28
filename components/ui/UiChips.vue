<script setup lang="ts">
import { computed } from 'vue';

// Chips: a legend and options to pick one (default) or several (`multiple`).
// Variants from the sites: pill (outlined pills), soft (quiet, no border), segment (all options in one shared
// track, like a segmented control) and tile (equal tiles with an icon over the label, for category bars).
// Sizes small and md; `onDark` for dark bands; `hideLegend` keeps the legend for screen readers only.
// States: hover, selected (-on), focus, disabled; -hover and -focus force a state for the brandbook only.
// Icons for tiles come through the `icon` slot: <template #icon="{ option }"><UiIcon :name="option.icon" /></template>.
type Option = string | { value: string; label: string; icon?: string };
const props = withDefaults(
  defineProps<{
    legend: string;
    options: Option[];
    multiple?: boolean;
    variant?: 'pill' | 'soft' | 'segment' | 'tile';
    size?: 'small' | 'md';
    onDark?: boolean;
    hideLegend?: boolean;
    disabled?: boolean;
    inline?: boolean; // the legend on the left of the choices, on one line (a group, not a fieldset)
  }>(),
  {
    multiple: false,
    variant: 'pill',
    size: 'md',
    onDark: false,
    hideLegend: false,
    disabled: false,
  },
);
const model = defineModel<string | string[]>({ default: '' });
const items = computed(() =>
  props.options.map((o) => (typeof o === 'string' ? { value: o, label: o, icon: undefined } : o)),
);
const isOn = (value: string) =>
  props.multiple ? (model.value as string[]).includes(value) : model.value === value;
const toggle = (value: string) => {
  if (!props.multiple) {
    // A segment always has one choice; other variants can be cleared by a second click.
    model.value = isOn(value) && props.variant !== 'segment' ? '' : value;
    return;
  }
  const list = model.value as string[];
  model.value = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
};
</script>

<template>
  <!-- a fieldset with a legend above (default); with `inline` a group with the label on the left, on one line -->
  <component
    :is="inline ? 'div' : 'fieldset'"
    class="chips"
    :class="[
      variant === 'pill' ? '' : `-${variant}`,
      { '-small': size === 'small', '-on-dark': onDark, '-inline': inline },
    ]"
    :role="inline ? 'group' : undefined"
    :aria-label="inline ? legend : undefined"
  >
    <component :is="inline ? 'span' : 'legend'" class="legend" :class="{ '-hidden': hideLegend }">{{
      legend
    }}</component>
    <div class="row">
      <button
        v-for="it in items"
        :key="it.value"
        type="button"
        class="chip"
        :class="{ '-on': isOn(it.value) }"
        :aria-pressed="isOn(it.value)"
        :disabled="disabled"
        @click="toggle(it.value)"
      >
        <span v-if="$slots.icon" class="icon"><slot name="icon" :option="it" /></span>
        <span>{{ it.label }}</span>
      </button>
    </div>
  </component>
</template>

<style scoped>
.chips {
  --chip-ink: var(--color-ink);
  --chip-line: var(--color-line-strong);
  --chip-bg: var(--color-surface);
  --chip-hover: var(--color-accent-soft);
  --chip-on-bg: var(--color-brand);
  --chip-on-ink: var(--color-brand-contrast);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  &.-on-dark {
    --chip-ink: var(--color-inverse-ink);
    --chip-line: var(--color-inverse-line);
    --chip-bg: transparent;
    --chip-hover: var(--color-inverse-soft);
    --chip-on-bg: var(--color-inverse-ink);
    --chip-on-ink: var(--color-inverse);

    .legend {
      color: var(--color-inverse-ink-600);
    }
    &.-focus .chip.-on,
    .chip:focus-visible {
      outline-color: var(--color-inverse-ink);
    }
  }

  &.-inline {
    display: flex;
    align-items: center;
    gap: var(--space-2);

    .legend {
      margin: 0;
      white-space: nowrap;
    }
  }

  .legend {
    margin-bottom: var(--space-2);
    padding: 0;
    color: var(--color-ink-700);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 2.25rem;
    padding: 0 var(--space-4);
    border: 1px solid var(--chip-line);
    border-radius: var(--radius-pill);
    background: var(--chip-bg);
    color: var(--chip-ink);
    font: inherit;
    font-size: var(--text-sm);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }

  .icon {
    display: inline-grid;
    place-items: center;
  }

  /* soft: no border, quiet hover */
  &.-soft .chip {
    border-color: transparent;
    border-radius: var(--radius-md);
    background: transparent;
  }
  &.-soft .chip:hover:not(:disabled),
  &.-soft.-hover .chip:not(.-on) {
    background: var(--chip-hover);
  }
  &.-soft .chip.-on {
    background: var(--chip-on-bg);
  }

  /* segment: one shared track, options share its height */
  &.-segment .row {
    display: inline-flex;
    gap: var(--space-1);
    max-width: 100%;
    padding: var(--space-1);
    overflow-x: auto;
    border: 1px solid var(--chip-line);
    border-radius: var(--radius-pill);
    background: var(--chip-hover);
    scrollbar-width: none;
  }
  &.-segment .chip {
    flex: none;
    border-color: transparent;
    background: transparent;
  }
  &.-segment .chip:hover:not(:disabled),
  &.-segment.-hover .chip:not(.-on) {
    background: var(--chip-hover);
  }
  &.-segment .chip.-on {
    background: var(--chip-on-bg);
    box-shadow: var(--shadow-card);
  }

  /* tile: equal tiles, icon over label, in one card */
  &.-tile .row {
    flex-wrap: nowrap;
    gap: var(--space-1);
    padding: var(--space-2);
    overflow-x: auto;
    border: 1px solid var(--chip-line);
    border-radius: var(--radius-lg);
    background: var(--chip-bg);
    scrollbar-width: none;
  }
  &.-tile .chip {
    flex: 1 0 6.5rem;
    flex-direction: column;
    gap: var(--space-1);
    min-height: 4.5rem;
    padding: var(--space-3) var(--space-2);
    border-color: transparent;
    border-radius: var(--radius-md);
    background: transparent;
  }
  &.-tile .chip:hover:not(:disabled),
  &.-tile.-hover .chip:not(.-on) {
    background: var(--chip-hover);
  }
  &.-tile .chip.-on {
    background: var(--chip-on-bg);
  }

  /* small */
  &.-small .chip {
    min-height: 1.85rem;
    padding: 0 var(--space-3);
    font-size: var(--text-xs);
  }
  &.-small.-tile .chip {
    min-height: 3.5rem;
  }
}
.legend.-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.chip:hover:not(:disabled),
.chips.-hover .chip:not(.-on) {
  border-color: var(--chip-ink);
}
.chip.-on {
  border-color: var(--chip-on-bg);
  background: var(--chip-on-bg);
  color: var(--chip-on-ink);
}
.chip:focus-visible,
.chips.-focus .chip.-on {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .chip {
    transition: none;
  }
}
</style>
