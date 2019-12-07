<template>
<div>
  <custom-tooltip id="infoBoxHolder" v-show="hovered_node !== null" :node_settings="node_settings" :position="hovered_node_location" :node="this.hovered_node"
                  @favorite="makeFavorite" @trash="deleteNode" @new_search="newSearch">
  </custom-tooltip>


  <!-- <tree-v3 v-if="draw && choice"
           :node_charge="parseInt(node_charge)"
           :cdpScore_threshold="parseInt(cdpScore_threshold)"
           :disp_titles="disp_titles" :distance_nodes="parseInt(distance_nodes)" :gradient_links="gradient_links" :draw_lines="true"
           :adjlist="adjlist" :graph_original="graph"
           @hover_node="setHoveredNode">
  </tree-v3> -->

  <tree-v2 v-if="draw && !choice"
           :node_charge="parseInt(node_charge)"
           :cdpScore_threshold="parseInt(cdpScore_threshold)"
           :disp_titles="disp_titles" :distance_nodes="parseInt(distance_nodes)" :gradient_links="gradient_links" :draw_lines="true"
           :adjlist="adjlist" :graph_original="graph"
           @hover_node="setHoveredNode">
  </tree-v2>

  <tree-canvas v-if="draw && choice"
               :node_charge="parseInt(node_charge)" :disp_titles="disp_titles" :distance_nodes="parseInt(distance_nodes)"
               :adjlist="adjlist" :graph_original="graph" :cdpScore_threshold="parseInt(cdpScore_threshold)" :gradient_links="gradient_links"
               @hover_node="setHoveredNode">
  </tree-canvas>

  <!-- <tree-d3 :socket="socket" :nodes="nodes"
           @hover_node="setHoveredNode">
  </tree-d3> -->


  <div class="full-container">
    <b-row align-h="center">
      <b-col cols="auto">
        <template v-if="graph !== null">
          Le graph comporte <span class="imp_text">{{graph.nodes.length}}</span> noeuds et <span class="imp_text">{{graph.links.length}}</span> liens
          <br  />
          Au total <span class="imp_text">{{total_nodes.length}}</span> noeuds et <span class="imp_text">{{total_links.length}}</span> sont chargés
        </template>
      </b-col>
    </b-row>
  </div>
  <div class="custom-container">
    <b-row align-h="end">
      <!-- <b-col cols="8">
        Cliquer <span class="link" @click="search">ici</span> pour relancer une recherche
        <br />
        Cliquer <span class="link" @click="addNode">ici</span> pour ajouter un noeud
        <br />
        <template v-if="graph !== null">
          Il y a {{graph.nodes.length}} noeuds et {{graph.links.length}} liens
        </template>
      </b-col> -->
      <b-col cols="auto">
        <display-settings :dates_extrem="dates_extrem" :dates_filter="dates_filter_array" :fav_nodes="favorites" :trash_nodes="trash"
                          :new_nodes="waiting_nodes"
                          @charge="setCharge" @disp_titles="setDispTitles" @distance="setDistance" @gradient_links="setGradientLinks"
                          @dates="setDates" @key_words="setKeyWords" @alternative="setAlternative" @only_adj="setOnlyAdj"
                          @cdp="setCdp" @favorites="setFavorites" @citations="setCitations"
                          @refresh_graph="updateNodes">
        </display-settings>
      </b-col>
    </b-row>
  </div>

  <b-modal id="delete-modal" hide-header>
    Êtes vous sûrs de vouloir supprimer ce noeud ? Il sera déplacé dans la corbeille et pourra être restauré à tout moment.
  </b-modal>
</div>
</template>

