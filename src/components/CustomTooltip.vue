<template>
  <div class="custom-tt">
    <div v-if="node !== null" id="infoBox">
      Title :
      {{node.title}}
      <br  />
      Abstract :
      {{node.abstract}}
      <br  />
      Year :
      {{node.year}}
      <br  />
      <template v-if="'citations' in node">
        Cited by :
        {{node.citations.length}}
      </template>
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
  }
}
</script>

<style scoped>

#infoBox {
  border: 1px solid var(--main-color);
  padding: 8px;
  background-color: white;
  text-align:justify;
  display: block;
  width:40vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
