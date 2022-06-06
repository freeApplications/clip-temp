<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="templates"
  @paste="() => {}"
  @remove="() => {}"
)
  template(v-slot:footer)
    button(
      @click="add"
    ) Add
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
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
    const router = useRouter();

    // data
    const state = reactive<State>({
      templates: [],
      selectIndex: 0,
    });
    const { templates, selectIndex } = toRefs(state);

    // methods
    const add = () => router.push('/template/edit');

    return {
      // data
      templates,
      selectIndex,
      // methods
      add,
    };
  },
});
</script>

<style scoped lang="scss"></style>
