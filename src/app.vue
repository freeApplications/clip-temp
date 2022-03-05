<template lang="pug">
#nav
  ul.tab-list
    li.tab-item
      router-link(to="/") clipboard
    li.tab-item
      router-link(to="/template") template
router-view.tab-contents
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { HANDLING_KEYS } from '~/renderer-constants';
import store from '~/store';

export default defineComponent({
  setup() {
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      const handlingKeys = Object.values(HANDLING_KEYS);
      if (handlingKeys.includes(keyEvent.key)) {
        keyEvent.preventDefault();
        store.commit('setKeyEvent', keyEvent);
      }
    };
    onMounted(() => {
      useRouter().push('/');
      document.addEventListener('keydown', onKeyDown);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onKeyDown);
    });
  },
});
</script>

<style lang="scss">
$font-color: #2c3e50;

* {
  box-sizing: border-box;
  outline: none;
}
body {
  height: 100vh;
  margin: 0;
  overflow-y: hidden;
}
#app {
  height: 100%;
  background-color: whitesmoke;
  color: $font-color;
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
  border-bottom: 1px solid lightgray;
  background-color: white;
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
        color: dimgray;
        font-weight: bold;
        text-decoration: none;
        &.router-link-exact-active,
        &:hover {
          padding: 2px;
          margin-bottom: 2px;
          border: 1px solid lightgray;
          border-bottom-color: whitesmoke;
          border-radius: 0.5rem 0.5rem 0 0;
          background-color: whitesmoke;
          color: $font-color;
        }
      }
    }
  }
}
.tab-contents {
  height: 100%;
  padding: 0.5rem;
}
</style>
