<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="templates"
  @paste="paste"
  @edit="isEditable ? edit() : undefined"
  @remove="remove"
)
  template(v-slot:footer)
    button(
      @click="add"
    ) Add
    button(
      @click="edit"
      :disabled="!isEditable"
    ) Edit
    button(
      @click="remove"
      :disabled="!isEditable"
    ) Delete
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue';
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

    // computed
    const isEditable = computed(
      () => state.selectIndex >= 0 && state.selectIndex < state.templates.length
    );

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
      // computed
      isEditable,
      // methods
      add,
      paste,
      edit,
      remove,
    };
  },
});
</script>
