<template lang="pug">
#radio-button
  .option(
    v-for="option in options"
    id="option.value"
    :class="{ checked: option.value === checked }"
  )
    label
      input(
        type="radio"
        :name="name"
        :value="option.value"
        v-model="checked"
      )
      | {{ option.text }}
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { Settings } from '~/@types';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    options: {
      type: Array as PropType<Settings.option[]>,
      required: true,
    },
  },
  setup(props, context) {
    // data
    const checked = ref(props.modelValue);

    // watch
    watch(checked, (value) => {
      context.emit('update:modelValue', value);
    });

    return {
      // data
      checked,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../../assets/css/colors';

#radio-button {
  display: flex;
  .option {
    border-top: 1px solid;
    border-right: 1px solid;
    border-bottom: 1px solid;
    font-weight: bold;
    &:first-child {
      border-left: 1px solid;
      border-radius: 4px 0 0 4px;
    }
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
    label {
      display: inline-block;
      padding: 0.25rem 1.5rem;
      cursor: pointer;
    }
    input {
      margin: 0;
      width: 0;
      visibility: hidden;
    }
  }
}

@media (prefers-color-scheme: light) {
  #radio-button {
    .option {
      border-color: $light-settings-border;
      color: $light-font-inactive;
      &:first-child {
        border-left-color: $light-settings-border;
      }
      &:hover {
        background-color: $light-settings-hover;
        color: $light-font-hover;
      }
      &.checked {
        background-color: $light-settings-checked;
        color: $light-font;
        text-shadow: 0 0 0.25rem $light-settings-blur;
      }
      &:not(:last-child) {
        border-right-color: $light-settings-border;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  #radio-button {
    .option {
      border-color: $dark-settings-border;
      color: $dark-font-inactive;
      &:first-child {
        border-left-color: $dark-settings-border;
      }
      &:hover {
        background-color: $dark-settings-hover;
        color: $dark-font-hover;
      }
      &.checked {
        background-color: $dark-settings-checked;
        color: $dark-font;
        text-shadow: 0 0 0.25rem $dark-settings-blur;
      }
      &:not(:last-child) {
        border-right-color: $dark-settings-border;
      }
    }
  }
}
</style>
