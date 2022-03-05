<template lang="pug">
#clipboard
  .list
    .item(v-for="item in histories" :key="item.time")
      | {{ item.text }}
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue';
import { Clipboard } from '~/@types';

type State = {
  histories: Clipboard[];
};
export default defineComponent({
  setup() {
    const { api } = window;
    api.orderClipboard();
    api.deliverClipboard((histories) => (state.histories = histories));
    const state = reactive<State>({
      histories: [],
    });
    const histories = computed(() => {
      return state.histories.slice().sort((a, b) => {
        return b.time - a.time;
      });
    });
    return {
      histories,
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
