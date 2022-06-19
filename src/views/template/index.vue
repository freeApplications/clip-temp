<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="templates"
  @paste="paste"
  @edit="selectIndex >= 0 && selectIndex < templates.length ? edit() : undefined"
  @remove="remove"
)
  template(v-slot:footer)
    button(
      @click="add"
    ) Add
    button(
      @click="edit"
      :disabled="selectIndex < 0 || selectIndex >= templates.length"
    ) Edit
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import TextList from '~/components/text-list.vue';
import Template from '~/models/template';

type State = {
  templates: Template[];
  selectIndex: number;
};
export default defineComponent({
  components: {
    TextList,
  },
  setup() {
    const router = useRouter();
    const { api } = window;
    api.orderTemplate();
    api.deliverTemplate((templates) => {
      state.templates = templates.map((item) => new Template(item));
    });

    // data
    const state = reactive<State>({
      templates: [],
      selectIndex: 0,
    });
    const { templates, selectIndex } = toRefs(state);

    // methods
    const add = () => router.push('/template/edit');
    const paste = () => api.pasteTemplate(state.selectIndex);
    const edit = () => router.push(`/template/${state.selectIndex}`);
    const remove = () => {
      api.removeTemplate(state.selectIndex);
      state.templates.splice(state.selectIndex, 1);
    };

    return {
      // data
      templates,
      selectIndex,
      // methods
      add,
      paste,
      edit,
      remove,
    };
  },
});
</script>
