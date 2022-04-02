import { createStore } from 'vuex';
import { WindowEvent } from '~/@types';

export type State = {
  windowEvent: WindowEvent | null;
  keyEvent: KeyboardEvent;
};

const store = createStore<State>({
  state: {
    windowEvent: null,
    keyEvent: new KeyboardEvent(''),
  },
  mutations: {
    setKeyEvent: (state, keyEvent: KeyboardEvent) =>
      (state.keyEvent = keyEvent),
    setWindowEvent: (state, windowEvent: WindowEvent) =>
      (state.windowEvent = windowEvent),
  },
  actions: {},
  modules: {},
});
export default store;

window.api.storeWindowEvent((type, ...args) => {
  store.commit('setWindowEvent', { type, args });
});
