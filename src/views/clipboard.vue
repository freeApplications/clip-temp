<template lang="pug">
#clipboard(
  :class="{ 'cursor-resize': isResizing }"
  @mousemove="resize"
  @mouseup="isResizing = false"
)
  .header
    icon-filter
    input.filter-word(
      ref="input"
      type="text"
      spellcheck="false"
      v-model="filterWord"
      @blur="fixingFocus"
    )
    icon-clear(
      :class="{ invisible: !filterWord.length }"
      @click="filterWord = ''"
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
      @click.right="showEditMenu(index)"
    )
      span.parts(
        v-for="partOfText in item.text.parts"
        :class="{ highlight: partOfText.isMatched }"
      ) {{ partOfText }}
  .separator.cursor-resize(
    @mousedown="isResizing = true"
  )
  .text(
    :style="{ height: `calc(50% - ${adjustHeight}px)` }"
  )
    template(
      v-if="histories.length && histories.length > selectIndex"
    )
      .actions
        icon-remove(
          @click="remove"
        )
      span.parts(
        v-for="partOfText in histories[selectIndex].text.parts"
        :class="{ highlight: partOfText.isMatched }"
      ) {{ partOfText }}
  .footer
    button(
      :disabled="histories.length <= selectIndex"
      @click="paste"
    ) Paste
    button(
      @click="closeWindow"
    ) Cancel
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';
import IconFilter from '~/components/icons/filter.vue';
import IconClear from '~/components/icons/clear.vue';
import IconRemove from '~/components/icons/remove.vue';
import Clipboard from '~/models/clipboard';
import { Clipboard as OriginClipboard } from '~/@types';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';

type State = {
  histories: OriginClipboard[];
  filterWord: string;
  selectIndex: number;
  adjustHeight: number;
  isResizing: boolean;
};
export default defineComponent({
  components: {
    IconFilter,
    IconClear,
    IconRemove,
  },
  setup() {
    const { api } = window;
    api.orderClipboard();
    api.deliverClipboard((histories) => (state.histories = histories));

    // data
    const state = reactive<State>({
      histories: [],
      filterWord: '',
      selectIndex: 0,
      adjustHeight: 0,
      isResizing: false,
    });
    const { filterWord, selectIndex, adjustHeight, isResizing } = toRefs(state);

    // refs
    const input = ref<HTMLDivElement>();
    const list = ref<HTMLDivElement>();

    // computed
    const histories = computed<Clipboard[]>(() => {
      return state.histories
        .map((item) => new Clipboard(item))
        .filter((item) => item.match(state.filterWord))
        .sort((a, b) => a.compareTo(b));
    });
    const originIndex = computed(() => {
      const selectedItem = histories.value[state.selectIndex];
      return state.histories.findIndex((item) => selectedItem.equals(item));
    });

    // methods
    const fixingFocus = () => {
      const refsInput = input.value;
      if (!refsInput) return;
      refsInput.focus();
    };
    const paste = () => {
      api.pasteClipboard(originIndex.value);
    };
    const remove = () => {
      api.removeClipboard(originIndex.value);
      state.histories.splice(originIndex.value, 1);
      if (histories.value.length <= state.selectIndex) {
        state.selectIndex = histories.value.length - 1;
      }
    };
    const resize = (event: MouseEvent) => {
      if (event.buttons === 0 || !state.isResizing) {
        state.isResizing = false;
        return;
      }
      event.preventDefault();
      state.adjustHeight += event.movementY;
    };
    const showEditMenu = (index: number) => {
      state.selectIndex = index;
      api.showEditMenu(paste, remove);
    };
    const closeWindow = api.closeWindow;

    // watch
    watch(
      () => store.state.keyEvent,
      (keyEvent) => {
        if (keyEvent === null) return fixingFocus();
        if (keyEvent.key === HANDLING_KEYS.ESCAPE) return closeWindow();
        if (histories.value.length <= state.selectIndex) return;
        const maxIndex = histories.value.length - 1;
        switch (keyEvent.key) {
          case HANDLING_KEYS.ENTER:
            paste();
            return;
          case HANDLING_KEYS.DELETE:
            remove();
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
    watch(filterWord, () => (state.selectIndex = 0));

    // lifecycle
    onMounted(() => {
      nextTick(() => fixingFocus());
    });

    return {
      // data
      filterWord,
      selectIndex,
      adjustHeight,
      isResizing,
      // refs
      input,
      list,
      // computed
      histories,
      // methods
      fixingFocus,
      paste,
      remove,
      resize,
      showEditMenu,
      closeWindow,
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
.header {
  display: flex;
  margin-bottom: 0.5rem;
  * {
    &:not(:last-child) {
      margin-right: 0.25rem;
    }
  }
  .filter-word {
    width: 100%;
    padding: 0;
    border: none;
    background-color: inherit;
    font-size: 0.75rem;
    font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
    cursor: default;
    caret-color: transparent;
  }
}
.list,
.text {
  overflow-y: auto;
  border: 1px solid lightgray;
  font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
  .parts {
    position: relative;
    z-index: 0;
    &.highlight {
      &::after {
        position: absolute;
        top: -2px;
        right: -1px;
        bottom: -2px;
        left: -1px;
        z-index: -1;
        border-radius: 3px;
        background-color: gold;
        content: '';
      }
    }
  }
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
  .actions {
    opacity: 0;
    position: sticky;
    top: 0.125rem;
    z-index: 1;
    height: 0;
    margin-right: -0.25rem;
    text-align: right;
  }
  &:hover {
    .actions {
      opacity: 0.5;
      svg {
        background-color: white;
      }
      &:hover {
        opacity: 0.9;
      }
    }
  }
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
    &:not(:last-child) {
      margin-right: 0.5rem;
    }
  }
}
.cursor-resize {
  cursor: ns-resize !important;
}
.invisible {
  visibility: hidden;
}
</style>
