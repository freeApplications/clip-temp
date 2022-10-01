<template lang="pug">
text-list(
  v-model="selectIndex"
  :list="templates"
  @paste="paste"
  @add="isEditable ? add() : undefined"
  @edit="isEditable ? edit() : undefined"
  @remove="remove"
)
  template(v-slot:footer)
    button.danger(
      @click="remove"
      :disabled="!isEditable"
    ) {{ i18n.get('edit.remove') }}
    button(
      @click="add"
    ) {{ i18n.get('edit.add') }}
    button(
      @click="edit"
      :disabled="!isEditable"
    ) {{ i18n.get('edit.edit') }}
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import TextList from '~/components/text-list.vue';
import Template from '~/models/template';
import Internationalization from '~/internationalization';

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
    const i18n = inject('i18n') as Internationalization;

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
      i18n,
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
