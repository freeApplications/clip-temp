import { createStore } from 'vuex';

export type State = {
  keyEvent: KeyboardEvent | null;
};

export default createStore<State>({
  state: {
    keyEvent: null,
  },
  mutations: {
    setKeyEvent: (state, keyEvent: KeyboardEvent) =>
      (state.keyEvent = keyEvent),
  },
  actions: {},
  modules: {},
});
