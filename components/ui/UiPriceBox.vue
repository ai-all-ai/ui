<script setup lang="ts">
// PRICEBOX-01 · Price box: base and extras lines over a box with the total and a note. Money is formatted with Intl.
const props = withDefaults(
  defineProps<{
    baseLabel: string;
    base: number;
    extrasLabel: string;
    extras: number;
    totalLabel: string;
    total: number;
    note?: string;
    currency?: string;
    locale?: string;
  }>(),
  { note: '', currency: 'EUR', locale: undefined },
);
const money = (value: number, sign = false) =>
  new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency,
    maximumFractionDigits: 0,
    signDisplay: sign ? 'always' : 'auto',
  }).format(value);
</script>

<template>
  <div class="pbox">
    <p class="pbox__line">
      <span>{{ baseLabel }}</span
      ><span>{{ money(base) }}</span>
    </p>
    <p class="pbox__line">
      <span>{{ extrasLabel }}</span
      ><span>{{ money(extras, true) }}</span>
    </p>
    <p class="pbox__total" aria-live="polite">
      <span class="pbox__total-label">{{ totalLabel }}</span>
      <span class="pbox__total-value">{{ money(total) }}</span>
      <span v-if="note" class="pbox__note">{{ note }}</span>
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
  margin: 0;
  color: var(--color-ink-700);
  font-size: var(--text-sm);
}
.pbox__total {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 0 var(--space-3);
  margin: var(--space-2) 0 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-accent-soft);
}
.pbox__total-label {
  font-weight: 600;
}
.pbox__total-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-heading);
}
.pbox__note {
  grid-column: 2;
  justify-self: end;
  color: var(--color-ink-600);
  font-size: var(--text-xs);
}
</style>
