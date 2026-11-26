<script setup lang="ts">
import messages from '~~/i18n/locales/es';

const m = messages.ui.lightbox;
const props = defineProps<{ open: boolean; src: string; alt?: string }>();
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

const label = computed(() => (fit.value ? m.fit : `${Math.round(scale.value * 100)}%`));
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
  <dialog ref="dialog" class="lightbox" :aria-label="m.label" @close="onClose" @keydown="onKey">
    <div class="lightbox__stage" :class="{ '-fit': fit }" @click.self="emit('close')">
      <img ref="img" :src="asset(src) || undefined" :alt="alt ?? ''" :style="size" @load="onLoad" />
    </div>
    <div class="lightbox__bar" role="toolbar" :aria-label="m.zoom">
      <button
        type="button"
        class="lightbox__btn"
        :aria-label="m.out"
        @click="setScale((fit ? 1 : scale) / 1.25)"
      >
        −
      </button>
      <output class="lightbox__value">{{ label }}</output>
      <button
        type="button"
        class="lightbox__btn"
        :aria-label="m.in"
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
        {{ m.fit }}
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
    <button type="button" class="lightbox__close" :aria-label="m.close" @click="emit('close')">
      ×
    </button>
  </dialog>
</template>
