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
    nodes:Array
  },
  components:{
    CustomTooltip
  },
  mounted(){
    console.log("Launching stuff")
    this.init()
  },
  data(){
    return{
      hovered_node:null,
      hovered_node_location:{},
      diagram:null,
      total_width:0,
      hover_node:false,
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
      myDiagram.model = new go.GraphLinksModel(
        [
          { title: "Alpha", key:"Alpha", color: nodeColor },
          { title: "Beta", key:"Beta", color: nodeColor },
          { title: "Gamma", key:"Gamma", color: nodeColor },
          { title: "Delta", key:"Delta", color: nodeColor }
        ],
        [
          { from: "Alpha", to: "Beta" },
          { from: "Alpha", to: "Gamma" },
          { from: "Beta", to: "Beta" },
          { from: "Gamma", to: "Delta" },
          { from: "Delta", to: "Alpha" },
          { from: "Gamma", to: self.nodes[0].paperId},
          { from: "Epsilon", to: "Alpha"}
        ]
      );
      self.nodes.forEach(node=>{
        node.color = nodeColor
        node.key=node.paperId
        myDiagram.model.addNodeData(node);
      })
      self.diagram = myDiagram;
    },
    addNode(){
      var self = this
      console.log("new node")
      self.nodes.forEach(node=>{
        self.diagram.model.addNodeData({title:'Epsilon', key:'Epsilon', color:'white'});
      })
      console.log(self.diagram.model)
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
