<!-- /ui brandbook: foundations, base HTML elements with their tags, every component with its ID, and a copyable catalog. -->
<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { Component, Ref } from 'vue';
import { useHead, useRoute, useRouter } from '#imports';
import { useUiDevTools } from '@ai.all/ui/dev-tools';
import { UiBreadcrumb, UiChips, UiCounter, UiSliderNav, UiTabs, UiTag } from '#components';

useHead({
  title: 'Brandbook · /ui',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    {
      name: 'description',
      content:
        'Brandbook of the site: tokens, base HTML elements, every component with its ID, and developer tools.',
    },
  ],
});

// the gallery page exists on the dev server only
const galleryLink = import.meta.dev;

// Tabs: each tab is its own page of the brandbook, kept in the URL (?tab=) so it can be linked and reloaded.
type Tab = 'foundations' | 'elements' | 'components' | 'catalog' | 'tools';
const tabs: { id: Tab; name: string }[] = [
  { id: 'foundations', name: 'Foundations' },
  { id: 'elements', name: 'Base elements' },
  { id: 'components', name: 'Components' },
  { id: 'catalog', name: 'Catalog' },
  { id: 'tools', name: 'Dev tools' },
];
const route = useRoute();
const router = useRouter();
const tab = computed<Tab>({
  get: () => tabs.find((x) => x.id === route.query.tab)?.id ?? 'foundations',
  set: (v) =>
    void router.replace({ query: { ...route.query, tab: v === 'foundations' ? undefined : v } }),
});
const visitedTabs = reactive(new Set<Tab>([tab.value]));
watch(tab, (value) => {
  visitedTabs.add(value);
});

// Foundations. Values are read from the live theme, so a project overlay shows its own colours here.
type ColourGroup = {
  id: string;
  title: string;
  note: string;
  items: { name: string; role: string }[];
};
const colourGroups: ColourGroup[] = [
  {
    id: 'c-brand',
    title: 'Brand',
    note: 'The only block a project changes to recolour the kit.',
    items: [
      { name: '--color-brand', role: 'Primary actions, links, selected state' },
      { name: '--color-brand-contrast', role: 'Text and icons on brand' },
      { name: '--color-brand-hover', role: 'Hover of brand fills' },
      { name: '--color-accent', role: 'Secondary accent' },
      { name: '--color-accent-soft', role: 'Quiet fills: hover, selected rows, totals' },
    ],
  },
  {
    id: 'c-ink',
    title: 'Ink (text)',
    note: 'Text colours from strongest to quietest. Body text stays on ink, ink-700 or ink-600.',
    items: [
      { name: '--color-ink', role: 'Body text and headings' },
      { name: '--color-ink-700', role: 'Strong secondary text' },
      { name: '--color-ink-600', role: 'Secondary text' },
      { name: '--color-ink-500', role: 'Captions, hints' },
      { name: '--color-ink-400', role: 'Placeholder icons, never body text' },
    ],
  },
  {
    id: 'c-surface',
    title: 'Surfaces',
    note: 'Backgrounds of the page and of what sits on it.',
    items: [
      { name: '--color-paper', role: 'Page background' },
      { name: '--color-surface', role: 'Cards, inputs, dialogs' },
      { name: '--color-surface-elevated', role: 'Raised layers: menus, popovers' },
      { name: '--color-surface-muted', role: 'Code blocks, quiet panels' },
      { name: '--color-placeholder', role: 'Photo placeholder' },
    ],
  },
  {
    id: 'c-line',
    title: 'Lines',
    note: 'Borders and dividers.',
    items: [
      { name: '--color-line-soft', role: 'Faint separators inside a card' },
      { name: '--color-line', role: 'Card and table borders' },
      { name: '--color-line-strong', role: 'Input borders, dividers' },
    ],
  },
  {
    id: 'c-inverse',
    title: 'Inverse (dark bands)',
    note: 'Dark sections, footers and photo overlays. Components use them through the -on-dark modifier.',
    items: [
      { name: '--color-inverse', role: 'Dark band background' },
      { name: '--color-inverse-raised', role: 'Cards on a dark band' },
      { name: '--color-inverse-ink', role: 'Text on dark' },
      { name: '--color-inverse-ink-600', role: 'Secondary text on dark' },
      { name: '--color-inverse-line', role: 'Borders on dark' },
      { name: '--color-inverse-soft', role: 'Quiet fills on dark' },
    ],
  },
  {
    id: 'c-overlay',
    title: 'Overlays',
    note: 'Layers over photos and the page.',
    items: [
      { name: '--color-glass', role: 'Frosted panel over a photo' },
      { name: '--color-veil', role: 'Light wash over a photo' },
      { name: '--color-scrim', role: 'Dark wash for text on a photo' },
      { name: '--color-dim', role: 'Dialog backdrop' },
    ],
  },
  {
    id: 'c-feedback',
    title: 'Feedback',
    note: 'System messages only, never decoration.',
    items: [
      { name: '--color-info', role: 'Information' },
      { name: '--color-success', role: 'Confirmation' },
      { name: '--color-warning', role: 'Warning' },
      { name: '--color-danger', role: 'Errors, required marks' },
    ],
  },
];
const allColours = colourGroups.flatMap((g) => g.items);
const groupCss = (g: ColourGroup) =>
  `/* ${g.title} */\n` + g.items.map((c) => `${c.name}: ${values.value[c.name] || ''};`).join('\n');
const typeScale = [
  { tag: 'h1', token: '--heading-h1', sample: 'Page title, once per page' },
  { tag: 'h2', token: '--heading-h2', sample: 'Section heading' },
  { tag: 'h3', token: '--heading-h3', sample: 'Subsection heading' },
  { tag: 'p.lead', token: '--text-lead', sample: 'Lead paragraph under a title' },
  { tag: 'p', token: '--text-base', sample: 'Body text for reading' },
  { tag: 'small', token: '--text-sm', sample: 'Small print, captions, labels' },
  { tag: 'span', token: '--text-xs', sample: 'Tags, hints, eyebrows' },
];
const spaces = [
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-6',
  '--space-8',
  '--space-12',
  '--space-16',
];
const radii = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-pill'];
const shadows = ['--shadow-card', '--shadow-modal'];

const values = ref<Record<string, string>>({});
onMounted(() => {
  const css = getComputedStyle(document.documentElement);
  for (const t of [...allColours, ...typeScale.map((x) => ({ name: x.token }))]) {
    values.value[t.name] = css.getPropertyValue(t.name).trim();
  }
});
// WCAG contrast against the page background (inverse colours against the dark band), measured from the live colour (hex or rgb only).
const rgb = (value = '') => {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const full = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join('') : hex[1]!;
    const n = Number.parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const fn = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[,/]\s*([\d.]+))?\)$/i);
  return fn && (fn[4] === undefined || Number(fn[4]) === 1) ? fn.slice(1, 4).map(Number) : null;
};
const lum = (c: number[]) =>
  c
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
const contrast = (name: string, against = '--color-paper') => {
  const a = rgb(values.value[name]);
  const b = rgb(values.value[against]);
  if (!a || !b) return '';
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m) as [number, number];
  return `${((x + 0.05) / (y + 0.05)).toFixed(1)}:1`;
};

