<!-- TIMELINE-01: numbered green circles joined by a line, each with a title and a short text. Wraps to two rows on tablets, a column on phones. -->
<script setup lang="ts">
defineProps<{ items: { title: string; text: string }[] }>();
</script>

<template>
  <ol class="tline">
    <li v-for="(it, i) in items" :key="it.title" class="tline__step">
      <span class="tline__num">{{ i + 1 }}</span>
      <span class="tline__title">{{ it.title }}</span>
      <span class="tline__text">{{ it.text }}</span>
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
.tline__step {
  position: relative;
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  text-align: center;
}
.tline__step + .tline__step::before {
  content: '';
  position: absolute;
  top: 1rem;
  right: calc(50% + 1.4rem);
  width: calc(100% + var(--space-4) - 2.8rem);
  height: 1px;
  background: var(--color-forest);
}
.tline__num {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin-bottom: var(--space-2);
  border-radius: 50%;
  background: var(--gradient-forest);
  color: var(--color-white);
  font-size: var(--text-sm);
  font-weight: 600;
}
.tline__title {
  color: var(--color-forest-950);
  font-size: var(--text-sm);
  font-weight: 600;
}
.tline__text {
  color: var(--color-ink-600);
  font-size: var(--text-xs);
  line-height: 1.45;
}
@media (max-width: 900px) {
  .tline {
    grid-auto-flow: row;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: var(--space-8);
  }
  .tline__step:nth-child(3n + 1)::before {
    display: none;
  }
}
@media (max-width: 560px) {
  .tline {
    grid-template-columns: minmax(0, 1fr);
  }
  .tline__step {
    grid-template-columns: auto minmax(0, 1fr);
    justify-items: start;
    column-gap: var(--space-4);
    text-align: left;
  }
  .tline__step::before {
    display: none;
  }
  .tline__num {
    grid-row: span 2;
    margin: 0;
  }
}
</style>
