<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { useUiDevTools } from '@ai.all/ui/dev-tools';
// DEVTOOLS-01 · Developer tools over the page, for checking layout (from miluzsolar's grid):
// - layout grid: 12 / 16 / 24 columns inside --content-width, a dashed line one base step (--grid-edge) outside (Alt+G);
// - baseline rhythm: horizontal lines every --rhythm-step to check vertical spacing (Alt+R);
// - outlines: a thin outline on every element to see boxes and overflow (Alt+O);
// - viewport size: width × height and the breakpoint in a corner badge (Alt+S);
// - audit: marks in red what a page is missing for accessibility and SEO (no alt, no label, no name, skipped
//   heading level, several h1, short title or description, no canonical, duplicate ids) and lists it (Alt+A).
// Put it once in app.vue or the default layout. State is shared per Vue app, so a settings panel such as the /ui
// Tools tab switches the same tools, and it is kept in localStorage.
// Site setting runtimeConfig.public.uiDevTools (or NUXT_PUBLIC_UI_DEV_TOOLS): 'dev' (default), 'always' or 'off'.
const STEPS = [0, 12, 16, 24];
const { visible, cols, button, rhythm, outlines, size, audit, routePath } = useUiDevTools();
const issues = ref<{ el: Element | null; text: string }[]>([]);
const viewport = ref('');
const KEY = 'ui-dev-tools';

const next = () => {
  cols.value = STEPS[(STEPS.indexOf(cols.value) + 1) % STEPS.length] ?? 0;
};
const measure = () => {
  const w = window.innerWidth;
  viewport.value = `${w} × ${window.innerHeight} · ${w < 641 ? 'phone' : w < 1025 ? 'tablet' : 'desktop'}`;
};
const onKey = (e: KeyboardEvent) => {
  if (!e.altKey) return;
  const act: Record<string, () => void> = {
    KeyG: next,
    KeyR: () => (rhythm.value = !rhythm.value),
    KeyO: () => (outlines.value = !outlines.value),
    KeyS: () => (size.value = !size.value),
    KeyA: () => (audit.value = !audit.value),
  };
  if (act[e.code]) {
    e.preventDefault();
    act[e.code]!();
  }
};
// shortcut: page-level checks only; a full audit (Lighthouse, ds7 audit) stays in CI.
const runAudit = () => {
  document.querySelectorAll('.dev-issue').forEach((el) => {
    el.classList.remove('dev-issue');
    el.removeAttribute('data-dev-issue');
  });
  if (!audit.value) return (issues.value = []);
  const found: { el: Element | null; text: string }[] = [];
  const flag = (el: Element | null, text: string) => {
    found.push({ el, text });
    if (el) {
      el.classList.add('dev-issue');
      el.setAttribute('data-dev-issue', text);
    }
  };
  const page = document.querySelectorAll('body *:not(.dev-grid, .dev-grid *)');
  const named = (el: Element) =>
    (el.textContent ?? '').trim() ||
    el.getAttribute('aria-label') ||
    el.getAttribute('aria-labelledby') ||
    el.getAttribute('title');
  page.forEach((el) => {
    // Only what is on screen: hidden tabs, closed dialogs and collapsed parts are checked when they show.
    if (!el.getClientRects().length) return;
    const tag = el.tagName;
    if (tag === 'IMG' && !el.hasAttribute('alt')) flag(el, 'Image without alt');
    if (
      tag === 'IMG' &&
      !(el.getAttribute('width') && el.getAttribute('height')) &&
      getComputedStyle(el.parentElement ?? el).aspectRatio === 'auto'
    )
      flag(el, 'Image without width and height (or a ratio box)');
    if (
      (tag === 'BUTTON' || tag === 'A') &&
      !named(el) &&
      !el.querySelector('img[alt]:not([alt=""])')
    )
      flag(el, `${tag === 'A' ? 'Link' : 'Button'} without a name`);
    if (tag === 'A' && !el.getAttribute('href')) flag(el, 'Link without href');
    if (
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag) &&
      (el as HTMLInputElement).type !== 'hidden'
    ) {
      const id = el.id;
      const labelled =
        el.closest('label') ||
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby');
      if (!labelled) flag(el, 'Field without a label');
    }
  });
  let last = 0;
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = Number(h.tagName[1]);
    if (last && level > last + 1) flag(h, `Heading skips a level (h${last} → h${level})`);
    last = level;
  });
  const h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) flag(null, `Page has ${h1} h1 (needs exactly one)`);
  const ids = new Map<string, number>();
  document.querySelectorAll('[id]').forEach((el) => ids.set(el.id, (ids.get(el.id) ?? 0) + 1));
  ids.forEach(
    (n, id) => n > 1 && flag(document.getElementById(id), `Duplicate id "${id}" (${n}×)`),
  );
  const title = document.title.trim();
  if (title.length < 10 || title.length > 60)
    flag(null, `Title is ${title.length} characters (10–60)`);
  const desc =
    document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '';
  if (desc.length < 50 || desc.length > 160)
    flag(null, `Meta description is ${desc.length} characters (50–160)`);
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  if (!robots.includes('noindex') && !document.querySelector('link[rel="canonical"]'))
    flag(null, 'No canonical link');
  if (!document.documentElement.lang) flag(null, 'No lang on <html>');
  issues.value = found;
};
const goTo = (el: Element | null) => el?.scrollIntoView({ block: 'center' });
watch(audit, () => nextTick(runAudit));
watch([cols, button, rhythm, outlines, size, audit], () => {
  document.documentElement.classList.toggle('dev-outlines', outlines.value);
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        cols: cols.value,
        button: button.value,
        rhythm: rhythm.value,
        outlines: outlines.value,
        size: size.value,
        audit: audit.value,
      }),
    );
  } catch {
    // Private mode: the tools still work, they are just not remembered.
  }
});
onMounted(() => {
  if (!visible) return;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (STEPS.includes(saved.cols)) cols.value = saved.cols;
    button.value = saved.button !== false;
    rhythm.value = saved.rhythm === true;
    outlines.value = saved.outlines === true;
    size.value = saved.size === true;
    audit.value = saved.audit === true;
  } catch {
    // Storage blocked or broken: start with everything off.
  }
  measure();
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('resize', measure);
  document.documentElement.classList.remove('dev-outlines');
  audit.value &&
    document.querySelectorAll('.dev-issue').forEach((el) => el.classList.remove('dev-issue'));
});
// Re-check after page changes (route or tab switches) while the audit is on.
let auditTimer: ReturnType<typeof setTimeout> | undefined;
watch(routePath, () => {
  clearTimeout(auditTimer);
  if (audit.value) auditTimer = setTimeout(runAudit, 300);
});
onBeforeUnmount(() => clearTimeout(auditTimer));
defineExpose({ runAudit });
</script>

