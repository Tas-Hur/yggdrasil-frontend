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

    <b-row class="justify-content-md-center">
      <b-col cols="6">
      </b-col>
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
    }
  },
  components: {
  },
  methods:{
    search(){
      console.log("Go")
      let url = "http://api.semanticscholar.org/v1/author/38087946"
      this.$.get(url, {request:this.request})
      .then(res => {
        console.log(res.data)
      })
    }
  }
}
</script>

<style scoped>

.title{
  height:30%;
}
.input-request{
  text-align:left;
}
</style>
