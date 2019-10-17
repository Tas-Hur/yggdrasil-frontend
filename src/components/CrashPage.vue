<template>
  <div>
    <b-row class="title align-items-center">
      <b-col>
        <h3>
          Yggdrasil
        </h3>
      </b-col>
    </b-row>

    <b-row align-v="center" align-h="center">
      <font-awesome-icon class="custom-btn" icon="search" @click="search"/>
      <b-col cols="6">
        <b-input placeholder="rechercher par DOI, mot-clés, auteur..." class="input-request" icon="search" label="mots-clés, DOI, auteur..." v-model="request" />
      </b-col>
    </b-row>

    <b-row align-h="center" align-v="center" class="query_type-select">
        Je recherche
      <b-col cols="4">
        <vue-multiselect :allow-empty="false" v-model="query_type" label="name" track-by="code" :options="options"></vue-multiselect>
      </b-col>
      <!-- <b-checkbox button-variant="info" class="checkbox">Author</b-checkbox>
      <b-checkbox class="checkbox">Key words</b-checkbox>
      <b-checkbox class="checkbox">Paper id</b-checkbox> -->
    </b-row>
  </div>
</template>

<script scoped>


export default{
  name:'crash-page',
  data(){
    return{
      request:"",
      author:false,
      query_type:{code:'key_words', name:"des mot-clés"},
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
      let url = "http://api.semanticscholar.org/v1/author/38087946"
      url = "http://localhost:3000/"+this.query_type.code
      console.log(url);
      this.$.get(url, {request:this.request})
      .then(res => {
        console.log(res.data)
      })
    }
  }
}
</script>

<style scoped>
.checkbox{
  margin-top:1rem;
  padding: 0 2rem 0 2rem;
}

.query_type-select{
  margin-top:1.5rem;
}

.title{
  height:30%;
}
.input-request{
  text-align:left;
}
</style>
