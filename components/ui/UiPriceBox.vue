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
    <p class="line">
      <span>{{ baseLabel }}</span
      ><span>{{ money(base) }}</span>
    </p>
    <p class="line">
      <span>{{ extrasLabel }}</span
      ><span>{{ money(extras, true) }}</span>
    </p>
    <p class="total" aria-live="polite">
      <span class="total-label">{{ totalLabel }}</span>
      <span class="total-value">{{ money(total) }}</span>
      <span v-if="note" class="note">{{ note }}</span>
    </p>
  </div>
</template>

<style scoped>
.pbox {
  display: grid;
  gap: var(--space-2);
}
.pbox {
  .line {
    display: flex;
    justify-content: space-between;
    margin: 0;
    color: var(--color-ink-700);
    font-size: var(--text-sm);
  }
  .total {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0 var(--space-3);
    margin: var(--space-2) 0 0;
    padding: var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-accent-soft);
  }
  .total-label {
    font-weight: 600;
  }
  .total-value {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-heading);
  }
  .note {
    grid-column: 2;
    justify-self: end;
    color: var(--color-ink-600);
    font-size: var(--text-xs);
  }
}
</style>
