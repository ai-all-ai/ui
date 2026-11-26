<script setup lang="ts">
// SWITCH-01 · Switch atom: on/off toggle with role="switch". On and disabled are modifiers.
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
      :aria-checked="model"
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
  gap: 0.7rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--color-ink);
}
.switch__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}
.switch__track {
  position: relative;
  width: 2.6rem;
  height: 1.5rem;
  flex: 0 0 2.6rem;
  border-radius: 999px;
  background: var(--color-sand);
  border: 1px solid var(--line);
  transition: background-color 180ms ease;
}
.switch__thumb {
  position: absolute;
  top: 50%;
  left: 0.2rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-white);
  transform: translateY(-50%);
  transition: left 180ms ease;
}
.switch.-on .switch__track {
  background: var(--color-champagne);
  border-color: var(--color-champagne);
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
</style>
