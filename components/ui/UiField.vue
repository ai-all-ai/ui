<script setup lang="ts">
// FIELD-01 · Field molecule: label, input or textarea and a message. Phone and email are masked as you type.
// The message appears after the field is left, so the user is not shouted at while typing.
import { useId } from 'vue';
import messages from '~~/i18n/locales/es';
import {
  formatEmail,
  formatName,
  formatPhone,
  isValidEmail,
  isValidName,
  isValidPhone,
  prettyName,
  type FieldKind,
} from '~/utils/masks';
import type { LineIconName } from '~/data/icons';

type Kind = FieldKind | 'text' | 'textarea';
const props = withDefaults(
  defineProps<{
    kind?: Kind;
    label: string;
    required?: boolean;
    placeholder?: string;
    icon?: LineIconName | false;
  }>(),
  { kind: 'text', required: false, placeholder: undefined, icon: undefined },
);
// Icon badge is an optional variant: it shows only when `icon` is passed explicitly.
const resolvedIcon = computed(() => props.icon || undefined);
const model = defineModel<string>({ default: '' });
const touched = ref(false);
const uid = useId();
const m = messages.ui.form;

const attrs = computed(
  () =>
    ({
      name: {
        type: 'text',
        autocomplete: 'name',
        inputmode: 'text' as const,
        ph: props.placeholder ?? '',
      },
      phone: {
        type: 'tel',
        autocomplete: 'tel',
        inputmode: 'tel' as const,
        ph: props.placeholder ?? '600 00 00 00',
      },
      email: {
        type: 'email',
        autocomplete: 'email',
        inputmode: 'email' as const,
        ph: props.placeholder ?? 'nombre@correo.com',
      },
      text: {
        type: 'text',
        autocomplete: 'off',
        inputmode: 'text' as const,
        ph: props.placeholder ?? '',
      },
      textarea: {
        type: 'text',
        autocomplete: 'off',
        inputmode: 'text' as const,
        ph: props.placeholder ?? '',
      },
    })[props.kind],
);

const valid = computed(() => {
  if (!model.value.trim()) return !props.required;
  if (props.kind === 'phone') return isValidPhone(model.value);
  if (props.kind === 'email') return isValidEmail(model.value);
  if (props.kind === 'name') return isValidName(model.value);
  return true;
});
const showError = computed(() => touched.value && !valid.value);
const errorText = computed(() =>
  props.kind === 'name'
    ? m.name
    : props.kind === 'phone'
      ? m.phone
      : props.kind === 'email'
        ? m.email
        : m.text,
);

function onInput(e: Event) {
  const el = e.target as HTMLInputElement | HTMLTextAreaElement;
  if (props.kind === 'textarea' || props.kind === 'text') {
    model.value = el.value;
    return;
  }
  const raw = el.value;
  const caret = el.selectionStart ?? raw.length;
  const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, '').length;
  const formatted =
    props.kind === 'phone'
      ? formatPhone(raw)
      : props.kind === 'email'
        ? formatEmail(raw)
        : formatName(raw);
  const rawDigits = raw.replace(/\D/g, '');
  const digitOffset =
    props.kind !== 'phone' ||
    raw.trim().startsWith('+') ||
    (rawDigits.length > 9 && rawDigits.startsWith('34'))
      ? 0
      : rawDigits.startsWith('00')
        ? -2
        : 2;
  const targetDigitCount = Math.max(0, digitsBeforeCaret + digitOffset);
  model.value = formatted;
  nextTick(() => {
    if (el.value !== formatted) el.value = formatted;
    if (props.kind !== 'phone') return;
    let digits = 0;
    let position = 0;
    while (position < formatted.length && digits < targetDigitCount) {
      if (/\d/.test(formatted[position] ?? '')) digits++;
      position++;
    }
    el.setSelectionRange(position, position);
  });
}
function onBlur() {
  touched.value = true;
  if (props.kind === 'name') model.value = prettyName(model.value);
}
defineExpose({
  valid,
  touch: () => {
    touched.value = true;
  },
});
</script>

<template>
  <div class="field" :class="{ '-error': showError, '-textarea': kind === 'textarea' }">
    <div class="field__head">
      <label class="field__label" :for="uid"
        >{{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span></label
      >
      <span v-if="showError" :id="`${uid}-msg`" class="field__error" role="alert">{{
        errorText
      }}</span>
    </div>
    <textarea
      v-if="kind === 'textarea'"
      :id="uid"
      class="field__input"
      :value="model"
      :placeholder="attrs.ph"
      :required="required"
      :aria-invalid="showError ? 'true' : undefined"
      :aria-describedby="showError ? `${uid}-msg` : undefined"
      maxlength="600"
      @input="onInput"
      @blur="onBlur"
    />
    <div v-else class="field__control">
      <input
        :id="uid"
        class="field__input"
        :class="{ '-icon': !!resolvedIcon }"
        :value="model"
        :type="attrs.type"
        :autocomplete="attrs.autocomplete"
        :inputmode="attrs.inputmode"
        :placeholder="attrs.ph"
        :required="required"
        :aria-invalid="showError ? 'true' : undefined"
        :aria-describedby="showError ? `${uid}-msg` : undefined"
        maxlength="120"
        @input="onInput"
        @blur="onBlur"
      />
      <span v-if="resolvedIcon" class="field__icon" :class="`-${kind}`" aria-hidden="true"
        ><UiIcon :name="resolvedIcon" :width="16" :height="16"
      /></span>
    </div>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}
.field__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 1.2rem;
}
.field__label {
  flex: none;
  color: var(--color-ink-600);
  font-size: 0.84rem;
  font-weight: 600;
}
.field__req {
  color: var(--color-danger);
}
.field__error {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-danger);
  font-size: 0.76rem;
  font-weight: 600;
  text-align: right;
}
.field__control {
  position: relative;
}
.field__input {
  box-sizing: border-box;
  width: 100%;
  height: var(--control-height);
  padding: 0 var(--control-pad-x);
  border: 1px solid var(--line);
  border-radius: var(--radius-ui);
  background: var(--color-white);
  color: var(--color-ink);
  font: inherit;
  font-size: var(--control-font);
}
.field__input.-icon {
  padding-left: 3rem;
}
.field__icon {
  position: absolute;
  top: 50%;
  left: 0.55rem;
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  transform: translateY(-50%);
  border-radius: 0.45rem;
  background: var(--color-champagne);
  color: var(--color-olive);
  pointer-events: none;
}
.field__input::placeholder {
  color: var(--control-placeholder);
  opacity: 1;
}
.field__input:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.field.-textarea .field__input {
  height: auto;
  min-height: 6rem;
  padding-block: 0.7rem;
  resize: vertical;
}
.field.-error .field__input {
  border-color: var(--color-danger);
}
</style>
