<template>
  <div class="custom-tt">
    <div id="infoBox">
      <b-row>
        <b-col>
          Title : <br  />{{node.title}}
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <br  />
          Abstract : {{node.abstract}}
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  export default{
    name:"custom-tooltip",
    props:{
      node:{
        type:Object,
        default:{title:"",abstract:""}
      },
      abstract:String,
      title:String,
      influential_count:Number,
    }
  }
</script>

<style scoped>

#infoBox {
  border: none;
  padding: 8px;
  background-color: white;
  opacity: 0.9;
  position: relative;
  width: 40vw;
  text-align:justify;
  font-family: arial, helvetica, sans-serif;
  font-weight: bold;
  font-size: 11px;
}
/* this is known as the "clearfix" hack to allow
floated objects to add to the height of a div */
#infoBox:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}
</style>
