<template>
  <div>

    <custom-tooltip v-show="hover_node" :node_settings="node_settings" :position="hovered_node_location" id="infoBoxHolder" :node="this.hovered_node">
    </custom-tooltip>
    <div id="myDiagramDiv" :style="{height:'100vh',width:'100vw'}">
    </div>
    <div class="custom-container">
      <b-row align-h="center">
        <b-col>
          Cliquer <span class="link" @click="search">ici</span> pour relancer une recherche
          <br  />
          Cliquer <span class="link" @click="addNode">ici</span> pour ajouter un noeud
          <br  />
          Il y a {{total_nodes.length}} noeuds et {{total_links.length}} liens
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import CustomTooltip from './CustomTooltip.vue'
export default{
  name:"tree-d3",
  props:{
    nodes:Array,
    socket:Object
  },
  components:{
    CustomTooltip
  },
  mounted(){
    var self = this;
    console.log("Launching stuff")
    this.init()
    self.slowAddNode(100);
    this.socket.on('new_node', (data)=>{
      if(!(data in self.total_nodes)){
        console.log("receiving")
        self.total_nodes.push(data);
      }
    })
  },
  data(){
    return{
      cursor:0,
      total_nodes:[],
      total_links:[],
      hovered_node:null,
      hovered_node_location:{},
      diagram:null,
      total_width:0,
      hover_node:false,
      nodes_limit:75,
      mainColor: "#2c3e50",
      lightColor: "rgb(150,150,150)",
      redColor: "#ff6a6a",
      greenColor: "#41b883",
      nodeDiameter:200,
      current_node:null,
    }
  },
  computed:{
    node_settings(){
      return{
        diameter:this.nodeDiameter
      }
    },
    data_links(){
      let res = []
      this.data.forEach(paper => {
        res.push({from:paper.key,to:paper.cites})
      })
      return res;
    }
  },
  methods:{
    slowAddNode(delay){
      var self=this;
      if(this.cursor < this.total_nodes.length){
        this.addNode(this.total_nodes[this.cursor])
      }
      this.cursor+=1;
      if(this.cursor < this.nodes_limit){
        setTimeout(self.slowAddNode.bind(null, delay), delay)
      }

    },
    search(){
      this.$emit('search')
    },
    init() {
      
    },
    addNode(node){
      var self = this
      node.key=node.paperId
      node.color='white'
      node.references.forEach(ref => {
        if(self.total_nodes.map(node => node.key).includes(ref.paperId)){
          let link={from:ref.paperId, to:node.paperId}
          if(!self.total_links.includes(link)){
            self.diagram.model.addLinkData(link)
            self.total_links.push(link)
          }
        }
      })
      node.citations.forEach(cit => {
        if(self.total_nodes.map(node => node.key).includes(cit.paperId)){
          let link={from:node.paperId, to:cit.paperId}
          if(!self.total_links.includes(link)){
            self.diagram.model.addLinkData(link)
            self.total_links.push(link)
          }
        }
      })
      if(!(node in self.total_nodes)){
        self.diagram.model.addNodeData(node);
      }
    },
  }
}
</script>

<style scoped>
.custom-container{
  position:fixed;
  left:10px;
  z-index: 500;
  right:10px;
  top:10px;
}

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
