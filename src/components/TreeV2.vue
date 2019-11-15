<template>
<div>

  <custom-tooltip v-show="hover_node" :node_settings="node_settings" :position="hovered_node_location" id="infoBoxHolder" :node="this.hovered_node">
  </custom-tooltip>
  <!-- <template v-if="graph !== null && graph.nodes[0] !== undefined">
    {{graph.nodes[0].x}}
    {{graph.nodes[0].y}}
  </template> -->
  <svg id='viz' :style="{height:'100vh',width:'100vw'}">
    <g id='container'>
      <g class="links" id="g_links">
        <template v-if="graph !== null">
          <line :stroke="mainColor" stroke-width="1px" :x1="fixna(link.source.x)" :y1="link.source.y" :x2="link.target.x" :y2="link.target.y" v-for="link in graph.links">
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


  <div class="custom-container">
    <b-row align-h="center">
      <b-col cols="auto">
        Cliquer <span class="link" @click="search">ici</span> pour relancer une recherche
        <br />
        Cliquer <span class="link" @click="addNode">ici</span> pour ajouter un noeud
        <br />
        <template v-if="graph !== null">
          Il y a {{graph.nodes.length}} noeuds et {{graph.links.length}} liens
        </template>
      </b-col>
      <b-col cols="auto" class="text-left">
        Charge : <input type="range" min="-100000" max="0" v-model="node_charge" class="slider" id="myRange" />{{node_charge}}
        <br />
        Distance : <input type="range" min="0" max="1000" v-model="distance_nodes" class="slider" />{{distance_nodes}}

        <br />
        CdP score : <input @change="updateNodes" type="range" min="0" max="200" v-model="cdpScore_threshold" class="slider" />{{cdpScore_threshold}}

        <br />
        <b-button @click="addCircle">
          Add Node
        </b-button>

      </b-col>
    </b-row>
  </div>
</div>
</template>

<script>
import CustomTooltip from './CustomTooltip.vue'
import * as d3 from 'd3'
import Vue from 'vue'

