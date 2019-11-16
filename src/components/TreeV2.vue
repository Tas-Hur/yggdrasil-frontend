<template>
  <svg id='viz' :style="{height:'100vh',width:'100vw'}">
    <g id='container'>
      <g class="links" id="g_links">
        <template v-if="graph !== null">
          <line :stroke="mainColor" stroke-width="1px" :style="{opacit:0.5}" :x1="fixna(link.source.x)" :y1="link.source.y" :x2="link.target.x" :y2="link.target.y" v-for="link in graph.links">
          </line>
          <circle v-if="link.target.citations !== null && link.target.citations !== undefined" class="pointer" :fill="'white'" stroke-width="1px" :stroke="mainColor" r="5" :cx="computeArrowX([link.target.x, link.target.y], [link.source.x, link.source.y], link.target.citations.length)"
            :cy="computeArrowY([link.target.x, link.target.y], [link.source.x, link.source.y], link.target.citations.length)" v-for="link in graph.links"></circle>
        </template>
      </g>
      <g class="nodes" id="g_nodes">
        <template v-if="graph !== null">
          <circle @mouseenter="focus(node)" @mouseleave="unfocus" class="circle" fill="white" :stroke="mainColor" stroke-width="2px" :id="node.paperId" :key="node.paperId" :r="computeRadius(node.citations.length)"
            :cx="'fx' in node && node.fx !== null ? node.fx : fixna(node.x)" :cy="'fy' in node && node.fy !== null ? node.fy : fixna(node.y)" v-for="node in graph.nodes">
          </circle>
          <text :id="'title_'+node.id" :fill="mainColor" :x="node.x - computeRadius(node.citations.length)*3.5" :y="node.y+computeRadius(node.citations.length)+25"
            v-for="node in graph.nodes">{{node.title.slice(0,Math.min(node.title.length-1, computeRadius(node.citations.length)))}}...</text>

        </template>
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import Vue from 'vue'

export default {
  name: "tree-v2",
  props: {
    cdpScore_threshold: {
      type:Number,
      default:5,
    },
    distance_nodes: {
      type:Number,
      default:100,
    },
    node_charge: {
      type:Number,
      default:-6000,
    },
    graph_original: Object,
    adjlist:Object,
  },
  components: {

  },
  mounted() {
    this.graph = this.copyNestedObject(this.graph_original)
    setTimeout(this.init, 1000)
    // this.init();
  },
  data() {
    return {
      center_x: 950,
      center_y: 500,
      drawn: false,
      graphLayout: null,
      graph:null,
      nodeDiameter: 200,
      mainColor: "#2c3e50",
      lightColor: "rgb(150,150,150)",
      redColor: "#ff6a6a",
      greenColor: "#41b883",
    }
  },
  computed: {
    node_settings() {
      return {
        diameter: this.nodeDiameter
      }
    },
  },
  watch: {
    graph(){
      var self = this;
      console.log("Graph refreshed")
      // let graph_tmp = this.copyNestedObject(this.graph_original)
      // graph_tmp.nodes.forEach(node => {
      //   if(!self.graph.nodes.map(n => n.id).includes(node.id)){
      //     self.graph.nodes.push(node)
      //   }
      // })
      // if(this.graphLayout !== null){
      //   this.graphLayout.alpha(0.03).restart()
      // }
      // this.graphLayout.force("charge", d3.forceManyBody().strength(self.node_charge))
      //   .force("collide", d3.forceCollide(self.distance_nodes))
      //   .force("link", d3.forceLink(this.graph.links).id(function(d) {
      //     return d.id;
      //   }).distance(self.distance_nodes).strength(1))
    },
    node_charge() {
      this.graphLayout.alpha(0.03).restart()
    },
    distance_nodes() {
      this.graphLayout.alpha(0.03).restart()
    }
  },
  methods: {
    computeThales(target_coord, source_coord, quote) {
      var vector = [target_coord[0] - source_coord[0], target_coord[1] - source_coord[1]]
      var d = Math.pow(Math.pow(vector[0], 2) + Math.pow(vector[1], 2), 1 / 2)
      return {
        d: d,
        vector: vector
      }
    },
    computeArrowX(target_coord, source_coord, quotes) {
      let res = this.computeThales(target_coord, source_coord, quotes)
      return target_coord[0] - (this.computeRadius(quotes) * res.vector[0] / res.d)
    },
    computeArrowY(target_coord, source_coord, quotes) {
      let res = this.computeThales(target_coord, source_coord, quotes)
      return target_coord[1] - (this.computeRadius(quotes) * res.vector[1] / res.d)
    },
    correctPos(pos) {
      if (pos < 0 || !isFinite(pos)) {
        return 800
      } else {
        return pos
      }
    },
    copyNestedObject(obj) {
      var self = this;
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
          return obj.map(cell => self.copyNestedObject(cell))
          break;
        case Object:
          Object.keys(obj).map(key => {
            obj[key] = self.copyNestedObject(obj[key])
          })
          return obj
          break;
      }
    },
    ticked() {
      var self = this;
      console.log("tick")
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
      this.graph.links.forEach((link, i) => {
        Vue.set(self.graph.links, i, Object.assign({}, link))
        Vue.set(self.graph.links[i], "source", this.graph.nodes.find(node => node.paperId == link.source.paperId))
        Vue.set(self.graph.links[i], "target", this.graph.nodes.find(node => node.paperId == link.target.paperId))
      })
      this.graph.nodes.forEach((node, i) => {
        Vue.set(self.graph.nodes, i, Object.assign({}, node))
      })
      var node = d3.selectAll(".circle").data(this.graph.nodes).call(
        d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );
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

      // this.graph.links.forEach(function(d) {
      //   self.adjlist[d.source.id + "-" + d.target.id] = true;
      //   self.adjlist[d.target.id + "-" + d.source.id] = true;
      // });


      var svg = d3.select("#viz");
      var container = d3.select("#container");

      svg.call(
        d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() {
          container.attr("transform", d3.event.transform);
        })
      );
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
      this.hover_node = true
      this.hovered_node = d
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
  }
}
</script>

<style scoped>

svg {
  /* background-color: var(--main-color); */
  /* color: rgb(200, 200, 200); */
}

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
