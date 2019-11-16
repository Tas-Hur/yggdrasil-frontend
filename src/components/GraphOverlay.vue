<template>
<div>
  <tree-v2 v-if="draw" :node_charge="parseInt(node_charge)" :distance_nodes="parseInt(distance_nodes)" :adjlist="adjlist" :graph_original="graph">
  </tree-v2>
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
import TreeV2 from './TreeV2.vue'
import Vue from 'vue'
export default {
  name: 'graph-overlay',
  components: {
    TreeV2
  },
  props: {
    nodes: Array,
    socket: Object
  },
  data() {
    return {
      draw:false,
      total_nodes: [],
      total_links: [],
      graph:null,
      total_links_2: [],
      adjlist: {},
      graph: {nodes:[], links:[]},
      total_width: 0,
      node_charge: -6000,
      distance_nodes: 100,
      cdpScore_threshold: 5
    }
  },
  computed: {
    links_checker() {
      return this.total_links.filter(link => {
        return link.source.constructor === String && link.target.constructor === String
      }).length
    },
  },
  methods: {
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
    computeEventual_nodes() {
      var self = this
      var nodes = this.total_nodes.filter(node => node.cdpScore >= this.cdpScore_threshold)
      return nodes
    },
    computeEventual_links(nodes) {
      var self = this;
      var links = this.copyNestedObject(self.total_links).filter(link => nodes.map(node => node.paperId).includes(link.source) && nodes.map(node => node.paperId).includes(link.target))
      for (let i = 0; i < links.length; i++) {
        self.adjlist[links[i].source + "-" + links[i].target] = true;
        self.adjlist[links[i].target + "-" + links[i].source] = true;
      }
      return links
    },
    addCircle() {
      this.graph.nodes.push({
        id: '45454545454',
        'cdpScore': 124,
        x: this.graph.nodes[0].x,
        y: this.graph.nodes[0].y,
        citations: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      })
    },
    updateNodes() {
      console.log("Update nodes")
      var self = this
      this.total_links_2.forEach((link, i) => {
        this.total_links[i] = Object.assign({}, link)
      })
      var nodes = [...this.computeEventual_nodes()]
      console.log("Updated nodes")
      var links = [...this.computeEventual_links(nodes)]
      console.log("Updated links")
      Vue.set(self.graph,'nodes',nodes)
      Vue.set(self.graph,'links',links)
      // this.graph = {
      //   nodes: nodes,
      //   links: links
      // }
    }
  },
  mounted() {
    var self = this;
    setTimeout(()=>{self.updateNodes();self.draw = true},3000)
    var self = this;
    console.log("Launching stuff")
    this.nodes.forEach(node => {
      this.addNode(node);
    })
    this.socket.on('done', () => {
      console.log("RECEIVED ALL")
    })
    this.socket.on('new_node', (data) => {
      this.addNode(data)
    })
  },

}
</script>

<style>
</style>
