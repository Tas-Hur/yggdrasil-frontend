<template>
    <div v-if="node !== null"  :style="positionStyle">
      <div class="arrow-tooltip" :style="arrowStyle">
      </div>
      <div id="infoBox" :style="sizingStyle">
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
    position:Object,
    node_settings:Object,
    tooltipWidth:{
      type:String,
      default:'20vw'
    },
    node:{
      type:Object,
      default:{title:"",abstract:""}
    },
  },
  data(){
    return{
        total_width:0
    }
  },
  computed:{

    arrowStyle(){
      if( this.position.F+this.node_settings.diameter/2 > this.total_width/2){
        return{left:0.2*this.total_width-10+'px'}
      }else{
        return{left:'-10px'}
      }

    },
    sizingStyle(){
      return{width:this.tooltipWidth}
    },
    positionStyle(){
      if( this.position.F+this.node_settings.diameter/2 > this.total_width/2){
        return{left:this.position.F-0.2*this.total_width-30+"px",top:this.position.G+"px"}
      }else{
        return{left:this.position.F+this.node_settings.diameter+30+"px",top:this.position.G+"px"}
      }
    }
  },
  mounted(){
    var self=this;
    this.total_width = window.innerWidth
    window.addEventListener('resize', ()=>{this.total_width=window.innerWidth});
  }
}
</script>

<style scoped>

.arrow-tooltip{
  transform: rotate(45deg);
  background-color: var(--main-color);
  position:relative;
  top:50px;
  z-index:250;
  height:20px;
  width:20px;
  box-shadow: 0 0 3px 0.1px var(--main-color);
}

#infoBox {
  padding: 15px;
  background-color: var(--main-color);
  text-align:justify;
  position: fixed;
  color:white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size:80%;
  box-shadow: 0 0 3px 0.1px var(--main-color);
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
