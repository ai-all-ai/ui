<script setup lang="ts">
import { computed, ref, useId } from 'vue';

// SELECT-01 · Select: native select with a label, a placeholder option and an error after the field is left.
const props = withDefaults(
  defineProps<{
    label: string;
    options: { value: string; label: string }[];
    required?: boolean;
    placeholder?: string;
    error?: string;
  }>(),
  { required: false, placeholder: 'Choose…', error: 'Choose an option' },
);
const model = defineModel<string>({ default: '' });
const touched = ref(false);
const uid = useId();
const showError = computed(() => touched.value && props.required && !model.value);
</script>

<template>
  <div class="select" :class="{ '-error': showError }">
    <label class="select__label" :for="uid">
      {{ label }}<span v-if="required" class="select__req" aria-hidden="true"> *</span>
    </label>
    <div class="select__control">
      <select
        :id="uid"
        v-model="model"
        class="select__input"
        :class="{ '-empty': !model }"
        :required="required"
        :aria-invalid="showError || undefined"
        :aria-describedby="showError ? `${uid}-error` : undefined"
        @blur="touched = true"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <span class="select__chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </div>
    <p v-if="showError" :id="`${uid}-error`" class="select__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.select {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}
.select__label {
  color: var(--color-ink-700);
  font-size: var(--text-sm);
  font-weight: 600;
}
.select__req,
.select__error {
  color: var(--color-danger);
}
.select__control {
  position: relative;
}
.select__input {
  width: 100%;
  min-height: var(--control-height);
  padding: 0 calc(var(--space-2) + 2.25rem) 0 var(--control-pad-x);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-ui);
  background: var(--color-surface);
  color: var(--color-ink);
  font: inherit;
  font-size: var(--control-font);
  appearance: none;
}
.select__input.-empty {
  color: var(--control-placeholder);
}
.select__input option {
  color: var(--color-ink);
}
.select__input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.select__chevron {
  position: absolute;
  inset-block: 0;
  right: var(--space-2);
  margin-block: auto;
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border-radius: 50%;
  background: var(--color-accent-soft);
  color: var(--color-ink);
  pointer-events: none;
}
.select__chevron svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.select__control:hover .select__chevron {
  background: var(--color-line);
}
.select.-error .select__input {
  border-color: var(--color-danger);
}
.select__error {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 600;
}
</style>