// Base elements: every HTML element a page can use, with a sample, its tags and a copy button for the HTML.
// `code: true` shows the markup as text (document-level tags, or tags that may appear once per page).
// Static, trusted markup written here, never user input.
type Sample = { html: string; tags: [string, string][]; code?: boolean };
const elementGroups: { id: string; title: string; note: string; items: Sample[] }[] = [
  {
    id: 'el-document',
    title: 'Document and metadata',
    note: 'Written by the framework (app.vue, useHead, nuxt.config), never typed into a page.',
    items: [
      {
        code: true,
        html: '<!doctype html>\n<html lang="en">\n  <head>…</head>\n  <body>…</body>\n</html>',
        tags: [
          ['html', 'Root element with lang'],
          ['head', 'Document metadata'],
          ['body', 'Document content'],
        ],
      },
      {
        code: true,
        html: '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Page title · Site</title>\n<meta name="description" content="One sentence about the page.">\n<link rel="canonical" href="https://example.com/">',
        tags: [
          ['meta', 'Metadata: charset, viewport, description'],
          ['title', 'Page title, one per page'],
          ['link', 'Link to a resource: canonical, icon'],
        ],
      },
      {
        code: true,
        html: '<script type="application/ld+json">{ "@type": "Organization" }<\/script>\n<noscript>Turn on JavaScript to use the calculator.</noscript>',
        tags: [
          ['script', 'Script or structured data'],
          ['noscript', 'Fallback without JavaScript'],
        ],
      },
    ],
  },
  {
    id: 'el-structure',
    title: 'Page structure',
    note: 'One header, main and footer per page; nav for menus; article for pieces that stand alone.',
    items: [
      {
        code: true,
        html: '<body>\n  <header>…logo, nav…</header>\n  <main id="main">…sections…</main>\n  <footer>…</footer>\n</body>',
        tags: [['main', 'Main content, one per page']],
      },
      {
        html: '<nav aria-label="Example"><ul><li><a href="#el-structure">Products</a></li><li><a href="#el-structure">Pricing</a></li><li><a href="#el-structure">Contact</a></li></ul></nav>',
        tags: [
          ['nav', 'Navigation block'],
          ['ul', 'Bulleted list'],
          ['li', 'List item'],
          ['a', 'Link'],
        ],
      },
      {
        html: '<section aria-labelledby="el-sec-h"><article><hgroup><h3 id="el-sec-h">Article title</h3><p>Subtitle that belongs to the heading.</p></hgroup><p>Content that can be read on its own, apart from the rest of the page.</p><aside><p>Side note related to the article.</p></aside></article></section>',
        tags: [
          ['section', 'Page section'],
          ['article', 'Standalone content'],
          ['hgroup', 'Heading with its subtitle'],
          ['h3', 'Subsection heading'],
          ['aside', 'Side note'],
        ],
      },
      {
        html: '<header><p>Section header: short title and links.</p></header><footer><p>Section footer: contacts and legal notes.</p></footer>',
        tags: [
          ['header', 'Section header'],
          ['footer', 'Section footer'],
          ['p', 'Paragraph'],
        ],
      },
      {
        html: '<search><label for="el-search">Search</label><input id="el-search" type="search" name="q" placeholder="Type to search"></search>',
        tags: [
          ['search', 'Search block'],
          ['label', 'Field label'],
          ['input', 'Input, type=search'],
        ],
      },
      {
        html: '<address>Example Ltd<br>1 Main Street, 10001 City<br><a href="tel:+10000000000">+1 000 000 0000</a> · <a href="mailto:hello@example.com">hello@example.com</a></address>',
        tags: [
          ['address', 'Contact details'],
          ['br', 'Line break'],
          ['a', 'Link: tel and mailto'],
        ],
      },
      {
        html: '<div>Generic block with no meaning, <span>and a generic inline span</span>, for styling only.</div>',
        tags: [
          ['div', 'Generic block container'],
          ['span', 'Generic inline container'],
        ],
      },
    ],
  },
  {
    id: 'el-headings',
    title: 'Headings',
    note: 'One h1 per page (shown as code here), then h2 to h6 in order without skipping levels.',
    items: [
      { code: true, html: '<h1>Page title</h1>', tags: [['h1', 'Page title, once per page']] },
      {
        html: '<h2>Our services</h2><p>A section heading opens a block of the page. Under it goes a short paragraph that says what the section is about.</p>',
        tags: [
          ['h2', 'Section heading'],
          ['p', 'Paragraph'],
        ],
      },
      {
        html: '<h3>Full service</h3><p>A subsection inside a section: one service, one topic, one question.</p>',
        tags: [['h3', 'Subsection heading']],
      },
      {
        html: '<h4>What is included</h4><p>Used for small groups inside a subsection, such as a list of features.</p>',
        tags: [['h4', 'Level 4 heading']],
      },
      {
        html: '<h5>Contact</h5><p>Small caps: footer columns, side notes, labels over a block.</p>',
        tags: [['h5', 'Level 5 heading, small caps']],
      },
      {
        html: '<h6>Price table</h6><p>The smallest heading, in spaced capitals: over a table or a short list.</p>',
        tags: [['h6', 'Level 6 heading, the smallest']],
      },
    ],
  },
  {
    id: 'el-text',
    title: 'Text and inline meaning',
    note: 'Inline tags carry meaning, not only looks: strong for importance, em for stress, time and data for machines.',
    items: [
      {
        html: '<p class="lead">Lead paragraph: the size and line height of the text under a title.</p>',
        tags: [['p', 'Paragraph, class lead']],
      },
      {
        html: '<p>We send the <strong>final price</strong> before we start and, if anything changes, <em>we ask first</em>. See <a href="#el-text">how it works</a>.</p>',
        tags: [
          ['strong', 'Important text'],
          ['em', 'Stress emphasis'],
          ['a', 'Link'],
        ],
      },
      {
        html: '<p>Text with <b>bold</b>, <i>italic</i>, <u>annotation</u>, <s>old price</s>, <q>short quote</q> and a <dfn>defined term</dfn>. Change: <del>$120</del> <ins>$99</ins>.</p>',
        tags: [
          ['b', 'Bold without importance'],
          ['i', 'Italic without stress'],
          ['u', 'Annotation underline'],
          ['s', 'No longer accurate'],
          ['q', 'Inline quote'],
          ['dfn', 'Defined term'],
          ['del', 'Deleted text'],
          ['ins', 'Inserted text'],
        ],
      },
      {
        html: '<p><small>Tax included</small>, area 100 m<sup>2</sup>, CO<sub>2</sub>, <mark>highlighted text</mark>, <abbr title="Web Content Accessibility Guidelines">WCAG</abbr>, <cite>Style Guide 2026</cite>.</p>',
        tags: [
          ['small', 'Small print'],
          ['sup', 'Superscript'],
          ['sub', 'Subscript'],
          ['mark', 'Highlight'],
          ['abbr', 'Abbreviation with its full form'],
          ['cite', 'Title of a work'],
        ],
      },
      {
        html: '<p>Delivery on <time datetime="2026-05-01">1 May</time> at <time datetime="10:00">10:00</time>. Product <data value="SKU-100">Model 100</data>.</p>',
        tags: [
          ['time', 'Date or time, machine-readable'],
          ['data', 'Value with a machine-readable code'],
        ],
      },
      {
        html: '<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd>, run <code>npm run dev</code>, output <samp>OK</samp>, formula <var>area</var> × <var>price</var>.</p>',
        tags: [
          ['kbd', 'Keyboard key'],
          ['code', 'Code fragment'],
          ['samp', 'Program output'],
          ['var', 'Variable'],
        ],
      },
      {
        html: '<p>User <bdi>إيان</bdi> booked a visit. Forced direction: <bdo dir="rtl">text</bdo>. Long word with optional<wbr>break<wbr>points.</p>',
        tags: [
          ['bdi', 'Text with its own direction'],
          ['bdo', 'Forced direction'],
          ['wbr', 'Optional line break'],
        ],
      },
    ],
  },
  {
    id: 'el-lists',
    title: 'Lists',
    note: 'ul for features, ol for steps (start and reversed change the numbers), dl for facts, menu for a toolbar.',
    items: [
      {
        html: '<ul><li>First feature.</li><li>Second feature.<ul><li>Nested detail.</li><li>Another detail.</li></ul></li><li>Third feature.</li></ul>',
        tags: [
          ['ul', 'Bulleted list'],
          ['li', 'List item'],
        ],
      },
      {
        html: '<ol><li>Choose a product.</li><li>Configure it.</li><li>Get a fixed quote.</li></ol>',
        tags: [
          ['ol', 'Numbered list'],
          ['li', 'List item'],
        ],
      },
      {
        html: '<dl><dt>Area</dt><dd>100 m²</dd><dt>Rooms</dt><dd>3</dd><dt>Lead time</dt><dd>4 to 8 weeks.</dd></dl>',
        tags: [
          ['dl', 'Description list'],
          ['dt', 'Term'],
          ['dd', 'Description'],
        ],
      },
      {
        html: '<menu><li><button type="button">Save</button></li><li><button type="button">Share</button></li><li><button type="button">Print</button></li></menu>',
        tags: [
          ['menu', 'Toolbar of actions'],
          ['button', 'Button'],
        ],
      },
    ],
  },
  {
    id: 'el-blocks',
    title: 'Quotes, code and disclosure',
    note: 'blockquote for reviews, pre for preformatted text, figure for anything with a caption, details for questions.',
    items: [
      {
        html: '<blockquote cite="https://example.com/reviews"><p>Clear process, fair price and a team that answers the same day.</p><cite>Anna R., customer</cite></blockquote>',
        tags: [
          ['blockquote', 'Block quote'],
          ['cite', 'Quote source'],
        ],
      },
      {
        html: '<pre><code>npm install\nnpm run dev</code></pre>',
        tags: [
          ['pre', 'Preformatted text'],
          ['code', 'Code fragment'],
        ],
      },
      {
        html: '<figure><svg viewBox="0 0 24 24" width="56" height="56" role="img" aria-label="Square" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/></svg><figcaption>A figure with an SVG and its caption.</figcaption></figure>',
        tags: [
          ['figure', 'Figure'],
          ['svg', 'Vector graphic'],
          ['figcaption', 'Figure caption'],
        ],
      },
      {
        html: '<details><summary>Do I need a permit?</summary><p>It depends on the city. We help with the paperwork.</p></details>',
        tags: [
          ['details', 'Disclosure block'],
          ['summary', 'Disclosure heading'],
        ],
      },
      {
        html: '<p>Text above the break.</p><hr><p>Text below the break.</p>',
        tags: [['hr', 'Thematic break']],
      },
    ],
  },
  {
    id: 'el-tables',
    title: 'Tables',
    note: 'Tables are for data only, never for layout. caption names the table, th scope tells readers what a cell belongs to.',
    items: [
      {
        html: '<table><caption>Prices without tax</caption><thead><tr><th scope="col">Service</th><th scope="col">Time</th><th scope="col">Price</th></tr></thead><tbody><tr><td>Express</td><td>45 min</td><td>$35</td></tr><tr><td>Full</td><td>2 h</td><td>$80</td></tr></tbody><tfoot><tr><th scope="row">Example total</th><td colspan="2">$115</td></tr></tfoot></table>',
        tags: [
          ['table', 'Table'],
          ['caption', 'Table caption'],
          ['thead', 'Table head'],
          ['tbody', 'Table body'],
          ['tfoot', 'Table footer'],
          ['tr', 'Table row'],
          ['th', 'Header cell'],
          ['td', 'Data cell'],
        ],
      },
    ],
  },
  {
    id: 'el-forms',
    title: 'Forms',
    note: 'Every field has a label; related fields share a fieldset with a legend. Components FIELD-01 and SELECT-01 build on these.',
    items: [
      {
        html: '<form onsubmit="return false"><fieldset><legend>Contact</legend><label for="el-name">Name</label><input id="el-name" name="name" autocomplete="name" placeholder="Your name"><label for="el-msg">Message</label><textarea id="el-msg" name="message" placeholder="How can we help?"></textarea></fieldset></form>',
        tags: [
          ['form', 'Form'],
          ['fieldset', 'Group of fields'],
          ['legend', 'Group title'],
          ['label', 'Field label'],
          ['input', 'Input'],
          ['textarea', 'Multi-line field'],
        ],
      },
      {
        html: '<label for="el-select">Plan</label><select id="el-select"><optgroup label="Monthly"><option>Basic</option><option>Pro</option></optgroup><optgroup label="Yearly"><option>Basic yearly</option></optgroup></select>',
        tags: [
          ['select', 'Drop-down list'],
          ['optgroup', 'Group of options'],
          ['option', 'Option'],
        ],
      },
      {
        html: '<p><label><input type="checkbox" checked> Checkbox</label> <label><input type="radio" name="el-r" checked> Radio A</label> <label><input type="radio" name="el-r"> Radio B</label></p><p><label for="el-range">Range</label><input id="el-range" type="range" min="0" max="10" value="6"></p>',
        tags: [['input', 'Input: checkbox, radio, range']],
      },
      {
        html: '<label for="el-city">City</label><input id="el-city" list="el-cities" placeholder="Start typing"><datalist id="el-cities"><option value="Berlin"></option><option value="Madrid"></option><option value="Paris"></option></datalist>',
        tags: [['datalist', 'Suggestions for an input']],
      },
      {
        html: '<p>Upload <progress value="70" max="100">70%</progress> · Storage <meter value="0.6">60%</meter> · Total <output>$99</output></p>',
        tags: [
          ['progress', 'Progress of a task'],
          ['meter', 'Value within a range'],
          ['output', 'Result of a calculation'],
        ],
      },
      {
        html: '<p><button type="button">Button</button> <button type="button" disabled>Disabled</button></p>',
        tags: [['button', 'Native button (component: BTN-01)']],
      },
    ],
  },
  {
    id: 'el-media',
    title: 'Media and embeds',
    note: 'Images always carry width, height and alt. picture switches sources; video and audio need controls and captions.',
    items: [
      {
        code: true,
        html: '<picture>\n  <source srcset="/photo.avif" type="image/avif">\n  <img src="/photo.jpg" alt="What the photo shows" width="1200" height="800" loading="lazy">\n</picture>',
        tags: [
          ['picture', 'Responsive image'],
          ['source', 'Alternative source'],
          ['img', 'Image'],
        ],
      },
      {
        code: true,
        html: '<video controls width="1280" height="720" poster="/poster.jpg">\n  <source src="/clip.mp4" type="video/mp4">\n  <track kind="captions" src="/clip.vtt" srclang="en" label="English">\n</video>\n<audio controls src="/sound.mp3"></audio>',
        tags: [
          ['video', 'Video'],
          ['track', 'Captions track'],
          ['audio', 'Audio'],
        ],
      },
      {
        code: true,
        html: '<iframe src="https://www.example.com/embed" title="What the embed shows" width="560" height="315" loading="lazy"></iframe>\n<canvas width="300" height="150"></canvas>',
        tags: [
          ['iframe', 'Embedded page, always with title'],
          ['canvas', 'Drawing surface'],
        ],
      },
      {
        code: true,
        html: '<dialog open>\n  <p>Native dialog. Component MODAL-01 uses it.</p>\n</dialog>',
        tags: [['dialog', 'Dialog window']],
      },
    ],
  },
];
// One row per tag for the index table, in order of first appearance.
const tagIndex = computed(() => {
  const seen = new Map<string, string>();
  for (const g of elementGroups)
    for (const it of g.items) for (const [t, d] of it.tags) if (!seen.has(t)) seen.set(t, d);
  return [...seen].map(([tag, desc]) => ({ tag, desc }));
});
const tagQuery = ref('');
const tagRows = computed(() => {
  const q = tagQuery.value.trim().toLowerCase();
  return q
    ? tagIndex.value.filter((r) => r.tag.includes(q) || r.desc.toLowerCase().includes(q))
    : tagIndex.value;
});
// "In use" page: each row lists the tags inside it, and every element gets a title with its tag and purpose.
const usage = ref<HTMLElement | null>(null);
const showTags = ref(false);
const tagDesc = computed<Record<string, string>>(() =>
  Object.fromEntries(tagIndex.value.map((r) => [r.tag, r.desc])),
);
const usageTags = ref<string[][]>([]);
onMounted(() => {
  const rows = usage.value?.querySelectorAll<HTMLElement>('.bb__tagged > .bb__sample') ?? [];
  usageTags.value = [...rows].map((row) => {
    const els = [...row.querySelectorAll<HTMLElement>('*')];
    for (const el of els) {
      const tag = el.tagName.toLowerCase();
      if (!el.title && tagDesc.value[tag]) el.title = `<${tag}> ${tagDesc.value[tag]}`;
    }
    return [...new Set(els.map((el) => el.tagName.toLowerCase()))].filter((t) => t !== 'path');
  });
});
// Hovering a tag chip outlines the matching elements in its sample.
const hlOn = (e: Event) => {
  const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-tag]');
  if (!chip) return;
  hlOff();
  chip
    .closest('.bb__tagged')
    ?.querySelectorAll<HTMLElement>(`.bb__sample ${chip.dataset.tag}`)
    .forEach((el) => el.classList.add('-hl'));
};
const hlOff = () => document.querySelectorAll('.-hl').forEach((el) => el.classList.remove('-hl'));

