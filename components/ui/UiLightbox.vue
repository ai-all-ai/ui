<script setup lang="ts">
// LIGHTBOX-01 · Lightbox: a photo full screen in a native <dialog> with zoom out, in, fit, 100% and 200%.
// Keys: + and - zoom, 0 fits. Focus returns to the opener on close. Labels come in as props.
const props = withDefaults(
  defineProps<{
    open: boolean;
    src: string;
    alt?: string;
    labels?: { dialog: string; zoom: string; in: string; out: string; fit: string; close: string };
  }>(),
  {
    alt: '',
    labels: () => ({
      dialog: 'Photo',
      zoom: 'Zoom',
      in: 'Zoom in',
      out: 'Zoom out',
      fit: 'Fit',
      close: 'Close',
    }),
  },
);
const emit = defineEmits<{ close: [] }>();

const MIN = 0.25;
const MAX = 4;
const dialog = ref<HTMLDialogElement | null>(null);
const img = ref<HTMLImageElement | null>(null);
const fit = ref(true);
const scale = ref(1);
const natural = ref({ w: 0, h: 0 });
let opener: HTMLElement | null = null;
let scrollLock = '';

const label = computed(() => (fit.value ? props.labels.fit : `${Math.round(scale.value * 100)}%`));
const size = computed(() =>
  fit.value || !natural.value.w
    ? undefined
    : { width: `${natural.value.w * scale.value}px`, height: `${natural.value.h * scale.value}px` },
);

const setScale = (value: number) => {
  fit.value = false;
  scale.value = Math.min(MAX, Math.max(MIN, value));
};
const setFit = () => {
  fit.value = true;
};
const onLoad = () => {
  natural.value = { w: img.value?.naturalWidth ?? 0, h: img.value?.naturalHeight ?? 0 };
};

function sync() {
  const el = dialog.value;
  if (!el) return;
  if (props.open && !el.open) {
    opener = document.activeElement as HTMLElement | null;
    scrollLock = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    fit.value = true;
    el.showModal();
  } else if (!props.open && el.open) {
    el.close();
  }
}
function onClose() {
  document.documentElement.style.overflow = scrollLock;
  emit('close');
  opener?.focus?.();
}
function onKey(event: KeyboardEvent) {
  if (event.key === '+' || event.key === '=') setScale((fit.value ? 1 : scale.value) * 1.25);
  else if (event.key === '-') setScale((fit.value ? 1 : scale.value) / 1.25);
  else if (event.key === '0') setFit();
}
watch(() => props.open, sync, { flush: 'post' });
onMounted(sync);
onBeforeUnmount(() => {
  if (props.open) document.documentElement.style.overflow = scrollLock;
});
</script>

<template>
  <dialog
    ref="dialog"
    class="lightbox"
    :aria-label="labels.dialog"
    @close="onClose"
    @keydown="onKey"
  >
    <div class="lightbox__stage" :class="{ '-fit': fit }" @click.self="emit('close')">
      <img ref="img" :src="src || undefined" :alt="alt" :style="size" @load="onLoad" />
    </div>
    <div class="lightbox__bar" role="toolbar" :aria-label="labels.zoom">
      <button
        type="button"
        class="lightbox__btn"
        :aria-label="labels.out"
        @click="setScale((fit ? 1 : scale) / 1.25)"
      >
        −
      </button>
      <output class="lightbox__value">{{ label }}</output>
      <button
        type="button"
        class="lightbox__btn"
        :aria-label="labels.in"
        @click="setScale((fit ? 1 : scale) * 1.25)"
      >
        +
      </button>
      <button
        type="button"
        class="lightbox__btn lightbox__text"
        :aria-pressed="fit"
        @click="setFit"
      >
        {{ labels.fit }}
      </button>
      <button
        type="button"
        class="lightbox__btn lightbox__text"
        :aria-pressed="!fit && scale === 1"
        @click="setScale(1)"
      >
        100%
      </button>
      <button
        type="button"
        class="lightbox__btn lightbox__text"
        :aria-pressed="!fit && scale === 2"
        @click="setScale(2)"
      >
        200%
      </button>
    </div>
    <button type="button" class="lightbox__close" :aria-label="labels.close" @click="emit('close')">
      ×
    </button>
  </dialog>
</template>

<style scoped>
.lightbox {
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--color-dim);
  color: var(--color-brand-contrast);
}
.lightbox::backdrop {
  background: var(--color-dim);
}
.lightbox__stage {
  display: grid;
  width: 100%;
  height: 100%;
  overflow: auto;
  place-items: center;
}
.lightbox__stage.-fit img {
  max-width: 92vw;
  max-height: 84dvh;
  object-fit: contain;
}
.lightbox__stage img {
  max-width: none;
}
.lightbox__bar {
  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
  border-radius: var(--radius-pill);
  background: var(--color-glass);
  color: var(--color-ink);
  transform: translateX(-50%);
}
.lightbox__btn,
.lightbox__close {
  display: grid;
  min-width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}
.lightbox__btn:hover,
.lightbox__btn[aria-pressed='true'] {
  background: var(--color-accent-soft);
}
.lightbox__value {
  min-width: 3.5rem;
  font-size: var(--text-sm);
  text-align: center;
}
.lightbox__close {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  background: var(--color-glass);
  color: var(--color-ink);
  font-size: var(--text-2xl);
}
.lightbox__btn:focus-visible,
.lightbox__close:focus-visible {
  outline: 2px solid var(--color-brand-contrast);
  outline-offset: 2px;
}
</style>
