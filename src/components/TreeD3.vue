<template>
<div>

  <custom-tooltip v-show="hover_node" :node_settings="node_settings" :position="hovered_node_location" id="infoBoxHolder" :node="this.hovered_node">
  </custom-tooltip>
  <!-- <div id="myDiagramDiv" :style="{height:'100vh',width:'100vw'}">
  </div> -->
  <svg id='viz' :style="{height:'100vh',width:'100vw'}">
    <g id='container'>
      <g class="links" id="g_links">
        <line v-for="link in total_links" stroke="gray" stroke-width="5"></line>
      </g>
      <g class="nodes" id="g_nodes">
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
        Il y a {{total_nodes.length}} noeuds et {{total_links.length}} liens

      </b-col>
      <b-col cols="auto" class="text-left">
        Charge : <input type="range" min="-100000" max="0" v-model="node_charge" class="slider" id="myRange" />{{node_charge}}
        <br />
        Cdp threshold : <input  type="range" min="0" max="400" v-model="cdpScore_threshold" class="slider" />{{cdpScore_threshold}}
        <br />
        Distance : <input @change="refresh" type="range" min="0" max="1000" v-model="distance_nodes" class="slider" />{{distance_nodes}}
      </b-col>
    </b-row>
  </div>
</div>
</template>

<script>
import CustomTooltip from './CustomTooltip.vue'
import * as d3 from 'd3'

