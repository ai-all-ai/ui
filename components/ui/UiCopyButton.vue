<script setup lang="ts">
const props = defineProps<{ value: string; label: string }>();

const state = ref<'idle' | 'copied' | 'error'>('idle');
let timer: ReturnType<typeof setTimeout> | undefined;

const copy = async () => {
  let success = false;
  try {
    await navigator.clipboard.writeText(props.value);
    success = true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    try {
      textarea.select();
      success = document.execCommand('copy');
    } catch {
      success = false;
    } finally {
      textarea.remove();
    }
  }

  state.value = success ? 'copied' : 'error';
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    state.value = 'idle';
  }, 1600);
};

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <button
    class="copy-button"
    type="button"
    :aria-label="
      state === 'copied'
        ? `${label} copied`
        : state === 'error'
          ? `Could not copy ${label}`
          : `Copy ${label}`
    "
    :title="state === 'copied' ? 'Copied' : state === 'error' ? 'Could not copy' : `Copy ${label}`"
    @click="copy"
  >
    <UiIcon v-if="state !== 'copied'" name="copy" />
    <UiIcon v-else name="check-small" />
    <span class="copy-button__status" role="status" aria-live="polite">
      {{
        state === 'copied' ? `${label} copied` : state === 'error' ? `Could not copy ${label}` : ''
      }}
    </span>
  </button>
</template>

<style scoped>
.copy-button {
  position: relative;
  display: inline-grid;
  flex: 0 0 auto;
  width: 1.65rem;
  height: 1.65rem;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: var(--color-ink-600);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;
}
.copy-button svg {
  width: 0.78rem;
  height: 0.78rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.35;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.copy-button:hover {
  border-color: transparent;
  background: var(--color-sun);
  color: var(--color-ink);
}
.copy-button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
.copy-button__status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}
</style>
