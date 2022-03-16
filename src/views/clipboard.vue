<template lang="pug">
#clipboard(
  :class="{ 'cursor-resize': isResizing }"
  @mousemove="resize"
  @mouseup="isResizing = false"
)
  .list(
    ref="list"
    :style="{ height: `calc(50% + ${adjustHeight}px)` }"
  )
    .item(
      v-for="(item, index) in histories"
      :key="item.time"
      :class="{ selected: selectIndex === index }"
      @click="selectIndex = index"
      @dblclick="paste"
    )
      | {{ item.text }}
  .separator.cursor-resize(
    @mousedown="isResizing = true"
  )
  .text(
    :style="{ height: `calc(50% - ${adjustHeight}px)` }"
  )
    template(
      v-if="histories.length > selectIndex"
    )
      | {{ histories[selectIndex].text }}
  .footer
    button(
      :disabled="histories.length <= selectIndex"
      @click="paste"
    ) Paste
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, computed, watch } from 'vue';
import { Clipboard } from '~/@types';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';

type State = {
  histories: Clipboard[];
  selectIndex: number;
  adjustHeight: number;
  isResizing: boolean;
};
export default defineComponent({
  setup() {
    const { api } = window;
    api.orderClipboard();
    api.deliverClipboard((histories) => (state.histories = histories));

    // data
    const state = reactive<State>({
      histories: [],
      selectIndex: 0,
      adjustHeight: 0,
      isResizing: false,
    });
    const { selectIndex, adjustHeight, isResizing } = toRefs(state);

    // refs
    const list = ref<HTMLDivElement>();

    // computed
    const histories = computed(() => {
      return state.histories.slice().sort((a, b) => {
        return b.time - a.time;
      });
    });

    // methods
    const paste = () => {
      const selectedItem = histories.value[state.selectIndex];
      const originIndex = state.histories.findIndex(
        (item) => item === selectedItem
      );
      api.pasteClipboard(originIndex);
    };
    const resize = (event: MouseEvent) => {
      if (event.buttons === 0 || !state.isResizing) {
        state.isResizing = false;
        return;
      }
      event.preventDefault();
      state.adjustHeight += event.movementY;
    };

    // watch
    watch(
      () => store.state.keyEvent,
      (keyEvent) => {
        if (state.histories.length <= state.selectIndex || keyEvent === null) {
          return;
        }
        const maxIndex = state.histories.length - 1;
        switch (keyEvent.key) {
          case HANDLING_KEYS.ENTER:
            paste();
            return;
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
      // data
      selectIndex,
      adjustHeight,
      isResizing,
      // refs
      list,
      // computed
      histories,
      // methods
      paste,
      resize,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/css/colors';

#clipboard {
  display: flex;
  flex-flow: column;
  cursor: default;
}
.list,
.text {
  overflow-y: auto;
  border: 1px solid lightgray;
  font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
  &::-webkit-scrollbar {
    width: 1rem;
    height: 1rem;
  }
  &::-webkit-scrollbar-track {
    margin: -1px;
    border-top: 1px solid lightgray;
    border-left: 1px solid lightgray;
    background-color: aliceblue;
  }
  &::-webkit-scrollbar-thumb {
    background-color: lightsteelblue;
  }
  &::-webkit-scrollbar-corner {
    margin: -2px;
    border-top: 1px solid lightgray;
    border-left: 1px solid lightgray;
    background-color: aliceblue;
  }
}
.list {
  min-height: 1.5rem;
  background-color: lightgray;
  .item {
    height: 1.46rem;
    padding: 0.25rem 0.5rem;
    overflow-x: hidden;
    overflow-y: visible;
    background-color: white;
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
}
.separator {
  height: 0.5rem;
  background-color: whitesmoke;
}
.text {
  min-height: 1.75rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  overflow-x: auto;
  background-color: white;
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: left;
  white-space: pre;
}
.footer {
  display: flex;
  justify-content: flex-end;
  transform: scale(1.25, 1);
  transform-origin: top right;
  button {
    padding: 0.125rem 0.8rem;
    border: 1px solid lightgray;
    background-color: #e4e4e4;
    color: $font-color;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
    &:not(:disabled):hover {
      background-color: #dae4ee;
      border-color: lightgray;
    }
  }
}
.cursor-resize {
  cursor: ns-resize !important;
}
</style>