<script>
import DisplaySettings from './DisplaySettings.vue'
import CustomTooltip from './CustomTooltip.vue'
import TreeV2 from './TreeV2.vue'
import TreeV3 from './TreeV3.vue'
import TreeCanvas from './TreeCanvas.vue'
import Vue from 'vue'
export default {
  name: 'graph-overlay',
  components: {
    TreeV2,
    TreeV3,
    CustomTooltip,
    DisplaySettings,
    TreeCanvas
  },
  props: {
    socket: Object
  },
  data() {
    return {
      trash: [],
      choice: !false,
      favorites: [],
      draw: false,
      waiting_nodes: [],
      total_nodes: [],
      total_links: [],
      adjlist: {},
      graph: {
        nodes: [],
        links: []
      },
      hovered_node: null,
      disp_titles: true,
      gradient_links: true,
      node_charge: -3000,
      distance_nodes: 100,

      only_adj: false,
      key_words: [],
      citations_threshold: 5,
      dates_filter: null,
      cdpScore_threshold: 5,
      favorites_only: false,

      hovered_node_location: {
        F: -25,
        G: 100
      },
      node_settings: {
        diameter: 20
      },
    }
  },
  computed: {
    links_checker() {
      return this.total_links.filter(link => {
        return link.source.constructor === String && link.target.constructor === String
      }).length
    },
    dates_extrem() {
      var dates = this.total_nodes.map(n => parseInt(n.year)).filter(date => !isNaN(date))
      return {
        start: Math.min(...dates),
        end: Math.max(...dates)
      }
    },
    dates_filter_array() {
      var ret
      if (this.dates_filter === null) {
        ret = [this.dates_extrem.start, this.dates_extrem.end]
      } else {
        ret = [this.dates_filter.start, this.dates_filter.end]
      }
      return ret
    }
  },
  methods: {
    newSearch(paperId){
      console.log("new search ",paperId)
      this.$emit('new_search', {request_type:'paper_id', request:paperId})
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
    addNode(node) {
      var self = this
      node.id = node.paperId
      node.color = 'white'
      node.references.forEach(ref => {
        if (self.total_nodes.map(node => node.id).includes(ref.paperId)) {
          let link = {
            source: ref.paperId,
            target: node.paperId,
            value: 1,
            identifier: node.paperId+'-'+ref.paperId
          }
          if (!(self.total_links.map(l => l.identifier).includes(link.identifier) || self.total_links.map(l => l.identifier).includes(ref.paperId+'-'+node.paperId)) ) {
            self.total_links.push(link)
          }else{
          }
        }
      })
      node.citations.forEach(cit => {
        if (self.total_nodes.map(node => node.key).includes(cit.paperId)) {
          let link = {
            source: node.paperId,
            target: cit.paperId,
            value: 1,
            identifier: node.paperId+'-'+cit.paperId
          }
          if (!(self.total_links.map(l => l.identifier).includes(link.identifier) || self.total_links.map(l => l.identifier).includes(cit.paperId+'-'+node.paperId)) ) {
            self.total_links.push(link)
          }else{
          }
        }
      })
      node.id = node.paperId
      node.group = Math.round(node.citations.length / 100)
      if (!self.total_nodes.map(nod => nod.paperId).includes(node.paperId) && node.paperId != null && node.paperId !== undefined) {
        self.total_nodes.push(node);
        self.waiting_nodes.push(node);
      }else{
      }
    },
    deleteNode() {
      var self = this
      this.$bvModal.msgBoxConfirm('Êtes vous sûrs de vouloir supprimer ce noeud ?\n Il sera déplacé dans la corbeille et pourra être restauré à tout moment.', {
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'Supprmier',
        cancelTitle: 'Annuler',
        footerClass: 'p-2',
        hideHeader: true,
        centered: true
      })
      .then(value => {
        if (value) {
          console.log("delete")

          self.trash.push(self.copyNestedObject(self.hovered_node))
          console.log(self.total_nodes)
          let index = self.total_nodes.findIndex(n => n.id == self.hovered_node.id)
          self.total_nodes.splice(index, 1)
          console.log("post thing", self.total_nodes)
          index = self.graph.nodes.findIndex(n => n.id == self.hovered_node.id)
          self.updateNodes();
          self.hovered_node = null
        }
      })
      .catch(err => {
        console.log(err)
        // An error occurred
      })
    },
    computeEventual_nodes() {
      var self = this
      if(this.hovered_node !== null){
        console.log(this.hovered_node)
        console.log(this.hovered_node.citations)
      }
      var nodes = this.total_nodes.filter(node => {
        var filt = true
        var kw = true
        var dates = true
        var score = false
        var adj = true
        var citations = false

        if(self.only_adj){
          if(self.hovered_node.id !== node.id && !self.hovered_node.citations.map(cit => cit.paperId).includes(node.id)){
            adj = false
          }
        }

        if (this.favorites_only && !node.favorite) {
          filt = false
        }

        if (self.dates_filter !== null && !(self.dates_filter.end >= node.year && self.dates_filter.start <= node.year)) {
          dates = false
        }

        if(node.citations.length >= self.citations_threshold){
          citations = true
        }

        if (this.key_words.length > 0) {
          kw = false
          for (let i = 0; i < this.key_words.length; i++) {
            if (node.title.toUpperCase().includes(this.key_words[i].toUpperCase())) {
              kw = true;
              break;
            }
          }
        }

        if (node.cdpScore == null || node.cdpScore == undefined) {
          node.cdpScore = 0
        }

        if (node.cdpScore >= self.cdpScore_threshold) {
          score = true
        }

        return citations && adj && dates && kw && filt && score
      })
      return nodes
    },
    computeEventual_links(nodes) {
      var self = this;

      var links = this.copyNestedObject(self.total_links).filter(link => nodes.map(node => node.paperId).includes(link.source) && nodes.map(node => node.paperId).includes(link.target))
      for (let i = 0; i < links.length; i++) {
        self.adjlist[links[i].source + "-" + links[i].target] = true;
        self.adjlist[links[i].target + "-" + links[i].source] = true;
      }
      Vue.set(self, 'adjlist', self.adjlist);
      return links
    },
    updateNodes(reset) {
      if (reset) {
        this.graph = {
          nodes: [],
          links: []
        }
      }
      console.log("Update nodes")
      var self = this
      var nodes = [...this.computeEventual_nodes()]
      console.log("Updated nodes")
      var links = [...this.computeEventual_links(nodes)]
      console.log("Updated links")
      this.waiting_nodes = []
      Vue.set(self.graph, 'nodes', nodes)
      Vue.set(self.graph, 'links', links)
    },
    makeFavorite(bool) {
      var self = this;
      if (bool) {
        this.favorites.push(this.hovered_node)
      } else {
        let i = this.favorites.findIndex(n => this.hovered_node.id == n.id)
        this.favorites.splice(i, 1)
      }
      this.hovered_node.favorite = bool;

      this.hovered_node = Object.assign({}, this.hovered_node)
      let index = this.total_nodes.findIndex(n => n.id == self.hovered_node.id)
      this.total_nodes[index].favorite = bool;
      index = this.graph.nodes.findIndex(n => n.id == self.hovered_node.id)
      this.graph.nodes[index].favorite = bool
    },
    search() {
      this.$emit('search')
    },
    setHoveredNode(d) {
      this.hovered_node = d;
    },
    setCharge(charge) {
      this.node_charge = charge;
    },
    setCdp(cdp) {
      this.cdpScore_threshold = cdp;
      this.updateNodes()
    },
    setDistance(distance) {
      this.distance_nodes = distance;
    },
    setFavorites(fav) {
      console.log("Je veux set les favoris : ", fav)
      this.favorites_only = fav
      this.updateNodes();
    },
    setDispTitles(disp_titles) {
      this.disp_titles = disp_titles
    },
    setKeyWords(str) {
      if (str === "") {
        this.key_words = [];
      } else {
        this.key_words = [...str.split(" ")]
      }
      this.updateNodes();
    },
    setDates(dates) {
      this.dates_filter = {
        start: dates[0],
        end: dates[1]
      }
      this.updateNodes()
    },
    setGradientLinks(gradient_links) {
      this.gradient_links = gradient_links;
    },
    setAlternative(choice) {
      this.choice = choice
      this.updateNodes(true)
    },
    setOnlyAdj(choice) {
      this.only_adj = choice
      this.updateNodes()
    },
    setCitations(citations){
      console.log("Citations threshold : ", citations)
      this.citations_threshold = citations;
      this.updateNodes()
    }
  },
  mounted() {
    var self = this;
    setTimeout(() => {
      self.updateNodes();
      self.draw = true
    }, 3000)
    var self = this;
    console.log("Launching stuff")
    this.socket.on('done', () => {
      console.log("RECEIVED ALL")
    })
    this.socket.on('new_node', (data) => {
      console.log("receive node")
      this.addNode(data)
    })
  },

}
</script>

<style scoped>
.imp_text {
  color: var(--green-color);
}

.full-container {
  position: fixed;
  z-index: 100;
  top: 50px;
  width: 100vw;
}

.custom-container {
  position: fixed;
  z-index: 500;
  right: 50px;
  top: 50px;
  width: auto;
}

.custom-container {
  position: fixed;
  z-index: 500;
  right: 50px;
  top: 50px;
  width: auto;
}

#infoBoxHolder {
  z-index: 300;
  position: fixed;
}
</style>
