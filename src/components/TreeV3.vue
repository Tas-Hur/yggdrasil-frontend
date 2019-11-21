<template>
<svg id='viz' :style="{height:'100vh',width:'100vw'}">
  <template v-if="graph !== null">
    <linearGradient :id="'gradient_'+link.index" :x1="link.source.x" :y1="link.source.y" :x2="link.target.x" :y2="link.target.y" :key="link.index" v-for="link in graph.links" gradientUnits="userSpaceOnUse">
      <stop stop-color="white" offset="0" />
      <stop :stop-color="link.source.favorite || link.target.favorite ? greenColor : mainColor" offset="1" />
    </linearGradient>
  </template>
  <g id='container'>
    <g class="links" id="g_links">

    </g>
    <g class="nodes" id="g_nodes">
      <!-- <template v-if="graph !== null">
        <circle @mouseenter="focus(node)" @mouseleave="unfocus" class="circle" fill="white" :stroke="node.favorite ? greenColor : mainColor" stroke-width="2px" :id="node.paperId" :key="node.paperId" :r="computeRadius(node.citations.length)"
                :cx="'fx' in node && node.fx !== null ? node.fx : fixna(node.x)" :cy="'fy' in node && node.fy !== null ? node.fy : fixna(node.y)" v-for="node in graph.nodes">
        </circle>
        <text v-if="disp_titles" :id="'title_'+node.id" lengthAdjust="spacingAndGlyphs" :textLength="4*computeRadius(node.citations.length)" :fill="node.favorite ? greenColor : mainColor" :x="node.x - 2*computeRadius(node.citations.length)"
              :y="node.y+computeRadius(node.citations.length)+25" v-for="node in graph.nodes">{{node.title.slice(0,Math.min(node.title.length, computeRadius(node.citations.length)/2))}}...</text>
      </template> -->
    </g>
  </g>
</svg>
</template>

<script>
import * as d3 from 'd3'
import Vue from 'vue'

