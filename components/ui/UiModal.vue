<script setup lang="ts">
// MODAL-01 · Modal: native <dialog>, so focus stays inside, Escape and a click on the backdrop close it, and the page
// behind is dimmed and blurred (--backdrop-blur) and does not scroll.
// Types: size small (confirm), md (default), wide (forms), read (long text); placement center (default), side (a
// panel from the right: filters, cart) or bottom (a sheet on phones); `image` puts a photo across the top.
// Eyebrow, title, lead, body (default slot) and foot (slot, for the actions).
const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    closeLabel?: string;
    lead?: string;
    eyebrow?: string;
    size?: 'small' | 'md' | 'wide' | 'read';
    placement?: 'center' | 'side' | 'bottom';
    image?: string;
  }>(),
  {
    closeLabel: 'Close',
    lead: undefined,
    eyebrow: undefined,
    size: 'md',
    placement: 'center',
    image: undefined,
  },
);
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const titleId = useId();
let scrollLock = '';

const sync = () => {
  const el = dialog.value;
  if (!el) return;
  if (props.open && !el.open) {
    scrollLock = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    el.showModal();
  } else if (!props.open && el.open) el.close();
};
const onClose = () => {
  document.documentElement.style.overflow = scrollLock;
  emit('close');
};
watch(() => props.open, sync, { flush: 'post' });
onMounted(sync);
onBeforeUnmount(() => {
  if (dialog.value?.open) document.documentElement.style.overflow = scrollLock;
});
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    :class="[size === 'md' ? '' : `-${size}`, placement === 'center' ? '' : `-${placement}`]"
    :aria-labelledby="titleId"
    @close="onClose"
    @click.self="emit('close')"
  >
    <div class="modal__card">
      <button type="button" class="modal__close" :aria-label="closeLabel" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <img v-if="image" class="modal__cover" :src="image" alt="" />
      <header class="modal__head">
        <p v-if="eyebrow" class="modal__eyebrow">{{ eyebrow }}</p>
        <h2 :id="titleId" class="modal__title">{{ title }}</h2>
        <p v-if="lead" class="modal__lead">{{ lead }}</p>
      </header>
      <div class="modal__body"><slot /></div>
      <footer v-if="$slots.foot" class="modal__foot"><slot name="foot" /></footer>
    </div>
  </dialog>
</template>

<style scoped>
.modal {
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-modal);
}
.modal[open] {
  animation: modal-in 180ms ease-out;
}
.modal::backdrop {
  background: var(--color-dim);
  -webkit-backdrop-filter: blur(var(--backdrop-blur));
  backdrop-filter: blur(var(--backdrop-blur));
}
.modal.-small {
  width: min(24rem, calc(100vw - 2rem));
}
.modal.-wide {
  width: min(48rem, calc(100vw - 2rem));
}
.modal.-read {
  width: min(40rem, calc(100vw - 2rem));
}
.modal.-side {
  inset: 0 0 0 auto;
  width: min(26rem, 100vw);
  height: 100dvh;
  max-height: none;
  margin: 0;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}
.modal.-side[open] {
  animation-name: modal-side;
}
.modal.-bottom {
  inset: auto 0 0;
  width: min(40rem, 100vw);
  max-height: 85dvh;
  margin: 0 auto;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.modal.-bottom[open] {
  animation-name: modal-bottom;
}
.modal__card {
  position: relative;
  display: grid;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-6) var(--space-6);
}
.modal.-small .modal__card {
  gap: var(--space-3);
  padding: var(--space-6);
  text-align: center;
}
.modal.-bottom .modal__card::before {
  content: '';
  justify-self: center;
  width: 2.5rem;
  height: 0.25rem;
  margin-top: calc(var(--space-4) * -1);
  border-radius: var(--radius-pill);
  background: var(--color-line-strong);
}
.modal__cover {
  display: block;
  width: calc(100% + var(--space-6) * 2);
  max-width: none;
  height: 11rem;
  margin: calc(var(--space-8) * -1) calc(var(--space-6) * -1) 0;
  object-fit: cover;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
.modal__close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 1;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--color-glass);
  color: var(--color-ink-600);
  cursor: pointer;
}
.modal__close:hover {
  background: var(--color-accent-soft);
  color: var(--color-ink);
}
.modal__close:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.modal__close svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.modal__head {
  display: grid;
  gap: var(--space-2);
  padding-right: var(--space-8);
}
.modal.-small .modal__head {
  padding-right: 0;
}
.modal__eyebrow {
  margin: 0;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.modal__title {
  margin: 0;
  font-size: var(--text-2xl);
}
.modal__lead {
  margin: 0;
  color: var(--color-ink-600);
}
.modal.-read .modal__body {
  line-height: 1.7;
}
.modal__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
}
.modal.-small .modal__foot {
  justify-content: center;
}
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem) scale(0.98);
  }
}
@keyframes modal-side {
  from {
    transform: translateX(100%);
  }
}
@keyframes modal-bottom {
  from {
    transform: translateY(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .modal[open] {
    animation: none;
  }
}
</style>
