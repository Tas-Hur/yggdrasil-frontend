<template>
  <div v-if="node !== null"  :style="positionStyleCursor">
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
      Cited by :
      <template v-if="'citations' in node">
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
        return{
          boxShadow: '5px -5px 10px 0.1px rgba(10,10,10,0.1)',
          left:0.2*this.total_width-10+'px'
        }
      }else{
        return{
          boxShadow: '-5px 5px 10px 0.1px rgba(10,10,10,0.1)',
          left:'-10px'
        }
      }

    },
    sizingStyle(){
      return{width:this.tooltipWidth}
    },
    positionStyleCursor(){
      if( this.position.F+this.node_settings.diameter/2 > this.total_width/2){
        return{left:this.position.F-0.2*this.total_width-50+"px",top:this.position.G-65+"px"}
      }else{
        return{left:this.position.F+50+"px",top:this.position.G-65+"px"}
      }
    },
    positionStyleNode(){
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
  z-index:350;
  transform: rotate(45deg);
  background-color: white;
  position:relative;
  top:50px;
  height:20px;
  width:20px;
}

#infoBox {
  z-index: 300;
  padding: 15px;
  border-radius:5px;
  background-color: white;
  text-align:justify;
  position: fixed;
  white-space: nowrap;
  color:gray;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size:90%;
  box-shadow: 0 0 10px 1px rgba(10,10,10,0.1);
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