export default {
  name: "tree-v3",
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
    gradient_links:Boolean,
    disp_titles: Boolean,
  },
  components: {

  },
  mounted() {
    console.log("mounting")
    console.log(this.graph_original)
    this.init();
  },
  data() {
    return {
      node: null,
      link: null,
      circle_text: null,
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
    node_settings() {
      return {
        diameter: this.nodeDiameter
      }
    },
  },
  watch: {
    node_charge() {
      console.log("changing force")
      var self = this
      this.graphLayout.force("charge", d3.forceManyBody().strength(self.node_charge))
      this.graphLayout.alpha(0.3).restart()
    },
    distance_nodes() {
      var self = this
      this.graphLayout.force("collide", d3.forceCollide(self.distance_nodes))
        .force("link", d3.forceLink(this.graph.links).id(function(d) {
          return d.id;
        }).distance(self.distance_nodes).strength(1))
    },
    graph_original() {
      var self = this;
      console.log("graph original changed");
      console.log(this.node)
      this.drawn = false;

      this.node.selectAll(".node").data([]).exit().remove()
      this.link.selectAll(".link").data([]).exit().remove()
      this.circle_text.selectAll(".text_circle").data([]).exit().remove()
      this.init()
    },
    adjlist() {},
  },
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
    init() {
      if (this.drawn) {
        return;
      }
      this.drawn = true;
      var self = this;
      var svg = d3.select("svg"),
        width = 1920,
        height = 1080;
      var color = d3.scaleOrdinal(d3.schemeCategory10);
      this.graph = this.copyNestedObject(this.graph_original)
      console.log("the graph is : ", this.graph);

      this.graphLayout = d3.forceSimulation(self.graph.nodes)
        .force("charge", d3.forceManyBody().strength(self.node_charge))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.r * -100))
        .force("link", d3.forceLink(self.graph.links).id(d => d.id)
          .distance(self.distance_nodes).strength(1))
        .on("tick", ticked);

      // this.graphLayout.alphaDecay(0.001)

      function neigh(a, b) {
        return a == b || self.adjlist[a + "-" + b];
      }


      var svg = d3.select("#viz").attr("width", width).attr("height", height);
      var container = d3.select("#container");
      svg.selectAll('.node').remove()
      svg.selectAll('.text_circle').remove()
      svg.selectAll('.link').remove()
      svg.call(
        d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() {
          container.attr("transform", d3.event.transform);
        })
      );

      var pseudo_node = d3.select("#g_nodes")
        .selectAll("g")
        .data(self.graph.nodes)
        .enter()

      self.node = pseudo_node
        .append("circle")
        .attr("class", "node")
        .attr("r", (d) => {
          return self.computeRadius(d.citations.length)
        })
        .attr("fill", "white")
        .attr("stroke", function(d) {
          return d.favorite ? self.greenColor : self.mainColor;
        })

      self.link = d3.select("#g_links")
        .selectAll("line")
        .data(self.graph.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", (d) => {
          return this.gradient_links ? "url(#gradient_" + d.index + ")" : mainColor
        })
        .attr("stroke-width", "1px")

      self.circle_text = pseudo_node
        .append("text")
        .attr("class", "text_circle")
        .attr("text-anchor", "middle")
        .text(function(d, i) {
          // return d.favorite;
          return d.title.slice(0, Math.min(d.title.length, self.computeRadius(d.citations.length) / 2))+"..."
        })
        .attr('id', function(d) {
          return 'title_' + d.id
        })
        .attr("lengthAdjust", "spacingAndGlyphs")
        .attr("textLength", function(d) {
          4 * self.computeRadius(d.citations.length)
        })
        .attr("fill", function(d) {
          return d.favorite ? self.greenColor : self.mainColor
        })

      self.node.call(
        d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

      self.node.on("mouseover", (node) => {
        focus(node);
        self.hover_node = true;
        self.hovered_node = node;
      }).on("mouseout", unfocus);

      function ticked() {
        // console.log("ticked")
        self.circle_text.call(updateCircleText)
        self.node.call(updateNode);
        self.link.call(updateLink);
        // self.graphLayout.nodes(self.graph.nodes)
        // self.graphLayout.force("charge", d3.forceManyBody().strength(self.node_charge))
        //   .force("link", d3.forceLink(self.graph.links).id(function(d) {
        //     return d.id;
        //   }).distance(self.distance_nodes).strength(1))
        self.current_x -= 10
      }

      function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
      }

      function focus(d) {
        self.$emit("hover_node", d)
        var index = d3.select(d3.event.target).datum().id;
        self.node.style("opacity", function(o) {
          return neigh(index, o.id) ? 1 : 0.1;
        });
        self.link.style("opacity", function(o) {
          return o.source.id == index || o.target.id == index ? 1 : 0.1;
        });
      }

      function unfocus() {
        self.node.style("opacity", 1);
        self.link.style("opacity", 1);
      }

      function updateLink(link) {
        self.graph.links.forEach((link, i) => {
          Vue.set(self.graph.links, i, Object.assign({}, link))
          Vue.set(self.graph.links[i], "source", self.graph.nodes.find(node => node.paperId == link.source.paperId))
          Vue.set(self.graph.links[i], "target", self.graph.nodes.find(node => node.paperId == link.target.paperId))
        })
        link.attr("x1", function(d) {
            return fixna(d.source.x);
          })
          .attr("y1", function(d) {
            return fixna(d.source.y);
          })
          .attr("x2", function(d) {
            return fixna(d.target.x);
          })
          .attr("y2", function(d) {
            return fixna(d.target.y);
          });
      }

      function updateNode(node) {
        node.attr("transform", function(d) {
          return "translate(" + (d.x) + "," + (d.y) + ")";
        });
      }

      function updateCircleText(circle_text) {
        circle_text.attr("transform", function(d) {
          return "translate(" + (d.x) + "," + (d.y) + ")";
        });
      }

      function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) self.graphLayout.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) self.graphLayout.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    },
    computeRadius(quotes) {
      if (quotes == 0) {
        return 20;
      }
      return 20 + 5 * Math.pow(quotes, 1 / 3)
    },
  }
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

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