// Components: one entry per pattern ID. Name, description, classes and usage are what the copy buttons give.
type Level = 'atom' | 'molecule' | 'organism';
type Entry = {
  id: string;
  name: string;
  level: Level;
  component: string;
  classes: string;
  description: string;
  usage: string;
  btn?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  matrix?: string;
};
const catalog: Entry[] = [
  {
    id: 'ICON-01',
    name: 'Line icon',
    level: 'atom',
    component: 'UiIcon',
    classes: 'icon',
    description:
      'Line icon on a 24px grid, 1.5 stroke, colour from currentColor. Decorative unless label is set.',
    usage: '<UiIcon name="check" />',
  },
  {
    id: 'BTN-01',
    name: 'Primary button',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -primary',
    description: 'Main action of a block, one per block. Brand fill; white fill on dark.',
    usage: '<UiButton>Get started</UiButton>',
    btn: 'primary',
  },
  {
    id: 'BTN-02',
    name: 'Secondary button',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -secondary',
    description: 'Second action of equal weight: a soft fill without a border.',
    usage: '<UiButton variant="secondary">Compare</UiButton>',
    btn: 'secondary',
  },
  {
    id: 'BTN-03',
    name: 'Outline button',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -outline',
    description: 'Secondary action next to a primary one; the border darkens on hover.',
    usage: '<UiButton variant="outline">Learn more</UiButton>',
    btn: 'outline',
  },
  {
    id: 'BTN-04',
    name: 'Ghost button',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -ghost',
    description: 'Quiet action in toolbars, cards and dialogs; a fill appears only on hover.',
    usage: '<UiButton variant="ghost">Cancel</UiButton>',
    btn: 'ghost',
  },
  {
    id: 'BTN-05',
    name: 'Link button',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -link',
    description: 'Action that reads as a link inside text or under a card.',
    usage: '<UiButton variant="link" href="/terms">Read the terms</UiButton>',
    btn: 'link',
  },
  {
    id: 'BTN-06',
    name: 'Button with icon, square and full width',
    level: 'atom',
    component: 'UiButton',
    classes: 'btn -square, -block',
    description:
      'Icon before or after the label (UiIcon in the slot), icon-only square with aria-label, and full width for phones and forms.',
    usage: '<UiButton square aria-label="Search"><UiIcon name="search" /></UiButton>',
  },
  {
    id: 'TAG-01',
    name: 'Tag',
    level: 'atom',
    component: 'UiTag',
    classes: 'tag -solid, -outline, -muted, -small, -on-dark',
    description:
      'Short label or category: solid, outline or muted; small or medium; a link when href is set; on dark.',
    usage: '<UiTag variant="outline">New</UiTag>',
    matrix: 'TAG',
  },
  {
    id: 'COPY-01',
    name: 'Copy button',
    level: 'atom',
    component: 'UiCopyButton',
    classes: 'copy-button, -text, -done',
    description: 'Copies a value to the clipboard and announces the result to screen readers.',
    usage: '<UiCopyButton value="hello@example.com" label="email" />',
  },
  {
    id: 'CHECK-01',
    name: 'Checkbox',
    level: 'atom',
    component: 'UiCheckbox',
    classes: 'check, -checked, -disabled',
    description: 'Native checkbox with a custom box.',
    usage: '<UiCheckbox v-model="agree" label="I agree" />',
  },
  {
    id: 'SWITCH-01',
    name: 'Switch',
    level: 'atom',
    component: 'UiSwitch',
    classes: 'switch, -on, -disabled',
    description: 'On/off toggle with role="switch" for settings that apply at once.',
    usage: '<UiSwitch v-model="on" label="Notifications" />',
  },
  {
    id: 'IMG-01',
    name: 'Image',
    level: 'atom',
    component: 'UiImg',
    classes: 'img',
    description: 'Image with width and height so the box is reserved; lazy unless priority.',
    usage: '<UiImg src="/photo.webp" alt="What it shows" :width="1200" :height="800" />',
  },
  {
    id: 'MEDIA-01',
    name: 'Media frame',
    level: 'atom',
    component: 'UiMedia',
    classes: 'media, -empty, -round',
    description: 'Photo cropped to a ratio, or a grey placeholder until the photo exists.',
    usage: '<UiMedia alt="Product photo" ratio="16 / 9" />',
  },
  {
    id: 'FIELD-01',
    name: 'Text field',
    level: 'molecule',
    component: 'UiField',
    classes: 'field, -error',
    description: 'Label, input or textarea, hint and an error after the field is left.',
    usage: '<UiField v-model="email" kind="email" label="Email" required />',
  },
  {
    id: 'SELECT-01',
    name: 'Select',
    level: 'molecule',
    component: 'UiSelect',
    classes: 'select, -error',
    description: 'Native select with a label, placeholder and an error after the field is left.',
    usage: '<UiSelect v-model="plan" label="Plan" :options="plans" required />',
  },
  {
    id: 'CHIPS-01',
    name: 'Chips',
    level: 'molecule',
    component: 'UiChips',
    classes: 'chips -pill, -soft, -segment, -tile, -small, -on-dark; chips__chip -on',
    description:
      'Pick one or several options: pills, soft chips, a segmented track or icon tiles; small or medium; light or dark.',
    usage: '<UiChips v-model="size" legend="Size" :options="sizes" variant="segment" />',
    matrix: 'CHIPS',
  },
  {
    id: 'ALERT-01',
    name: 'Alert',
    level: 'molecule',
    component: 'UiAlert',
    classes: 'alert, -info, -success, -warning, -danger',
    description: 'Feedback block; danger is announced as an alert, the rest as status.',
    usage: '<UiAlert tone="success" title="Saved">Your changes are saved.</UiAlert>',
  },
  {
    id: 'SPECS-01',
    name: 'Specs',
    level: 'molecule',
    component: 'UiSpecs',
    classes: 'specs',
    description: 'Key facts as value and label pairs.',
    usage: "<UiSpecs :items=\"[{ value: '100 m²', label: 'Area' }]\" />",
  },
  {
    id: 'PRICEBOX-01',
    name: 'Price box',
    level: 'molecule',
    component: 'UiPriceBox',
    classes: 'pbox',
    description: 'Base and extras lines over a total box; money formatted with Intl.',
    usage:
      '<UiPriceBox base-label="Base" :base="900" extras-label="Extras" :extras="120" total-label="Total" :total="1020" />',
  },
  {
    id: 'STEPPER-01',
    name: 'Stepper',
    level: 'molecule',
    component: 'UiStepper',
    classes: 'stepper, stepper__step -done',
    description: 'Numbered steps of a flow; done steps show a check.',
    usage: '<UiStepper :steps="steps" :current="1" label="Checkout" />',
  },
  {
    id: 'TIMELINE-01',
    name: 'Timeline',
    level: 'molecule',
    component: 'UiTimeline',
    classes: 'tline',
    description: 'Numbered road of steps with a title and a short text each.',
    usage: "<UiTimeline :items=\"[{ title: 'Call', text: 'We talk about the goal.' }]\" />",
  },
  {
    id: 'FAQ-01',
    name: 'Accordion (FAQ)',
    level: 'molecule',
    component: 'UiAccordion',
    classes: 'faq, -plain, -accent; faq__item, faq__q, faq__a',
    description:
      'Questions that open one at a time: opening one closes the rest. Native details, keyboard and screen-reader friendly.',
    usage: '<UiAccordion :items="[{ q: \'How long?\', a: \'Same day.\' }]" :open="0" />',
  },
  {
    id: 'COUNTER-01',
    name: 'Counter (− / +)',
    level: 'molecule',
    component: 'UiCounter',
    classes: 'counter -outline, -inner, -small, -on-dark; counter__btn, counter__input',
    description:
      'A bounded number with − and +: guests, quantity, rooms. Arrow keys change it, typing is clamped to min and max.',
    usage: '<UiCounter v-model="guests" label="Guests" :min="0" :max="10" />',
    matrix: 'COUNTER',
  },
  {
    id: 'TABS-01',
    name: 'Tabs',
    level: 'molecule',
    component: 'UiTabs',
    classes: 'tabs -underline, -pill, -small, -on-dark; tabs__tab',
    description:
      'Switch between views of one block (plan, specs, photos). Arrow keys move between tabs; panels stay in the page.',
    usage: '<UiTabs v-model="view" :tabs="tabs" label="Product views" />',
    matrix: 'TABS',
  },
  {
    id: 'BREADCRUMB-01',
    name: 'Breadcrumb',
    level: 'molecule',
    component: 'UiBreadcrumb',
    classes: 'crumbs -plain, -pill, -on-dark; crumbs__link',
    description:
      'Where the page sits in the site. The last item is the current page and not a link.',
    usage: "<UiBreadcrumb :items=\"[{ label: 'Home', href: '/' }, { label: 'Services' }]\" />",
    matrix: 'CRUMBS',
  },
  {
    id: 'SLIDERNAV-01',
    name: 'Slider controls',
    level: 'molecule',
    component: 'UiSliderNav',
    classes: 'slider-nav -numbered, -small, -on-dark; slider-nav__dot, slider-nav__arrow',
    description:
      'Navigation for any slider: dots and arrows, numbers, arrows only or dots only; small; on dark.',
    usage: '<UiSliderNav v-model="index" :count="5" />',
    matrix: 'SLIDER',
  },
  {
    id: 'GRID-01',
    name: 'Card grid',
    level: 'organism',
    component: 'UiCardGrid',
    classes: 'cards, -cols-3, -cols-4',
    description: 'Equal columns of cards that collapse on tablets and phones.',
    usage: '<UiCardGrid :columns="3">…cards…</UiCardGrid>',
  },
  {
    id: 'MODAL-01',
    name: 'Modal',
    level: 'organism',
    component: 'UiModal',
    classes:
      'modal -small, -wide, -read, -side, -bottom; modal__cover, modal__head, modal__body, modal__foot',
    description:
      'Native dialog with a blurred page behind: dialog, confirm, reading, wide form, side panel, bottom sheet and with a photo.',
    usage: '<UiModal :open="open" title="Contact us" @close="open = false">…</UiModal>',
  },
  {
    id: 'LIGHTBOX-01',
    name: 'Lightbox',
    level: 'organism',
    component: 'UiLightbox',
    classes: 'lightbox',
    description: 'Photo full screen with zoom; keys + - 0; focus returns to the opener.',
    usage: '<UiLightbox :open="open" src="/photo.webp" alt="…" @close="open = false" />',
  },
];
const levels: { id: Level; name: string; note: string }[] = [
  { id: 'atom', name: 'Atoms', note: 'Smallest parts: one job, no other components inside.' },
  {
    id: 'molecule',
    name: 'Molecules',
    note: 'A few atoms working together as one control or block.',
  },
  {
    id: 'organism',
    name: 'Organisms',
    note: 'Complete pieces of a page: grids, dialogs, viewers.',
  },
];
// Button system: sizes and every state, shown on a light surface and on a dark band.
const btnSizes = [
  { size: 'small', label: 'Small', note: '36 px high, text-sm' },
  { size: 'md', label: 'Medium', note: '44 px high, default' },
  { size: 'big', label: 'Big', note: '52 px high, text-lead' },
] as const;
const btnStates = [
  { id: 'default', label: 'Default', cls: '', attrs: '', code: '', note: 'At rest.' },
  {
    id: 'hover',
    code: ':hover',
    label: 'Hover',
    cls: '-hover',
    attrs: '',
    note: 'Pointer over: fill or border shifts one step.',
  },
  {
    id: 'active',
    code: ':active',
    label: 'Active',
    cls: '-active',
    attrs: '',
    note: 'Pressed: moves 1 px down, 98% scale.',
  },
  {
    id: 'focus',
    code: ':focus-visible',
    label: 'Focus',
    cls: '-focus',
    attrs: '',
    note: 'Keyboard focus: 2 px ring, 2 px offset.',
  },
  {
    id: 'disabled',
    code: 'disabled',
    label: 'Disabled',
    cls: '',
    attrs: ' disabled',
    note: '45% opacity, not clickable.',
  },
  {
    id: 'loading',
    code: 'loading',
    label: 'Loading',
    cls: '',
    attrs: ' loading',
    note: 'Spinner, aria-busy, not clickable.',
  },
] as const;
// What a state's copy button gives: the attribute for disabled/loading, the CSS selector for the rest.
const stateCopy = (variant: string, st: (typeof btnStates)[number], dark = false) =>
  st.attrs
    ? btnTag(variant, `${dark ? ' on-dark' : ''}${st.attrs}`)
    : `.btn.-${variant}${dark ? '.-on-dark' : ''}${st.code}`;
const btnTag = (variant: string, extra = '') =>
  `<UiButton${variant === 'primary' ? '' : ` variant="${variant}"`}${extra}>Label</UiButton>`;

const card = (e: Entry) =>
  `${e.id} · ${e.name}\n${e.description}\nComponent: ${e.component}\nClasses: ${e.classes}\nUsage: ${e.usage}`;
const catalogMarkdown = computed(
  () =>
    '| ID | Name | Level | Component | Classes | Description |\n|---|---|---|---|---|---|\n' +
    catalog
      .map(
        (e) =>
          `| ${e.id} | ${e.name} | ${e.level} | ${e.component} | \`${e.classes}\` | ${e.description} |`,
      )
      .join('\n'),
);
const catalogQuery = ref('');
const catalogRows = computed(() => {
  const q = catalogQuery.value.trim().toLowerCase();
  return q ? catalog.filter((e) => Object.values(e).join(' ').toLowerCase().includes(q)) : catalog;
});

