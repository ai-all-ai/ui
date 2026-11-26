<script setup lang="ts">
// ALERT-01 · Feedback block: info, success, warning or danger. Danger is announced as an alert.
withDefaults(defineProps<{ tone?: 'info' | 'success' | 'warning' | 'danger'; title?: string }>(), {
  tone: 'info',
  title: '',
});
</script>

<template>
  <div class="alert" :class="`-${tone}`" :role="tone === 'danger' ? 'alert' : 'status'">
    <p v-if="title" class="alert__title">{{ title }}</p>
    <div class="alert__body"><slot /></div>
  </div>
</template>

<style scoped>
.alert {
  display: grid;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-line);
  border-left: 4px solid var(--color-ink-500);
  border-radius: var(--radius-ui);
  background: var(--color-surface);
  color: var(--color-ink);
  font-size: var(--text-sm);
}
.alert__title {
  margin: 0;
  font-weight: 700;
}
.alert__body {
  margin: 0;
  color: var(--color-ink-700);
}
.alert.-info {
  border-left-color: var(--color-info);
}
.alert.-success {
  border-left-color: var(--color-success);
}
.alert.-warning {
  border-left-color: var(--color-warning);
}
.alert.-danger {
  border-left-color: var(--color-danger);
}
</style>
