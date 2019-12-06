<template>
<b-container>
  <b-row class="title align-items-center">
    <b-col>
      <h3>
        Yggdrasil
      </h3>
    </b-col>
  </b-row>
  <b-row align-h="center">
    <b-col sm="7">
      <b-row align-v="center" align-h="center">
        <font-awesome-icon class="custom-btn" icon="search" @click="search" />
        <b-col cols="10">
          <b-input :disabled="socket === null" @keyup.enter="search" placeholder="rechercher par DOI, mot-clés, auteur..." class="input-request" icon="search" label="mots-clés, DOI, auteur..." v-model="request" />
        </b-col>
      </b-row>

      <b-row align-h="center" align-v="center" class="query_type-select">
        Je recherche
        <b-col cols="7">
          <vue-multiselect :allow-empty="false" v-model="query_type" label="name" track-by="code" :options="options"></vue-multiselect>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</b-container>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'crash-page',
  data() {
    return {
      socket: null,
      loading: false,
      request: "",
      author: false,
      query_type: {
        code: 'paper_id',
        name: "un papier spécifique "
      },
      options: [{
          code: 'author',
          name: 'un auteur'
        },
        {
          code: 'key_words',
          name: 'des mot-clés'
        },
        {
          code: 'paper_id',
          name: 'un papier spécifique'
        }
      ]
    }
  },
  components: {
  },
  methods:{
    connect(){
      var self = this;
      console.log(self.back_url)
      this.socket = Vue.prototype.$socketIO.connect(this.back_url)
      this.socket.on('connect', () => {
        console.log("connected ", self.socket)
        this.$emit("socket_connected", self.socket)
      })
    },
    search() {
      this.$emit('search',{request_type: this.query_type.code, request: this.request})

    }
  },
  mounted() {
    this.connect();
  }
}
</script>

<style scoped>
.req_spinner {
  margin-top: 2rem;
}

.checkbox {
  margin-top: 1rem;
  padding: 0 2rem 0 2rem;
}

.query_type-select {
  margin-top: 1.5rem;
}

.title {
  margin-top: 17vh;
  margin-bottom: 13vh;
  height: 30%;
}

.input-request {
  text-align: left;
}
</style>
