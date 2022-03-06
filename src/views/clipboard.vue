<template lang="pug">
#clipboard
  .list(ref="list")
    .item(
      v-for="(item, index) in histories"
      :key="item.time"
      :class="{ selected: selectIndex === index }"
      @click="selectIndex = index"
    )
      | {{ item.text }}
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, computed, watch } from 'vue';
import { Clipboard } from '~/@types';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';

type State = {
  histories: Clipboard[];
  selectIndex: number;
};
export default defineComponent({
  setup() {
    const { api } = window;
    api.orderClipboard();
    api.deliverClipboard((histories) => (state.histories = histories));
    const state = reactive<State>({
      histories: [],
      selectIndex: 0,
    });
    const { selectIndex } = toRefs(state);
    const list = ref<HTMLDivElement>();
    const histories = computed(() => {
      return state.histories.slice().sort((a, b) => {
        return b.time - a.time;
      });
    });
    watch(
      () => store.state.keyEvent,
      (keyEvent) => {
        if (state.histories.length <= state.selectIndex || keyEvent === null) {
          return;
        }
        const maxIndex = state.histories.length - 1;
        switch (keyEvent.key) {
          case HANDLING_KEYS.ENTER: {
            const selectedItem = histories.value[state.selectIndex];
            const originIndex = state.histories.findIndex(
              (item) => item === selectedItem
            );
            api.pasteClipboard(originIndex);
            return;
          }
          case HANDLING_KEYS.UP:
            state.selectIndex > 0
              ? state.selectIndex--
              : (state.selectIndex = maxIndex);
            break;
          case HANDLING_KEYS.DOWN:
            state.selectIndex < maxIndex
              ? state.selectIndex++
              : (state.selectIndex = 0);
            break;
          default:
            return;
        }
        const refsList = list.value;
        if (!refsList) return;
        const item: Element = refsList
          .querySelectorAll('.item')
          .item(state.selectIndex);
        const listTop = refsList.getBoundingClientRect().top;
        const scrollBottom = refsList.scrollTop + refsList.clientHeight;
        const itemRect = item.getBoundingClientRect();
        const itemTop = itemRect.top - listTop + refsList.scrollTop;
        const itemBottom = itemRect.bottom - listTop + refsList.scrollTop;
        if (itemTop < refsList.scrollTop) {
          refsList.scrollTop = itemTop - 1;
        }
        if (itemBottom > scrollBottom) {
          refsList.scrollTop = itemBottom - refsList.clientHeight - 2;
        }
      }
    );
    return {
      histories,
      selectIndex,
      list,
    };
  },
});
</script>

<style scoped lang="scss">
.list {
  max-height: calc(100% - 1.5rem);
  overflow-y: auto;
  border: 1px solid lightgray;
  background-color: white;
  font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
  .item {
    height: 1.46rem;
    padding: 0.25rem 0.5rem;
    overflow-x: hidden;
    overflow-y: visible;
    font-size: 0.75rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
    &:not(:last-child) {
      border-bottom: 1px solid lightgray;
    }
    &.selected {
      background-color: skyblue;
    }
  }
  &::-webkit-scrollbar {
    width: 1rem;
  }
  &::-webkit-scrollbar-track {
    margin: -1px;
    border: 1px solid lightgray;
    border-right: none;
    background-color: aliceblue;
  }
  &::-webkit-scrollbar-thumb {
    background-color: lightsteelblue;
  }
}
</style>