<template>
  <div v-if="visible" class="dev-grid">
    <button
      v-if="button"
      type="button"
      class="dev-grid__btn"
      :aria-pressed="cols > 0"
      title="Layout grid (Alt+G)"
      @click="next"
    >
      Grid{{ cols ? ` ${cols}` : '' }}
    </button>
    <div v-if="cols" class="dev-grid__lines" :style="{ '--dev-cols': cols }" aria-hidden="true">
      <i v-for="n in cols" :key="n" />
    </div>
    <div v-if="cols" class="dev-grid__edge" aria-hidden="true" />
    <div v-if="rhythm" class="dev-grid__rhythm" aria-hidden="true" />
    <output v-if="size" class="dev-grid__size">{{ viewport }}</output>
    <aside v-if="audit" class="dev-grid__audit" aria-label="Page audit">
      <p class="dev-grid__audit-head">
        <strong>{{
          issues.length ? `${issues.length} issue${issues.length > 1 ? 's' : ''}` : 'No issues'
        }}</strong>
        <button type="button" class="dev-grid__audit-btn" @click="runAudit">Re-check</button>
      </p>
      <ol v-if="issues.length" class="dev-grid__audit-list">
        <li v-for="(it, i) in issues.slice(0, 40)" :key="i">
          <button
            type="button"
            class="dev-grid__audit-item"
            :disabled="!it.el"
            @click="goTo(it.el)"
          >
            {{ it.text }}
          </button>
        </li>
      </ol>
    </aside>
  </div>
</template>

<style scoped>
.dev-grid__btn {
  position: fixed;
  bottom: var(--space-3);
  left: var(--space-3);
  z-index: 1000;
  min-height: 2rem;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-danger);
  color: var(--color-brand-contrast);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
}
.dev-grid__btn[aria-pressed='true'] {
  background: var(--color-ink);
}
.dev-grid__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.dev-grid__lines,
.dev-grid__edge,
.dev-grid__rhythm {
  position: fixed;
  inset: 0;
  z-index: 999;
  height: 100vh;
  margin-inline: auto;
  pointer-events: none;
  opacity: 0.5;
}
.dev-grid__lines {
  display: grid;
  grid-template-columns: repeat(var(--dev-cols), minmax(0, 1fr));
  gap: var(--grid-gutter);
  width: min(100% - var(--page-gutter) * 2, var(--content-width));
}
.dev-grid__lines i {
  border-inline: 1px solid var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 6%, transparent);
}
.dev-grid__edge {
  width: min(
    100%,
    100% - var(--page-gutter) * 2 + var(--grid-edge) * 2,
    var(--content-width) + var(--grid-edge) * 2
  );
  border-inline: 1px dashed var(--color-danger);
}
.dev-grid__rhythm {
  width: 100%;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 calc(var(--rhythm-step) - 1px),
    color-mix(in srgb, var(--color-info) 45%, transparent) calc(var(--rhythm-step) - 1px)
      var(--rhythm-step)
  );
}
.dev-grid__audit {
  position: fixed;
  right: var(--space-3);
  bottom: calc(var(--space-3) + 2.5rem);
  z-index: 1000;
  width: min(22rem, calc(100vw - 1.5rem));
  max-height: 50vh;
  overflow-y: auto;
  padding: var(--space-3);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
  font-size: var(--text-xs);
}
.dev-grid__audit-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 var(--space-2);
  color: var(--color-danger);
}
.dev-grid__audit-list {
  margin: 0;
  padding-left: var(--space-4);
}
.dev-grid__audit-item,
.dev-grid__audit-btn {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-ink);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dev-grid__audit-item:hover:not(:disabled),
.dev-grid__audit-btn:hover {
  text-decoration: underline;
}
.dev-grid__audit-item:disabled {
  cursor: default;
}
.dev-grid__size {
  position: fixed;
  right: var(--space-3);
  bottom: var(--space-3);
  z-index: 1000;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-ink);
  color: var(--color-brand-contrast);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
</style>

<style>
/* Audit tool: offenders in red; the message shows on hover (global on purpose, it marks the whole page). */
html .dev-issue,
html.dev-outlines .dev-issue {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}
/* Outlines tool: every element gets a thin outline (global on purpose, it has to reach the whole page). */
.dev-outlines *:not(.dev-grid, .dev-grid *) {
  outline: 1px solid color-mix(in srgb, var(--color-info) 40%, transparent);
  outline-offset: -1px;
}
</style>
