<template lang="pug">
svg(xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="2 2 20 20")
  path(
    fill="slategray"
    stroke="slategray"
    stroke-width="1"
    d="M4.293,18.293,10.586,12,4.293,5.707A1,1,0,0,1,5.707,4.293L12,10.586l6.293-6.293a1,1,0,1,1,1.414,1.414L13.414,12l6.293,6.293a1,1,0,1,1-1.414,1.414L12,13.414,5.707,19.707a1,1,0,0,1-1.414-1.414Z"
  )
</template>

<style scoped lang="scss">
svg {
  &:hover {
    cursor: pointer;
    path {
      fill: tomato;
      stroke: tomato;
    }
  }
}
</style>
