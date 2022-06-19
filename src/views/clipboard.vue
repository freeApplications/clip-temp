<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="histories"
  @paste="paste"
  @remove="remove"
)
  template(v-slot:footer)
    button(
      @click="remove"
      :disabled="selectIndex < 0 || selectIndex >= histories.length"
    ) Delete
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import TextList from '~/components/text-list.vue';
import Clipboard from '~/models/clipboard';

type State = {
  histories: Clipboard[];
  selectIndex: number;
};
export default defineComponent({
  components: {
    TextList,
  },
  setup() {
    const { api } = window;
    api.orderClipboard();
    api.deliverClipboard((histories) => {
      state.histories = histories.map((item) => new Clipboard(item));
    });

    // data
    const state = reactive<State>({
      histories: [],
      selectIndex: 0,
    });
    const { histories, selectIndex } = toRefs(state);

    // methods
    const paste = () => api.pasteClipboard(state.selectIndex);
    const remove = () => {
      api.removeClipboard(state.selectIndex);
      state.histories.splice(state.selectIndex, 1);
    };

    return {
      // data
      histories,
      selectIndex,
      // methods
      paste,
      remove,
    };
  },
});
</script>
