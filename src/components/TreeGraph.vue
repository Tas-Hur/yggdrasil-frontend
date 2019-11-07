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
  name:"tree-graph",
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
    this.socket.on('new_node', (data)=>{
      if(self.total_nodes.length < self.nodes_limit ){
        self.addNode(data);
        self.total_nodes.push(data);
      }
    })
    this.init()
  },
  data(){
    return{
      total_nodes:[],
      total_links:[],
      hovered_node:null,
      hovered_node_location:{},
      diagram:null,
      total_width:0,
      hover_node:false,
      nodes_limit:1000,
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
    search(){
      this.$emit('search')
    },
    init() {
      var nodeColor='white'
      var nodeTextColor=this.mainColor
      var nodeStrokeColor= this.mainColor
      var linkColor=this.mainColor;
      var linkShape='Triangle'
      var $ = go.GraphObject.make;  // for conciseness in defining templates
      var self = this



      var myDiagram =
      $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
      { // enable undo & redo
        hoverDelay:100,
        layout: $(go.ForceDirectedLayout  ),
        "undoManager.isEnabled": true,
      });


      myDiagram.nodeTemplate =
      $(go.Node, "Auto",
      { desiredSize: new go.Size(self.nodeDiameter,200), selectionAdorned:false }, // the Shape will go around the TextBlock
      $(go.Shape, "Circle",
      { strokeWidth: 1, stroke: nodeStrokeColor },  // default fill is white
      // Shape.fill is bound to Node.data.color
      new go.Binding("fill", "color")),
      $(go.TextBlock,
        { margin: 3, stroke:nodeTextColor },  // some room around the text
        // TextBlock.text is bound to Node.data.title
        new go.Binding("text", "title")),
        {
          click: (e, obj) => {this.current_node = this.hovered_node=obj.part.data;this.hover_node=false;},
          mouseOver:(e,obj)=>
          {
            // this.hovered_node_location = myDiagram.transformDocToView(obj.position);
            this.hovered_node_location = {F:e.event.clientX, G:e.event.clientY};
            this.hovered_node=obj.part.data;
            self.hover_node=true
          },
          mouseLeave:(e,obj)=>{self.hover_node=false},
        }
      );
      // but use the default Link template, by not setting Diagram.linkTemplate
      myDiagram.linkTemplate =
      $(go.Link,
        $(go.Shape,
          { strokeWidth: 1, stroke: linkColor }
        ),  // the link shape
        $(go.Shape,   // the arrowhead

          { toArrow: linkShape,strokeWidth:0, stroke:linkColor, fill: linkColor }
        )
      );
      // create the model data that will be represented by Nodes and Links
      self.nodes.forEach(node=>{
        node.color = nodeColor
        node.key=node.paperId
        self.total_nodes.push(node);
        myDiagram.model.addNodeData(node);
      })
      self.diagram = myDiagram;
    },
    addNode(node){
      var self = this
      node.key=node.paperId
      node.color='white'

      node.references.filter(ref => ref.isInfluential).forEach(ref => {
        let link={from:ref.paperId, to:node.paperId}
        if(!(link in self.total_links)){
          self.diagram.model.addLinkData(link)
          self.total_links.push(link)
        }
      })
      node.citations.filter(cit => cit.isInfluential).forEach(cit => {
        let link={from:node.paperId, to:cit.paperId}
        if(!(link in self.total_links)){
          self.diagram.model.addLinkData(link)
          self.total_links.push(link)
        }
      })
      if(!(node in self.total_nodes)){
        self.total_nodes.push(node);
        self.diagram.model.addNodeData(node);
      }
      console.log(self.diagram.model)
    },
    doLayout(){
    }
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
