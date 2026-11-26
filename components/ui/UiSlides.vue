<script setup lang="ts">
// SLIDES-01 · Slides organism: a row of square slide cards (number, title with an italic second line, lead, perks or a short list of points, actions, footer line) on a photo or a plain tone.
// An optional heading (`titleA`, `titleB`, `lead`, `eyebrow` or `numbered`) opens the row; then the slide titles become h3.
// `slider` turns the grid into one swipeable strip (3 slides on wide screens, 2 on tablets, one and a peek on phones) with arrows opposite the heading.
// A light or dark slide that has a `src` becomes a picture slide (`-pic`): the text stays on top and the photo fills the lower half, dissolving into the tone through a gradient.
import type { PerkItem } from './UiPerks.vue';
import type { SiteModalKey } from '~/composables/useSiteModal';
import messages from '~~/i18n/locales/es';
export interface SlideItem {
  tone: 'dark' | 'light' | 'photo';
  titleA: string;
  titleB?: string;
  lead?: string;
  src?: string;
  cutout?: string;
  alt?: string;
  perks?: PerkItem[];
  cta?: string;
  modal?: SiteModalKey;
  topic?: string;
  points?: string[];
  foot?: string[];
}
const props = defineProps<{
  items: SlideItem[];
  chatHref?: string;
  chatLabel?: string;
  titleA?: string;
  titleB?: string;
  lead?: string;
  eyebrow?: string;
  numbered?: boolean;
  slider?: boolean;
}>();
const titleId = useId();
const slideTitle = computed(() => (props.titleA ? 'h3' : 'h2'));
const m = messages.ui.slider;
const track = ref<HTMLElement | null>(null);
const atStart = ref(true);
const atEnd = ref(false);
const sync = () => {
  const el = track.value;
  if (!el) return;
  atStart.value = el.scrollLeft <= 2;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
};
const step = (dir: 1 | -1) => {
  const el = track.value;
  const slide = el?.querySelector<HTMLElement>('.slide');
  if (el && slide)
    el.scrollBy({
      left: dir * (slide.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)),
      behavior: 'smooth',
    });
};
onMounted(sync);
</script>

<template>
  <section
    class="slides"
    :class="{ '-slider': slider }"
    :aria-labelledby="titleA ? titleId : undefined"
  >
    <div v-if="titleA" class="slides__top">
      <header class="slides__head">
        <p v-if="numbered" class="index"></p>
        <p v-else-if="eyebrow" class="eyebrow -rule">{{ eyebrow }}</p>
        <h2 :id="titleId" class="section__title">
          {{ titleA
          }}<template v-if="titleB"
            >{{ ' ' }}<em>{{ titleB }}</em></template
          >
        </h2>
        <p v-if="lead" class="section__lead">{{ lead }}</p>
      </header>
      <div v-if="slider" class="slides__nav">
        <button
          class="slides__arrow"
          type="button"
          :aria-label="m.prev"
          :disabled="atStart"
          @click="step(-1)"
        >
          <UiIcon name="slider-prev" />
        </button>
        <button
          class="slides__arrow"
          type="button"
          :aria-label="m.next"
          :disabled="atEnd"
          @click="step(1)"
        >
          <UiIcon name="slider-next" />
        </button>
      </div>
    </div>
    <div ref="track" class="slides__track" @scroll.passive="sync">
      <article
        v-for="(item, i) in items"
        :key="item.titleA"
        class="slide"
        :class="[
          `-${item.tone}`,
          { '-text': item.points, '-pic': item.src && item.tone !== 'photo' },
        ]"
      >
        <UiImg
          v-if="item.src"
          class="slide__bg"
          :src="item.src"
          :alt="item.alt ?? ''"
          sizes="(max-width: 900px) 90vw, 34vw"
          loading="lazy"
        />
        <UiImg
          v-if="item.cutout"
          class="slide__cutout"
          :src="item.cutout"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <p class="slide__index">
          {{ String(i + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}
        </p>
        <component :is="slideTitle" class="slide__title"
          >{{ item.titleA }}<em v-if="item.titleB">{{ item.titleB }}</em></component
        >
        <p v-if="item.lead" class="slide__lead">{{ item.lead }}</p>
        <ul v-if="item.points" class="slide__points">
          <li v-for="point in item.points" :key="point">{{ point }}</li>
        </ul>
        <UiPerks v-if="item.perks" class="-list" :items="item.perks" />
        <div v-if="item.cta" class="slide__actions">
          <slot name="actions" :item="item" />
          <a v-if="chatHref" class="slide__chat" :href="chatHref" :aria-label="chatLabel"
            ><svg aria-hidden="true"><use :href="asset('/icons.svg#icon-whatsapp-outline')" /></svg
          ></a>
        </div>
        <p v-if="item.foot" class="slide__foot">
          <span v-for="part in item.foot" :key="part">{{ part }}</span>
        </p>
        <UiSpark v-if="item.tone !== 'photo'" />
        <UiImg
          class="slide__curve"
          src="/images/decor/gold-route-arc.svg"
          alt=""
          aria-hidden="true"
        />
      </article>
    </div>
  </section>
</template>