// Fixed menu (top right): the same tabs and on-page links, reachable from anywhere on the page.
// Native popover: Escape and a click outside close it; picking a tab or a link closes it too.
const menu = ref<HTMLElement | null>(null);
// Anchor links land below the sticky bar: scroll-padding follows the bar's real height (it changes with width).
const bar = ref<HTMLElement | null>(null);
let barObserver: ResizeObserver | undefined;
onMounted(() => {
  const root = document.documentElement;
  // A deep link (?tab=components#BTN-01) is scrolled before the tab is shown; scroll again once the padding is set.
  let first = true;
  barObserver = new ResizeObserver(([entry]) => {
    root.style.scrollPaddingTop = `${Math.ceil(entry!.borderBoxSize[0]!.blockSize) + 16}px`;
    if (first && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    first = false;
  });
  if (bar.value) barObserver.observe(bar.value);
});
onBeforeUnmount(() => {
  barObserver?.disconnect();
  document.documentElement.style.scrollPaddingTop = '';
});
const closeMenu = () => menu.value?.hidePopover?.();
const pick = (id: Tab) => {
  tab.value = id;
  closeMenu();
  window.scrollTo({ top: 0 });
};

// How much to show, for people who only want to look: View (demos), Info (+ names, classes, code), Full (+ copy).
const detail = ref<string | string[]>('Full');
watch(detail, (v) => {
  try {
    localStorage.setItem('ui-bb-detail', String(v));
  } catch {
    // Not remembered in private mode.
  }
});
onMounted(() => {
  try {
    const saved = localStorage.getItem('ui-bb-detail');
    if (saved === 'View' || saved === 'Info') detail.value = saved;
  } catch {
    // Storage blocked: stay on Full.
  }
});
// Developer tools controls: the same shared state UiDevTools uses, so the menu and the page switch it together.
const {
  visible: gridOn,
  mode: gridMode,
  cols: gridCols,
  button: gridButton,
  rhythm,
  outlines,
  size,
  audit,
} = useUiDevTools();
const toolState: Record<string, Ref<boolean>> = { rhythm, outlines, size, audit };
const devTools = [
  {
    id: 'grid',
    name: 'Layout grid',
    key: 'G',
    switch: '',
    note: 'Columns inside the page container, to check that blocks start and end on the grid. A dashed line runs one base step outside the columns.',
    checks: [
      '12, 16 or 24 columns inside --content-width',
      '--grid-gutter between columns',
      'dashed edge --grid-edge outside them',
    ],
  },
  {
    id: 'rhythm',
    name: 'Baseline rhythm',
    key: 'R',
    switch: 'Show horizontal lines every --rhythm-step',
    note: 'Horizontal lines every base step, to check vertical spacing: text, cards and gaps should sit on them.',
    checks: ['line every --rhythm-step (8 px by default)', 'paddings and gaps in multiples of it'],
  },
  {
    id: 'outlines',
    name: 'Outlines',
    key: 'O',
    switch: 'Outline every element',
    note: 'A thin outline on every element, to see boxes, stray wrappers and anything that overflows.',
    checks: ['every element outlined', 'overflow and empty wrappers become visible'],
  },
  {
    id: 'size',
    name: 'Viewport size',
    key: 'S',
    switch: 'Show width × height and breakpoint',
    note: 'A corner badge with the window size and the breakpoint, to test layouts at 375, 768 and 1280.',
    checks: ['phone up to 640 px', 'tablet up to 1024 px', 'desktop above'],
  },
  {
    id: 'audit',
    name: 'Visual check',
    key: 'A',
    switch: 'Mark problems in red and list them',
    note: 'Marks in red what the page is missing for accessibility and SEO, with the reason on hover, and lists it in a panel; click an item to scroll to it.',
    checks: [
      'image without alt, width or height',
      'link or button without a name, link without href',
      'field without a label',
      'heading that skips a level, not exactly one h1',
      'duplicate id',
      'title 10–60 and description 50–160 characters, canonical, lang',
    ],
  },
];
// the same state UiDevTools uses: the columns and the steps 0 → 12 → 16 → 24 → 0 (gridCols above is the same ref)
const gridColsShared = gridCols;
const cycleGrid = () => {
  const steps = [0, 12, 16, 24];
  gridColsShared.value = steps[(steps.indexOf(gridColsShared.value) + 1) % steps.length] ?? 0;
};
const gridColsLabel = computed({
  get: () => (gridCols.value ? String(gridCols.value) : 'Off'),
  set: (v: string | string[]) => (gridCols.value = Number(v) || 0),
});

const toc = computed(() => {
  if (tab.value === 'foundations')
    return [
      { id: 'colours', name: 'Colours' },
      ...colourGroups.map((g) => ({ id: g.id, name: g.title })),
      { id: 'type', name: 'Type' },
      { id: 'space', name: 'Space, radius, shadow' },
    ];
  if (tab.value === 'elements')
    return [
      { id: 'el-usage', name: 'In use' },
      ...elementGroups.map((g) => ({ id: g.id, name: g.title })),
      { id: 'el-index', name: 'All tags' },
    ];
  if (tab.value === 'components') return levels.map((l) => ({ id: `lvl-${l.id}`, name: l.name }));
  if (tab.value === 'tools')
    return [
      { id: 't-about', name: 'About' },
      ...devTools.map((t) => ({ id: `t-${t.id}`, name: t.name })),
      { id: 't-settings', name: 'Setting and shortcuts' },
    ];
  return [{ id: 'catalog', name: 'All components' }];
});

// Live demo state.
const demo = reactive({
  agree: true,
  notify: false,
  fields: {} as Record<string, string>,
  email: '',
  plan: '',
  city: '',
  extras: ['Delivery'] as string[],
  slide: 1,
  num: 0,
  lightbox: false,
});
const chipVariants = [
  {
    id: 'pill',
    name: 'Pills',
    legend: 'Size',
    note: 'outlined pills, selected is filled',
    options: ['S', 'M', 'L', 'XL'],
    usage: '<UiChips v-model="size" legend="Size" :options="[\'S\', \'M\', \'L\']" />',
  },
  {
    id: 'soft',
    name: 'Soft',
    legend: 'Filter',
    note: 'no border, for filters in lists',
    options: ['All', 'New', 'Sale', 'Popular'],
    usage:
      '<UiChips v-model="filter" legend="Filter" :options="filters" variant="soft" hide-legend />',
  },
  {
    id: 'segment',
    name: 'Segment',
    legend: 'Period',
    note: 'one shared track, always one choice',
    options: ['Week', 'Month', 'Year'],
    usage: '<UiChips v-model="period" legend="Period" :options="periods" variant="segment" />',
  },
  {
    id: 'tile',
    name: 'Tiles',
    legend: 'Category',
    note: 'icon over label, equal width, scrolls on phones',
    options: [],
    usage:
      '<UiChips v-model="cat" legend="Category" :options="cats" variant="tile"><template #icon="{ option }"><UiIcon :name="option.icon" /></template></UiChips>',
  },
] as const;
const tileOptions = [
  { value: 'search', label: 'Search', icon: 'search' },
  { value: 'image', label: 'Photos', icon: 'image' },
  { value: 'info', label: 'Guides', icon: 'info' },
  { value: 'plus', label: 'New', icon: 'plus' },
];
// Final HTML of the live demos (what the browser gets, not the Vue tag): the root's classes and its markup,
// read once after mount from wrappers marked data-html="key".
const rendered = reactive<Record<string, { cls: string; html: string }>>({});
const cleanHtml = (el: Element) =>
  el.outerHTML
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s(?:data-v-[a-z0-9]+|data-html)(?:="[^"]*")?/g, '');
onMounted(() =>
  nextTick(() =>
    document.querySelectorAll<HTMLElement>('[data-html]').forEach((w) => {
      const el = w.firstElementChild;
      if (el)
        rendered[w.dataset.html!] = { cls: `.${[...el.classList].join('.')}`, html: cleanHtml(el) };
    }),
  ),
);
// Variant matrices: every variant of a component in its own row of equal cells (sizes, states, dark), each cell
// labelled, with its final class and copy buttons for the class, the HTML and the Vue tag (same idea as the buttons).
type MCell = {
  key: string;
  label: string;
  note: string;
  props: Record<string, unknown>;
  cls?: string;
  dark?: boolean;
  text?: string;
  vue: string;
};
type MVariant = {
  id: string;
  name: string;
  cls: string;
  note: string;
  comp: Component;
  model?: boolean;
  tile?: boolean;
  wide?: boolean;
  cells: MCell[];
};
type CellSpec = [
  label: string,
  note: string,
  props: Record<string, unknown>,
  vueAttrs: string,
  cls?: string,
  dark?: boolean,
];
const cellsFrom = (
  prefix: string,
  base: Record<string, unknown>,
  vue: (attrs: string) => string,
  specs: CellSpec[],
  text?: string,
): MCell[] =>
  specs.map(([label, note, props, attrs, cls, dark], i) => ({
    key: `m-${prefix}-${i}`,
    label,
    note,
    props: { ...base, ...props },
    cls,
    dark,
    text,
    vue: vue(attrs),
  }));
const standard = (sizes = true): CellSpec[] => [
  ['Medium', 'Default size.', {}, ''],
  ...(sizes
    ? ([
        ['Small', 'Compact size for dense blocks.', { size: 'small' }, ' size="small"'],
      ] as CellSpec[])
    : []),
  ['Hover', 'Pointer over: border or fill shifts one step.', {}, '', '-hover'],
  ['Focus', 'Keyboard focus: 2 px ring.', {}, '', '-focus'],
];
const onDark: CellSpec = [
  'On dark',
  'For dark bands, footers and photos.',
  { onDark: true },
  ' on-dark',
  '',
  true,
];

const chipMatrix: MVariant[] = chipVariants.map((v) => {
  const options = v.id === 'tile' ? tileOptions.slice(0, 2) : v.options.slice(0, 3);
  const first = typeof options[0] === 'string' ? options[0] : options[0]!.value;
  return {
    id: v.id,
    name: v.name,
    cls: `.chips.-${v.id}`,
    note: v.note,
    comp: UiChips,
    model: true,
    tile: v.id === 'tile',
    wide: true,
    cells: cellsFrom(
      `chips-${v.id}`,
      { legend: v.legend, options, variant: v.id, hideLegend: true, modelValue: first },
      (a) => v.usage.replace('<UiChips', `<UiChips${a}`),
      [
        ...standard(),
        ['Disabled', 'Not clickable, 45% opacity.', { disabled: true }, ' disabled'],
        onDark,
      ],
    ),
  };
});
const tagMatrix: MVariant[] = (['solid', 'outline', 'muted'] as const).map((id) => ({
  id,
  name: id[0]!.toUpperCase() + id.slice(1),
  cls: `.tag.-${id}`,
  note: {
    solid: 'strongest: status, “New”',
    outline: 'neutral: categories',
    muted: 'quiet: metadata, counts',
  }[id],
  comp: UiTag,
  cells: cellsFrom(
    `tag-${id}`,
    { variant: id },
    (a) => `<UiTag variant="${id}"${a}>New</UiTag>`,
    [
      ['Medium', 'Default size.', {}, ''],
      ['Small', 'Inside cards and tables.', { size: 'small' }, ' size="small"'],
      ['Link', 'A tag that links to its category.', { href: '#TAG-01' }, ' href="/category"'],
      ['Hover', 'Pointer over a link tag.', { href: '#TAG-01' }, ' href="/category"', '-hover'],
      [
        'Focus',
        'Keyboard focus on a link tag.',
        { href: '#TAG-01' },
        ' href="/category"',
        '-focus',
      ],
      onDark,
    ],
    'New',
  ),
}));
const counterMatrix: MVariant[] = (['outline', 'inner'] as const).map((id) => ({
  id,
  name: id === 'outline' ? 'Outline' : 'Inner',
  cls: `.counter.-${id}`,
  note:
    id === 'outline'
      ? 'round − and + around the value'
      : 'one pill with the buttons inside, for forms',
  comp: UiCounter,
  model: true,
  cells: cellsFrom(
    `counter-${id}`,
    { label: 'Guests', min: 0, max: 10, variant: id, modelValue: 2 },
    (a) => `<UiCounter v-model="guests" label="Guests" :min="0" :max="10" variant="${id}"${a} />`,
    [
      ...standard(),
      ['At minimum', '− is disabled at min, + at max.', { modelValue: 0 }, ''],
      ['Disabled', 'Whole control off.', { disabled: true }, ' disabled'],
      onDark,
    ],
  ),
}));
const sliderMatrix: MVariant[] = [
  {
    id: 'dots',
    name: 'Dots and arrows',
    note: 'default: position dots and both arrows',
    props: {},
    attrs: '',
  },
  {
    id: 'numbered',
    name: 'Numbered',
    note: 'numbers instead of dots, for few slides',
    props: { numbered: true },
    attrs: ' numbered',
  },
  {
    id: 'arrows',
    name: 'Arrows only',
    note: 'for long rows where dots would not fit',
    props: { dots: false },
    attrs: ' :dots="false"',
  },
  {
    id: 'dots-only',
    name: 'Dots only',
    note: 'for swipe sliders on phones',
    props: { arrows: false },
    attrs: ' :arrows="false"',
  },
].map((v) => ({
  id: v.id,
  name: v.name,
  cls: '.slider-nav',
  note: v.note,
  comp: UiSliderNav,
  model: true,
  cells: cellsFrom(
    `slider-${v.id}`,
    { count: 4, modelValue: 1, ...v.props },
    (a) => `<UiSliderNav v-model="index" :count="4"${v.attrs}${a} />`,
    [
      ...standard(),
      [
        'First, no loop',
        'Without loop the previous arrow is off at the start.',
        { modelValue: 0, loop: false },
        ' :loop="false"',
      ],
      onDark,
    ],
  ),
}));
const tabsMatrix: MVariant[] = (['underline', 'pill'] as const).map((id) => ({
  id,
  name: id === 'underline' ? 'Underline' : 'Pill',
  cls: `.tabs.-${id}`,
  note:
    id === 'underline'
      ? 'a line under the active tab, for content views'
      : 'a track with a filled tab, for modes',
  comp: UiTabs,
  model: true,
  wide: true,
  cells: cellsFrom(
    `tabs-${id}`,
    {
      tabs: [
        { id: 'plan', label: 'Plan' },
        { id: 'specs', label: 'Specs' },
        { id: 'photos', label: 'Photos' },
      ],
      label: 'Product views',
      variant: id,
      modelValue: 'plan',
    },
    (a) => `<UiTabs v-model="view" :tabs="tabs" label="Product views" variant="${id}"${a} />`,
    [...standard(), onDark],
  ),
}));
const crumbMatrix: MVariant[] = (['plain', 'pill'] as const).map((id) => ({
  id,
  name: id === 'plain' ? 'Plain' : 'Pill',
  cls: `.crumbs.-${id}`,
  note: id === 'plain' ? 'slashes, under the page header' : 'a frosted pill, over a hero photo',
  comp: UiBreadcrumb,
  wide: true,
  cells: cellsFrom(
    `crumbs-${id}`,
    {
      items: [
        { label: 'Home', href: '#BREADCRUMB-01' },
        { label: 'Services', href: '#BREADCRUMB-01' },
        { label: 'Full service' },
      ],
      variant: id,
    },
    (a) => `<UiBreadcrumb :items="crumbs" variant="${id}"${a} />`,
    [['Default', 'The last item is the current page.', {}, ''], onDark],
  ),
}));
const matrices: Record<string, MVariant[]> = {
  CHIPS: chipMatrix,
  TAG: tagMatrix,
  COUNTER: counterMatrix,
  SLIDER: sliderMatrix,
  TABS: tabsMatrix,
  CRUMBS: crumbMatrix,
};
const cellModel = reactive<Record<string, unknown>>({});
const bindCell = (v: MVariant, c: MCell) => {
  if (!v.model) return c.props;
  if (!(c.key in cellModel)) cellModel[c.key] = c.props.modelValue;
  return {
    ...c.props,
    modelValue: cellModel[c.key],
    'onUpdate:modelValue': (x: unknown) => (cellModel[c.key] = x),
  };
};
const modalTypes = [
  {
    id: 'dialog',
    name: 'Dialog',
    cls: '.modal',
    note: 'Default: a short form or a message, centred.',
    title: 'Write to us',
    props: { eyebrow: 'Contact', lead: 'We answer within one working day.' },
    vue: '<UiModal :open="open" title="Write to us" @close="open = false">…<template #foot>…</template></UiModal>',
  },
  {
    id: 'confirm',
    name: 'Confirm',
    cls: '.modal.-small',
    note: 'Small and centred text: one question, two actions.',
    title: 'Delete this item?',
    props: { size: 'small' },
    vue: '<UiModal :open="open" size="small" title="Delete this item?" @close="open = false">…</UiModal>',
  },
  {
    id: 'read',
    name: 'Reading',
    cls: '.modal.-read',
    note: 'A narrow column for terms and long text.',
    title: 'Terms',
    props: { size: 'read' },
    vue: '<UiModal :open="open" size="read" title="Terms" @close="open = false">…</UiModal>',
  },
  {
    id: 'wide',
    name: 'Wide form',
    cls: '.modal.-wide',
    note: 'Two columns of fields: booking, request.',
    title: 'Book a visit',
    props: { size: 'wide', lead: 'Pick a plan and a day; we confirm by phone.' },
    vue: '<UiModal :open="open" size="wide" title="Book a visit" @close="open = false">…</UiModal>',
  },
  {
    id: 'side',
    name: 'Side panel',
    cls: '.modal.-side',
    note: 'Slides in from the right: filters, cart, menu.',
    title: 'Filters',
    props: { placement: 'side' },
    vue: '<UiModal :open="open" placement="side" title="Filters" @close="open = false">…</UiModal>',
  },
  {
    id: 'bottom',
    name: 'Bottom sheet',
    cls: '.modal.-bottom',
    note: 'Rises from the bottom: actions on phones.',
    title: 'Share',
    props: { placement: 'bottom' },
    vue: '<UiModal :open="open" placement="bottom" title="Share" @close="open = false">…</UiModal>',
  },
  {
    id: 'image',
    name: 'With photo',
    cls: '.modal',
    note: 'A photo across the top: offers, announcements.',
    title: 'Spring service',
    props: { eyebrow: 'Offer' },
    vue: '<UiModal :open="open" :image="photo" title="Spring service" @close="open = false">…</UiModal>',
  },
];
const openModal = ref('');
const currentModal = computed(() => {
  const m = modalTypes.find((x) => x.id === openModal.value);
  return m ? { ...m, props: m.id === 'image' ? { ...m.props, image: photo } : m.props } : undefined;
});
const fieldDemos = [
  {
    label: 'Name',
    kind: 'text',
    autocomplete: 'name',
    placeholder: 'e.g. Anna Ruiz',
    hint: undefined,
    required: true,
    error: 'Enter your name',
    why: 'A realistic name shows first and last name are both welcome.',
  },
  {
    label: 'Email',
    kind: 'email',
    autocomplete: 'email',
    placeholder: 'name@example.com',
    hint: 'We reply within a day.',
    required: true,
    error: 'Enter an email like name@example.com',
    why: 'Shows the format; example.com is reserved for examples.',
  },
  {
    label: 'Phone',
    kind: 'tel',
    autocomplete: 'tel',
    placeholder: '+34 600 000 000',
    hint: 'With the country code.',
    required: false,
    error: 'Enter a phone number',
    why: 'Shows the country code and digit groups.',
  },
  {
    label: 'Website',
    kind: 'url',
    autocomplete: 'url',
    placeholder: 'https://example.com',
    hint: undefined,
    required: false,
    error: 'Enter an address starting with https://',
    why: 'Shows that https:// is part of the address.',
  },
  {
    label: 'Search',
    kind: 'search',
    autocomplete: 'off',
    placeholder: 'Search services, e.g. brakes',
    hint: undefined,
    required: false,
    error: 'Check this field',
    why: 'Says what can be searched, with one example.',
  },
  {
    label: 'Message',
    kind: 'textarea',
    autocomplete: 'off',
    placeholder: 'e.g. The brakes squeak when it rains',
    hint: 'A sentence or two is enough.',
    required: false,
    error: 'Check this field',
    why: 'A real example helps more than “Your message”.',
  },
] as const;
const cities = [
  { value: 'madrid', label: 'Madrid' },
  { value: 'sevilla', label: 'Sevilla' },
  { value: 'valencia', label: 'Valencia' },
];
const faqItems = [
  {
    q: 'How long does a full service take?',
    a: 'Most services are ready the same day; the express service takes under an hour.',
  },
  {
    q: 'Do I pay before or after?',
    a: 'After. You get a fixed price before we start and pay when you pick it up.',
  },
  {
    q: 'What if you find another problem?',
    a: 'We call you first and only do extra work you approve.',
  },
];
const faqVariants = [
  {
    id: 'card',
    name: 'Cards',
    note: 'each question in its own card',
    usage: '<UiAccordion :items="faq" />',
  },
  {
    id: 'plain',
    name: 'Plain',
    note: 'lines between questions, for long lists',
    usage: '<UiAccordion :items="faq" variant="plain" />',
  },
  {
    id: 'accent',
    name: 'Accent',
    note: 'the open question is filled',
    usage: '<UiAccordion :items="faq" variant="accent" />',
  },
] as const;
const plans = [
  { value: 'basic', label: 'Basic' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];
const steps = ['Product', 'Options', 'Details', 'Confirm'];
const road = [
  { title: 'Call', text: 'We talk about the goal and the budget.' },
  { title: 'Plan', text: 'A fixed plan and price in writing.' },
  { title: 'Build', text: 'Work in weekly steps you can see.' },
  { title: 'Launch', text: 'Release, checks and handover.' },
];
const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9d9d9"/><stop offset="1" stop-color="#8c8c8c"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="860" cy="260" r="110" fill="#f2f2f2"/><path d="M0 800 L380 380 L640 640 L820 470 L1200 800Z" fill="#595959"/></svg>',
  );
const icons = [
  'check',
  'copy',
  'close',
  'plus',
  'minus',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'arrow-right',
  'info',
  'search',
  'image',
] as const;
</script>

<template>
  <main id="main" class="bb" :class="`-detail-${detail.toLowerCase()}`">
    <header class="bb__intro">
      <p class="bb__eyebrow">@ai.all/ui · DS7</p>
      <h1 class="bb__title">Brandbook</h1>
      <p class="lead">
        Foundations, base elements and every component with its ID. A block exists here, with all
        its variants, before a page uses it. Every name, description, class and snippet can be
        copied.
      </p>
    </header>

    <div ref="bar" class="bb__nav">
      <div class="bb__nav-main">
        <div class="bb__tabs" role="tablist" aria-label="Brandbook pages">
          <button
            v-for="x in tabs"
            :id="`tab-${x.id}`"
            :key="x.id"
            type="button"
            role="tab"
            class="bb__tab"
            :aria-selected="tab === x.id"
            :aria-controls="`panel-${x.id}`"
            @click="tab = x.id"
          >
            {{ x.name }}
          </button>
          <!-- the source gallery is a dev-server page of the ui app (see the gallery layer); a link tab, not a panel -->
          <a v-if="galleryLink" class="bb__tab" href="/ui/ds" role="tab">Source gallery</a>
        </div>
        <nav class="bb__toc" aria-label="On this page">
          <a v-for="x in toc" :key="x.id" :href="`#${x.id}`">{{ x.name }}</a>
        </nav>
      </div>
      <div class="bb__navend">
        <div class="bb__navctl">
          <div
            class="bb__navgrid"
            title="How much to show: View (demos only), Info (+ names, classes, code), Full (+ copy buttons)"
          >
            <span class="bb__navgrid-label" aria-hidden="true">Info</span>
            <UiChips
              v-model="detail"
              legend="How much information to show"
              :options="['View', 'Info', 'Full']"
              variant="segment"
              size="small"
              hide-legend
            />
          </div>
          <div v-if="gridOn" class="bb__navgrid" title="Layout grid · Alt + G">
            <span class="bb__navgrid-label" aria-hidden="true">Grid</span>
            <UiChips
              v-model="gridColsLabel"
              legend="Layout grid columns"
              :options="['Off', '12', '16', '24']"
              variant="segment"
              size="small"
              hide-legend
            />
          </div>
        </div>
        <button
          type="button"
          class="bb__fab"
          popovertarget="bb-menu"
          aria-label="Brandbook menu"
          title="Brandbook menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>
    <nav id="bb-menu" ref="menu" popover class="bb__menu" aria-label="Brandbook menu">
      <p class="bb__label">Pages</p>
      <ul class="bb__menu-list">
        <li v-for="x in tabs" :key="x.id">
          <button
            type="button"
            class="bb__menu-item"
            :aria-current="tab === x.id ? 'page' : undefined"
            @click="pick(x.id)"
          >
            {{ x.name }}
          </button>
        </li>
      </ul>
      <p class="bb__label">On this page</p>
      <ul class="bb__menu-list">
        <li v-for="x in toc" :key="x.id">
          <a class="bb__menu-item" :href="`#${x.id}`" @click="closeMenu">{{ x.name }}</a>
        </li>
      </ul>
      <p class="bb__label">Show</p>
      <div class="bb__gridset">
        <UiChips
          v-model="detail"
          legend="How much information to show"
          :options="['View', 'Info', 'Full']"
          variant="segment"
          size="small"
          hide-legend
        />
        <p class="bb__hint">
          View: demos only. Info: + names, classes, code. Full: + copy buttons.
        </p>
      </div>
      <p class="bb__label">Developer</p>
      <button type="button" class="bb__menu-item" @click="pick('tools')">All dev tools</button>
      <div v-if="gridOn" class="bb__gridset">
        <UiChips
          v-model="gridColsLabel"
          legend="Layout grid"
          :options="['Off', '12', '16', '24']"
          variant="segment"
          size="small"
        />
        <UiSwitch v-model="gridButton" label="Grid button on the page" />
        <p class="bb__hint">Alt + G steps the columns. Site setting: <code>uiDevTools</code></p>
      </div>
      <p v-else class="bb__hint">
        Dev tools are off here: <code>uiDevTools</code> is <code>{{ gridMode }}</code
        >.
      </p>
      <a class="bb__menu-item -top" href="#main" @click="closeMenu">Back to top</a>
    </nav>

    <div
      v-for="x in tabs.filter((entry) => !visitedTabs.has(entry.id))"
      :id="`panel-${x.id}`"
      :key="x.id"
      :aria-labelledby="`tab-${x.id}`"
      role="tabpanel"
      hidden
    />

    <!-- Foundations -->
    <div
      v-if="visitedTabs.has('foundations')"
      v-show="tab === 'foundations'"
      id="panel-foundations"
      role="tabpanel"
      aria-labelledby="tab-foundations"
    >
      <section id="colours" class="bb__sec">
        <h2 class="bb__h">Colours</h2>
        <p class="bb__note">
          Monochrome by default. A project changes the brand block in its <code>theme.css</code>;
          this page reads the live values, so it always shows the current theme. Contrast is
          measured against the page background, inverse colours against the dark band.
        </p>
        <section v-for="g in colourGroups" :id="g.id" :key="g.id" class="bb__group">
          <div class="bb__row bb__group-head">
            <h3 class="bb__h3">{{ g.title }}</h3>
            <UiCopyButton
              :value="groupCss(g)"
              :label="`${g.title} colours as CSS`"
              text="Copy group"
            />
          </div>
          <p class="bb__note">{{ g.note }}</p>
          <ul class="bb__swatches">
            <li v-for="c in g.items" :key="c.name" class="bb__swatch">
              <span class="bb__chip" :style="{ background: `var(${c.name})` }" />
              <span class="bb__swatch-meta">
                <span class="bb__row">
                  <code>{{ c.name }}</code>
                  <UiCopyButton :value="`var(${c.name})`" :label="`variable ${c.name}`" />
                </span>
                <span class="bb__row">
                  <small>{{ values[c.name] || '…' }}</small>
                  <UiCopyButton
                    v-if="values[c.name]"
                    :value="values[c.name]!"
                    :label="`value of ${c.name}`"
                  />
                  <small
                    v-if="contrast(c.name, g.id === 'c-inverse' ? '--color-inverse' : undefined)"
                    class="bb__muted"
                    >·
                    {{
                      contrast(c.name, g.id === 'c-inverse' ? '--color-inverse' : undefined)
                    }}</small
                  >
                </span>
                <small class="bb__muted">{{ c.role }}</small>
              </span>
            </li>
          </ul>
        </section>
      </section>

      <section id="type" class="bb__sec">
        <h2 class="bb__h">Type</h2>
        <p class="bb__note">
          Font: <code>--font-sans</code> for text, <code>--font-display</code> for headings,
          <code>--font-mono</code> for code.
        </p>
        <div v-for="t in typeScale" :key="t.token" class="bb__type">
          <p
            class="bb__type-sample"
            :style="{
              fontSize: `var(${t.token})`,
              fontWeight: t.tag.startsWith('h') ? 'var(--font-weight-heading)' : undefined,
            }"
          >
            {{ t.sample }}
          </p>
          <span class="bb__row">
            <code>{{ t.tag }} · {{ t.token }}</code>
            <UiCopyButton :value="`var(${t.token})`" :label="`variable ${t.token}`" />
          </span>
        </div>
      </section>

      <section id="space" class="bb__sec">
        <h2 class="bb__h">Space, radius, shadow</h2>
        <div class="bb__cols">
          <div>
            <h3 class="bb__h3">Space</h3>
            <ul class="bb__list">
              <li v-for="s in spaces" :key="s">
                <span class="bb__bar" :style="{ width: `var(${s})` }" /><code>{{ s }}</code>
                <UiCopyButton :value="`var(${s})`" :label="`variable ${s}`" />
              </li>
            </ul>
          </div>
          <div>
            <h3 class="bb__h3">Radius</h3>
            <ul class="bb__list">
              <li v-for="r in radii" :key="r">
                <span class="bb__box" :style="{ borderRadius: `var(${r})` }" /><code>{{ r }}</code>
                <UiCopyButton :value="`var(${r})`" :label="`variable ${r}`" />
              </li>
            </ul>
          </div>
          <div>
            <h3 class="bb__h3">Shadow</h3>
            <ul class="bb__list">
              <li v-for="s in shadows" :key="s">
                <span class="bb__box -white" :style="{ boxShadow: `var(${s})` }" /><code>{{
                  s
                }}</code>
                <UiCopyButton :value="`var(${s})`" :label="`variable ${s}`" />
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- Base elements -->
    <div
      v-if="visitedTabs.has('elements')"
      v-show="tab === 'elements'"
      id="panel-elements"
      role="tabpanel"
      aria-labelledby="tab-elements"
    >
      <section id="el-usage" class="bb__sec">
        <h2 class="bb__h">In use <code class="bb__id">TEXT-01</code></h2>
        <p class="bb__note">
          A sample page made only of plain HTML elements and <code>base.css</code>. Every block
          lists its tags in the right margin with what each is for; hover a tag to outline it in the
          text.
        </p>
        <UiSwitch v-model="showTags" label="Outline every element" />
        <div ref="usage" class="bb__usage" :class="{ '-tags': showTags }">
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <nav aria-label="Breadcrumb">
                <ol class="bb__crumbs">
                  <li><a href="#el-usage">Home</a></li>
                  <li><a href="#el-usage">Services</a></li>
                  <li aria-current="page">Full service</li>
                </ol>
              </nav>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[0]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <hgroup>
                <h2>Full service in one visit</h2>
                <p class="lead">
                  We check, clean and adjust everything, then hand it back ready to use. The price
                  is fixed before we start.
                </p>
              </hgroup>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[1]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <p>
                A full service is the simplest way to keep things running: one visit, one
                <dfn>fixed price</dfn>, no surprises. We <strong>check every part</strong>, replace
                only what is worn and tell you <em>before</em> we touch anything that costs extra.
                Most customers come back once a year, usually in
                <time datetime="2026-03">March</time>, before the busy season starts.
              </p>
              <p>
                Prices on this page include <abbr title="Value-added tax">VAT</abbr>. Parts are
                charged separately and listed in your report, for example a new chain at
                <data value="24">$24</data> or brake pads at <data value="18">$18</data>. If you
                prefer, we keep the old parts for you to see.
                <mark>Booking a day ahead</mark> usually gets you a same-day slot.
              </p>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[2]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <p>
                As one customer put it, <q>it felt like getting a new one back</q>. The
                <cite>Workshop Guide 2026</cite> recommends a full check every 1,500 km<sup>*</sup>;
                our notes use the formula <var>km</var> ÷ 1,500 = services per year. In the booking
                tool, press <kbd>Enter</kbd> to confirm and the screen shows <samp>Booked</samp>.
                Developers can add the widget with <code>&lt;BookingWidget /&gt;</code>.
              </p>
              <p>
                <small
                  >* Or every 12 months, whichever comes first. Old price: <s>$95</s>, now $80. Text
                  added after review: <ins>parts listed separately</ins>; text removed:
                  <del>parts included</del>. Words in <b>bold</b> and <i>italic</i> without extra
                  meaning, and an <u>annotated</u> word.</small
                >
              </p>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[3]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <p>
                <small
                  >Updated <time datetime="2026-11-26">26 November 2026</time> · 4 min read</small
                >
              </p>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[4]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <section aria-labelledby="u-included">
                <h3 id="u-included">What is included</h3>
                <p>
                  Every service follows the same checklist. We
                  <strong>never start extra work</strong> without asking, and <em>you</em> get a
                  short report with photos. Read the <a href="#el-usage">full checklist</a> or the
                  <abbr title="Frequently asked questions">FAQ</abbr>.
                </p>
                <ul>
                  <li>Inspection of every moving part</li>
                  <li>Cleaning and lubrication</li>
                  <li>
                    Adjustment and a final test
                    <ul>
                      <li>Brakes</li>
                      <li>Gears</li>
                    </ul>
                  </li>
                </ul>
              </section>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[5]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <h4>How it works</h4>
              <ol>
                <li>Book a time online or by phone.</li>
                <li>Drop it off; we confirm the price.</li>
                <li>Pick it up the same day.</li>
              </ol>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[6]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <figure>
                <img :src="photo" alt="Grey mountains under a pale sun" width="1200" height="800" />
                <figcaption>A figure: the photo with its caption.</figcaption>
              </figure>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[7]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <table>
                <caption>
                  Prices include tax
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Time</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Express</td>
                    <td>45 min</td>
                    <td><del>$45</del> <ins>$35</ins></td>
                  </tr>
                  <tr>
                    <td>Full</td>
                    <td>2 h</td>
                    <td>$80</td>
                  </tr>
                  <tr>
                    <td>Custom</td>
                    <td>On request</td>
                    <td>Quote</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[8]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <blockquote cite="https://example.com/reviews">
                <p>
                  Clear price, done the same day and everything explained.
                  <mark>Exactly what I needed.</mark>
                </p>
                <cite>Anna R., customer since 2024</cite>
              </blockquote>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[9]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <details open>
                <summary>How long does it take?</summary>
                <p>
                  Most services are ready the same day. Press <kbd>Ctrl</kbd> + <kbd>F</kbd> to
                  search this page.
                </p>
              </details>
              <details>
                <summary>Can I wait while you work?</summary>
                <p>Yes, the express service takes under an hour.</p>
              </details>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[10]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <dl>
                <dt>Time</dt>
                <dd>2 hours</dd>
                <dt>Price</dt>
                <dd>from $35</dd>
                <dt>Warranty</dt>
                <dd>3 months</dd>
              </dl>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[11]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <p>
                Booked this week <meter value="0.7">70%</meter> · code <code>FIRST10</code> · output
                <samp>OK</samp>
              </p>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[12]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <hr />
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[13]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <form onsubmit="return false" aria-label="Book a visit">
                <fieldset>
                  <legend>Book a visit</legend>
                  <p>
                    <label for="u-name">Name</label
                    ><input id="u-name" autocomplete="name" placeholder="Your name" />
                  </p>
                  <p>
                    <label for="u-service">Service</label>
                    <select id="u-service">
                      <option>Express</option>
                      <option>Full</option>
                      <option>Custom</option>
                    </select>
                  </p>
                  <p>
                    <label for="u-note">Note</label
                    ><textarea id="u-note" placeholder="Anything we should know?"></textarea>
                  </p>
                  <p>
                    <label><input type="checkbox" checked /> Send me a reminder</label>
                  </p>
                </fieldset>
                <p><button type="submit">Book</button> <output>Estimated: $80</output></p>
              </form>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[14]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
          <div
            class="bb__tagged"
            @mouseover="hlOn"
            @focusin="hlOn"
            @mouseleave="hlOff"
            @focusout="hlOff"
          >
            <div class="bb__sample">
              <footer>
                <address>
                  Example Workshop<br />1 Main Street<br /><a href="tel:+10000000000"
                    >+1 000 000 0000</a
                  >
                </address>
              </footer>
            </div>
            <div class="bb__tags">
              <span v-for="t in usageTags[15]" :key="t" class="bb__tagline"
                ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ tagDesc[t] }}</span
              >
            </div>
          </div>
        </div>
      </section>
      <section v-for="g in elementGroups" :id="g.id" :key="g.id" class="bb__sec">
        <h2 class="bb__h">{{ g.title }}</h2>
        <p class="bb__note">{{ g.note }}</p>
        <div
          v-for="(it, i) in g.items"
          :key="i"
          class="bb__tagged"
          @mouseover="hlOn"
          @focusin="hlOn"
          @mouseleave="hlOff"
          @focusout="hlOff"
        >
          <pre v-if="it.code" class="bb__sample -code"><code>{{ it.html }}</code></pre>
          <!-- eslint-disable-next-line vue/no-v-html -- static markup written in this file -->
          <div v-else class="bb__sample" v-html="it.html" />
          <div class="bb__tags">
            <span v-for="[t, d] in it.tags" :key="t" class="bb__tagline"
              ><code :data-tag="t" tabindex="0">&lt;{{ t }}&gt;</code> {{ d }}</span
            >
            <UiCopyButton :value="it.html" label="HTML of this sample" />
          </div>
        </div>
      </section>

      <section id="el-index" class="bb__sec">
        <h2 class="bb__h">All tags <code class="bb__id">TAGS-01</code></h2>
        <p class="bb__note">
          Every HTML element on this page with what it is for. Copy the tag or its description;
          hover a tag under a sample to outline it there.
        </p>
        <label class="bb__search">
          <span class="bb__sr">Filter tags</span>
          <input v-model="tagQuery" type="search" placeholder="Filter: table, link, form…" />
        </label>
        <table class="bb__table">
          <thead>
            <tr>
              <th scope="col">Tag</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in tagRows" :key="r.tag">
              <td>
                <span class="bb__row">
                  <code>&lt;{{ r.tag }}&gt;</code>
                  <UiCopyButton :value="`<${r.tag}>`" :label="`tag ${r.tag}`" />
                </span>
              </td>
              <td>
                <span class="bb__row">
                  {{ r.desc }}
                  <UiCopyButton
                    :value="`<${r.tag}> — ${r.desc}`"
                    :label="`description of ${r.tag}`"
                  />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- Components -->
    <div
      v-if="visitedTabs.has('components')"
      v-show="tab === 'components'"
      id="panel-components"
      role="tabpanel"
      aria-labelledby="tab-components"
    >
      <section v-for="l in levels" :id="`lvl-${l.id}`" :key="l.id" class="bb__sec">
        <h2 class="bb__h">{{ l.name }}</h2>
        <p class="bb__note">{{ l.note }}</p>
        <article
          v-for="e in catalog.filter((x) => x.level === l.id)"
          :id="e.id"
          :key="e.id"
          class="bb__spec"
        >
          <header class="bb__plate">
            <div class="bb__plate-top">
              <code class="bb__id">{{ e.id }}</code>
              <h3 class="bb__h3">{{ e.name }}</h3>
              <UiTag variant="outline">{{ e.level }}</UiTag>
              <span class="bb__copies" role="group" :aria-label="`Copy ${e.id}`">
                <UiCopyButton :value="e.id" :label="`ID ${e.id}`" text="ID" />
                <UiCopyButton
                  :value="`${e.id} · ${e.name}`"
                  :label="`name of ${e.id}`"
                  text="Name"
                />
                <UiCopyButton
                  :value="e.description"
                  :label="`description of ${e.id}`"
                  text="Desc"
                />
                <UiCopyButton :value="card(e)" :label="`card of ${e.id}`" text="All" />
              </span>
            </div>
            <p class="bb__desc">{{ e.description }}</p>
            <div class="bb__specs">
              <p class="bb__spec-line">
                <span class="bb__spec-key">class</span>
                <code>{{ e.classes }}</code>
                <UiCopyButton :value="e.classes" :label="`classes of ${e.id}`" />
              </p>
              <p class="bb__spec-line">
                <span class="bb__spec-key">use</span>
                <code>{{ e.usage }}</code>
                <UiCopyButton :value="e.usage" :label="`usage of ${e.id}`" />
              </p>
            </div>
          </header>

          <div class="bb__stage">
            <template v-if="e.id === 'ICON-01'">
              <ul class="bb__icons">
                <li v-for="n in icons" :key="n" class="bb__icon">
                  <span class="bb__icon-box"><UiIcon :name="n" /></span>
                  <span class="bb__icon-name" :title="n"
                    ><code>{{ n }}</code></span
                  >
                  <UiCopyButton :value="`<UiIcon name=&quot;${n}&quot; />`" :label="`icon ${n}`" />
                </li>
              </ul>
            </template>
            <template v-else-if="e.btn">
              <div class="bb__btn">
                <h4 class="bb__label">Sizes</h4>
                <div class="bb__cells -matrix">
                  <figure
                    v-for="z in btnSizes"
                    :key="z.size"
                    class="bb__cell"
                    :title="z.note"
                    :data-html="`btn-${e.btn}-${z.size}`"
                  >
                    <UiButton :variant="e.btn" :size="z.size">{{ z.label }}</UiButton>
                    <figcaption class="bb__row">
                      <code>{{ rendered[`btn-${e.btn}-${z.size}`]?.cls }}</code>
                      <span>{{ z.note.split(',')[0] }}</span>
                      <UiCopyButton
                        :value="rendered[`btn-${e.btn}-${z.size}`]?.cls ?? ''"
                        :label="`class of ${z.label} ${e.name}`"
                        text="Class"
                      />
                      <UiCopyButton
                        :value="rendered[`btn-${e.btn}-${z.size}`]?.html ?? ''"
                        :label="`HTML of ${z.label} ${e.name}`"
                        text="HTML"
                      />
                      <UiCopyButton
                        :value="btnTag(e.btn, z.size === 'md' ? '' : ` size=&quot;${z.size}&quot;`)"
                        :label="`Vue of ${z.label} ${e.name}`"
                        text="Vue"
                      />
                    </figcaption>
                  </figure>
                </div>
                <h4 class="bb__label">
                  States on light
                  <span class="bb__hint"
                    >· hover for details, copy gives the selector or attribute</span
                  >
                </h4>
                <div class="bb__cells -matrix">
                  <figure v-for="st in btnStates" :key="st.id" class="bb__cell" :title="st.note">
                    <UiButton
                      :variant="e.btn"
                      :class="st.cls"
                      :disabled="st.id === 'disabled'"
                      :loading="st.id === 'loading'"
                      >{{ st.label }}</UiButton
                    >
                    <figcaption class="bb__row">
                      <code>{{ st.code || `.-${e.btn}` }}</code>
                      <UiCopyButton
                        :value="stateCopy(e.btn, st)"
                        :label="`${st.label} ${e.name}`"
                      />
                    </figcaption>
                  </figure>
                </div>
                <h4 class="bb__label">States on dark</h4>
                <div class="bb__cells -matrix bb__dark">
                  <figure v-for="st in btnStates" :key="st.id" class="bb__cell" :title="st.note">
                    <UiButton
                      :variant="e.btn"
                      on-dark
                      :class="st.cls"
                      :disabled="st.id === 'disabled'"
                      :loading="st.id === 'loading'"
                      >{{ st.label }}</UiButton
                    >
                    <figcaption class="bb__row">
                      <code>{{ st.code || '.-on-dark' }}</code>
                      <UiCopyButton
                        :value="stateCopy(e.btn, st, true)"
                        :label="`${st.label} ${e.name} on dark`"
                      />
                    </figcaption>
                  </figure>
                </div>
              </div>
            </template>
            <template v-else-if="e.matrix">
              <div class="bb__btn">
                <template v-for="v in matrices[e.matrix]" :key="v.id">
                  <h4 class="bb__label">
                    {{ v.name }} <code>{{ v.cls }}</code>
                    <span class="bb__hint">· {{ v.note }}</span>
                  </h4>
                  <div class="bb__cells -matrix" :class="{ '-wide': v.wide }">
                    <figure
                      v-for="c in v.cells"
                      :key="c.key"
                      class="bb__cell"
                      :class="{ '-dark': c.dark }"
                      :title="c.note"
                      :data-html="c.key"
                    >
                      <component :is="v.comp" v-bind="bindCell(v, c)" :class="c.cls">
                        <template v-if="c.text">{{ c.text }}</template>
                        <template v-if="v.tile" #icon="{ option }">
                          <UiIcon :name="(option as { icon: 'info' }).icon" />
                        </template>
                      </component>
                      <figcaption>
                        <strong class="bb__cell-name">{{ c.label }}</strong>
                        <code>{{ rendered[c.key]?.cls }}</code>
                        <span class="bb__row">
                          <UiCopyButton
                            :value="rendered[c.key]?.cls ?? ''"
                            :label="`class of ${v.name} ${c.label}`"
                            text="Class"
                          />
                          <UiCopyButton
                            :value="rendered[c.key]?.html ?? ''"
                            :label="`HTML of ${v.name} ${c.label}`"
                            text="HTML"
                          />
                          <UiCopyButton
                            :value="c.vue"
                            :label="`Vue of ${v.name} ${c.label}`"
                            text="Vue"
                          />
                        </span>
                      </figcaption>
                    </figure>
                  </div>
                </template>
                <template v-if="e.id === 'CHIPS-01'">
                  <h4 class="bb__label">Several at once <code>multiple</code></h4>
                  <UiChips
                    v-model="demo.extras"
                    legend="Extras"
                    :options="['Delivery', 'Assembly', 'Warranty', 'Insurance']"
                    multiple
                  />
                </template>
              </div>
            </template>
            <template v-else-if="e.id === 'BTN-06'">
              <div class="bb__btn">
                <h4 class="bb__label">Icon before and after</h4>
                <div class="bb__cells">
                  <UiButton><UiIcon name="plus" />Add item</UiButton>
                  <UiButton variant="outline">Next step<UiIcon name="arrow-right" /></UiButton>
                  <UiButton variant="link">Read more<UiIcon name="chevron-right" /></UiButton>
                </div>
                <h4 class="bb__label">Square, icon only (always with aria-label)</h4>
                <div class="bb__cells">
                  <UiButton square size="small" aria-label="Close"
                    ><UiIcon name="close"
                  /></UiButton>
                  <UiButton square variant="outline" aria-label="Search"
                    ><UiIcon name="search"
                  /></UiButton>
                  <UiButton square size="big" variant="secondary" aria-label="Add"
                    ><UiIcon name="plus"
                  /></UiButton>
                </div>
                <h4 class="bb__label">Full width</h4>
                <div class="bb__narrow"><UiButton block>Send request</UiButton></div>
                <h4 class="bb__label">On dark</h4>
                <div class="bb__cells bb__dark">
                  <UiButton on-dark><UiIcon name="plus" />Add item</UiButton>
                  <UiButton square variant="outline" on-dark aria-label="Search"
                    ><UiIcon name="search"
                  /></UiButton>
                  <UiButton variant="link" on-dark
                    >Read more<UiIcon name="chevron-right"
                  /></UiButton>
                </div>
              </div>
            </template>
            <template v-else-if="e.id === 'COPY-01'">
              <span class="bb__row"
                >hello@example.com <UiCopyButton value="hello@example.com" label="email"
              /></span>
              <UiCopyButton value="npm i @ai.all/ui" label="install command" text="Copy install" />
            </template>
            <template v-else-if="e.id === 'CHECK-01'">
              <UiCheckbox v-model="demo.agree" label="I agree to the terms" />
              <UiCheckbox :model-value="false" label="Unchecked" />
              <UiCheckbox :model-value="true" label="Disabled" disabled />
            </template>
            <template v-else-if="e.id === 'SWITCH-01'">
              <UiSwitch v-model="demo.notify" label="Email notifications" />
              <UiSwitch :model-value="true" label="Disabled on" disabled />
            </template>
            <template v-else-if="e.id === 'IMG-01'">
              <UiImg
                class="bb__img"
                :src="photo"
                alt="Grey mountains under a pale sun"
                :width="1200"
                :height="800"
              />
            </template>
            <template v-else-if="e.id === 'MEDIA-01'">
              <UiMedia
                class="bb__media"
                :src="photo"
                alt="Grey mountains under a pale sun"
                ratio="16 / 9"
              />
              <UiMedia class="bb__media" alt="Photo coming soon" ratio="4 / 3" />
              <UiMedia class="bb__media" :src="photo" alt="Rounded photo" ratio="1 / 1" round />
            </template>
            <template v-else-if="e.id === 'FIELD-01'">
              <div class="bb__form">
                <UiField
                  v-for="f in fieldDemos"
                  :key="f.label"
                  v-model="demo.fields[f.label]"
                  :kind="f.kind"
                  :label="f.label"
                  :autocomplete="f.autocomplete"
                  :placeholder="f.placeholder"
                  :hint="f.hint"
                  :required="f.required"
                  :error="f.error"
                />
              </div>
              <div class="bb__wide">
                <h4 class="bb__label">
                  Placeholders
                  <span class="bb__hint">· an example of the format, never the label</span>
                </h4>
                <table class="bb__table">
                  <thead>
                    <tr>
                      <th scope="col">Field</th>
                      <th scope="col">Placeholder</th>
                      <th scope="col">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="f in fieldDemos" :key="f.label">
                      <td>
                        {{ f.label }} <code>{{ f.kind }}</code>
                      </td>
                      <td>
                        <span class="bb__row"
                          ><code>{{ f.placeholder }}</code
                          ><UiCopyButton
                            :value="f.placeholder"
                            :label="`placeholder of ${f.label}`"
                        /></span>
                      </td>
                      <td class="bb__muted">{{ f.why }}</td>
                    </tr>
                  </tbody>
                </table>
                <p class="bb__note">
                  The label stays visible above the field; the placeholder disappears as soon as the
                  user types, so it only shows an example. Placeholder colour is
                  <code>--control-placeholder</code> (4.5:1 or more on the field). Errors appear
                  after the field is left, under it, and are read out by screen readers.
                </p>
              </div>
            </template>
            <template v-else-if="e.id === 'SELECT-01'">
              <div class="bb__form">
                <UiSelect
                  v-model="demo.plan"
                  label="Plan"
                  placeholder="Choose a plan"
                  :options="plans"
                  required
                />
                <UiSelect
                  v-model="demo.city"
                  label="City"
                  placeholder="Choose the nearest city"
                  :options="cities"
                />
              </div>
              <p class="bb__note">
                Native select with a round chevron badge on the right; the first option is the
                placeholder, disabled, in the placeholder colour until a value is chosen. Leave it
                empty and move on to see the required error.
              </p>
            </template>
            <template v-else-if="e.id === 'FAQ-01'">
              <div class="bb__btn">
                <template v-for="v in faqVariants" :key="v.id">
                  <h4 class="bb__label">
                    {{ v.name }} <code>{{ v.id === 'card' ? 'default' : `.-${v.id}` }}</code>
                    <UiCopyButton :value="v.usage" :label="`${v.name} accordion`" />
                    <span class="bb__hint">· {{ v.note }}</span>
                  </h4>
                  <div :data-html="`faq-${v.id}`">
                    <UiAccordion :items="faqItems" :variant="v.id" :open="0" />
                  </div>
                  <p class="bb__spec-line">
                    <span class="bb__spec-key">html</span>
                    <code>{{ rendered[`faq-${v.id}`]?.cls }}</code>
                    <UiCopyButton
                      :value="rendered[`faq-${v.id}`]?.cls ?? ''"
                      :label="`class of ${v.name} accordion`"
                      text="Class"
                    />
                    <UiCopyButton
                      :value="rendered[`faq-${v.id}`]?.html ?? ''"
                      :label="`HTML of ${v.name} accordion`"
                      text="HTML"
                    />
                  </p>
                </template>
              </div>
            </template>
            <template v-else-if="e.id === 'ALERT-01'">
              <div class="bb__stack">
                <UiAlert title="Info">Prices update every Monday.</UiAlert>
                <UiAlert tone="success" title="Saved">Your changes are saved.</UiAlert>
                <UiAlert tone="warning" title="Check">Two fields need attention.</UiAlert>
                <UiAlert tone="danger" title="Error"
                  >The form could not be sent. Try again.</UiAlert
                >
              </div>
            </template>
            <template v-else-if="e.id === 'SPECS-01'">
              <UiSpecs
                :items="[
                  { value: '100 m²', label: 'Area' },
                  { value: '3', label: 'Rooms' },
                  { value: '2', label: 'Bathrooms' },
                  { value: '8 wk', label: 'Lead time' },
                ]"
              />
            </template>
            <template v-else-if="e.id === 'PRICEBOX-01'">
              <div class="bb__narrow">
                <UiPriceBox
                  base-label="Base price"
                  :base="49900"
                  extras-label="Extras"
                  :extras="3200"
                  total-label="Estimated total"
                  :total="53100"
                  note="Tax included"
                  locale="en-US"
                  currency="USD"
                />
              </div>
            </template>
            <template v-else-if="e.id === 'STEPPER-01'">
              <UiStepper :steps="steps" :current="2" label="Checkout steps" />
            </template>
            <template v-else-if="e.id === 'TIMELINE-01'">
              <UiTimeline :items="road" />
            </template>
            <template v-else-if="e.id === 'GRID-01'">
              <UiCardGrid :columns="3" class="bb__wide">
                <div v-for="n in 3" :key="n" class="bb__card">
                  <UiMedia alt="Card photo placeholder" ratio="16 / 10" />
                  <h3 class="bb__h3">Card {{ n }}</h3>
                  <p class="bb__muted">Short text that explains the card.</p>
                </div>
              </UiCardGrid>
            </template>
            <template v-else-if="e.id === 'MODAL-01'">
              <p class="bb__note bb__wide">
                While a modal is open the page behind is dimmed and blurred
                (<code>--backdrop-blur</code>), does not scroll, and focus stays inside. Escape, the
                close button and a click outside close it; focus returns to the button that opened
                it.
              </p>
              <div class="bb__modals">
                <article v-for="m in modalTypes" :key="m.id" class="bb__modal-card">
                  <p class="bb__row">
                    <strong>{{ m.name }}</strong>
                    <code>{{ m.cls }}</code>
                  </p>
                  <p class="bb__muted">{{ m.note }}</p>
                  <p class="bb__row">
                    <UiButton size="small" variant="outline" @click="openModal = m.id"
                      >Open</UiButton
                    >
                    <UiCopyButton :value="m.cls" :label="`class of ${m.name}`" text="Class" />
                    <UiCopyButton :value="m.vue" :label="`Vue of ${m.name}`" text="Vue" />
                  </p>
                </article>
              </div>
              <LazyUiModal
                v-if="openModal"
                :open="!!openModal"
                v-bind="currentModal?.props"
                :title="currentModal?.title ?? ''"
                @close="openModal = ''"
              >
                <template v-if="openModal === 'dialog'">
                  <UiField
                    v-model="demo.email"
                    kind="email"
                    label="Email"
                    autocomplete="email"
                    placeholder="name@example.com"
                  />
                </template>
                <template v-else-if="openModal === 'confirm'">
                  <p>The item and its photos are removed. This cannot be undone.</p>
                </template>
                <template v-else-if="openModal === 'read'">
                  <p>
                    Long text reads in a narrow column with a comfortable line height. The page
                    behind stays blurred and does not scroll while the dialog is open.
                  </p>
                  <p>
                    Use it for terms, privacy notes and long descriptions that do not need their own
                    page.
                  </p>
                </template>
                <template v-else-if="openModal === 'wide'">
                  <div class="bb__twocol">
                    <UiField
                      v-model="demo.fields['m-name']"
                      label="Name"
                      autocomplete="name"
                      placeholder="e.g. Anna Ruiz"
                    />
                    <UiField
                      v-model="demo.fields['m-phone']"
                      kind="tel"
                      label="Phone"
                      autocomplete="tel"
                      placeholder="+34 600 000 000"
                    />
                    <UiSelect
                      v-model="demo.plan"
                      label="Plan"
                      placeholder="Choose a plan"
                      :options="plans"
                    />
                    <UiField
                      v-model="demo.fields['m-date']"
                      label="Preferred day"
                      placeholder="e.g. Friday morning"
                    />
                  </div>
                </template>
                <template v-else-if="openModal === 'side'">
                  <UiChips
                    v-model="demo.extras"
                    legend="Extras"
                    :options="['Delivery', 'Assembly', 'Warranty']"
                    multiple
                  />
                  <UiChips
                    v-model="demo.plan"
                    legend="Plan"
                    :options="['basic', 'pro', 'team']"
                    variant="segment"
                  />
                </template>
                <template v-else-if="openModal === 'bottom'">
                  <UiButton block variant="secondary">Copy link</UiButton>
                  <UiButton block variant="secondary">Send by email</UiButton>
                </template>
                <template v-else-if="openModal === 'image'">
                  <p>Seasonal offer: a full service with a free check of the brakes.</p>
                </template>
                <template #foot>
                  <template v-if="openModal === 'confirm'">
                    <UiButton variant="ghost" @click="openModal = ''">Cancel</UiButton>
                    <UiButton @click="openModal = ''">Delete</UiButton>
                  </template>
                  <template v-else-if="openModal === 'side'">
                    <UiButton block @click="openModal = ''">Show 24 results</UiButton>
                  </template>
                  <template v-else-if="openModal !== 'bottom' && openModal !== 'read'">
                    <UiButton variant="ghost" @click="openModal = ''">Cancel</UiButton>
                    <UiButton @click="openModal = ''">{{
                      openModal === 'image' ? 'Book now' : 'Send'
                    }}</UiButton>
                  </template>
                </template>
              </LazyUiModal>
            </template>
            <template v-else-if="e.id === 'LIGHTBOX-01'">
              <button type="button" class="bb__thumb" @click="demo.lightbox = true">
                <UiImg :src="photo" alt="Open the photo full screen" :width="240" :height="160" />
              </button>
              <LazyUiLightbox
                v-if="demo.lightbox"
                :open="demo.lightbox"
                :src="photo"
                alt="Grey mountains under a pale sun"
                @close="demo.lightbox = false"
              />
            </template>
          </div>
        </article>
      </section>
    </div>

    <!-- Dev tools -->
    <div
      v-if="visitedTabs.has('tools')"
      v-show="tab === 'tools'"
      id="panel-tools"
      role="tabpanel"
      aria-labelledby="tab-tools"
    >
      <section id="t-about" class="bb__sec">
        <h2 class="bb__h">Developer tools <code class="bb__id">DEVTOOLS-01</code></h2>
        <p class="bb__note">
          Overlays for checking a page while building it. They come from
          <code>&lt;UiDevTools /&gt;</code>, placed once in <code>app.vue</code> or the default
          layout, so they work on every page of the site, not only here. Each tool has a switch
          below and a shortcut; the choice is remembered.
        </p>
        <p v-if="!gridOn" class="bb__note">
          The tools are off in this environment: <code>uiDevTools</code> is
          <code>{{ gridMode }}</code
          >. Set it to <code>always</code> to use them here.
        </p>
      </section>

      <section v-for="t in devTools" :id="`t-${t.id}`" :key="t.id" class="bb__sec">
        <h2 class="bb__h">
          {{ t.name }} <kbd>Alt</kbd>+<kbd>{{ t.key }}</kbd>
        </h2>
        <p class="bb__note">{{ t.note }}</p>
        <div v-if="gridOn" class="bb__tool">
          <div v-if="t.id === 'grid'" class="bb__gridrow">
            <!-- the same red Grid button as the one bottom left, next to the columns it controls (shared state) -->
            <button
              type="button"
              class="bb__gridbtn"
              :aria-pressed="gridColsShared > 0"
              title="Layout grid (Alt+G)"
              @click="cycleGrid"
            >
              Grid{{ gridColsShared ? ` ${gridColsShared}` : '' }}
            </button>
            <UiSwitch v-model="gridButton" label="Show the red button" />
            <UiChips
              v-model="gridColsLabel"
              legend="Columns"
              :options="['Off', '12', '16', '24']"
              variant="segment"
            />
          </div>
          <UiSwitch v-else v-model="toolState[t.id]!.value" :label="t.switch" />
        </div>
        <ul class="bb__checks">
          <li v-for="c in t.checks" :key="c">{{ c }}</li>
        </ul>
      </section>

      <section id="t-settings" class="bb__sec">
        <h2 class="bb__h">Site setting</h2>
        <p class="bb__note">
          In <code>nuxt.config.ts</code>:
          <code>runtimeConfig: { public: { uiDevTools: 'dev' } }</code>. <code>dev</code> (default)
          shows the tools in development only, <code>always</code> on every page in every
          environment (a review on staging), <code>off</code> removes them. Without a rebuild:
          <code>NUXT_PUBLIC_UI_DEV_TOOLS=always|dev|off</code>.
        </p>
        <table class="bb__table">
          <thead>
            <tr>
              <th scope="col">Shortcut</th>
              <th scope="col">Does</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in devTools.filter((x) => x.key)" :key="t.id">
              <td>
                <kbd>Alt</kbd> + <kbd>{{ t.key }}</kbd>
              </td>
              <td>{{ t.name }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- Catalog -->
    <div
      v-if="visitedTabs.has('catalog')"
      v-show="tab === 'catalog'"
      id="panel-catalog"
      role="tabpanel"
      aria-labelledby="tab-catalog"
    >
      <section id="catalog" class="bb__sec">
        <h2 class="bb__h">All components</h2>
        <p class="bb__note">
          One row per pattern ID. Copy a single cell, a whole row, or the full table as Markdown for
          a task or a pull request.
        </p>
        <div class="bb__row bb__toolbar">
          <label class="bb__search">
            <span class="bb__sr">Filter components</span>
            <input
              v-model="catalogQuery"
              type="search"
              placeholder="Filter: button, form, molecule…"
            />
          </label>
          <UiCopyButton :value="catalogMarkdown" label="catalog as Markdown" text="Copy table" />
        </div>
        <div class="bb__scroll">
          <table class="bb__table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Level</th>
                <th scope="col">Component</th>
                <th scope="col">Classes</th>
                <th scope="col">Description</th>
                <th scope="col"><span class="bb__sr">Copy row</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in catalogRows" :key="e.id">
                <td>
                  <span class="bb__row"
                    ><a :href="`?tab=components#${e.id}`"
                      ><code>{{ e.id }}</code></a
                    ><UiCopyButton :value="e.id" :label="`ID ${e.id}`"
                  /></span>
                </td>
                <td>
                  {{ e.name }}
                </td>
                <td>{{ e.level }}</td>
                <td>
                  <code>{{ e.component }}</code>
                </td>
                <td>
                  <span class="bb__row"
                    ><code>{{ e.classes }}</code
                    ><UiCopyButton :value="e.classes" :label="`classes of ${e.id}`"
                  /></span>
                </td>
                <td>
                  {{ e.description }}
                </td>
                <td><UiCopyButton :value="card(e)" :label="`card of ${e.id}`" text="Row" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.bb {
  max-width: calc(var(--page-max) + var(--page-gutter) * 2);
  margin: 0 auto;
  padding: var(--space-8) var(--page-gutter) var(--space-16);
}
.bb__intro {
  display: grid;
  gap: var(--space-3);
  padding-bottom: var(--space-6);
}
.bb__eyebrow {
  margin: 0;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bb__title {
  margin: 0;
}
.bb__intro .lead {
  max-width: 48rem;
  margin: 0;
}
.bb__tabs {
  display: flex;
  gap: var(--space-1);
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  padding: var(--space-1);
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
  justify-self: start;
}
.bb__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  text-decoration: none;
  color: var(--color-ink-600);
  flex: none;
  min-height: 2.5rem;
  padding: 0 var(--space-6);
  white-space: nowrap;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-ink-600);
  font-weight: 600;
  cursor: pointer;
}
.bb__tab[aria-selected='true'] {
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
}
.bb__nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin: 0 calc(var(--page-gutter) * -1);
  padding: var(--space-3) var(--page-gutter);
  border-bottom: 1px solid var(--color-line);
  background: var(--color-glass);
  backdrop-filter: blur(12px);
}
.bb__nav-main {
  display: grid;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
}
.bb.-detail-view :deep(.copy-button),
.bb.-detail-info :deep(.copy-button),
.bb.-detail-view .bb__copies,
.bb.-detail-view .bb__specs,
.bb.-detail-view .bb__codes,
.bb.-detail-view .bb__spec-line,
.bb.-detail-view .bb__cell figcaption,
.bb.-detail-view .bb__tags,
.bb.-detail-view .bb__hint,
.bb.-detail-view .bb__icons code {
  display: none;
}
.bb.-detail-view .bb__tagged {
  grid-template-columns: minmax(0, 1fr);
}
.bb.-detail-view .bb__menu .bb__hint,
.bb.-detail-view .bb__menu :deep(.copy-button) {
  display: revert;
}
.bb__navend {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-3);
  min-height: 3rem; /* the height of the tab row, so both line up */
}
.bb__navctl {
  display: grid;
  gap: 0.15rem;
}
.bb__navgrid {
  display: grid;
  grid-template-columns: 2.25rem auto;
  align-items: center;
  gap: var(--space-1);
}
.bb__navgrid :deep(.chips__row) {
  padding: 0.1rem;
}
.bb__navgrid :deep(.chips__chip) {
  min-height: 1.35rem;
  padding: 0 0.55rem;
  font-size: 0.6875rem;
}
.bb__navgrid-label {
  color: var(--color-ink-500);
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bb__fab {
  display: grid;
  flex: none;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  padding: 0;
  border: 1px solid var(--color-line-strong);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}
.bb__fab:hover {
  border-color: var(--color-ink);
}
.bb__fab:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.bb__fab svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
}
.bb__menu {
  position: fixed;
  inset: 4.5rem var(--space-4) auto auto;
  width: min(18rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 6rem);
  margin: 0;
  padding: var(--space-3);
  overflow-y: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-ink);
  box-shadow: var(--shadow-modal);
}
.bb__menu .bb__label {
  margin: var(--space-2) var(--space-2) var(--space-1);
}
.bb__menu-list {
  margin: 0 0 var(--space-2);
  padding: 0;
  list-style: none;
}
.bb__menu-list li {
  margin: 0;
}
.bb__menu-item {
  display: block;
  width: 100%;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-ink);
  font-size: var(--text-sm);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.bb__menu-item:hover,
