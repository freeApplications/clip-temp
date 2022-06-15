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
    button(@click="save") Save
    button(@click="goIndex") Cancel
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';

type State = {
  title: string;
  text: string;
};
export default defineComponent({
  setup() {
    const { api } = window;
    const router = useRouter();

    // data
    const state = reactive<State>({
      title: '',
      text: '',
    });
    const { title, text } = toRefs(state);

    // methods
    const goIndex = () => router.push('/template');
    const save = () => {
      api.saveTemplate(index, state.title, state.text);
      goIndex();
    };

    return {
      // data
      title,
      text,
      // methods
      goIndex,
      save,
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
.footer {
  display: flex;
  justify-content: space-between;
  button {
    &:first-child {
      transform: scale(1.5, 1);
      transform-origin: top left;
    }
    &:last-child {
      transform: scale(1.5, 1);
      transform-origin: top right;
    }
  }
}
</style>
