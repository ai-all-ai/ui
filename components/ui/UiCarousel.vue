<script setup lang="ts">
import messages from '~~/i18n/locales/es';
const m = messages.ui.carousel;
const visuals = [
  '/images/home/card-express.webp',
  '/images/home/card-complete.webp',
  '/images/photos/leather-saddle-workshop-closeup.webp',
  '/images/photos/mechanic-wheel-spokes-closeup.webp',
  '/images/home/service-chain.webp',
  '/images/home/service-hand.webp',
];
const cards = m.cards.map((c, i) => ({ ...c, img: visuals[i] }));
const active = ref(1);
const prev = () => {
  active.value = (active.value - 1 + cards.length) % cards.length;
};
const next = () => {
  active.value = (active.value + 1) % cards.length;
};
</script>

<template>
  <section
    class="band -light carousel -band -stars"
    data-header-tone="light"
    aria-labelledby="carousel-title"
  >
    <UiSparkleField />
    <div class="carousel__head">
      <p class="index"></p>
      <h2 id="carousel-title" class="section__title">
        {{ m.titleA }} <em>{{ m.titleB }}</em>
      </h2>
      <p class="section__lead">{{ m.lead }}</p>
    </div>
    <div class="carousel__stage">
      <div class="carousel__row">
        <button type="button" class="carousel__nav" :aria-label="m.prev" @click="prev">←</button>
        <div class="carousel__viewport">
          <ul class="carousel__track" :style="{ '--i': Math.min(active, cards.length - 2) }">
            <li
              v-for="(c, i) in cards"
              :key="c.title"
              class="carousel__card"
              :class="{ 'is-active': i === active }"
              @click="active = i"
            >
              <UiImg :src="c.img" alt="" loading="lazy" />
              <div class="carousel__text">
                <h3>{{ c.title }}</h3>
                <p>{{ c.text }}</p>
              </div>
            </li>
          </ul>
        </div>
        <button type="button" class="carousel__nav" :aria-label="m.next" @click="next">→</button>
      </div>
      <div class="carousel__dots" role="tablist">
        <button
          v-for="(c, i) in cards"
          :key="c.title"
          type="button"
          :class="{ 'is-active': i === active }"
          :aria-label="c.title"
          @click="active = i"
        ></button>
      </div>
    </div>
  </section>
</template>
