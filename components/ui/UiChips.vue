<script setup lang="ts">
// CHIPS-01 · Chips molecule: a legend and a row of pills to pick from. One choice by default; `multiple` allows several (the model is then a list).
const props = withDefaults(
  defineProps<{ legend: string; options: string[]; multiple?: boolean }>(),
  { multiple: false },
);
const model = defineModel<string | string[]>({ default: '' });
const isOn = (option: string) =>
  props.multiple ? (model.value as string[]).includes(option) : model.value === option;
const toggle = (option: string) => {
  if (!props.multiple) {
    model.value = isOn(option) ? '' : option;
    return;
  }
  const list = model.value as string[];
  model.value = list.includes(option) ? list.filter((o) => o !== option) : [...list, option];
};
</script>

<template>
  <fieldset class="chips">
    <legend class="chips__legend">{{ legend }}</legend>
    <div class="chips__row">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="chips__chip"
        :class="{ '-on': isOn(option) }"
        :aria-pressed="isOn(option)"
        @click="toggle(option)"
      >
        {{ option }}
      </button>
    </div>
  </fieldset>
</template>
