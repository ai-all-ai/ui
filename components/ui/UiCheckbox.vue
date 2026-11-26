<script setup lang="ts">
// CHECK-01 · Checkbox: native input with a custom box. Checked and disabled are modifiers.
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="check" :class="{ '-checked': model, '-disabled': disabled }">
    <input v-model="model" class="check__input" type="checkbox" :disabled="disabled" />
    <span class="check__box" aria-hidden="true" />
    <span class="check__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.check {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-ink);
  font-size: var(--text-base);
  font-weight: 400;
  cursor: pointer;
}
.check__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
}
.check__box {
  display: grid;
  flex: none;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}
.check__input:focus-visible + .check__box {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.check.-checked .check__box {
  border-color: var(--color-brand);
  background: var(--color-brand);
}
.check.-checked .check__box::after {
  content: '';
  width: 0.35rem;
  height: 0.65rem;
  border: solid var(--color-brand-contrast);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}
.check.-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
