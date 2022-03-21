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
  border: 1px solid;
  font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
  .parts {
    position: relative;
    z-index: 0;
    &.highlight {
      color: $highlight-font;
      &::after {
        position: absolute;
        top: -2px;
        right: -1px;
        bottom: -2px;
        left: -1px;
        z-index: -1;
        border-radius: 3px;
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
    border-top: 1px solid;
    border-left: 1px solid;
  }
  &::-webkit-scrollbar-corner {
    margin: -2px;
    border-top: 1px solid;
    border-left: 1px solid;
  }
}
.list {
  min-height: 1.5rem;
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
      border-bottom: 1px solid;
    }
  }
}
.separator {
  height: 0.5rem;
}
.text {
  min-height: 1.75rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  overflow-x: auto;
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
    border: 1px solid;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
      cursor: default;
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

@media (prefers-color-scheme: light) {
  .header .filter-word {
    color: $light-font;
  }
  .list,
  .text {
    border-color: $light-border;
    .parts.highlight::after {
      background-color: $light-highlight;
    }
    &::-webkit-scrollbar-track {
      border-top-color: $light-border;
      border-left-color: $light-border;
      background-color: $light-scrollbar-track;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $light-scrollbar;
    }
    &::-webkit-scrollbar-corner {
      border-top-color: $light-border;
      border-left-color: $light-border;
      background-color: $light-scrollbar-track;
    }
  }
  .list {
    background-color: $light-background-empty;
    .item {
      background-color: $light-background-main;
      &:not(:last-child) {
        border-bottom-color: $light-border;
      }
      &.selected {
        background-color: $light-selected;
      }
    }
  }
  .separator {
    background-color: $light-background;
  }
  .text {
    background-color: $light-background-main;
    &:hover .actions svg {
      background-color: $light-background-main;
    }
  }
  .footer button {
    border-color: $light-border;
    background-color: $light-button;
    color: $light-font;
    &:not(:disabled):hover {
      background-color: $light-button-hover;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .header .filter-word {
    color: $dark-font;
  }
  .list,
  .text {
    border-color: $dark-border;
    .parts.highlight::after {
      background-color: $dark-highlight;
    }
    &::-webkit-scrollbar-track {
      border-top-color: $dark-border;
      border-left-color: $dark-border;
      background-color: $dark-scrollbar-track;
    }
    &::-webkit-scrollbar-thumb {
      background-color: $dark-scrollbar;
    }
    &::-webkit-scrollbar-corner {
      border-top-color: $dark-border;
      border-left-color: $dark-border;
      background-color: $dark-scrollbar-track;
    }
  }
  .list {
    background-color: $dark-background-empty;
    .item {
      background-color: $dark-background-main;
      &:not(:last-child) {
        border-bottom-color: $dark-border;
      }
      &.selected {
        background-color: $dark-selected;
      }
    }
  }
  .separator {
    background-color: $dark-background;
  }
  .text {
    background-color: $dark-background-main;
    &:hover .actions svg {
      background-color: $dark-background-main;
    }
  }
  .footer button {
    border-color: $dark-border;
    background-color: $dark-button;
    color: $dark-font;
    &:not(:disabled):hover {
      background-color: $dark-button-hover;
    }
  }
}
</style>