export default {
  name: "tree-d3",
  props: {
    nodes: Array,
    socket: Object
  },
  components: {
    CustomTooltip
  },
  mounted() {
    var self = this;

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
      // cursor: 0,
      // nodes_limit: 2,
      graphLayout: null,
      labelLayout: null,
      node_charge: -5000,
      drawn: false,
      total_nodes: [],
      distance_nodes: 50,
      total_links: [],
      hovered_node: null,
      hovered_node_location: {
        F: -25,
        G: 100
      },
      svg: d3.select("#viz"),
      container: d3.select("#container"),
      hover_node: false,
      mainColor: "#2c3e50",
      lightColor: "rgb(150,150,150)",
      adjlist:[],
      redColor: "#ff6a6a",
      greenColor: "#41b883",
      nodeDiameter: 200,
      cdpScore_threshold: 5,
      colorSet: d3.scaleOrdinal(d3.schemeCategory10)
    }
  },
  computed: {
    // pseudo_node() {
    //   var self = this
    //   return d3.select("#g_nodes")
    //     // .selectAll("g")
    //     .data(self.graph.nodes)
    //     .enter()
    // },
    // node() {
    //   var self = this;
    //   return self.pseudo_node
    //     .append("circle")
    //     .attr("r", (d) => {
    //       return 3 * Math.pow(d.cdpScore, 1 / 2)
    //     })
    //     .attr("fill", "white")
    //     .attr("stroke", function(d) {
    //       return "#2c5e50";
    //     })
    // },
    pseudo_node() {
      var self = this;
      return d3.select("#g_nodes")
        .selectAll("g")
        .data(self.graph.nodes)
        .enter()
    },
    node() {
      var self = this;
      return this.pseudo_node
        .append("circle")
        .attr("class", "node")
        .attr("r", (d) => {
          return 3 * Math.pow(d.cdpScore, 1 / 2)
        })
        .attr("fill", "white")
        .attr("stroke", function(d) {
          return self.colorSet(d.group);
        })
    },
    // link() {
    //   var self = this
    //   return d3.select("#g_links")
    //     .selectAll("line")
    //     .data(self.graph.links)
    //     .enter()
    //     .append("line")
    //     .attr("class", "link")
    //     .attr("stroke", "#aaa")
    //     .attr("stroke-width", "1px")
    // },
    labelNode() {
      var self = this;
      return this.container.append("g").attr("class", "labelNodes")
        .selectAll("text")
        .data(self.label.nodes)
        .enter()
        .append("text")
        .text(function(d, i) {
          return i % 2 == 0 ? "" : d.node.title;
        })
        .style("fill", "transparent")
        .style("font-family", "Arial")
        .style("font-size", 12)
        .style("pointer-events", "none"); // to prevent mouseover/drag capture
    },
    circle_text() {
      var self = this;
      return this.pseudo_node
        .append("text")
        .attr("class", "text_circle")
        .attr("text-anchor", "middle")
        .text(function(d, i) {
          return d.title + "\n" + d.group
        })
        .style("fill", function(d) {
          return self.colorSet(d.group);
        })
        .style("white-space", "nowrap")
        .style("overflow", "hidden")
        .style("font-family", "Arial")
        .style("font-size", '5px')
        .style("pointer-events", "none"); // to prevent mouseover/drag capture
    },
    label() {
      var label = {
        'nodes': [],
        'links': []
      }
      for (let i = 0; i < this.graph.nodes.length; i++) {
        let d = this.graph.nodes[i]
        label.nodes.push({
          node: d
        });
        label.nodes.push({
          node: d
        });
        label.links.push({
          source: i * 2,
          target: i * 2 + 1
        });
      }
      return label;
    },
    graph() {
      return {
        nodes: [...this.eventual_nodes],
        links: [...this.eventual_links]
      }
    },
    node_settings() {
      return {
        diameter: this.nodeDiameter
      }
    },
    eventual_nodes() {
      return this.total_nodes.filter(node => node.cdpScore >= this.cdpScore_threshold)
    },
    eventual_links() {
      var self = this;
      return this.total_links.filter(link => self.eventual_nodes.map(paper => paper.paperId).includes (link.source) && self.eventual_nodes.map(paper => paper.paperId).includes(link.target))
    },
  },
  watch: {
    node_charge() {
      console.log("force changed")
    }
  },
  methods: {
    // updateNodes() {
    //   var self = this
    //   var node = d3.selectAll("circle.node")
    //     .data(self.graph.nodes)
    //   node.enter().append("circle")
    //     .attr("class", "node")
    //     .attr("cx", (d) => 200)
    //     .attr("cy", (d) => 200)
    //     .attr("r", (d) => {
    //       return 3 * Math.pow(d.cdpScore, 1 / 2)
    //     })
    //     .style("fill", "white")
    //     .style("stroke", "gray")
    //     .style("stroke-width", 1.0)
    //
    //   node.exit().remove()
    //   self.updateLinks()
    // },
    // updateLinks() {
    //   var self = this;
    //   var link = d3.selectAll("line.link")
    //     .data(self.graph.links)
    //   link.enter().append("line")
    //     .attr("class", "link")
    //     .attr("stroke", "#ddd")
    //     .attr("stroke-opacity", 0.8)
    //     .attr("x1", (d) => d.source.x)
    //     .attr("y1", (d) => d.source.y)
    //     .attr("x2", (d) => d.target.x)
    //     .attr("y2", (d) => d.target.y)
    //
    //   link.exit().remove()
    // },
    refresh() {
      console.log("CDP CONSTRAINT CHANGED")
    },
    // slowAddNode(delay) {
    //   console.log("Adding ", this.cursor)
    //   var self = this;
    //   if (this.cursor == 100) {
    //     this.init();
    //   }
    //   if (this.cursor < this.total_nodes.length) {
    //     this.addNode(this.total_nodes[this.cursor])
    //   }
    //   this.cursor += 1;
    //   if (this.cursor < this.nodes_limit) {
    //     setTimeout(self.slowAddNode.bind(null, delay), delay)
    //   }
    // },
    search() {
      this.$emit('search')
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

      var graph = this.graph
      console.log(graph)
      var labelLayout = d3.forceSimulation(self.label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(self.label.links).distance(0).strength(2));

      var graphLayout = d3.forceSimulation(graph.nodes)
        .force("charge", d3.forceManyBody().strength(self.node_charge))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(1))
        .force("y", d3.forceY(height / 2).strength(1))
        .force("link", d3.forceLink(graph.links).id(function(d) {
          return d.id;
        }).distance(self.distance_nodes).strength(1))
        .on("tick", self.ticked);

      this.labelLayout = labelLayout
      this.graphLayout = graphLayout
      graph.links.forEach(d => {
        this.adjlist[d.source.index + "-" + d.target.index] = true;
        this.adjlist[d.target.index + "-" + d.source.index] = true;
      });

      this.svg.call(
        d3.zoom()
        .scaleExtent([.1, 4])
        .on("zoom", function() {
          self.container.attr("transform", d3.event.transform);
        })
      );

      // var pseudo_node = d3.select("#g_nodes")
      //   .selectAll("g")
      //   .data(self.graph.nodes)
      //   .enter()
      //
      //
      // var node = pseudo_node
      //   .append("circle")
      //   .attr("class", "node")
      //   .attr("r", (d) => {
      //     return 3 * Math.pow(d.cdpScore, 1 / 2)
      //   })
      //   .attr("fill", "white")
      //   .attr("stroke", function(d) {
      //     return self.colorSet(d.group);
      //   })
      // var link = d3.select("#g_links")
      //   .selectAll("line")
      //   .data(self.graph.links)
      //   .enter()
      //   .append("line")
      //   .attr("class", "link")
      //   .attr("stroke", "#aaa")
      //   .attr("stroke-width", "1px")
      //
      // var circle_text = pseudo_node
      //   .append("text")
      //   .attr("class", "text_circle")
      //   .attr("text-anchor", "middle")
      //   .text(function(d, i) {
      //     return d.title + "\n" + d.group
      //   })
      //   .style("fill", function(d) {
      //     return self.colorSet(d.group);
      //   })
      //   .style("white-space", "nowrap")
      //   .style("overflow", "hidden")
      //   .style("font-family", "Arial")
      //   .style("font-size", '5px')
      //   .style("pointer-events", "none"); // to prevent mouseover/drag capture

      // var labelNode = container.append("g").attr("class", "labelNodes")
      //   .selectAll("text")
      //   .data(label.nodes)
      //   .enter()
      //   .append("text")
      //   .text(function(d, i) {
      //     return i % 2 == 0 ? "" : d.node.title;
      //   })
      //   .style("fill", "transparent")
      //   .style("font-family", "Arial")
      //   .style("font-size", 12)
      //   .style("pointer-events", "none"); // to prevent mouseover/drag capture

      this.node.call(
        d3.drag()
        .on("start", self.dragstarted)
        .on("drag", self.dragged)
        .on("end", self.dragended)
      );

      this.node.on("mouseover", (node) => {
        console.log("Hover")
        self.focus(node);
        self.hover_node = true;
        self.hovered_node = node;
      }).on("mouseout", self.unfocus);

    },
    ticked() {
      var self = this;
      self.node.call(self.updateNode);
      // self.link.call(self.updateLink);
      if (self.graphLayout.nodes().length != self.graph.nodes.length) {
        self.graphLayout.nodes(self.graph.nodes)
      }
      self.graphLayout.force("charge", d3.forceManyBody().strength(self.node_charge))
        // .force("link", d3.forceLink(self.graph.links).id(function(d) {
        //   return d.id;
        // }).distance(self.distance_nodes).strength(1))
      self.labelLayout.alphaTarget(0.3).restart();
      self.labelNode.each(function(d, i) {
        if (i % 2 == 0) {
          d.x = d.node.x;
          d.y = d.node.y;
        } else {
          var b = this.getBBox();

          var diffX = d.x - d.node.x;
          var diffY = d.y - d.node.y;

          var dist = Math.sqrt(diffX * diffX + diffY * diffY);

          var shiftX = b.width * (diffX - dist) / (dist * 2);
          shiftX = Math.max(-b.width, Math.min(0, shiftX));
          var shiftY = 16;
          this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
        }
      });
      self.labelNode.call(self.updateNode);
      self.circle_text.call(self.updateCircleText)
    },
    neigh(a, b) {
      return a == b || this.adjlist[a + "-" + b];
    },
    focus(d) {
      var self = this
      var index = d3.select(d3.event.target).datum().index;
      this.node.style("opacity", function(o) {
        return self.neigh(index, o.index) ? 1 : 0.1;
      });
      this.labelNode.attr("display", function(o) {
        return self.neigh(index, o.node.index) ? "block" : "none";
      });
      // this.link.style("opacity", function(o) {
      //   return o.source.index == index || o.target.index == index ? 1 : 0.1;
      // });
    },
    unfocus() {
      this.labelNode.attr("display", "block");
      this.node.style("opacity", 1);
      // this.link.style("opacity", 1);
    },
    updateLink(link) {
      var self = this;
      link.attr("x1", function(d) {
          return self.fixna(d.source.x);
        })
        .attr("y1", function(d) {
          return self.fixna(d.source.y);
        })
        .attr("x2", function(d) {
          return self.fixna(d.target.x);
        })
        .attr("y2", function(d) {
          return self.fixna(d.target.y);
        });
    },
    updateNode(node) {
      var self = this
      node.attr("transform", function(d) {
        return "translate(" + self.fixna(d.x) + "," + self.fixna(d.y) + ")";
      });
    },
    fixna(x) {
      if (isFinite(x)) return x;
      return 0;
    },
    updateCircleText(circle_text) {
      var self = this;
      circle_text.attr("transform", function(d) {
        return "translate(" + self.fixna(d.x) + "," + self.fixna(d.y) + ")";
      });
    },
    dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      if (!d3.event.active) this.graphLayout.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },
    dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },
    dragended(d) {
      if (!d3.event.active) this.graphLayout.alphaTarget(0);
      d.fx = null;
      d.fy = null;
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
          if (!self.total_links.includes(link)) {
            self.total_links.push(link)
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
          if (!self.total_links.includes(link)) {
            self.total_links.push(link)
          }
        }
      })
      node.id = node.paperId
      node.group = Math.round(node.citations.length / 100)
      if (!self.total_nodes.map(nod => nod.paperId).includes(node.paperId) && node.paperId != null && node.paperId !== undefined) {
        self.total_nodes.push(node);
      }
    },
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
