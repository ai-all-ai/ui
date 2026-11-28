<script setup lang="ts">
// Switch: on/off toggle with role="switch". On and disabled are modifiers.
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="switch" :class="{ '-on': model, '-disabled': disabled }">
    <input v-model="model" class="input" type="checkbox" role="switch" :disabled="disabled" />
    <span class="track" aria-hidden="true"><span class="thumb" /></span>
    <span class="label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-ink);
  font-size: var(--text-base);
  font-weight: 400;
  cursor: pointer;
}
.switch {
  .input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    opacity: 0;
  }
  .track {
    position: relative;
    flex: none;
    width: 2.6rem;
    height: 1.5rem;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-pill);
    background: var(--color-surface-muted);
    transition: background-color 180ms ease;
  }
  .thumb {
    position: absolute;
    top: 50%;
    left: 0.2rem;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    transform: translateY(-50%);
    transition: left 180ms ease;
  }
  &.-on .track {
    border-color: var(--color-brand);
    background: var(--color-brand);
  }
  &.-on .thumb {
    left: calc(100% - 1.2rem);
  }
}
.input:focus-visible + .track {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.switch {
  &.-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
@media (prefers-reduced-motion: reduce) {
  .track,
  .thumb {
    transition: none;
  }
}
</style>
