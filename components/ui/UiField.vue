<script setup lang="ts">
import { computed, ref, useId } from 'vue';

// FIELD-01 · Text field: label, input or textarea, hint and an error shown after the field is left.
// The browser validates (required, type=email, pattern); `error` is the message shown when it fails.
const props = withDefaults(
  defineProps<{
    label: string;
    size?: 'small' | 'md' | 'big';
    kind?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'textarea';
    required?: boolean;
    placeholder?: string;
    hint?: string;
    error?: string;
    autocomplete?: string;
  }>(),
  {
    kind: 'text',
    required: false,
    placeholder: undefined,
    hint: undefined,
    error: 'Check this field',
    autocomplete: undefined,
  },
);
const model = defineModel<string>({ default: '' });
const uid = useId();
const invalid = ref(false);
const onBlur = (e: FocusEvent) => {
  invalid.value = !(e.target as HTMLInputElement | HTMLTextAreaElement).checkValidity();
};
const describedBy = computed(
  () =>
    [props.hint && `${uid}-hint`, invalid.value && `${uid}-error`].filter(Boolean).join(' ') ||
    undefined,
);
</script>

<template>
  <div
    class="field"
    :class="{ '-error': invalid, '-small': size === 'small', '-big': size === 'big' }"
  >
    <label class="label" :for="uid">
      {{ label }}<span v-if="required" class="req" aria-hidden="true"> *</span>
    </label>
    <textarea
      v-if="kind === 'textarea'"
      :id="uid"
      v-model="model"
      class="input -area"
      :required="required"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
      @blur="onBlur"
    />
    <input
      v-else
      :id="uid"
      v-model="model"
      class="input"
      :type="kind"
      :required="required"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
      @blur="onBlur"
    />
    <p v-if="hint" :id="`${uid}-hint`" class="hint">{{ hint }}</p>
    <p v-if="invalid" :id="`${uid}-error`" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  --field-height: var(--control-height);
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}
.field {
  .label {
    color: var(--color-ink-700);
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .req,
  .error {
    color: var(--color-danger);
  }
  .input {
    width: 100%;
    min-height: var(--field-height);
    padding: 0 var(--control-pad-x);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-ui);
    background: var(--color-surface);
    color: var(--color-ink);
    font: inherit;
    font-size: var(--control-font);
  }
}
.input.-area {
  min-height: 6rem;
  padding-block: var(--space-2);
  resize: vertical;
}
.input::placeholder {
  color: var(--control-placeholder);
}
.input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.field {
  &.-error .input {
    border-color: var(--color-danger);
  }
  .hint,
  .error {
    margin: 0;
    font-size: var(--text-xs);
  }
  .hint {
    color: var(--color-ink-500);
  }
  .error {
    font-weight: 600;
  }
}
.field.-small {
  --field-height: var(--control-height-small, 2.25rem);
}
.field.-big {
  --field-height: var(--control-height-big, 3.25rem);
}
</style>
