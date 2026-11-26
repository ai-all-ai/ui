<script setup lang="ts">
import messages from '~~/i18n/locales/es';
const m = messages.ui.trust;
// Provisional copy from the "Premium Bicycle Care" banner; the 1.000 figure is a placeholder until confirmed.
const points = m.points;
</script>

<template>
  <section
    class="band -dark trust -stars -title-shadow"
    data-header-tone="dark"
    aria-labelledby="trust-title"
  >
    <UiSparkleField />
    <p class="index"></p>
    <UiImg
      src="/images/decor/olive-sprig-detail.webp"
      alt=""
      class="trust__sprig"
      aria-hidden="true"
      loading="lazy"
    />
    <div class="trust__grid">
      <div class="trust__copy">
        <p class="trust__eyebrow">{{ m.eyebrow }}</p>
        <h2 id="trust-title" class="section__title">
          {{ m.titleA }} <em>{{ m.titleB }}</em>
        </h2>
      </div>
      <ul class="trust__points">
        <li v-for="p in points" :key="p">✓ {{ p }}</li>
      </ul>
      <div class="trust__badge">
        <span class="trust__more">{{ m.more }}</span>
        <span class="trust__count">1.000</span>
        <span class="trust__unit">{{ m.unit }}</span>
      </div>
    </div>
  </section>
</template>
