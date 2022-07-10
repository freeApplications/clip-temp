<template lang="pug">
#template-edit
  .form
    .text-wide title:
    input(
      type="text"
      v-model="title"
    )
    .text-wide template:
    textarea(
      v-model="text"
    )
  .footer
    .left
      button(@click="save") Save
      button.danger(
        v-if="isEdit"
        @click="remove"
      ) Delete
    .right
      button.danger(@click="goIndex") Cancel
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Template } from '~/@types';
import store from '~/store';
import { HANDLING_KEYS } from '~/renderer-constants';

type State = {
  index: number | string;
  title: string;
  text: string;
};
export default defineComponent({
  props: {
    index: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { api } = window;
    const router = useRouter();

    // data
    const state = reactive<State>({
      index: props.index.match(/\d+/) ? Number(props.index) : props.index,
      title: '',
      text: '',
    });
    const { title, text } = toRefs(state);

    // computed
    const isEdit = computed(() => typeof state.index === 'number');

    // change editable
    api.changeEditable(isEdit.value ? ['remove'] : []);

    // load template
    if (isEdit.value) {
      api.getTemplate(Number(state.index)).then((template: Template) => {
        state.title = template.title;
        state.text = template.text;
      });
    }

    // watch
    const { closeMainWindow } = window.api;
    watch(
      () => store.state.keyEvent,
      (keyEvent) => {
        if (keyEvent.key === HANDLING_KEYS.ESCAPE) closeMainWindow();
      }
    );

    // methods
    const goIndex = () => router.push('/template');
    const save = () => {
      api.saveTemplate(state.index, state.title, state.text);
      goIndex();
    };
    const remove = () => {
      api.removeTemplate(state.index as number);
      goIndex();
    };

    return {
      // data
      title,
      text,
      // computed
      isEdit,
      // methods
      goIndex,
      save,
      remove,
    };
  },
});
</script>

<style scoped lang="scss">
#template-edit {
  display: flex;
  flex-flow: column;
}
.form {
  display: grid;
  flex-grow: 1;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  text-align: left;
  .text-wide {
    transform: scale(1.25, 1);
    transform-origin: top left;
    margin-top: 0.375rem;
    margin-right: 0.375rem;
    font-weight: bold;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }
  textarea {
    height: 100%;
    overflow: auto;
    line-height: 1.5;
    white-space: nowrap;
    resize: none;
  }
}
</style>
