<template lang="pug">
#settings
  header
    arrow-back(
      @click="close"
    )
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ArrowBack from '~/components/icons/arrow-back.vue';

export default defineComponent({
  components: {
    ArrowBack,
  },
  setup(_, context) {
    // methods
    const close = () => context.emit('close');

    return {
      // methods
      close,
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
  header {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
  }
}

@media (prefers-color-scheme: light) {
  #settings {
    background-color: $light-background-main;
    color: $light-font;
  }
}
@media (prefers-color-scheme: dark) {
  #settings {
    background-color: $dark-background-main;
    color: $dark-font;
  }
}
</style>
