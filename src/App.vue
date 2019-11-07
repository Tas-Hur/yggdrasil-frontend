<template>
  <div id="app">

    <crash-page v-if="step==0" @got_papers="draw_graph" class="content">
    </crash-page>

    <tree-graph :socket="socket" :nodes="data" @search="search" v-if="step == 1">
    </tree-graph>
  </div>
</template>

<script>
import CrashPage from './components/CrashPage.vue'
import TreeGraph from'./components/TreeGraph.vue'
export default {
  name: 'app',
  components: {
    CrashPage,TreeGraph
  },
  data(){
    return{
      step:0,
      socket:null,
      data:[],
    }
  },
  methods:{
    search(){
      this.step=0
    },
    draw_graph(session){
      this.step = 1
      this.data=session.data
      this.socket=session.socket
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--main-color);
  /* margin-top: 60px; */
  /* height:90vh; */
}

.content{
  height:100%;
}
.container{
  height:100%;
}
</style>
