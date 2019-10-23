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
      <b-col sm="8">
        <b-row align-v="center" align-h="center">
          <font-awesome-icon class="custom-btn" icon="search" @click="search"/>
          <b-col cols="10">
            <b-input @keyup.enter="search" placeholder="rechercher par DOI, mot-clés, auteur..." class="input-request" icon="search" label="mots-clés, DOI, auteur..." v-model="request" />
          </b-col>
        </b-row>

        <b-row align-h="center" align-v="center" class="query_type-select">
          Je recherche
          <b-col cols="6">
            <vue-multiselect :allow-empty="false" v-model="query_type" label="name" track-by="code" :options="options"></vue-multiselect>
          </b-col>
        </b-row>

        <b-row v-if="loading" class="req_spinner" align-h="center">
          <b-spinner></b-spinner>
        </b-row>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
export default{
  name:'crash-page',
  data(){
    return{
      loading:false,
      request:"",
      author:false,
      query_type:{code:'paper_id', name:"un papier spécifique "},
      options:
      [
        {
          code:'author',
          name:'un auteur'
        },
        {
          code:'key_words',
          name:'des mot-clés'
        },
        {
          code:'paper_id',
          name:'un papier spécifique'
        }
      ]
    }
  },
  components: {
  },
  methods:{
    search(){
      console.log("Go")
      this.loading=true
      let url = "http://api.semanticscholar.org/v1/author/38087946"
      url = "http://localhost:3000/"+this.query_type.code
      console.log(url);
      this.$.get(url, {
        params: {
          paper_id: this.request
        }
      })
      .then(res => {
        console.log("data ! ",res.data)
        this.loading=false;
        if('error' in res.data){
          this.$bvToast.toast(`Le papier n'a pas été trouvé`, {
            title: 'Erreur',
            autoHideDelay:2000,
          })
          throw "Paper not found";
        }
        this.$emit("got_papers", res.data)
      })
      .catch(err => {
        console.log(err)
        this.loading=false;
      })
    }
  }
}
</script>

<style scoped>
.req_spinner{
  margin-top:2rem;
}

.checkbox{
  margin-top:1rem;
  padding: 0 2rem 0 2rem;
}

.query_type-select{
  margin-top:1.5rem;
}

.title{
  margin:15vh;
  height:30%;
}
.input-request{
  text-align:left;
}
</style>
