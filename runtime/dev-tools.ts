import { getCurrentInstance, ref } from 'vue';
import type { App } from 'vue';

function createState() {
  return {
    cols: ref(0),
    button: ref(true),
    rhythm: ref(false),
    outlines: ref(false),
    size: ref(false),
    audit: ref(false),
    mode: 'dev',
    visible: Boolean(import.meta.env?.DEV),
    routePath: () => '',
  };
}

const states = new WeakMap<App, ReturnType<typeof createState>>();

export function useUiDevTools() {
  const app = getCurrentInstance()?.appContext.app;
  if (!app) throw new Error('useUiDevTools must be called during component setup.');
  let state = states.get(app);
  if (!state) {
    state = createState();
    states.set(app, state);
  }
  return state;
}

export function provideUiDevTools(app: App, mode: string, routePath: () => string) {
  const state = createState();
  state.mode = mode;
  state.visible =
    mode === 'always' || mode === 'true' || (mode !== 'off' && mode !== 'false' && state.visible);
  state.routePath = routePath;
  states.set(app, state);
}
