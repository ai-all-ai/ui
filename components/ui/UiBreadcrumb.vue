<script setup lang="ts">
// BREADCRUMB-01 · Breadcrumb: where the page sits (madera). Plain (slashes) or pill (a frosted pill over a photo);
// `onDark`. The last item is the current page (aria-current="page", not a link).
withDefaults(
  defineProps<{
    items: { label: string; href?: string }[];
    label?: string;
    variant?: 'plain' | 'pill';
    onDark?: boolean;
  }>(),
  { label: 'Breadcrumb', variant: 'plain', onDark: false },
);
</script>

<template>
  <nav
    class="crumbs"
    :class="[variant === 'plain' ? '' : `-${variant}`, { '-on-dark': onDark }]"
    :aria-label="label"
  >
    <ol class="list">
      <li v-for="(it, i) in items" :key="it.label" class="item">
        <a v-if="it.href && i < items.length - 1" class="link" :href="it.href">{{ it.label }}</a>
        <span v-else aria-current="page">{{ it.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs {
  --crumbs-ink: var(--color-ink);
  --crumbs-muted: var(--color-ink-500);
  color: var(--crumbs-muted);
  font-size: var(--text-sm);
}
.crumbs {
  &.-on-dark {
    --crumbs-ink: var(--color-inverse-ink);
    --crumbs-muted: var(--color-inverse-ink-600);
  }
  .list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .item {
    margin: 0;
  }
}
.item + .item::before {
  content: '/';
  margin-right: var(--space-2);
}
.crumbs {
  .link {
    color: var(--crumbs-ink);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }
}
.link:hover {
  text-decoration-thickness: 2px;
}
.crumbs {
  &.-pill {
    display: inline-block;
    padding: var(--space-1) var(--space-4);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-pill);
    background: var(--color-glass);
  }
  &.-pill.-on-dark {
    border-color: var(--color-inverse-line);
    background: var(--color-inverse-soft);
  }
}
</style>
