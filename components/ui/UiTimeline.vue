<script setup lang="ts">
// Timeline: numbered circles joined by a line, each with a title and a short text. Rows on tablets, a column on phones.
defineProps<{ items: { title: string; text: string }[] }>();
</script>

<template>
  <ol class="tline">
    <li v-for="(it, i) in items" :key="it.title" class="step">
      <span class="num">{{ i + 1 }}</span>
      <span class="title">{{ it.title }}</span>
      <span class="text">{{ it.text }}</span>
    </li>
  </ol>
</template>

<style scoped>
.tline {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tline {
  .step {
    position: relative;
    margin: 0;
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    text-align: center;
  }
}
.step + .step::before {
  content: '';
  position: absolute;
  top: 1rem;
  right: calc(50% + 1.4rem);
  width: calc(100% + var(--space-4) - 2.8rem);
  height: 1px;
  background: var(--color-line-strong);
}
.tline {
  .num {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    margin-bottom: var(--space-2);
    border-radius: 50%;
    background: var(--color-brand);
    color: var(--color-brand-contrast);
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .title {
    color: var(--color-ink);
    font-size: var(--text-sm);
    font-weight: 600;
  }
  .text {
    color: var(--color-ink-600);
    font-size: var(--text-xs);
    line-height: 1.45;
  }
}
@media (max-width: 1024px) {
  .tline {
    grid-auto-flow: row;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: var(--space-8);
  }
  .step:nth-child(3n + 1)::before {
    display: none;
  }
}
@media (max-width: 480px) {
  .tline {
    grid-template-columns: minmax(0, 1fr);
  }
  .step {
    grid-template-columns: auto minmax(0, 1fr);
    justify-items: start;
    column-gap: var(--space-4);
    text-align: left;
  }
  .step::before {
    display: none;
  }
  .num {
    grid-row: span 2;
    margin: 0;
  }
}
</style>
