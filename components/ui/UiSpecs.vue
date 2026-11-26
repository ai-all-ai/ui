<script setup lang="ts">
// SPECS-01 · Specs: key facts as value and label pairs (area, rooms, weight), in a row that wraps.
defineProps<{ items: { value: string; label: string }[] }>();
</script>

<template>
  <dl class="specs">
    <div v-for="item in items" :key="item.label" class="specs__item">
      <dt class="specs__label">{{ item.label }}</dt>
      <dd class="specs__value">{{ item.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
}
.specs__item {
  display: grid;
  gap: var(--space-1);
  min-width: 7rem;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.specs__label {
  order: 2;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
  font-weight: 400;
}
.specs__value {
  margin: 0;
  color: var(--color-ink);
  font-size: var(--text-lead);
  font-weight: 600;
}
</style>
