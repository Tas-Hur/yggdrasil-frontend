<template>
  <div id="app">
    <b-container>
      <crash-page class="content">
      </crash-page>
    </b-container>
  </div>
</template>

<script>
import CrashPage from './components/CrashPage.vue'

export default {
  name: 'app',
  components: {
    CrashPage
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--main-color);
  margin-top: 60px;
  height:90vh;
}

.content{
  height:100%;
}
.container{
  height:100%;
}
</style>
