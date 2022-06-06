<template lang="pug">
#template-edit
  .form
    .text-wide title:
    input(
      type="text"
    )
    .text-wide template:
    textarea
  .footer
    button(@click="goIndex") Save
    button(@click="goIndex") Cancel
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();

    // methods
    const goIndex = () => router.push('/template');

    return {
      // methods
      goIndex,
    };
  },
});
</script>

<style scoped lang="scss">
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
  margin-bottom: 0.5rem;
  text-align: left;
  .text-wide {
    transform: scale(1.25, 1);
    transform-origin: top left;
    margin-top: 0.375rem;
    margin-right: 0.375rem;
    font-weight: bold;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
  }
  textarea {
    height: 100%;
    overflow: auto;
    line-height: 1.5;
    white-space: nowrap;
    resize: none;
  }
}
.footer {
  display: flex;
  justify-content: space-between;
  button {
    &:first-child {
      transform: scale(1.5, 1);
      transform-origin: top left;
    }
    &:last-child {
      transform: scale(1.5, 1);
      transform-origin: top right;
    }
  }
}
</style>