export default {
  name: "tree-v2",
  props: {
    nodes: Array,
    socket: Object
  },
  components: {
    CustomTooltip
  },
  mounted() {
    var self = this;
    console.log("Launching stuff")
    // this.init()
    // self.slowAddNode(1);
    this.nodes.forEach(node => {
      this.addNode(node);
    })
    setTimeout(this.init, 3000)
    this.socket.on('done', () => {
      console.log("RECEIVED ALL")
      this.init()
    })
    this.socket.on('new_node', (data) => {
      this.addNode(data)
    })
  },
  data() {
    return {
      center_x: 950,
      center_y: 500,
      graph: null,
      node_charge: -5000,
      drawn: false,
      cursor: 0,
      total_nodes: [],
      distance_nodes: 50,
      dragging: false,
      adjlist: {},
      total_links: [],
      total_links_2: [],
      hovered_node: null,
      hovered_node_location: {
        F: -25,
        G: 100
      },
      graphLayout: null,
      diagram: null,
      total_width: 0,
      hover_node: false,
      nodes_limit: 2,
      mainColor: "#2c3e50",
      lightColor: "rgb(150,150,150)",
      redColor: "#ff6a6a",
      greenColor: "#41b883",
      nodeDiameter: 200,
      current_node: null,
      cdpScore_threshold: 5,
      eventual_links: [],
      eventual_nodes: [],
    }
  },
  computed: {
    node_settings() {
      return {
        diameter: this.nodeDiameter
      }
    },
    links_checker() {
      return this.total_links.filter(link => {
        return link.source.constructor === String && link.target.constructor === String
      }).length
    },
  },
  watch: {
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
    computeEventual_nodes() {
      var self = this
      var nodes = this.total_nodes.filter(node => node.cdpScore >= this.cdpScore_threshold)
      for (let i = 0; i < nodes.length; i++) {
        //   nodes[i].vx = 0
        //   nodes[i].vy = 0
      }
      return nodes
    },
    computeEventual_links(nodes) {
      var self = this;
      var links = this.copyNestedObject(self.total_links).filter(link => nodes.map(node => node.paperId).includes(link.source) && nodes.map(node => node.paperId).includes(link.target))
      for(let i = 0; i<links.length; i++){
        self.adjlist[links[i].source.id + "-" + links[i].target.id] = true;
        self.adjlist[links[i].target.id + "-" + links[i].source.id] = true;
      }
      console.warn(self.adjlist)
      return links
    },
    copyNestedObject: function pf(obj) {
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
          return obj.map(cell => pf(cell))
          break;
        case Object:
          Object.keys(obj).map(key => {
            obj[key] = pf(obj[key])
          })
          return obj
          break;
      }
    },
    slowAddNode(delay) {
      console.log("Adding ", this.cursor)
      var self = this;
      if (this.cursor == 100) {
        this.init();
      }
      if (this.cursor < this.total_nodes.length) {
        this.addNode(this.total_nodes[this.cursor])
      }
      this.cursor += 1;
      if (this.cursor < this.nodes_limit) {
        setTimeout(self.slowAddNode.bind(null, delay), delay)
      }

    },
    search() {
      this.$emit('search')
    },
    addNode(node) {
      var self = this
      node.id = node.paperId
      node.color = 'white'
      node.references.forEach(ref => {
        if (self.total_nodes.map(node => node.id).includes(ref.paperId)) {
          let link = {
            source: ref.paperId,
            target: node.paperId,
            value: 1
          }
          let link_2 = {
            source: ref.paperId,
            target: node.paperId,
            value: 1
          }
          if (!self.total_links.includes(link)) {
            self.total_links.push(link)
            self.total_links_2.push(link_2)
          }
        }
      })
      node.citations.forEach(cit => {
        if (self.total_nodes.map(node => node.key).includes(cit.paperId)) {
          let link = {
            source: node.paperId,
            target: cit.paperId,
            value: 1
          }
          let link_2 = {
            source: node.paperId,
            target: cit.paperId,
            value: 1
          }
          if (!self.total_links.includes(link)) {
            self.total_links.push(link)
            self.total_links_2.push(link_2)
          }
        }
      })
      node.id = node.paperId
      node.group = Math.round(node.citations.length / 100)
      if (!self.total_nodes.map(nod => nod.paperId).includes(node.paperId) && node.paperId != null && node.paperId !== undefined) {
        self.total_nodes.push(node);
      }
    },
    ticked() {
      var self = this;
      console.log("tick")

      function dragstarted(d) {
        self.dragging = true;
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
        self.dragging = false;
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
      console.log("ticked")
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
    init() {
      if (this.drawn) {
        return;
      }
      var nodes = this.computeEventual_nodes()
      var links = [...this.computeEventual_links(nodes)]
      this.graph = {
        nodes: nodes,
        links: links
      }
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
      links = [...graph.links]
      nodes = [...graph.nodes]


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



      this.graph.links.forEach(function(d) {
        self.adjlist[d.source.id + "-" + d.target.id] = true;
        self.adjlist[d.target.id + "-" + d.source.id] = true;
      });


      var svg = d3.select("#viz");
      var container = d3.select("#container");

      svg.call(
        d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() {
          container.attr("transform", d3.event.transform);
        })
      );



      // node.on("mouseover", (node) => {
      //   focus(node);
      //   self.hover_node = true;
      //   self.hovered_node = node;
      // }).on("mouseout", unfocus);

    },
    neigh(a, b) {
      return a == b || this.adjlist[a + "-" + b];
    },
    focus(d) {
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
    addCircle() {
      this.graph.nodes.push({
        id: '45454545454',
        'cdpScore': 124,
        x: this.graph.nodes[0].x,
        y: this.graph.nodes[0].y,
        citations: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      })
      this.graphLayout.alpha(0.03).restart()
    },
    updateNodes() {
      console.log("Update nodes")
      var self = this
      // setTimeout(()=>{self.graphLayout.alphaDecay(0.001).restart()},2000)
      this.total_links_2.forEach((link, i) => {
        this.total_links[i] = Object.assign({}, link)
      })
      var nodes = [...this.computeEventual_nodes()]
      console.log("Updated nodes")
      var links = [...this.computeEventual_links(nodes)]
      console.log("Updated links")
      this.graph = {
        nodes: nodes,
        links: links
      }
    }
  }
}
</script>

<style scoped>
.nodes_title {
  display: block;
  position: absolute;
}

.custom-container {
  position: fixed;
  left: 10px;
  z-index: 500;
  right: 10px;
  top: 10px;
}

svg {
  /* background-color: var(--main-color); */
  /* color: rgb(200, 200, 200); */
}

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
