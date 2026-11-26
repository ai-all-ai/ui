<script setup lang="ts">
// SLIDERNAV-01 · Slider controls: dots (or numbers) and previous/next arrows for any slider. The model is the index.
// Variants by props: dots + arrows, numbered, arrows only, dots only; small; `onDark`. is-hover and is-focus force
// a state on the next arrow for the brandbook only.
const props = withDefaults(
  defineProps<{
    count: number;
    arrows?: boolean;
    dots?: boolean;
    loop?: boolean;
    numbered?: boolean;
    size?: 'small' | 'md';
    onDark?: boolean;
    prevLabel?: string;
    nextLabel?: string;
    goToLabel?: string;
  }>(),
  {
    arrows: true,
    dots: true,
    loop: true,
    numbered: false,
    size: 'md',
    onDark: false,
    prevLabel: 'Previous',
    nextLabel: 'Next',
    goToLabel: 'Go to slide',
  },
);
const model = defineModel<number>({ default: 0 });
const go = (index: number) => {
  model.value = props.loop
    ? (index + props.count) % props.count
    : Math.max(0, Math.min(props.count - 1, index));
};
</script>

<template>
  <div
    class="slider-nav"
    :class="{ '-numbered': numbered, '-small': size === 'small', '-on-dark': onDark }"
  >
    <div v-if="dots" class="slider-nav__dots">
      <button
        v-for="i in count"
        :key="i"
        type="button"
        class="slider-nav__dot"
        :class="{ 'is-active': model === i - 1 }"
        :aria-label="`${goToLabel} ${i}`"
        :aria-current="model === i - 1 ? 'true' : undefined"
        @click="go(i - 1)"
      >
        <span v-if="numbered" aria-hidden="true">{{ i }}</span>
      </button>
    </div>
    <div v-if="arrows" class="slider-nav__arrows">
      <button
        type="button"
        class="slider-nav__arrow"
        :aria-label="prevLabel"
        :disabled="!loop && model === 0"
        @click="go(model - 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        class="slider-nav__arrow"
        :aria-label="nextLabel"
        :disabled="!loop && model === count - 1"
        @click="go(model + 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
}
.slider-nav__dots,
.slider-nav__arrows {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.slider-nav__dot {
  width: 0.6rem;
  height: 0.6rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-line-strong);
  cursor: pointer;
  transition:
    width 180ms ease,
    background-color 180ms ease;
}
.slider-nav__dot.is-active {
  width: 1.6rem;
  background: var(--color-brand);
}
.slider-nav.-numbered .slider-nav__dot {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--color-line-strong);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--text-sm);
  font-weight: 600;
}
.slider-nav.-numbered .slider-nav__dot.is-active {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: var(--color-brand-contrast);
}
.slider-nav__arrow {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  padding: 0;
  border: 1px solid var(--color-line-strong);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-ink);
  cursor: pointer;
}
.slider-nav__arrow:hover:not(:disabled),
.slider-nav.is-hover .slider-nav__arrow:last-child {
  border-color: var(--color-ink);
  background: var(--color-accent-soft);
}
.slider-nav__arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.slider-nav__arrow svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}
.slider-nav__dot:focus-visible,
.slider-nav__arrow:focus-visible,
.slider-nav.is-focus .slider-nav__arrow:last-child {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.slider-nav.-small .slider-nav__arrow {
  width: 2rem;
  height: 2rem;
}
.slider-nav.-small.-numbered .slider-nav__dot {
  width: 1.6rem;
  height: 1.6rem;
  font-size: var(--text-xs);
}
.slider-nav.-on-dark .slider-nav__dot {
  background: var(--color-inverse-line);
}
.slider-nav.-on-dark .slider-nav__dot.is-active {
  background: var(--color-inverse-ink);
}
.slider-nav.-on-dark.-numbered .slider-nav__dot {
  border-color: var(--color-inverse-line);
  background: transparent;
  color: var(--color-inverse-ink);
}
.slider-nav.-on-dark.-numbered .slider-nav__dot.is-active {
  background: var(--color-inverse-ink);
  color: var(--color-inverse);
}
.slider-nav.-on-dark .slider-nav__arrow {
  border-color: var(--color-inverse-line);
  background: transparent;
  color: var(--color-inverse-ink);
}
.slider-nav.-on-dark .slider-nav__arrow:hover:not(:disabled),
.slider-nav.-on-dark.is-hover .slider-nav__arrow:last-child {
  border-color: var(--color-inverse-ink);
  background: var(--color-inverse-soft);
}
.slider-nav.-on-dark :is(.slider-nav__dot, .slider-nav__arrow):focus-visible,
.slider-nav.-on-dark.is-focus .slider-nav__arrow:last-child {
  outline-color: var(--color-inverse-ink);
}
@media (prefers-reduced-motion: reduce) {
  .slider-nav__dot {
    transition: none;
  }
}
</style>
