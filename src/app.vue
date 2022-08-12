<template lang="pug">
#nav
  ul.tab-list(ref="tabList")
    li.tab-item
      router-link(to="/") clipboard
    li.tab-item
      router-link(
        :to="isTemplateEdit ? route.path : '/template'"
      ) template
router-view.tab-contents(
  v-if="!isReloading"
)
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';

export default defineComponent({
  setup() {
    const route = useRoute();

    // data
    const state = reactive({
      isReloading: false,
    });
    const { isReloading } = toRefs(state);

    // refs
    const tabList = ref<HTMLUListElement>();

    // computed
    const isTemplateEdit = computed(() => route.name === 'template-edit');

    // watch
    watch(
      () => store.state.windowEvent,
      (windowEvent) => {
        if (!isTemplateEdit.value && windowEvent?.type === 'reload') {
          state.isReloading = true;
          nextTick(() => (state.isReloading = false));
        }
      }
    );

    // methods
    const changeTab = (isNext: boolean) => {
      if (!tabList.value) return;
      const tabLinks: HTMLLinkElement[] = Array.from(
        tabList.value.querySelectorAll('.tab-item > a')
      );
      const lastIndex = tabLinks.length - 1;
      let tabIndex = tabLinks.findIndex((link) =>
        link.className.match(/router-link-active/)
      );
      tabIndex += isNext ? 1 : -1;
      if (tabIndex < 0) tabIndex = lastIndex;
      if (tabIndex > lastIndex) tabIndex = 0;
      tabLinks[tabIndex].click();
    };
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (
        !keyEvent.altKey &&
        keyEvent.ctrlKey &&
        keyEvent.key === HANDLING_KEYS.TAB
      ) {
        changeTab(!keyEvent.shiftKey);
      }
      if (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey) return;
      store.commit('setKeyEvent', keyEvent);
    };

    // lifecycle
    onMounted(() => {
      useRouter().push('/');
      document.addEventListener('keydown', onKeyDown);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onKeyDown);
    });

    return {
      // data
      isReloading,
      route,
      // refs
      tabList,
      // computed
      isTemplateEdit,
    };
  },
});
</script>

<style lang="scss">
@import 'assets/css/colors';
@import 'assets/css/scrollbar';

* {
  box-sizing: border-box;
  outline: none;
}
body {
  height: 100vh;
  margin: 0;
  overflow: hidden;
}
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.5rem;
  margin: 0;
  border-bottom: 1px solid;
  .tab-list {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    margin: 0 0 -2px;
    padding: 0 0.5rem;
    list-style: none;
    .tab-item {
      width: 100%;
      height: 100%;
      padding: 0 0.25rem;
      a {
        display: inline-block;
        width: 100%;
        height: 100%;
        padding: 3px;
        font-weight: bold;
        text-decoration: none;
        &.router-link-active,
        &:hover {
          padding: 2px;
          margin-bottom: 2px;
          border: 1px solid;
          border-radius: 0.5rem 0.5rem 0 0;
        }
      }
    }
  }
}
.tab-contents {
  height: calc(100% - 1.5rem);
  padding: 0.5rem;
}
.footer,
.footer > div {
  display: flex;
  justify-content: center;
  column-gap: 1rem;
  button {
    padding: 0 1rem;
    border: 1px solid;
    border-radius: 4px;
    font-weight: bold;
    font-size: 1rem;
    font-family: 'Lucida Sans Unicode', Verdana, Roboto, sans-serif;
    cursor: pointer;
    &:disabled {
      cursor: default;
    }
  }
}

@media (prefers-color-scheme: light) {
  #app {
    background-color: $light-background;
    color: $light-font;
  }
  #nav {
    border-bottom-color: $light-border;
    background-color: $light-background-main;
    .tab-list .tab-item a {
      color: $light-font-inactive;
      &.router-link-active,
      &:hover {
        border-color: $light-border;
        border-bottom-color: $light-background;
        background-color: $light-background;
      }
      &:hover {
        color: $light-font-hover;
      }
      &.router-link-active {
        color: $light-font;
      }
    }
  }
  .footer,
  .footer > div {
    button {
      border-color: $light-border;
      box-shadow: 3px 3px 6px #10204080, -2px -2px 4px #c0e0ff3f;
      background-color: $light-button;
      color: $light-font-inactive;
      &:disabled {
        opacity: 0.5;
        color: $light-font;
      }
      &:not(:disabled):hover {
        border-color: $light-button-border;
        background-color: $light-button-hover;
        color: $light-font;
        text-shadow: 0 0 0.25rem $light-button-blur;
      }
      &.danger:not(:disabled):hover {
        border-color: $light-danger-button-border;
        background-color: $light-danger-button-hover;
        text-shadow: 0 0 0.25rem $light-danger-button-blur;
      }
    }
  }
}
@media (prefers-color-scheme: dark) {
  #app {
    background-color: $dark-background;
    color: $dark-font;
  }
  #nav {
    border-bottom-color: $dark-border;
    background-color: $dark-background-main;
    .tab-list .tab-item a {
      color: $dark-font-inactive;
      &.router-link-active,
      &:hover {
        border-color: $dark-border;
        border-bottom-color: $dark-background;
        background-color: $dark-background;
      }
      &:hover {
        color: $dark-font-hover;
      }
      &.router-link-active {
        color: $dark-font;
      }
    }
  }
  .footer,
  .footer > div {
    button {
      border-color: $dark-border;
      box-shadow: 3px 3px 6px #08102080, -2px -2px 4px #20283040;
      background-color: $dark-button;
      color: $dark-font-inactive;
      &:disabled {
        opacity: 0.3;
        color: $dark-font;
      }
      &:not(:disabled):hover {
        border-color: $dark-button-border;
        background-color: $dark-button-hover;
        color: $dark-font;
        text-shadow: 0 0 0.75rem $dark-button-blur;
      }
      &.danger:not(:disabled):hover {
        border-color: $dark-danger-button-border;
        background-color: $dark-danger-button-hover;
        text-shadow: 0 0 0.75rem $dark-danger-button-blur;
      }
    }
  }
}
</style>
