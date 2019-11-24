<template>
<div class="canvas_container" :style="{width:'99vw',height:'95vh'}">
  {{current_mouse_position}}
  {{origin}}
  {{scale}}
  <canvas id='viz' ref="tree-graph">
  </canvas>
</div>

<!-- <div id="graphDiv">

</div> -->
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
  mounted() {
    this.init_2()
  },
  data() {
    return {
      grad: null,
      stage: null,
      scale: 1,
      ctx: null,
      transform: null,
      width: null,
      current_mouse_position: {
        x: 0,
        y: 0
      },
      height: null,
      origin: [0, 0],
      move_origin: null,
      current_node: null,
      center_x: 950,
      center_y: 500,
      drawn: false,
      graphLayout: null,
      graph: null,
      nodeDiameter: 200,
    }
  },
  computed: {},
  methods: {
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
    init_2() {
      var self = this;
      var radius = 20
      var defaultNodeCol = "white",
        highlightCol = "yellow";


      this.height = window.innerHeight * 0.96;
      this.width = window.innerWidth;

      var graphCanvas = d3.select('#viz')
        .attr('width', this.width + 'px')
        .attr('height', this.height + 'px')
        .node();

      self.ctx = graphCanvas.getContext('2d');

      self.ctx.strokeStyle = this.mainColor;

      self.graphLayout = d3.forceSimulation()
        .force("center", d3.forceCenter(self.width / 2, self.height / 2))
        .force("x", d3.forceX(self.width / 2).strength(0.1))
        .force("y", d3.forceY(self.height / 2).strength(0.1))
        .force("charge", d3.forceManyBody().strength(self.node_charge))
        .force("link", d3.forceLink().strength(1).id(function(d) {
          return d.id;
        }).distance(self.distance_nodes).strength(1))
        .alpha(0.03)
        .alphaDecay(0.001)

      self.transform = d3.zoomIdentity;

      self.graph = this.graph_original

      function zoomed() {
        self.transform = d3.event.transform;
        self.simulationUpdate();
      }

      d3.select(graphCanvas)
        .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

      function dragsubject() {
        var i,
          x = self.transform.invertX(d3.event.x),
          y = self.transform.invertY(d3.event.y),
          dx,
          node,
          dy;
        for (i = self.graph.nodes.length - 1; i >= 0; --i) {
          node = self.graph.nodes[i];
          dx = x - node.x;
          dy = y - node.y;
          let radius = self.computeRadius(node.citations.length) * 1

          if (dx * dx + dy * dy < radius * radius) {
            self.$emit('hover_node', node)
            node.x = self.transform.applyX(node.x);
            node.y = self.transform.applyY(node.y);

            return node;
          }
        }
      }

      function dragstarted() {
        if (!d3.event.active) self.graphLayout.alpha(0.03).restart();
        d3.event.subject.fx = self.transform.invertX(d3.event.x);
        d3.event.subject.fy = self.transform.invertY(d3.event.y);
      }

      function dragged() {
        d3.event.subject.fx = self.transform.invertX(d3.event.x);
        d3.event.subject.fy = self.transform.invertY(d3.event.y);

      }

      function dragended() {
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      self.graphLayout.nodes(self.graph.nodes)
        .on("tick", self.simulationUpdate);

      self.graphLayout.force("link")
        .links(self.graph.links);


    },
    simulationUpdate() {
      var self = this;
      self.ctx.fillStyle = 'white'
      self.ctx.save();
      self.ctx.clearRect(0, 0, self.width, self.height);
      self.ctx.translate(self.transform.x, self.transform.y);
      self.ctx.scale(self.transform.k, self.transform.k);
      self.graphLayout.force("link")
        .links(self.graph.links);
      self.ctx.beginPath();
      self.graph.links.forEach(function(d) {
        self.ctx.moveTo(d.source.x, d.source.y);
        self.ctx.lineTo(d.target.x, d.target.y);
      });
      self.ctx.stroke();

      // Draw the nodes
      self.graph.nodes.forEach(function(d, i) {
        let radius = self.computeRadius(d.citations.length)
        self.ctx.beginPath()
        self.ctx.moveTo(d.x, d.y)
        self.ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
        self.ctx.strokeStyle = d.favorite ? self.greenColor : self.mainColor
        self.ctx.stroke()
        self.ctx.font = "10px Arial";
        self.ctx.fillStyle = self.mainColor
        self.ctx.fillText(d.title, d.x, d.y + radius + 20, radius * 2);
        self.ctx.fillStyle = "white"
        self.ctx.fill()
      });
      self.ctx.restore();
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
    graph() {
    },
    node_charge() {
      this.graphLayout.force("charge", d3.forceManyBody().strength(this.node_charge))
      this.graphLayout.alpha(0.03).restart()
    },
    distance_nodes() {
      var self = this
      this.graphLayout.force("link", d3.forceLink().strength(1).id(function(d) {
        return d.id;
      }).distance(self.distance_nodes).strength(1))
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
