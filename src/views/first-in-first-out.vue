<template lang="pug">
#contents(
  @click.right="showCloseMenu"
)
  .list
    template(
      v-for="(text, index) in firstInFirstOut"
    )
      .text(v-if="index < MAX_COUNT")
        span.new-line(
          v-for='textPerLine in text.split(/\\r?\\n/)'
        ) {{ textPerLine }}
  .text(v-if="count === 0")
    | no items...
  .text(v-if="moreCount > 0")
    | ... {{ moreCount }} more item{{ moreCount > 1 ? 's' : '' }} (total {{ count }} items)
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  reactive,
  toRefs,
  computed,
  onMounted,
} from 'vue';

type State = {
  firstInFirstOut: string[];
};
export default defineComponent({
  setup() {
    const { deliverFirstInFirstOut, resizeSubWindow } = window.api;
    deliverFirstInFirstOut((firstInFirstOUt: string[]) => {
      state.firstInFirstOut = firstInFirstOUt;
      nextTick(() => resizeSubWindow(document.body.scrollHeight));
    });

    // data
    const MAX_COUNT = 5;
    const state = reactive<State>({
      firstInFirstOut: [],
    });
    const { firstInFirstOut } = toRefs(state);

    // computed
    const count = computed(() => state.firstInFirstOut.length);
    const moreCount = computed(() => count.value - MAX_COUNT);

    // methods
    const { showCloseMenu } = window.api;

    // lifecycle
    const { toggleFirstInFirstOutRepeat, closeSubWindow } = window.api;
    onMounted(() => {
      const repeat = document.body.querySelector('#title-bar .repeat');
      repeat?.addEventListener('click', () => {
        repeat.classList.toggle('on');
        toggleFirstInFirstOutRepeat();
      });
      const close = document.body.querySelector('#close');
      close?.addEventListener('click', closeSubWindow);
      resizeSubWindow(document.body.scrollHeight);
    });

    return {
      // date
      MAX_COUNT,
      firstInFirstOut,
      // computed
      count,
      moreCount,
      // methods
      showCloseMenu,
    };
  },
});
</script>

<style lang="scss">
@import '../assets/css/colors';

body {
  margin: 0;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#contents {
  padding: 0.25rem;
  font-size: 0.75rem;
  .list {
    .text {
      min-height: 1rem;
      overflow: hidden;
      border: 1px solid;
      font-family: Consolas, 'Courier New', Courier, Monaco, monospace;
      white-space: pre;
      &:not(:last-child) {
        border-bottom: none;
      }
      .new-line:not(:first-child) {
        position: relative;
        padding-left: 1.25rem;
        &::before {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          font-size: 1.25rem;
          content: '⮠';
        }
      }
    }
  }
  .text {
    padding: 0.25rem;
  }
}

@media (prefers-color-scheme: light) {
  #contents {
    background-color: $light-background;
    .list {
      .text {
        border-color: $light-border;
        background-color: $light-background-main;
        &:first-child {
          background-color: $light-selected;
        }
      }
    }
    .text {
      color: $light-font;
    }
  }
}
@media (prefers-color-scheme: dark) {
  #contents {
    background-color: $dark-background;
    .list {
      .text {
        border-color: $dark-border;
        background-color: $dark-background-main;
        &:first-child {
          background-color: $dark-selected;
        }
      }
    }
    .text {
      color: $dark-font;
    }
  }
}
</style>
