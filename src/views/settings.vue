<template lang="pug">
#settings
  header
    arrow-back(
      @click="close"
    )
  section
    h1 Settings
    .list(v-if="Object.keys(settings).length")
      .item
        | Window theme
        radio-button(
          v-model="settings.theme"
          name="theme"
          :options="themeOptions"
          @update:modelValue="changeTheme"
        )
      .item
        | Run application on system startup
        checkbox(
          v-model="settings.startup"
          @update:modelValue="changeStartup"
        )
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ArrowBack from '~/components/icons/arrow-back.vue';
import RadioButton from '~/components/forms/radio-button.vue';
import Checkbox from '~/components/forms/checkbox.vue';
import { Settings } from '~/@types';

export default defineComponent({
  components: {
    ArrowBack,
    RadioButton,
    Checkbox,
  },
  setup(_, context) {
    // data
    const settings = ref({});
    const loadSettings = async () => {
      const { getSettings } = window.api;
      settings.value = await getSettings();
    };
    loadSettings();
    const themeOptions: Settings.option[] = [
      { text: 'System', value: 'system' },
      { text: 'Light', value: 'light' },
      { text: 'Dark', value: 'dark' },
    ];

    // methods
    const { changeTheme, changeStartup } = window.api;
    const close = () => context.emit('close');

    return {
      // data
      settings,
      themeOptions,
      // methods
      close,
      changeTheme,
      changeStartup,
    };
  },
});
</script>

<style scoped lang="scss">
@import '../assets/css/colors';

#settings {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  header {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
  section {
    min-width: fit-content;
    padding: 0.5rem 1rem;
    h1 {
      margin: 0;
      padding: 0.25rem 0;
      border-bottom: 2.5px solid;
      font-size: 1.25rem;
      text-align: center;
    }
    .list {
      padding: 1rem 0.5rem;
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        column-gap: 1rem;
        position: relative;
        padding: 0.5rem 0.5rem 0.5rem 1.5rem;
        border: 1px solid;
        font-family: 'Lucida Sans Unicode', Verdana, Roboto, sans-serif;
        white-space: nowrap;
        &:not(:last-child) {
          margin-bottom: 1rem;
        }
        &::before {
          position: absolute;
          top: 0;
          left: 0;
          width: 8px;
          height: 100%;
          border-right: 1px solid;
          content: '';
        }
      }
    }
  }
}

@media (prefers-color-scheme: light) {
  #settings {
    background-color: $light-background-main;
    color: $light-font;
    section {
      h1 {
        border-bottom-color: $light-border;
      }
      .list {
        .item {
          border-color: $light-border;
          background-color: $light-background;
          &::before {
            border-right-color: $light-border;
            background-color: $light-settings-item;
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  #settings {
    background-color: $dark-background-main;
    color: $dark-font;
    section {
      h1 {
        border-bottom-color: $dark-border;
      }
      .list {
        .item {
          border-color: $dark-border;
          background-color: $dark-background;
          &::before {
            border-right-color: $dark-border;
            background-color: $dark-settings-item;
          }
        }
      }
    }
  }
}
</style>
