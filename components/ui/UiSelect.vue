<script setup lang="ts">
import { computed, ref, useId } from 'vue';

// Select: native select with a label, a placeholder option and an error after the field is left.
const props = withDefaults(
  defineProps<{
    label: string;
    size?: 'small' | 'md' | 'big';
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
  <div
    class="select"
    :class="{ '-error': showError, '-small': size === 'small', '-big': size === 'big' }"
  >
    <label class="label" :for="uid">
      {{ label }}<span v-if="required" class="req" aria-hidden="true"> *</span>
    </label>
    <div class="control">
      <select
        :id="uid"
        v-model="model"
        class="input"
        :class="{ '-empty': !model }"
        :required="required"
        :aria-invalid="showError || undefined"
        :aria-describedby="showError ? `${uid}-error` : undefined"
        @blur="touched = true"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <span class="chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
      </span>
    </div>
    <p v-if="showError" :id="`${uid}-error`" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.select {
  --field-height: var(--control-height);
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}
.select {
  .label {
    color: var(--color-ink-700);
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .req,
  .error {
    color: var(--color-danger);
  }
  .control {
    position: relative;
  }
  .input {
    width: 100%;
    min-height: var(--field-height);
    padding: 0 calc(var(--space-2) + 2.25rem) 0 var(--control-pad-x);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-ui);
    background: var(--color-surface);
    color: var(--color-ink);
    font: inherit;
    font-size: var(--control-font);
    appearance: none;
  }
}
.input.-empty {
  color: var(--control-placeholder);
}
.input option {
  color: var(--color-ink);
}
.select {
  .chevron {
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
}
.chevron svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.control:hover .chevron {
  background: var(--color-line);
}
.select {
  &.-error .input {
    border-color: var(--color-danger);
  }
  .error {
    margin: 0;
    font-size: var(--text-xs);
    font-weight: 600;
  }
}
.select.-small {
  --field-height: var(--control-height-small, 2.25rem);
}
.select.-big {
  --field-height: var(--control-height-big, 3.25rem);
}
</style>
