<template lang="pug">
#template-edit
  .form
    .text-wide {{ i18n.get('template.title') }}:
    input(
      type="text"
      v-model="title"
    )
    .text-wide {{ i18n.get('template.contents') }}:
    .text-padding
      | {{ text }}
      textarea(
        ref="textarea"
        v-model="text"
        @input="fitContent"
      )
  .footer
    button.danger(
      v-if="isEdit"
      @click="remove"
    ) {{ i18n.get('edit.remove') }}
    button.danger(
      @click="goIndex"
    ) {{ i18n.get('edit.cancel') }}
    button(
      @click="save"
    ) {{ i18n.get('edit.save') }}
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  inject,
  ref,
  computed,
  nextTick,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { Template } from '~/@types';
import store from '~/store';
import { HANDLING_KEYS } from '~/renderer-constants';
import Internationalization from '~/internationalization';

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
    const i18n = inject('i18n') as Internationalization;

    // refs
    const textarea = ref<HTMLTextAreaElement>();

    // computed
    const isEdit = computed(() => typeof state.index === 'number');

    // change editable
    api.changeEditable(isEdit.value ? ['remove'] : []);

    // load template
    if (isEdit.value) {
      api.getTemplate(Number(state.index)).then((template: Template) => {
        state.title = template.title;
        state.text = template.text;
        nextTick(fitContent);
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
    const fitContent = () => {
      const refsTextarea = textarea.value;
      const wrapper = refsTextarea?.parentElement;
      if (!refsTextarea || !wrapper) return;
      refsTextarea.style.width = 'auto';
      const width =
        refsTextarea.scrollWidth > wrapper.clientWidth
          ? refsTextarea.scrollWidth
          : wrapper.clientWidth;
      refsTextarea.style.width = `${width}px`;
      refsTextarea.style.height = 'auto';
      const height =
        refsTextarea.scrollHeight > wrapper.clientHeight
          ? refsTextarea.scrollHeight
          : wrapper.clientHeight;
      refsTextarea.style.height = `${height}px`;
    };

    return {
      // data
      title,
      text,
      i18n,
      // refs
      textarea,
      // computed
      isEdit,
      // methods
      goIndex,
      save,
      remove,
      fitContent,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../../assets/css/colors';

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
  height: calc(100% - 3rem);
  margin-bottom: 0.5rem;
  text-align: left;
  .text-wide {
    transform: scale(1.25, 1);
    transform-origin: top left;
    margin-right: 0.375rem;
    font-weight: bold;
    font-size: 0.75rem;
    line-height: 1.375rem;
    letter-spacing: 0.5px;
  }
  input[type='text'],
  .text-padding,
  textarea {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
  }
  input[type='text'],
  .text-padding {
    border: 1px solid;
  }
  .text-padding {
    position: relative;
    overflow: auto;
    line-height: 1.5;
    white-space: pre;
    textarea {
      position: absolute;
      top: 0;
      left: 0;
      overflow: hidden;
      border: none;
      line-height: 1.5;
      white-space: nowrap;
      resize: none;
    }
  }
}

@media (prefers-color-scheme: light) {
  .form {
    input[type='text'],
    .text-padding,
    textarea {
      border-color: $light-border;
      background-color: $light-background-main;
      color: $light-font;
    }
  }
}
@media (prefers-color-scheme: dark) {
  .form {
    input[type='text'],
    .text-padding,
    textarea {
      border-color: $dark-border;
      background-color: $dark-background-main;
      color: $dark-font;
    }
  }
}
</style>
