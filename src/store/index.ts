import { createStore } from 'vuex';

export type State = {
  keyEvent: KeyboardEvent;
};

export default createStore<State>({
  state: {
    keyEvent: new KeyboardEvent(''),
  },
  mutations: {
    setKeyEvent: (state, keyEvent: KeyboardEvent) =>
      (state.keyEvent = keyEvent),
  },
  actions: {},
  modules: {},
});
