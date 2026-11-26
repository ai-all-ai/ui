<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string;
    variant?: 'bright' | 'outline' | 'green' | 'black' | 'white';
    size?: 'md' | 'small' | 'big';
    arrow?: string | false;
    crown?: boolean;
    prime?: boolean;
    type?: 'button' | 'submit';
  }>(),
  {
    href: undefined,
    variant: 'bright',
    size: 'md',
    arrow: '↗',
    crown: false,
    prime: false,
    type: 'button',
  },
);
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="btn"
    :class="[
      variant === 'bright' ? '' : `-${variant}`,
      { '-small': size === 'small', '-big': size === 'big', '-crown': crown, '-prime': prime },
    ]"
    :href="asset(href)"
    :type="href ? undefined : type"
  >
    <UiCrown v-if="crown" class="btn__crown" />
    <slot />
    <span v-if="arrow" aria-hidden="true">{{ arrow }}</span>
    <svg
      v-if="prime"
      class="btn-crown"
      viewBox="143 199 102 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 240.9 246.2 L 146.6 246.2 C 146.6 246.2 143.7 245.4 143.7 241.5 L 143.7 214.8 C 143.7 214.8 143.6 211.8 149.4 214.8 C 155.2 217.8 173.4 228.3 173.4 228.3 C 173.4 228.3 175.7 230.6 176.9 228.3 C 178 226.1 190.6 204.9 190.6 204.9 C 190.6 204.9 193.4 199.6 196 205 C 198.6 210.3 208.7 227.8 208.7 227.8 C 208.7 227.8 210.5 230.7 213.6 228.5 C 216.6 226.4 238.4 214.1 238.4 214.1 C 238.4 214.1 243.5 211.5 243.5 217.1 C 243.5 222.6 243.7 242.9 243.7 242.9 C 243.7 242.9 244.6 246.2 240.9 246.2"
      />
    </svg>
  </component>
</template>
