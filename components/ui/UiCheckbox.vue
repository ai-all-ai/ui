<script setup lang="ts">
// CHECK-01 · Checkbox: native input with a custom box. Checked and disabled are modifiers.
defineProps<{ modelValue: boolean; label: string; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<template>
  <label class="check" :class="{ '-checked': modelValue, '-disabled': disabled }">
    <input
      class="check__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="check__box" aria-hidden="true" />
    <span class="check__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.check {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--color-ink);
}
.check__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}
.check__box {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 1.25rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--color-white);
}
.check__input:focus-visible + .check__box {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.check.-checked .check__box {
  background: var(--color-champagne);
  border-color: var(--color-champagne);
}
.check.-checked .check__box::after {
  content: '';
  width: 0.35rem;
  height: 0.65rem;
  border: solid var(--color-olive);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}
.check.-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
