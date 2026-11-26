<!-- SPEC-01: icon facts of a model (surface, bedrooms, baths). -stacked: icon, value and label in divided columns; -bar: one divided row (cards); -bar -panel: the white fact bar under a product hero; -bar -icons: icons only, evenly spread (values stay for screen readers). -->
<script setup lang="ts">
import type { Spec } from '~/data/specs';

defineProps<{ items: Spec[] }>();
</script>

<template>
  <ul class="specs">
    <li v-for="item in items" :key="item.icon" class="specs__item">
      <UiIcon :name="item.icon" class="specs__icon" />
      <span class="specs__value">{{ item.value }}</span>
      <span v-if="item.label" class="specs__label">{{ item.label }}</span>
    </li>
  </ul>
</template>

<style scoped>
.specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--color-ink-700);
  font-size: var(--text-sm);
}
.specs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.specs__icon {
  color: var(--color-ink-600);
  font-size: 1.05rem;
}
.specs__value {
  font-weight: 600;
}
.specs.-stacked {
  gap: 0;
}
.specs.-stacked .specs__item {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  padding: 0 var(--space-4);
  border-left: 1px solid var(--color-line);
  text-align: center;
}
.specs.-stacked .specs__item:first-child {
  padding-left: 0;
  border-left: 0;
}
.specs.-stacked .specs__icon {
  font-size: 1.6rem;
  color: var(--color-forest);
}
.specs.-stacked .specs__value {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-ink);
}
.specs.-stacked .specs__label {
  font-size: var(--text-xs);
  color: var(--color-ink-500);
}
.specs.-bar {
  gap: var(--space-2) 0;
}
.specs.-bar .specs__item {
  padding: 0 var(--space-3);
  border-left: 1px solid var(--color-line);
  white-space: nowrap;
}
.specs.-bar .specs__item:first-child {
  padding-left: 0;
  border-left: 0;
}
.specs.-bar .specs__item {
  gap: 0.35rem;
}
.specs.-bar .specs__icon {
  font-size: 1.15rem;
  color: var(--color-forest-950);
}
.specs.-bar .specs__value {
  font-weight: 500;
}
.specs.-bar .specs__label {
  display: none;
}
.specs.-icons {
  flex-wrap: nowrap;
  justify-content: space-between;
}
.specs.-icons .specs__item {
  flex: 1;
  justify-content: center;
  padding-block: var(--space-1);
}
.specs.-icons .specs__item:first-child {
  justify-content: flex-start;
}
.specs.-icons .specs__icon {
  font-size: 1.6rem;
  stroke-width: 1.3;
}
.specs.-icons .specs__value {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.specs.-panel {
  justify-content: space-between;
  padding: var(--space-4) var(--space-8);
  border: 1px solid var(--color-line-soft);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  box-shadow: var(--shadow-card);
  font-size: var(--text-base);
}
.specs.-panel .specs__item {
  flex: 1;
  justify-content: center;
}
.specs.-panel .specs__icon {
  font-size: 1.6rem;
}
@media (max-width: 640px) {
  .specs.-bar {
    flex-wrap: wrap;
    row-gap: var(--space-2);
  }
  .specs.-panel {
    padding: var(--space-3) var(--space-4);
  }
  .specs.-panel .specs__item {
    flex-basis: 45%;
    justify-content: flex-start;
    border-left: 0;
    padding-left: 0;
  }
}
</style>
