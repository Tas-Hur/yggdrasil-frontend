<template>
  <b-container class="max-container">
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
export default{
  name:"tree-graph",
  props:{
    nodes:Array
  },
  mounted(){
    console.log("Launching stuff")
    this.init()
  },
  data(){
    return{
      diagram:null,
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

      // define a simple Node template
      myDiagram.nodeTemplate =
      $(go.Node, "Auto",
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
          toolTip:  // define a tooltip for each node that displays the color as text
          $("ToolTip",
          $(go.TextBlock, { margin: 4 },
            new go.Binding("text", "", (data) => {
              let authors = ""
              let abstract =""
              let title = data.title
              "authors" in data ? authors = data.authors.map(obj=>obj.name) : authors =""
              "abstract" in data ? abstract = data.abstract : abstract=""
              return ""+
              "title : \n"+
              data.title+
              "\n\nauthors : \n"+
              authors+
              "\n\nabstract : \n"+
              abstract+
              data.color})
            )
          )
        }
      );
      function diagramInfo(model) {
        return "Model:\n" + model.nodeDataArray.length + " nodes, " +
        model.linkDataArray.length + " links";
      }

      myDiagram.toolTip =
      $("ToolTip",
      $(go.TextBlock,
        {
          overflow: go.TextBlock.OverflowClip /* the default value */,
          margin: 4,
          width:"50px",
        },
        // use a converter to display information about the diagram model
        new go.Binding("text", "", diagramInfo))
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
</style>
