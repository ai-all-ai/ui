<script setup lang="ts">
// MODAL-01 · Modal organism: a dialog over a dimmed page with a close button, an icon, an eyebrow, a title, a lead, a body (default slot) and a foot (slot). `size="wide"` makes the window wider, for the contact hub.
// `size="read"` is the reading window (MODAL-03): a column for long text; `image` puts a photo across the top of the card.
// Closes with the button, the backdrop or Escape. The page behind does not scroll while it is open.
const props = defineProps<{
  open: boolean;
  title: string;
  lead?: string;
  eyebrow?: string;
  icon?: string;
  closeLabel: string;
  size?: 'wide' | 'read';
  image?: string;
}>();
const emit = defineEmits<{ close: [] }>();
const titleId = useId();
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close');
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
watch(
  () => props.open,
  (v) => {
    if (import.meta.client) document.documentElement.classList.toggle('is-locked', v);
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.self="emit('close')"
      >
        <div class="modal__card" :class="{ '-wide': size === 'wide', '-read': size === 'read' }">
          <button
            type="button"
            class="modal__close"
            :aria-label="closeLabel"
            @click="emit('close')"
          >
            ×
          </button>
          <figure v-if="image" class="modal__cover"><UiImg :src="image" alt="" /></figure>
          <header class="modal__head">
            <UiImg v-if="icon" class="modal__icon" :src="icon" alt="" aria-hidden="true" />
            <p v-if="eyebrow" class="modal__eyebrow">{{ eyebrow }}</p>
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
            <p v-if="lead" class="modal__text">{{ lead }}</p>
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.foot" class="modal__foot"><slot name="foot" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
