<template lang="pug">
#checkbox
  label(:class="{ checked: modelValue }")
    | {{ checked ? 'On' : 'Off' }}
    input(
      type="checkbox"
      v-model="checked"
    )
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
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

#checkbox {
  position: relative;
  width: 6rem;
  height: 2.25rem;
  input {
    opacity: 0;
    cursor: pointer;
  }
  label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-top: 0.375rem;
    padding-left: 3rem;
    border-radius: 1.125rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color, padding-left 0.25s ease-in-out;
    &::after {
      display: block;
      position: absolute;
      top: 0.25rem;
      left: 0.25rem;
      z-index: 1;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 1rem;
      background-color: white;
      content: '';
      cursor: pointer;
      transition: left 0.25s ease-in-out;
    }
    &.checked {
      padding-left: 1.5rem;
      &::after {
        left: 4rem;
      }
    }
  }
}

@media (prefers-color-scheme: light) {
  #checkbox {
    label {
      background-color: $light-settings-danger-checked;
      color: $light-font;
      text-shadow: 0 0 0.25rem $light-settings-danger-blur;
      &.checked {
        background-color: $light-settings-checked;
        text-shadow: 0 0 0.25rem $light-settings-blur;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  #checkbox {
    label {
      background-color: $dark-settings-danger-checked;
      color: $dark-font;
      text-shadow: 0 0 0.25rem $dark-settings-danger-blur;
      &.checked {
        background-color: $dark-settings-checked;
        text-shadow: 0 0 0.25rem $dark-settings-blur;
      }
    }
  }
}
</style>
