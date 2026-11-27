<script setup lang="ts">
// CHECK-01 · Checkbox: native input with a custom box. Checked and disabled are modifiers.
defineProps<{ label: string; disabled?: boolean }>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <label class="check" :class="{ '-checked': model, '-disabled': disabled }">
    <input v-model="model" class="input" type="checkbox" :disabled="disabled" />
    <span class="box" aria-hidden="true" />
    <span class="label">{{ label }}</span>
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
.check {
  .input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    opacity: 0;
  }
  .box {
    display: grid;
    flex: none;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
  }
}
.input:focus-visible + .box {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.check {
  &.-checked .box {
    border-color: var(--color-brand);
    background: var(--color-brand);
  }
  &.-checked .box::after {
    content: '';
    width: 0.35rem;
    height: 0.65rem;
    border: solid var(--color-brand-contrast);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }
  &.-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
