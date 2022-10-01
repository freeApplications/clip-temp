<template lang="pug">
#settings
  header
    arrow-back(
      @click="close"
    )
  main
    h1 {{ get('header') }}
    .list(v-if="Object.keys(settings).length")
      .item
        | {{ get('theme.description') }}
        radio-button(
          v-model="settings.theme"
          name="theme"
          :options="themeOptions"
          @update:modelValue="changeTheme"
        )
      .item
        | {{ get('startup') }}
        checkbox(
          v-model="settings.startup"
          @update:modelValue="changeStartup"
        )
      section
        h2 {{ get('clipboard.header') }}
        .item
          | {{ get('clipboard.maxsize') }}
          range-slider(
            v-model="settings.clipboard.maxsize"
            @update:modelValue="changeClipboardMaxsize"
            :min="100"
            :max="1000"
            :step="100"
          )
        .item
          | {{ get('clipboard.backup') }}
          checkbox(
            v-model="settings.clipboard.backup"
            @update:modelValue="changeClipboardBackup"
          )
      section.first-in-first-out
        h2 {{ get('firstInFirstOut.header') }}
        .item
          | {{ get('firstInFirstOut.keepItems') }}
          checkbox(
            v-model="settings.firstInFirstOut.keepItems"
            @update:modelValue="changeFirstInFirstOutKeepItems"
          )
        .item.position
          | {{ get('firstInFirstOut.position.description') }}
          .direction {{ get('firstInFirstOut.position.vertical') }}
          radio-button(
            v-model="firstInFirstOutPosition.vertical"
            name="position-vertical"
            :options="positionVerticalOptions"
            @update:modelValue="changeFirstInFirstOutPosition"
          )
          .empty
          .direction {{ get('firstInFirstOut.position.horizontal') }}
          radio-button(
            v-model="firstInFirstOutPosition.horizontal"
            name="position-horizontal"
            :options="positionHorizontalOptions"
            @update:modelValue="changeFirstInFirstOutPosition"
          )
</template>

<script lang="ts">
import { defineComponent, Ref, ref, inject } from 'vue';
import ArrowBack from '~/components/icons/arrow-back.vue';
import RadioButton from '~/components/forms/radio-button.vue';
import Checkbox from '~/components/forms/checkbox.vue';
import RangeSlider from '~/components/forms/range-slider.vue';
import { Settings } from '~/@types';
import Internationalization from '~/internationalization';

export default defineComponent({
  components: {
    ArrowBack,
    RadioButton,
    Checkbox,
    RangeSlider,
  },
  setup(_, context) {
    const i18n = inject('i18n') as Ref<Internationalization | undefined>;
    const get = (key: string): string => {
      if (i18n.value) return i18n.value.get(`settings.${key}`) as string;
      return '';
    };

    // data
    const settings = ref({} as Settings.items);
    const firstInFirstOutPosition = ref({});
    const loadSettings = async () => {
      const { getSettings } = window.api;
      settings.value = await getSettings();
      const [vertical, horizontal] =
        settings.value.firstInFirstOut.position.split('-');
      firstInFirstOutPosition.value = { vertical, horizontal };
    };
    loadSettings();
    const themeOptions: Settings.option[] = [
      { text: get('theme.options.system'), value: 'system' },
      { text: get('theme.options.light'), value: 'light' },
      { text: get('theme.options.dark'), value: 'dark' },
    ];
    const positionVerticalOptions: Settings.option[] = [
      { text: get('firstInFirstOut.position.options.top'), value: 'top' },
      { text: get('firstInFirstOut.position.options.bottom'), value: 'bottom' },
    ];
    const positionHorizontalOptions: Settings.option[] = [
      { text: get('firstInFirstOut.position.options.left'), value: 'left' },
      { text: get('firstInFirstOut.position.options.center'), value: 'center' },
      { text: get('firstInFirstOut.position.options.right'), value: 'right' },
    ];

    // methods
    const {
      changeTheme,
      changeStartup,
      changeClipboardMaxsize,
      changeClipboardBackup,
      changeFirstInFirstOutKeepItems,
      resizeAndRepositionSubWindow,
    } = window.api;
    const close = () => context.emit('close');
    const changeFirstInFirstOutPosition = () => {
      const position = Object.values(firstInFirstOutPosition.value).join('-');
      window.api.changeFirstInFirstOutPosition(position as Settings.position);
      resizeAndRepositionSubWindow();
    };

    return {
      // data
      settings,
      firstInFirstOutPosition,
      themeOptions,
      positionVerticalOptions,
      positionHorizontalOptions,
      // methods
      close,
      changeTheme,
      changeStartup,
      changeClipboardMaxsize,
      changeClipboardBackup,
      changeFirstInFirstOutKeepItems,
      changeFirstInFirstOutPosition,
      get,
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
  main {
    min-width: fit-content;
    padding: 0.5rem 1rem;
    h1 {
      margin: 0;
      padding: 0.25rem 0;
      border-bottom: 2.5px solid;
      font-size: 1.25rem;
      text-align: center;
    }
    h2 {
      margin: 0 0 1rem 0;
      padding: 0 0 0.25rem 0.25rem;
      border-bottom: 2px solid;
      font-size: 1.125rem;
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
      section {
        .item {
          margin-left: 1rem;
        }
        &:not(:last-child) {
          margin-bottom: 1rem;
        }
        &.first-in-first-out {
          .position {
            display: grid;
            grid-template-columns: auto 1fr auto;
            grid-gap: 0.25rem 1rem;
            .direction {
              position: relative;
              &::before {
                position: absolute;
                top: 0;
                left: -0.75rem;
                content: '･';
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 500px) {
  #settings {
    main .list {
      .item {
        padding-top: 0.125rem;
        padding-left: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      section.first-in-first-out {
        .position {
          text-align: center;
          justify-content: center;
          grid-template-columns: auto;
          grid-gap: 0;
          .direction {
            text-align: left;
          }
        }
      }
    }
  }
}
@media (prefers-color-scheme: light) {
  #settings {
    background-color: $light-background-main;
    color: $light-font;
    main {
      h1,
      h2 {
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
    main {
      h1,
      h2 {
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