.bb__menu-item[aria-current='page'] {
  background: var(--color-accent-soft);
  color: var(--color-ink);
}
.bb__menu-item[aria-current='page'] {
  font-weight: 600;
}
.bb__gridset {
  display: grid;
  gap: var(--space-2);
  padding: 0 var(--space-2) var(--space-2);
}
.bb__menu .bb__hint {
  display: block;
  margin: 0 var(--space-2) var(--space-2);
  color: var(--color-ink-500);
  font-size: var(--text-xs);
}
.bb__gridrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
.bb__gridbtn {
  min-height: 2rem;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--color-ink-600);
  color: var(--color-brand-contrast);
  font: inherit;
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
}
.bb__gridbtn[aria-pressed='true'] {
  background: var(--color-danger);
}
.bb__tool {
  margin-bottom: var(--space-3);
}
.bb__checks {
  margin: 0;
  color: var(--color-ink-600);
  font-size: var(--text-sm);
}
.bb__menu-item.-top {
  border-top: 1px solid var(--color-line);
  border-radius: 0;
  color: var(--color-ink-600);
}
.bb__toc {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}
.bb__toc a {
  color: var(--color-ink-600);
}
.bb__sec {
  padding-top: var(--space-12);
}
.bb__h {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-2xl);
}
.bb__h3 {
  margin: 0;
  font-size: var(--text-lead);
}
.bb__note {
  max-width: 48rem;
  color: var(--color-ink-600);
}
.bb__id {
  font-size: var(--text-sm);
}
.bb__muted {
  color: var(--color-ink-500);
}
.bb__row {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);
}
.bb__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.bb__group {
  margin-top: var(--space-6);
}
.bb__group-head {
  justify-content: space-between;
  width: 100%;
}
.bb__group .bb__note {
  margin-bottom: var(--space-3);
}
.bb__btn {
  display: grid;
  gap: var(--space-3);
  width: 100%;
}
.bb__label {
  margin: var(--space-2) 0 0;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bb__cells {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4);
}
.bb__cell {
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  max-width: 11rem;
  margin: 0;
}
.bb__cell figcaption {
  margin: 0;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
}
/* Size and state matrices: equal cells, the control centred in a fixed-height stage, its code and copies under it */
.bb__cells.-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  align-items: stretch;
  gap: var(--space-3);
}
.bb__cells.-matrix .bb__cell {
  grid-template-rows: 4.25rem auto;
  align-content: start;
  max-width: none;
  padding: var(--space-3);
  border: 1px dashed var(--color-line-strong);
  border-radius: var(--radius-md);
}
.bb__cells.-matrix .bb__cell > :first-child {
  align-self: center;
}
.bb__cells.-matrix figcaption {
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-line);
}
.bb__cells.-matrix.-wide {
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}
.bb__cell.-dark {
  border-style: solid;
  border-color: var(--color-inverse);
  background: var(--color-inverse);
  color: var(--color-inverse-ink);
}
.bb__cell.-dark figcaption {
  border-top-color: var(--color-inverse-line);
  color: var(--color-inverse-ink-600);
}
.bb__cell.-dark :deep(.copy-button) {
  color: var(--color-inverse-ink-600);
}
.bb__cell.-dark code {
  background: var(--color-inverse-soft);
  color: var(--color-inverse-ink);
}
.bb__cell figcaption {
  display: grid;
  justify-items: start;
  gap: var(--space-1);
}
.bb__cell-name {
  color: var(--color-ink);
  font-size: var(--text-xs);
}
.bb__cell.-dark .bb__cell-name {
  color: var(--color-inverse-ink);
}
.bb__dark.-matrix .bb__cell {
  border-color: var(--color-inverse-line);
}
.bb__dark.-matrix figcaption {
  border-top-color: var(--color-inverse-line);
}
.bb__dark {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-inverse);
  color: var(--color-inverse-ink);
}
.bb__dark .bb__cell figcaption {
  color: var(--color-inverse-ink-600);
}
.bb__dark :deep(.copy-button) {
  color: var(--color-inverse-ink-600);
}
.bb__swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}
.bb__swatch {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  gap: var(--space-3);
  margin: 0;
  padding: var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.bb__chip {
  height: 3.5rem;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
}
.bb__swatch-meta {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}
.bb__type {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-line);
}
.bb__type-sample {
  margin: 0;
  line-height: 1.2;
}
.bb__cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--space-8);
}
.bb__list {
  display: grid;
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}
.bb__list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0;
}
.bb__bar {
  height: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-brand);
}
.bb__box {
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--color-line-strong);
  background: var(--color-accent-soft);
}
.bb__box.-white {
  border: 0;
  background: var(--color-surface);
}
.bb__search {
  display: block;
  max-width: 24rem;
  margin-bottom: var(--space-4);
}
.bb__toolbar {
  justify-content: space-between;
  width: 100%;
}
.bb__toolbar .bb__search {
  flex: 1;
  margin: 0;
}
.bb__scroll {
  position: relative;
  margin-top: var(--space-4);
  overflow-x: auto;
}
.bb__crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: 0;
  color: var(--color-ink-500);
  font-size: var(--text-sm);
  list-style: none;
}
.bb__crumbs li {
  margin: 0;
}
.bb__crumbs li + li::before {
  content: '/';
  margin-right: var(--space-2);
}
.bb__usage {
  margin-top: var(--space-6);
}
.bb__usage .bb__sample :where(*):hover,
.bb__usage.-tags .bb__sample :where(*) {
  outline: 1px dashed var(--color-line-strong);
  outline-offset: 2px;
}

