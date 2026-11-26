<script setup lang="ts">
// GRID-01 · Card grid: equal columns (2, 3 or 4) that collapse on tablets and phones. Cards go in the slot.
withDefaults(
  defineProps<{
    columns?: 2 | 3 | 4;
  }>(),
  {
    columns: 2,
  },
);
</script>

<template>
  <div class="cards" :class="{ '-cols-3': columns === 3, '-cols-4': columns === 4 }">
    <slot />
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}
.cards.-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.cards.-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 700px) {
  .cards,
  .cards.-cols-3 {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 1000px) {
  .cards.-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .cards.-cols-4 {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
