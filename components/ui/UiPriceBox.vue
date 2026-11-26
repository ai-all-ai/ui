<!-- PRICEBOX-01: base price and extras lines over a sage box with the estimated total and its tax note. -->
<script setup lang="ts">
defineProps<{
  baseLabel: string;
  base: number;
  extrasLabel: string;
  extras: number;
  totalLabel: string;
  total: number;
  note: string;
}>();
</script>

<template>
  <div class="pbox">
    <p class="pbox__line">
      <span>{{ baseLabel }}</span
      ><span>{{ formatEuro(base) }}</span>
    </p>
    <p class="pbox__line">
      <span>{{ extrasLabel }}</span
      ><span>{{ formatEuro(extras, true) }}</span>
    </p>
    <p class="pbox__total" aria-live="polite">
      <span class="pbox__total-label">{{ totalLabel }}</span>
      <span class="pbox__total-value">{{ formatEuro(total) }}</span>
      <span class="pbox__note">{{ note }}</span>
    </p>
  </div>
</template>

<style scoped>
.pbox {
  display: grid;
  gap: var(--space-2);
}
.pbox__line {
  display: flex;
  justify-content: space-between;
  color: var(--color-ink-700);
  font-size: var(--text-sm);
}
.pbox__total {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 0 var(--space-3);
  margin-top: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-sage-100);
}
.pbox__total-label {
  color: var(--color-forest-950);
  font-weight: 600;
}
.pbox__total-value {
  color: var(--color-forest-950);
  font-family: var(--font-serif);
  font-size: var(--text-2xl);
}
.pbox__note {
  grid-column: 2;
  justify-self: end;
  color: var(--color-ink-600);
  font-size: var(--text-xs);
}
</style>
