<template lang="pug">
#range-slider
  .value {{ value }}
  input(
    ref="refs.input"
    type="range"
    v-model="value"
    :min="min"
    :max="max"
    :step="step"
  )
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  setup(props, context) {
    // data
    const value = ref(props.modelValue);

    // refs
    const input = ref<HTMLInputElement>();

    // methods
    const setInputBackgroundStyle = () => {
      const refsInput = input.value;
      if (!refsInput) return;
      refsInput.style.background = '';
      const background = String(
        window
          .getComputedStyle(refsInput)
          .getPropertyValue('background')
          .match(/linear-gradient\(90deg,.+%,.+0px\)/)
      );
      const current = value.value - props.min;
      const max = current / (props.max - props.min);
      const rate = `${Math.round(max * 900) / 10 + 5}%`;
      refsInput.style.background = background.replace(/\d+\.?\d*%/, rate);
    };
    const windowTheme = window.matchMedia('(prefers-color-scheme: dark)');
    windowTheme.addEventListener('change', setInputBackgroundStyle);

    // watch
    watch(value, (value) => {
      context.emit('update:modelValue', Number(value));
      setInputBackgroundStyle();
    });

    // lifecycle
    onMounted(setInputBackgroundStyle);
    onBeforeUnmount(() => {
      windowTheme.removeEventListener('change', setInputBackgroundStyle);
    });

    return {
      // data
      value,
      // refs
      'refs.input': input,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../../assets/css/colors';

#range-slider {
  display: flex;
  align-items: center;
  height: 2.25rem;
  .value {
    margin-right: 1rem;
  }
  input {
    width: 15rem;
    height: 1.5rem;
    margin: 0;
    border-radius: 0.75rem;
    appearance: none;
    cursor: pointer;
    &::-webkit-slider-thumb {
      width: 1.5rem;
      height: 1.5rem;
      border: 0.125rem solid;
      border-radius: 0.75rem;
      appearance: none;
    }
  }
}

@media (prefers-color-scheme: light) {
  #range-slider {
    input {
      background: linear-gradient(
        90deg,
        $light-settings-checked 100%,
        $light-settings-hover 0px
      );
      &::-webkit-slider-thumb {
        border-color: $light-settings-checked;
        background: white;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  #range-slider {
    input {
      background: linear-gradient(
        90deg,
        $dark-settings-checked 100%,
        $dark-settings-hover 0px
      );
      &::-webkit-slider-thumb {
        border-color: $dark-settings-checked;
        background: white;
      }
    }
  }
}
</style>
