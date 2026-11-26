<!-- STEPPER-01: numbered steps of a flow; the current step is a filled green circle with its label in a pill, done steps show a check. -->
<script setup lang="ts">
defineProps<{ steps: string[]; current: number; label: string }>();
</script>

<template>
  <ol class="stepper" :aria-label="label">
    <li
      v-for="(s, i) in steps"
      :key="i"
      class="stepper__step"
      :aria-current="i === current ? 'step' : undefined"
      :data-done="i < current || undefined"
    >
      <span class="stepper__num"
        ><UiIcon v-if="i < current" name="check" /><template v-else>{{ i + 1 }}</template></span
      >
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
  counter-reset: step;
  scrollbar-width: none;
}
.stepper__step {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  padding: 0.3rem 0.9rem 0.3rem 0.3rem;
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
  background: var(--color-white);
  font-weight: 600;
}
.stepper__step[data-done] .stepper__num {
  border-color: var(--color-forest);
  color: var(--color-forest);
}
.stepper__step[aria-current='step'] {
  background: var(--color-sage-100);
  color: var(--color-forest-950);
  font-weight: 600;
}
.stepper__step[aria-current='step'] .stepper__num {
  border-color: var(--color-forest);
  background: var(--color-forest);
  color: var(--color-white);
}
@media (max-width: 640px) {
  .stepper__step:not([aria-current='step']) .stepper__label {
    display: none;
  }
}
</style>
