<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="templates"
  @paste="() => {}"
  @remove="() => {}"
)
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import TextList from '~/components/text-list.vue';
import Clipboard from '~/models/clipboard';

type State = {
  templates: Clipboard[];
  selectIndex: number;
};
export default defineComponent({
  components: {
    TextList,
  },
  setup() {
    // data
    const state = reactive<State>({
      templates: [],
      selectIndex: 0,
    });
    const { templates, selectIndex } = toRefs(state);
    return {
      // data
      templates,
      selectIndex,
    };
  },
});
</script>
