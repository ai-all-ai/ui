<script setup lang="ts">
// SELECT-01 · Select molecule: native select with a label, a required marker and a message after the field is left.
import { useId } from 'vue';
import messages from '~~/i18n/locales/es';

const props = withDefaults(
  defineProps<{
    label: string;
    options: { value: string; label: string }[];
    required?: boolean;
    placeholder?: string;
  }>(),
  { required: false, placeholder: '' },
);
const model = defineModel<string>({ default: '' });
const touched = ref(false);
const uid = useId();
const m = messages.ui.form;
const showError = computed(() => touched.value && props.required && !model.value);
</script>

<template>
  <div class="select" :class="{ '-error': showError }">
    <div class="select__head">
      <label class="select__label" :for="uid"
        >{{ label }}<span v-if="required" class="select__req" aria-hidden="true"> *</span></label
      >
      <span v-if="showError" :id="`${uid}-msg`" class="select__error" role="alert">{{
        m.select
      }}</span>
    </div>
    <div class="select__control">
      <select
        :id="uid"
        v-model="model"
        class="select__input"
        :required="required"
        :aria-invalid="showError ? 'true' : undefined"
        :aria-describedby="showError ? `${uid}-msg` : undefined"
        @blur="touched = true"
      >
        <option value="" disabled>{{ placeholder || m.select }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <span class="select__chevron" aria-hidden="true"
        ><UiIcon name="chevron-down-small" :width="16" :height="16"
      /></span>
    </div>
  </div>
</template>

<style scoped>
.select {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}
.select__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 1.2rem;
}
.select__label {
  flex: none;
  color: var(--color-ink-600);
  font-size: 0.84rem;
  font-weight: 600;
}
.select__req {
  color: var(--color-danger);
}
.select__error {
  color: var(--color-danger);
  font-size: 0.76rem;
  font-weight: 600;
}
.select__control {
  position: relative;
}
.select__chevron {
  position: absolute;
  top: 50%;
  right: var(--control-pad-x);
  display: grid;
  place-items: center;
  transform: translateY(-50%);
  color: var(--color-ink-600);
  pointer-events: none;
}
.select__input {
  box-sizing: border-box;
  appearance: none;
  width: 100%;
  height: var(--control-height);
  padding: 0 calc(var(--control-pad-x) + 1.5rem) 0 var(--control-pad-x);
  border: 1px solid var(--line);
  border-radius: var(--radius-ui);
  background: var(--color-white);
  color: var(--color-ink);
  font: inherit;
  font-size: var(--control-font);
}
.select__input:has(option[value='']:checked) {
  color: var(--control-placeholder);
}
.select__input option {
  color: var(--color-ink);
}
.select__input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.select.-error .select__input {
  border-color: var(--color-danger);
}
</style>
