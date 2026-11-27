import type { NuxtModule } from 'nuxt/schema';

export interface UiModuleOptions {
  /** Use scoped styles for imported components, combine core styles, or skip global foundation CSS. */
  css: boolean | 'bundle';
  /** Include the managed Brandbook in development only, all builds, or neither. */
  brandbook: boolean | 'dev';
  /** Compile the developer overlay for development only, all builds, or neither. */
  devTools: boolean | 'dev';
}

declare const module: NuxtModule<UiModuleOptions>;
export default module;

declare module 'nuxt/schema' {
  interface NuxtConfig {
    aiallUi?: Partial<UiModuleOptions>;
  }
  interface NuxtOptions {
    aiallUi?: Partial<UiModuleOptions>;
  }
}
