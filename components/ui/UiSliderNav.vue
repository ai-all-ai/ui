<script setup lang="ts">
import messages from '~~/i18n/locales/es';
const props = withDefaults(
  defineProps<{
    count: number;
    arrows?: boolean;
    dots?: boolean;
    loop?: boolean;
    hideDisabledArrows?: boolean;
    progress?: number;
    paused?: boolean;
    large?: boolean;
    numbered?: boolean;
    pausable?: boolean;
  }>(),
  {
    arrows: true,
    dots: true,
    loop: true,
    hideDisabledArrows: false,
    progress: 0,
    paused: false,
    large: false,
    numbered: false,
  },
);
const emit = defineEmits<{ done: [] }>();
const m = messages.ui.slider;
const model = defineModel<number>({ default: 0 });
const stopped = defineModel<boolean>('stopped', { default: false });

const go = (index: number) => {
  model.value = props.loop
    ? (index + props.count) % props.count
    : Math.max(0, Math.min(props.count - 1, index));
};
</script>

<template>
  <div
    class="slider-nav"
    :class="{ '-large': large, '-numbered': numbered }"
    :role="numbered ? 'group' : undefined"
  >
    <div v-if="dots" class="slider-dots" :class="{ 'nav-set -circle -white': numbered }">
      <button
        v-for="index in count"
        :key="index"
        class="slider-dot"
        :class="{ '-active': model === index - 1, on: numbered && model === index - 1 }"
        type="button"
        :aria-label="`${m.goTo} ${index}`"
        :aria-current="model === index - 1 ? 'true' : undefined"
        :aria-pressed="numbered ? model === index - 1 : undefined"
        @click="go(index - 1)"
      >
        <span v-if="numbered">{{ index }}</span>
        <span
          v-if="progress > 0 && model === index - 1"
          :key="`${model}-${progress}`"
          class="slider-fill"
          :class="{ '-paused': paused }"
          :style="{ animationDuration: `${progress}ms` }"
          @animationend="emit('done')"
        />
      </button>
    </div>
    <button
      v-if="pausable"
      class="slider-pause"
      type="button"
      :aria-pressed="stopped"
      :aria-label="stopped ? m.play : m.pause"
      :data-label="stopped ? 'go' : 'stop'"
      @click="stopped = !stopped"
    />
    <div v-if="arrows" class="slider-arrows">
      <button
        v-if="!hideDisabledArrows || loop || model > 0"
        class="slider-arrow"
        type="button"
        :aria-label="m.prev"
        :disabled="!loop && model === 0"
        @click="go(model - 1)"
      >
        <UiIcon name="slider-prev" />
      </button>
      <button
        v-if="!hideDisabledArrows || loop || model < count - 1"
        class="slider-arrow slider-arrow-next"
        type="button"
        :aria-label="m.next"
        :disabled="!loop && model === count - 1"
        @click="go(model + 1)"
      >
        <UiIcon name="slider-next" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider-nav {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  align-items: center;
  gap: var(--space-2);
}
.slider-nav.-numbered {
  flex-wrap: nowrap;
  gap: 0.2rem;
}
.slider-nav.-numbered .slider-dots {
  flex-wrap: nowrap;
  gap: 0.15rem;
}
.slider-nav.-numbered .slider-dot {
  display: grid;
  width: 2rem;
  height: 2rem;
  min-height: 2rem;
  flex: 0 0 2rem;
  padding: var(--space-half) 0.58rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  place-items: center;
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}
.slider-nav.-numbered .slider-dot::before {
  display: none;
}
.slider-nav.-numbered .slider-dot:hover {
  background: var(--color-dim-soft);
}
.slider-nav.-numbered .slider-dot[aria-pressed='true'] {
  border-color: var(--color-ink);
  background: var(--color-ink);
  color: var(--color-white);
}
.slider-nav.-numbered .slider-dot:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}

.slider-dots,
.slider-arrows {
  display: flex;
  align-items: center;
}
.slider-dots {
  flex-wrap: wrap;
  min-width: 0;
  gap: var(--space-1);
}
.slider-arrows {
  gap: var(--space-1);
}
.slider-dot {
  position: relative;
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  padding: 0;
  border: 0;
  place-items: center;
  background: transparent;
  cursor: pointer;
}
.slider-dot::before {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--color-dim);
  box-shadow: 0 0 0 1px var(--color-veil);
  content: '';
  transition:
    width 240ms ease,
    background-color 240ms ease;
}
.slider-dot.-active::before {
  width: 1.6rem;
  background: var(--color-sun);
}
.slider-dot:focus-visible {
  outline: none;
}
.slider-arrow {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--color-ink);
  background: var(--color-glass);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}
.slider-arrow-next {
  border-color: transparent;
  background: var(--color-sun);
}
.slider-arrow:hover {
  transform: translateY(-2px);
  background: var(--color-white);
}
.slider-arrow-next:hover {
  background: var(--color-sun-strong);
}
.slider-arrow svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>

<style scoped>
.slider-nav.-large {
  gap: 0;
  --ind-w: 6.2rem;
  --ind-h: 0.8rem;
  max-width: 100%;
}
.slider-nav.-large .slider-dots {
  flex-wrap: nowrap;
  gap: var(--space-1);
  max-width: 100%;
}
.slider-nav.-large .slider-dot {
  width: var(--ind-w);
  min-width: 0;
  flex: 0 1 var(--ind-w);
  height: 2.4rem;
}
.slider-nav.-large .slider-dot::before {
  box-sizing: border-box;
  width: 100%;
  height: var(--ind-h);
  border: 1.5px solid transparent;
  background: var(--color-dim);
  box-shadow: none;
  transition: border-color 160ms ease;
}
.slider-nav.-large .slider-dot.-active::before {
  width: 100%;
  background: var(--color-dim);
}
.slider-nav.-large .slider-dot:hover::before,
.slider-nav.-large .slider-dot:focus-visible::before {
  border-color: var(--color-ink);
}
.slider-pause {
  position: relative;
  flex: none;
  width: 2.6rem;
  height: max(var(--ind-h, 0.8rem), 1.5rem);
  min-width: 1.5rem;
  margin-left: var(--space-1);
  padding: 0;
  border: 1.5px solid transparent;
  border-radius: var(--radius-pill);
  background: var(--color-dim);
  color: var(--color-white);
  font: inherit;
  font-size: 0.55rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}
.slider-pause::before {
  content: attr(data-label);
}
.slider-pause::after {
  position: absolute;
  inset: -0.8rem -0.4rem;
  content: '';
}
.slider-pause:hover,
.slider-pause:focus-visible {
  border-color: var(--color-ink);
}
.slider-pause[aria-pressed='true'] {
  background: var(--color-sun);
  color: var(--color-ink);
}
.slider-fill {
  position: absolute;
  top: 50%;
  left: 1.5px;
  width: 0;
  height: calc(var(--ind-h, 0.5rem) - 3px);
  border-radius: var(--radius-pill);
  background: var(--color-sun);
  transform: translateY(-50%);
  animation: slider-fill linear forwards;
}
.slider-nav:not(.-large) .slider-fill {
  left: 50%;
  height: 0.5rem;
  margin-left: -0.8rem;
  animation-name: slider-fill-sm;
}
.slider-fill.-paused {
  animation-play-state: paused;
}
@keyframes slider-fill {
  to {
    width: calc(100% - 3px);
  }
}
@keyframes slider-fill-sm {
  to {
    width: 1.6rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .slider-fill {
    display: none;
  }
}
</style>
