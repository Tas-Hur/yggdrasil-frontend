<template>
  <b-container class="max-container">
    <custom-tooltip v-show="hover_node" id="infoBoxHolder" :node="this.current_node">
    </custom-tooltip>
    <b-row>
      <b-col>
        Cliquer <span class="link" @click="search">ici</span> pour relancer une recherche
        Cliquer <span class="link" @click="addNode">ici</span> pour ajouter un noeud
      </b-col>
    </b-row>
    <b-row>
      <b-col id="myDiagramDiv" :style="{height:'80vh'}">
      </b-col>
    </b-row>

  </b-container>
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
    var infoBoxH = document.getElementById("infoBoxHolder");
    document.addEventListener("mousemove", function(e) {
      var box = document.getElementById("infoBoxHolder");
      if(box !== null){
        box.style.left = e.clientX + 30 + "px";
        box.style.top = e.clientY + "px";
      }
    }, false);
  },
  data(){
    return{
      current_node:null,
      diagram:null,
      hover_node:false,
      mainColor: "#2c3e50",
      lightColor: "rgb(150,150,150)",
      redColor: "#ff6a6a",
      greenColor: "#41b883",
    }
  },
  methods:{
    search(){
      this.$emit('search')
    },
    init() {
      var $ = go.GraphObject.make;  // for conciseness in defining templates
      var self = this
      var myDiagram =
      $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
      { // enable undo & redo
        hoverDelay:100,
        "undoManager.isEnabled": true
      });

      myDiagram.nodeTemplate =
      $(go.Node, "Auto",
      new go.Binding("location", "", function(nothing, elt) {
        return new go.Point(elt.data[myLocation.x] * 200,
          elt.data[myLocation.y] * 200)
        }
      ),
      { desiredSize: new go.Size(100,100) }, // the Shape will go around the TextBlock
      $(go.Shape, "Circle",
      { strokeWidth: 0, fill: "white" },  // default fill is white
      // Shape.fill is bound to Node.data.color
      new go.Binding("fill", "color")),
      $(go.TextBlock,
        { margin: 8, stroke:'white' },  // some room around the text
        // TextBlock.text is bound to Node.data.title
        new go.Binding("text", "title")),
        {
          mouseEnter:(e,obj)=>{this.current_node=obj.part.data;self.hover_node=true},
          mouseLeave:(e,obj)=>{self.hover_node=false}
        }
      );
      // but use the default Link template, by not setting Diagram.linkTemplate
      myDiagram.linkTemplate =
      $(go.Link,
        $(go.Shape),  // the link shape
        $(go.Shape,   // the arrowhead
          { toArrow: "Triangle", fill: self.mainColor }
        )
      );

      // create the model data that will be represented by Nodes and Links
      myDiagram.model = new go.GraphLinksModel(
        [
          { title: "Alpha", key:"Alpha", color: "lightblue" },
          { title: "Beta", key:"Beta", color: "orange" },
          { title: "Gamma", key:"Gamma", color: "lightgreen" },
          { title: "Delta", key:"Delta", color: "pink" }
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
        node.color = "lightblue"
        node.key=node.paperId
        myDiagram.model.addNodeData(node);
      })
      self.diagram = myDiagram;
    },
    addNode(){
      var self = this
      console.log("new node")
      self.nodes.forEach(node=>{
        self.diagram.model.addNodeData({title:'Epsilon', key:'Epsilon', color:'orange'});
      })
      console.log(self.diagram.model)
    }
  }
}
</script>

<style scoped>
#myDiagramDiv{
  border-color:1px solid red;
}

#infoBoxHolder {
  z-index: 300;
  position: absolute;
  left: 5px;
}
</style>
