<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="histories"
  @paste="paste"
  @remove="remove"
)
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import TextList from '~/components/text-list.vue';
import Clipboard from '~/models/clipboard';
import store from '~/store';

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

    // computed
    const isEmpty = computed(() => !state.histories.length);
    const isSelected = computed(
      () => !isEmpty.value && state.histories.length > state.selectIndex
    );

    // methods
    const paste = (asPlainText?: boolean) => {
      api.pasteClipboard(state.selectIndex, asPlainText);
    };
    const remove = () => {
      api.removeClipboard(state.selectIndex);
      state.histories.splice(state.selectIndex, 1);
    };

    // watch
    watch(
      () => store.state.windowEvent,
      (windowEvent) => {
        if (!windowEvent || !isSelected.value) return;
        switch (windowEvent.type) {
          case 'paste': {
            const [asPlainText] = windowEvent.args;
            paste(asPlainText as boolean | undefined);
            break;
          }
          case 'remove':
            remove();
            break;
        }
      }
    );

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
