<template>
<div class="canvas_container" :style="{width:'98vw',height:'98vh'}">
  <canvas id='viz' ref="tree-graph">
  </canvas>
</div>
</template>

<script>
import * as d3 from 'd3'
import Vue from 'vue'

export default {
  name: "tree-canvas",
  props: {
    cdpScore_threshold: {
      type: Number,
      default: 5,
    },
    distance_nodes: {
      type: Number,
      default: 100,
    },
    node_charge: {
      type: Number,
      default: -6000,
    },
    graph_original: Object,
    adjlist: Object,
    disp_titles: Boolean,
    gradient_links: Boolean,
  },
  components: {

  },
  created() {
    window.addEventListener('wheel', this.scaleGraph);
    window.addEventListener('drag', this.translateGraph)
  },
  destroyed() {
    window.removeEventListener('scroll', this.scaleGraph);
    window.removeEventListener('drag', this.translateGraph)
  },
  mounted() {
    var container = document.getElementsByClassName("canvas_container")[0];
    var width = container.offsetWidth
    var height = container.offsetHeight;
    this.width = width
    this.height= height
    var can = document.getElementById('viz');
    this.stage = can
    can.width = width;
    can.height = height;
    if (can.getContext) {
      console.log("I have a context")
      this.ctx = can.getContext('2d')
      this.ctx.fillStyle = 'white';
      this.ctx.scale(this.scale, this.scale)
    }

    this.graph = this.graph_original

    this.init()
  },
  data() {
    return {
      stage:null,
      scale: 1,
      ctx: null,
      width:null,
      height:null,
      current_node: null,
      center_x: 950,
      center_y: 500,
      drawn: false,
      graphLayout: null,
      graph: null,
      nodeDiameter: 200,
    }
  },
  computed: {
  },
  methods: {
    scaleGraph(e){
      var direction = e.deltaY < 0 ? -1 : 1
      var s = 1-e.deltaY/100
      console.log("Scrool : ",s)
      console.log(this.stage)
      this.ctx.translate(-1*this.width*(s-1)/2,-1*this.height*(s-1)/2)
      this.ctx.scale(s,s,e.clientX,e.clientY)
    },
    translateGraph(e){
      console.log(e)
    },
    copyNestedObject(obj) {
      var self = this;
      var ret
      switch (obj) {
        case null:
          return null;
          break;
        case undefined:
          return undefined;
          break
      }
      var self = this;
      let type = obj.constructor
      switch (type) {
        case Number:
          return obj;
          break;
        case Boolean:
          return obj;
          break;
        case String:
          return obj;
          break;
        case Array:
          ret = []
          for (let i = 0; i < obj.length; i++) {
            ret.push(self.copyNestedObject(obj[i]))
          }
          return ret
          break;
        case Object:
          ret = {}
          var keys = Object.keys(obj)
          for (let i = 0; i < keys.length; i++) {
            ret[keys[i]] = self.copyNestedObject(obj[keys[i]])
          }
          return ret
          break;
      }
    },
    ticked() {
      // console.log("tick")
      this.ctx.clearRect(0, 0, 4000, 3000)
      var self = this;
      function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        self.graphLayout.alpha(0.03).restart()
      }

      function dragged(d) {
        self.graph.nodes.find(node => node.id == d.id).fx = d3.event.x
        self.graph.nodes.find(node => node.id == d.id).fy = d3.event.y
      }

      function dragended(d) {
        self.graph.nodes.find(node => node.id == d.id).fx = null
        self.graph.nodes.find(node => node.id == d.id).fy = null
      }

      this.graphLayout.nodes(self.graph.nodes)
      this.graphLayout.force("charge", d3.forceManyBody().strength(self.node_charge))
        .force("collide", d3.forceCollide(self.distance_nodes))
        .force("link", d3.forceLink(this.graph.links).id(function(d) {
          return d.id;
        }).distance(self.distance_nodes).strength(1))

      self.ctx.beginPath();
      for (let i = 0; i < this.graph.links.length; i++) {
        var link = self.graph.links[i]
        var x1 = 'fx' in link.source && link.source.fx !== null ? link.source.fx : link.source.x // x coordinate
        var y1 = 'fy' in link.source && link.source.fy !== null ? link.source.fy : link.source.y; // y coordinate
        self.ctx.moveTo(x1, y1);
        var x2 = 'fx' in link.target && link.target.fx !== null ? link.target.fx : link.target.x // x coordinate
        var y2 = 'fy' in link.target && link.target.fy !== null ? link.target.fy : link.target.y; // y coordinate
        self.ctx.lineTo(x2, y2);
      }

      for (let j = 0; j < this.graph.nodes.length; j++) {
        var node = self.graph.nodes[j]
        var x = 'fx' in node && node.fx !== null ? node.fx : node.x // x coordinate
        var y = 'fy' in node && node.fy !== null ? node.fy : node.y; // y coordinate
        self.ctx.moveTo(x, y)
        var radius = self.computeRadius(node.citations.length); // Arc radius
        var startAngle = 0; // Starting point on circle
        var endAngle = Math.PI * 2; // End point on circle
        var anticlockwise = true; // clockwise or anticlockwise
        self.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
      }
      self.ctx.stroke();
      self.ctx.fill()
    },
    init() {
      if (this.drawn) {
        return;
      }
      // var nodes = this.computeEventual_nodes()
      // var links = [...this.computeEventual_links(nodes)]
      // this.graph = {
      //   nodes: nodes,
      //   links: links
      // }
      this.drawn = true;
      var self = this;
      var svg = d3.select("svg"),
        width = 1920,
        height = 1080;
      var color = d3.scaleOrdinal(d3.schemeCategory10);
      // var graph = Object.assign({}, this.graph)this.back

      var label = {
        'nodes': [],
        'links': []
      };
      var graph = this.graph
      var links = [...graph.links]
      var nodes = [...graph.nodes]

      this.graphLayout = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(self.node_charge))
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force("collide", d3.forceCollide(self.distance_nodes))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink(links).id(d => d.id).distance(self.distance_nodes).strength(1))
        .on("tick", self.ticked)
        .alpha(0.03)
        .alphaDecay(0.002)

    },
    fixna(x) {
      if (isFinite(x)) return x;
      return 600;
    },
    computeRadius(quotes) {
      if (quotes == 0) {
        return 20;
      }
      return 20 + 5 * Math.pow(quotes, 1 / 3)
    },
    neigh(a, b) {
      return a == b || this.adjlist[a + "-" + b];
    },
    focus(d) {
      this.$emit("hover_node", d)
      this.current_node = d
      var self = this
      var node = d3.selectAll(".circle").data(self.graph.nodes)
      var link = d3.selectAll("line").data(self.graph.links)
      var labels = d3.selectAll("text").data(self.graph.nodes)
      var pointer = d3.selectAll(".pointer").data(self.graph.links)
      var index = d.id;

      node.style("opacity", function(o) {
        return self.neigh(index, o.id) ? 1 : 0.1;
      });
      labels.style("opacity", function(o) {
        return self.neigh(index, o.id) ? 1 : 0.1;
      });
      link.style("opacity", function(o) {
        return o.source.id == index || o.target.id == index ? 1 : 0.1;
      });
      pointer.style("opacity", function(o) {
        return o.source.id == index || o.target.id == index ? 1 : 0.0;
      });
    },
    unfocus() {
      this.current_node = null
      var self = this;
      var node = d3.selectAll(".circle")
      var link = d3.selectAll("line")
      var labels = d3.selectAll("text")
      var pointer = d3.selectAll(".pointer")
      node.style("opacity", 1);
      link.style("opacity", 1);
      labels.style("opacity", 1);
      pointer.style("opacity", 1);
    },
  },
  watch: {
    adjlist() {
      console.log("adjlist refreshed");
    },
    node_charge() {
      this.graphLayout.alpha(0.03).restart()
    },
    distance_nodes() {
      this.graphLayout.alpha(0.03).restart()
    }
  },
}
</script>

<style scoped>
text {
  background-color: var(--main-color);
  color: white;
}

svg {
  /* background-color: var(--main-color); */
  /* color: rgb(200, 200, 200); */
}

circle {
  transition: ease-in-out opacity .3s;
}

line {
  transition: ease-in-out opacity .3s;
}

text {
  transition: ease-in-out opacity .3s;
}
</style>