.bb__table td {
  vertical-align: top;
}
.bb__tagged {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: start;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}
.bb__sample {
  max-width: 42rem;
  min-width: 0;
}
.bb__sample > :deep(:last-child),
.bb__sample > :last-child {
  margin-bottom: 0;
}
.bb__sample.-code {
  margin: 0;
}
.bb__sample :deep(.-hl),
.bb__sample .-hl {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
.bb__tags {
  display: grid;
  justify-items: start;
  gap: 0.15rem;
  color: var(--color-ink-500);
  padding-top: 0.2rem;
  font-size: var(--text-xs);
  line-height: 1.6;
}
.bb__tags code {
  font-size: inherit;
  color: var(--color-ink);
  cursor: help;
}
.bb__tagline {
  line-height: 1.45;
}
.bb__tags code:hover,
.bb__tags code:focus-visible {
  background: var(--color-brand);
  color: var(--color-brand-contrast);
}
.bb__spec {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-bottom: var(--space-6);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  overflow: hidden;
}
.bb__plate {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-line);
}
.bb__plate-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
}
.bb__copies {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-left: auto;
}
.bb__specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--space-1) var(--space-4);
  margin-top: var(--space-1);
}
.bb__spec-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  margin: 0;
  font-size: var(--text-sm);
}
.bb__spec-line code {
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
}
.bb__codes {
  display: grid;
  gap: var(--space-1);
}
.bb__codes .bb__spec-key {
  width: 4rem;
}
.bb__spec-key {
  flex: none;
  width: 2.5rem;
  color: var(--color-ink-500);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
}
.bb__dark code {
  background: var(--color-inverse-soft);
  color: var(--color-inverse-ink);
}
.bb__hint {
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}
.bb__desc {
  margin: 0;
  color: var(--color-ink-600);
  font-size: var(--text-sm);
}
.bb__stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-paper);
}
.bb__icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: var(--space-3);
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.bb__icon {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: 4rem auto;
  align-items: center;
  margin: 0;
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.bb__icon-box {
  display: grid;
  grid-column: 1 / -1;
  place-items: center;
  height: 100%;
}
.bb__icon-name {
  min-width: 0;
  overflow: hidden;
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bb__form {
  display: grid;
  gap: var(--space-4);
  width: min(100%, 26rem);
}
.bb__stack,
.bb__wide {
  width: 100%;
}
.bb__stack {
  display: grid;
  gap: var(--space-3);
}
.bb__narrow {
  width: min(100%, 24rem);
}
.bb__img {
  width: min(100%, 24rem);
  border-radius: var(--radius-md);
}
.bb__media {
  width: min(100%, 16rem);
}
.bb__card {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.bb__card p {
  margin: 0;
}
.bb__modals {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: var(--space-3);
  width: 100%;
}
.bb__modal-card {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px dashed var(--color-line-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.bb__modal-card p {
  margin: 0;
  font-size: var(--text-sm);
}
.bb__twocol {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--space-4);
}
.bb__thumb {
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: zoom-in;
}
@media (max-width: 900px) {
  .bb__navgrid-label {
    display: none;
  }
}
@media (max-width: 640px) {
  .bb__toc,
  .bb__navgrid {
    display: none;
  }
  .bb__tagged {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-2);
  }
  .bb__copies {
    margin-left: 0;
  }
}
</style>
