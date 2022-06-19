<template lang="pug">
#text-list(
  :class="{ 'cursor-resize': isResizing }"
  @mousemove="resize"
  @mouseup="isResizing = false"
)
  .header
    icon-filter
    input.filter-word(
      ref="refs.input"
      type="text"
      spellcheck="false"
      v-model="filterWord"
    )
    icon-clear(
      :class="{ invisible: !filterWord.length }"
      @click="filterWord = ''"
    )
  .list(
    ref="refs.list"
    :style="{ height: `calc(50% + ${adjustHeight}px)` }"
  )
    .item(
      v-for="(item, index) in listOfText"
      :key="item.time"
      :class="{ selected: selectIndex === index }"
      @click="selectIndex = index"
      @dblclick="paste"
      @click.right="showEditMenu"
    )
      template(
        v-for="partOfText in isClipboard ? item.text.parts : item.title.parts"
      )
        span.parts(
          v-for='(textPerLine, index) in partOfText.split(/\\r?\\n/)'
          :class="{ highlight: partOfText.isMatched, 'new-line': index > 0 }"
        ) {{ textPerLine }}
    .empty(v-if="isEmpty")
      template(v-if="filterWord.length") No matches found
      template(v-else) {{ isClipboard ? 'Clipboard history' : 'Template' }} is empty
  .separator.cursor-resize(
    @mousedown="isResizing = true"
  )
  .text(
    :style="{ height: `calc(50% - ${adjustHeight}px)` }"
  )
    template(v-if="isSelected")
      .actions
        icon-edit(
          v-if="!isClipboard"
          @click="edit"
        )
        icon-remove(
          @click="remove"
        )
      span.parts(
        v-for="partOfText in listOfText[selectIndex].text.parts"
        :class="{ highlight: partOfText.isMatched }"
      ) {{ partOfText }}
  .footer
    .left
      slot(name="footer")
    .right
      button(
        :disabled="!isSelected"
        @click="paste"
      ) Paste
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  ref,
  toRefs,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';
import IconFilter from '~/components/icons/filter.vue';
import IconClear from '~/components/icons/clear.vue';
import IconEdit from '~/components/icons/edit.vue';
import IconRemove from '~/components/icons/remove.vue';
import ClipTemp from '~/models/clip-temp';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';
import { useRoute } from 'vue-router';

type State = {
  filterWord: string;
  selectIndex: number;
  adjustHeight: number;
  isResizing: boolean;
};
export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    list: {
      type: Array as PropType<ClipTemp[]>,
      required: true,
    },
  },
  components: {
    IconFilter,
    IconClear,
    IconEdit,
    IconRemove,
  },
  setup(props, context) {
    // data
    const state = reactive<State>({
      filterWord: '',
      selectIndex: props.modelValue,
      adjustHeight: 0,
      isResizing: false,
    });
    const { filterWord, selectIndex, adjustHeight, isResizing } = toRefs(state);

    // refs
    const input = ref<HTMLDivElement>();
    const list = ref<HTMLDivElement>();

    // computed
    const isClipboard = computed(() => {
      return useRoute().name === 'clipboard';
    });
    const listOfText = computed<ClipTemp[]>(() => {
      return props.list
        .filter((item) => item.match(state.filterWord))
        .sort((a, b) => a.compareTo(b));
    });
    const isEmpty = computed(() => !listOfText.value.length);
    const isSelected = computed(
      () => !isEmpty.value && listOfText.value.length > state.selectIndex
    );
    const originIndex = computed(() => {
      if (!isSelected.value) return -1;
      return props.list.findIndex((item) =>
        item.equals(listOfText.value[state.selectIndex])
      );
    });

    // methods
    const { pressKey, showEditMenu } = window.api;
    const fixingFocus = (doPressKey = true) => {
      const refsInput = input.value;
      if (!refsInput || refsInput === document.activeElement) return;
      if (doPressKey) {
        const keyEvent = store.state.keyEvent;
        if (keyEvent.key.length > 1) return;
        keyEvent.preventDefault();
        const listener = () => pressKey(keyEvent.key, keyEvent.shiftKey);
        refsInput.addEventListener('focus', listener, { once: true });
      }
      refsInput.focus();
    };
    const paste = () => context.emit('paste');
    const edit = () => context.emit('edit');
    const remove = () => context.emit('remove');
    const resize = (event: MouseEvent) => {
      if (event.buttons === 0 || !state.isResizing) {
        state.isResizing = false;
        return;
      }
      event.preventDefault();
      state.adjustHeight += event.movementY;
    };

    // watch
    const { closeWindow } = window.api;
    watch(listOfText, (newValue) => {
      if (newValue.length > state.selectIndex) return;
      const adjust = newValue.length ? 1 : 0;
      state.selectIndex = newValue.length - adjust;
    });
    watch(originIndex, (newValue) => {
      context.emit('update:modelValue', newValue);
    });
    watch(
      () => store.state.keyEvent,
      (keyEvent) => {
        if (keyEvent.key === HANDLING_KEYS.ESCAPE) {
          if (state.filterWord.length) {
            state.filterWord = '';
          } else {
            closeWindow();
          }
          return;
        }
        const maxIndex = listOfText.value.length - 1;
        if (maxIndex < state.selectIndex) return;
        switch (keyEvent.key) {
          case HANDLING_KEYS.ENTER:
            return paste();
          case HANDLING_KEYS.DELETE:
            return remove();
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
            return fixingFocus();
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
    watch(
      () => store.state.windowEvent,
      (windowEvent) => {
        if (!windowEvent || !isSelected.value) return;
        switch (windowEvent.type) {
          case 'paste':
          case 'edit':
          case 'remove':
            context.emit(windowEvent.type);
            break;
          case 'reload':
            fixingFocus(false);
        }
      }
    );
    watch(filterWord, () => (state.selectIndex = 0));

    // lifecycle
    onMounted(() => {
      store.commit('setWindowEvent', null);
      nextTick(() => fixingFocus(false));
    });

    return {
      // data
      filterWord,
      selectIndex,
      adjustHeight,
      isResizing,
      // refs
      'refs.input': input,
      'refs.list': list,
      // computed
      isClipboard,
      listOfText,
      isEmpty,
      isSelected,
      // methods
      paste,
      edit,
      remove,
      resize,
      showEditMenu,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/css/colors';

#text-list {
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
}
.list {
  min-height: 1.5rem;
  overflow-y: auto;
  .item {
    height: 1.45rem;
    padding: 0.25rem 0.5rem;
    overflow: hidden;
    font-size: 0.75rem;
    white-space: pre;
    text-align: left;
    &:not(:last-child) {
      border-bottom: 1px solid;
    }
    .parts {
      &.new-line {
        position: relative;
        padding-left: 1.25rem;
        &::before {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 1.25rem;
          content: '⮠';
        }
      }
    }
  }
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-family: initial;
  }
}
.separator {
  height: 0.5rem;
  min-height: 0.5rem;
}
.text {
  min-height: 1.75rem;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.5rem;
  overflow: auto;
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: left;
  white-space: pre;
  .actions {
    opacity: 0;
    position: sticky;
    top: 0.125rem;
    right: 0;
    left: 0;
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
}
</style>
