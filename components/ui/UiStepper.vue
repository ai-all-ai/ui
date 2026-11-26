<script setup lang="ts">
// STEPPER-01 · Stepper: numbered steps of a flow. Done steps show a check; the current step is filled.
defineProps<{ steps: string[]; current: number; label: string }>();
</script>

<template>
  <ol class="stepper" :aria-label="label">
    <li
      v-for="(s, i) in steps"
      :key="s"
      class="stepper__step"
      :class="{ '-done': i < current }"
      :aria-current="i === current ? 'step' : undefined"
    >
      <span class="stepper__num">
        <svg v-if="i < current" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <template v-else>{{ i + 1 }}</template>
      </span>
      <span class="stepper__label">{{ s }}</span>
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;
}
.stepper__step {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-1) var(--space-4) var(--space-1) var(--space-1);
  border-radius: var(--radius-pill);
  color: var(--color-ink-600);
  font-size: var(--text-sm);
}
.stepper__step + .stepper__step::before {
  content: '';
  width: 1.5rem;
  height: 1px;
  margin-right: var(--space-2);
  background: var(--color-line-strong);
}
.stepper__num {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid var(--color-line-strong);
  border-radius: 50%;
  background: var(--color-surface);
  font-weight: 600;
}
.stepper__num svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.stepper__step.-done .stepper__num {
  border-color: var(--color-brand);
  color: var(--color-brand);
}
.stepper__step[aria-current='step'] {
  background: var(--color-accent-soft);
  color: var(--color-ink);
  font-weight: 600;
}
.stepper__step[aria-current='step'] .stepper__num {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: var(--color-brand-contrast);
}
@media (max-width: 640px) {
  .stepper__step:not([aria-current='step']) .stepper__label {
    display: none;
  }
}
</style>
