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
          <line stroke="#aaa" stroke-width="1px" :x1="link.source.x" :y1="link.source.y" :x2="link.target.x" :y2="link.target.y" v-for="link in graph.links">
          </line>
        </template>
      </g>
      <g class="nodes" id="g_nodes">
        <template v-if="graph !== null">
          <circle class="circle" fill="white" :stroke="mainColor" stroke-width="2px" :id="node.paperId" :key="node.paperId" :r="20+5*Math.pow(node.citations.length,1/4)" :cx="'fx' in node && node.fx !== null ? node.fx : node.x"
            :cy="'fy' in node && node.fy !== null ? node.fy : node.y" v-for="node in graph.nodes"></circle>
          <!-- <text color="red" :x="node.x" :y="node.y" v-for="node in graph.nodes">{{node.title}}</text> -->
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
        Il y a {{eventual_nodes.length}} noeuds et {{eventual_links.length}} liens
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
    // graph() {
    //   return {
    //     nodes: [...this.computeEventual_nodes()],
    //     links: [...this.computeEventual_links()]
    //   }
    // },
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
    // eventual_nodes() {
    //   var self = this;
    //   return (self.total_nodes).filter(node => node.cdpScore >= this.cdpScore_threshold)
    // },
    // eventual_links() {
    //   var self = this;
    //   return this.copyNestedObject((self.total_links)).filter(link => self.eventual_nodes.map(node => node.paperId).includes(link.source) && self.eventual_nodes.map(node => node.paperId).includes(link.target))
    // },
  },
  watch: {
    node_charge() {
      this.graphLayout.alpha(0.03).restart()
    }
  },
  methods: {
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
      return nodes
    },
    computeEventual_links(nodes) {
      var self = this;
      return this.copyNestedObject(self.total_links).filter(link => nodes.map(node => node.paperId).includes(link.source) && nodes.map(node => node.paperId).includes(link.target))
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
    dragstarted(d) {
      var self = this;
      console.log("Dragging : ", d)
      if(!d3.event.active) self.graphLayout.alphaTarget(0.1).restart()
      // d3.event.sourceEvent.stopPropagation();
      // d.fx = d.x;
      // d.fy = d.y;
    },
    dragged(d) {
      var self = this;
      console.log("Dragging : ", d3.event.x)
      self.graph.nodes.find(node => node.id == d.id).x = d3.event.x
      self.graph.nodes.find(node => node.id == d.id).y = d3.event.y
      // d.x = d3.event.x;
      // d.y = d3.event.y;
      // d3.select('[id="'+d.paperId+'"]').attr("transform","translate(" + d3.event.x + "," + d3.event.y + ")")
    },
    dragended(d) {
      var self = this;
      // if (!d3.event.active) self.graphLayout.alphaTarget(0);
      // d.fx = null;
      // d.fy = null;
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
        .force("link", d3.forceLink(this.graph.links).id(function(d) {
          return d.id;
        }).distance(self.distance_nodes).strength(0))

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
        .on("start", self.dragstarted)
        .on("drag", self.dragged)
        .on("end", self.dragended)
      );
    },
    fixna(x) {
      if (isFinite(x)) return x;
      return 0;
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
      // var graph = Object.assign({}, this.graph)

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
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("link", d3.forceLink(links).id(d => d.id).distance(self.distance_nodes).strength(0))
        .on("tick", self.ticked)
        .alphaTarget(0.1)
        .alphaDecay(0.02)
        .alpha(0.001)


      var adjlist = [];

      this.graph.links.forEach(function(d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
      });

      function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
      }


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


      function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
      }

      function focus(d) {
        var index = d3.select(d3.event.target).datum().index;
        node.style("opacity", function(o) {
          return neigh(index, o.index) ? 1 : 0.1;
        });
        // labelNode.attr("display", function(o) {
        //   return neigh(index, o.node.index) ? "block" : "none";
        // });
        link.style("opacity", function(o) {
          return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
      }

      function unfocus() {
        // labelNode.attr("display", "block");
        node.style("opacity", 1);
        link.style("opacity", 1);
      }
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
      this.total_links_2.forEach((link, i) => {
        this.total_links[i] = Object.assign({}, link)
      })
      var nodes = [...this.computeEventual_nodes()]
      var links = [...this.computeEventual_links(nodes)]

      this.graph = {
        nodes: nodes,
        links: links
      }
    }
  }
}
</script>

<style scoped>
.custom-container {
  position: fixed;
  left: 10px;
  z-index: 500;
  right: 10px;
  top: 10px;
}

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
