<template>
<div id="app">

  <crash-page v-if="step==0" @got_papers="draw_graph" class="content" @search="newSearch" @socket_connected="sockectConnected">
  </crash-page>

  <b-col v-if="loading" class="req_spinner" align-h="center">
    <img height="100px" width="100px" src="animated_logo_load.svg" />
  </b-col>

  <graph-overlay :socket="socket" :nodes="data" @reset_search="resetSearch" v-if="step == 1"
    @new_search="newSearch">
  </graph-overlay>
  <!-- <tree-d3 :socket="socket" :nodes="data" @search="search" v-if="step == 1">
    </tree-d3> -->

</div>
</template>

<script>
import CrashPage from './components/CrashPage.vue'
import TreeV2 from './components/TreeV2.vue'
import GraphOverlay from './components/GraphOverlay.vue'
export default {
  name: 'app',
  components: {
    CrashPage,
    TreeV2,
    GraphOverlay
  },
  data() {
    return {
      step: 0,
      loading: false,
      socket: null,
      data: [],
    }
  },
  methods: {
    userLeave() {
      var self = this;
      console.log("A User leaves :", this.socket)
      this.socket.emit('userLeave')
    },
    resetSearch() {
      this.onUserLeave();
      this.step = 0
    },
    sockectConnected(socket) {
      console.log("connecting socket")
      this.socket = socket
    },
    newSearch(request_data) {
      var self = this;
      this.loading = true
      let url = this.back_url + '/' + request_data.request_type
      console.log(url);
      this.$.get(url, {
          params: {
            paper_id: request_data.request,
            socket_id: self.socket.id
          }
        })
        .then(res => {
          console.log("success ? ", res.data)
          this.loading = false;
          if ('error' in res.data) {
            this.$bvToast.toast(`Le papier n'a pas été trouvé`, {
              title: 'Erreur',
              autoHideDelay: 2000,
            })
            throw "Paper not found";
          }
          this.draw_graph();
        })
        .catch(err => {
          console.log(err)
          this.loading = false;
        })
    },
    onUserLeave() {
      this.socket.emit("userLeave")
    },
    draw_graph() {
      window.removeEventListener("beforeunload", this.onUserLeave, false)
      this.step = 1
      var self = this;
      console.log("ici : ", this.socket)
      window.addEventListener("beforeunload", this.onUserLeave, false);
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

.content {
  height: 100%;
}

.container {
  height: 100%;
}

.req_spinner {
  position: fixed;
  padding-top: 45vh;
  width: 100vw;
  background-color: rgba(255, 255, 255, 0.6);
  height: 80vh;
}
</style>
