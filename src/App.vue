<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
</template>

<style lang="scss">
* {
  box-sizing: border-box;
  outline: none;
}
body {
  height: 100vh;
  margin: 0.5rem;
  overflow-y: hidden;
}
#app {
  height: 100%;
  color: #2c3e50;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#nav {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2rem;
  a {
    margin: 0 0.5rem;
    color: #2c3e50;
    font-weight: bold;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
