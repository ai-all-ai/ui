<script setup lang="ts">
// SWITCH-01 · Switch: on/off toggle with role="switch". On and disabled are modifiers.
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="switch" :class="{ '-on': model, '-disabled': disabled }">
    <input
      v-model="model"
      class="switch__input"
      type="checkbox"
      role="switch"
      :disabled="disabled"
    />
    <span class="switch__track" aria-hidden="true"><span class="switch__thumb" /></span>
    <span class="switch__label">{{ label }}</span>
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
.switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
}
.switch__track {
  position: relative;
  flex: none;
  width: 2.6rem;
  height: 1.5rem;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface-muted);
  transition: background-color 180ms ease;
}
.switch__thumb {
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
.switch.-on .switch__track {
  border-color: var(--color-brand);
  background: var(--color-brand);
}
.switch.-on .switch__thumb {
  left: calc(100% - 1.2rem);
}
.switch__input:focus-visible + .switch__track {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.switch.-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .switch__track,
  .switch__thumb {
    transition: none;
  }
}
</style>
