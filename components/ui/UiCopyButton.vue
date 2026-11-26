<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

// COPY-01 · Copy button: copies `value` to the clipboard and announces the result. `label` names what is copied.
const props = defineProps<{ value: string; label: string; text?: string }>();

const state = ref<'idle' | 'copied' | 'error'>('idle');
let timer: ReturnType<typeof setTimeout> | undefined;

const copy = async () => {
  let success = false;
  try {
    await navigator.clipboard.writeText(props.value);
    success = true;
  } catch {
    // Fallback for pages without clipboard permission (http, old browsers).
    const area = document.createElement('textarea');
    area.value = props.value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    try {
      area.select();
      success = document.execCommand('copy');
    } catch {
      success = false;
    } finally {
      area.remove();
    }
  }
  state.value = success ? 'copied' : 'error';
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => (state.value = 'idle'), 1600);
};

onBeforeUnmount(() => timer && clearTimeout(timer));
</script>

<template>
  <button
    class="copy-button"
    :class="{ '-text': text, '-done': state === 'copied' }"
    type="button"
    :title="state === 'copied' ? 'Copied' : `Copy ${label}`"
    :aria-label="text ? undefined : `Copy ${label}`"
    @click="copy"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path v-if="state === 'copied'" d="M5 12.5l4.5 4.5L19 7.5" />
      <path v-else d="M9 9h10v10H9zM5 15V5h10" />
    </svg>
    <span v-if="text">{{ text }}</span>
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
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-ink-600);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}
.copy-button.-text {
  height: 1.5rem;
  padding: 0 var(--space-2) 0 0.4rem;
  border-color: var(--color-line);
}
.copy-button svg {
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.copy-button:hover {
  background: var(--color-accent-soft);
  color: var(--color-ink);
}
.copy-button.-done {
  color: var(--color-success);
}
.copy-button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.copy-button__status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
