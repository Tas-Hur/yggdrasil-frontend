<template>
<b-row class="filter_section">

  <b-col class="advanced_group" cols="auto">
    <transition>
      <div v-show="display_venue_filter" class="venue_filter">
        <b-button @click="display_venue_filter=false">X</b-button>
        Journaux à afficher
        <vue-multiselect :showLabels="true" deselectLabel="remove" :close-on-select="false" selectLabel="select" :multiple="true"
          @close="sendVenues"
          v-model="only_venues" :options="venues" />
        <b-button @click="resetVenues">reset</b-button>
      </div>
    </transition>
  </b-col>

  <b-col class="input_groups" cols="auto">

    <div class="inputs_group">
      <b-col @click="resetSearch" class="custom-btn text-right" cols="12">
        <img class="png_icon" src="animated_logo_load.svg" />
      </b-col>
    </div>

    <div class="inputs_group">
      <b-col class="custom-btn text-right" cols="12">
        <font-awesome-icon class="svg_icon" icon="info" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
      </b-col>
      <b-col class="sliders infos" cols="auto">
        Le graph comporte <span class="imp_text">{{total_nodes_loaded}}</span> noeuds et <span class="imp_text">{{total_links_loaded}}</span> liens
        <br />
        Au total <span class="imp_text">{{total_nodes}}</span> noeuds et <span class="imp_text">{{total_links}}</span> sont chargés
        <br />

      </b-col>
    </div>

    <div class="inputs_group">
      <b-col class="custom-btn text-right" cols="12">
        <font-awesome-icon class="svg_icon" icon="cog" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
      </b-col>
      <b-col class="sliders display" cols="auto">
        Charge : {{node_charge}}
        <vue-slider class="slider" v-model="node_charge"
          tooltipPlacement="bottom" direction="rtl"
          :min="-15000" :max="0" :contained="true" />
        <br />
        Distance : {{distance_nodes}}
        <vue-slider class="slider" v-model="distance_nodes"
          :min="0" :max="1000" :contained="true" />
        <br />
        Afficher les titres :
        <br />
        <toggle-button v-model="disp_titles"
          :color="mainColor"
          @change="$emit('disp_titles', disp_titles)" />
        <br />
        Activer les dégradés pour les liens :
        <br />
        <toggle-button v-model="gradient_links"
          :color="mainColor"
          @change="$emit('gradient_links', gradient_links)" />
        <br />
        <!-- Graph alternatif (plus rapide) :
        <br />
        <toggle-button v-model="alternative"
        :color="mainColor"
        @change="$emit('alternative', alternative)" />
        <br /> -->
        N'afficher que les voisins du noeud actif :
        <br />
        <toggle-button v-model="only_adj"
          :color="mainColor"
          @change="$emit('only_adj', only_adj)" />
        <!-- <b-button @click="addCircle">
        Add Node
      </b-button> -->
      </b-col>
    </div>

    <div class="inputs_group">
      <b-col class="custom-btn text-right" cols="12">
        <font-awesome-icon class="svg_icon" icon="filter" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
      </b-col>
      <b-col class="sliders filters" cols="auto">
        Nombre de citations minimal : {{citations_threshold}}
        <vue-slider class="slider" v-model="citations_threshold"
          tooltipPlacement="bottom" :min="0" :max="1000" :contained="true"
          @drag-end="$emit('citations', citations_threshold)" />
        <br />
        Cdp Score mini : {{cdpScore_threshold}}
        <vue-slider class="slider" v-model="cdpScore_threshold"
          tooltipPlacement="bottom" :min="0" :max="50" :contained="true"
          @drag-end="$emit('cdp', cdpScore_threshold)" />
        <br />
        Dates limites :
        <vue-slider v-if="dates_extrem.start < dates_extrem.end"
          :min="dates_extrem.start" :max="dates_extrem.end" :value="dates_filter" :contained="true"
          @drag-end="sendDates" @change="changeDates">
        </vue-slider>
        <br />
        Mots clés :
        <input type=" text" value=""
          @change="sendKeyWords" />
        <br />
        <br />
        Favoris seulement :
        <br />
        <toggle-button v-model="favorites"
          :color="mainColor"
          @change="$emit('favorites', favorites)" />
        <br />
        <br />
        <b-button v-b-modal="'journaux-modal'" @click="display_venue_filter=true">
          Journaux (dev)
        </b-button>
      </b-col>
    </div>

    <div class="inputs_group">
      <b-col class="custom-btn text-right" cols="12">
        <font-awesome-icon class="svg_icon" icon="briefcase"
          @mouseleave="reduceSettings" @mouseenter="displaySettings" />
      </b-col>
      <b-col class="sliders lists" cols="auto">
        <ul>
          Favoris
          <li v-for="n in fav_nodes">
            {{n.title}}
          </li>
        </ul>

        <ul>
          Corbeille
          <li v-for="n in trash_nodes">
            {{n.title}}
          </li>
        </ul>
      </b-col>
    </div>

    <div class="inputs_group">
      <b-col class="custom-btn text-right" cols="12">
        <font-awesome-icon class="svg_icon" icon="sync"
          @click="refreshGraph" />
        <div class="new_nodes_notif" v-if="new_nodes.length != 0">
          {{new_nodes.length}}
        </div>
      </b-col>
    </div>

  </b-col>


</b-row>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'

export default {
  name: 'display-settings',
  props: {
    total_nodes: Number,
    total_nodes_loaded: Number,
    total_links: Number,
    total_links_loaded: Number,
    venues: Array,
    new_nodes: Array,
    dates_filter: Array,
    dates_extrem: Object,
    fav_nodes: Array,
    trash_nodes: Array,
    key_word: String
  },
  components: {
    VueSlider
  },
  data() {
    return {
      width: '2em',
      height: '2em',
      display_venue_filter: false,
      hovered: false,
      node_charge: -6000,
      cdpScore_threshold: 5,
      distance_nodes: 150,
      dates_buffer: [],
      favorites: false,
      citations_threshold: 5,
      only_adj: false,
      only_venues: [],
      disp_titles: true,
      alternative: true,
      gradient_links: true,
    }
  },
  computed: {
    computed_style() {
      return {
        width: this.width,
        height: this.height
      }
    }
  },
  methods: {
    refreshGraph() {
      this.$emit('refresh_graph')
    },
    reduceSettings() {
      // this.width = "2em";
      // this.height = "2em";
      this.hovered = false;
    },
    displaySettings() {
      // this.width = '20vw'
      // this.height = "30020vh";
      this.hovered = true;
    },
    resetVenues() {
      this.only_venues = [];
      this.sendVenues();
    },
    updateNodes() {},
    hover() {
      this.hovered = !this.hovered
    },
    sendKeyWords(e) {
      this.$emit('key_words', e.target.value)
    },
    changeDates(e) {
      this.dates_buffer = e
    },
    sendDates() {
      this.$emit('dates', this.dates_buffer)
    },
    sendVenues() {
      console.log("Venues ", this.only_venues);
      this.$emit('venues', this.only_venues);
    },
    resetSearch(){
      console.log("Called")
      var self = this
      this.$bvModal.msgBoxConfirm('Êtes vous sûr·e de vouloir relancer une recherche ?\n Ce graph sera perdu.', {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'danger',
          title: 'Êtes vous sûr·e ?',
          okTitle: 'Relancer',
          cancelTitle: 'Annuler',
          footerClass: 'p-2',
          hideHeader: false,
          centered: true
        })
        .then(value => {
          if (value) {
            this.$emit('reset_search')
          }
        })
        .catch(err => {
          console.log(err)
          // An error occurred
        })
    }
  },
  watch: {
    new_nodes() {
      var self = this
      this.new_node_alert = true;
      // setTimeout(()=>{self.new_node_alert = false},1000)
    },
    node_charge() {
      this.$emit('charge', this.node_charge)
    },
    distance_nodes() {
      this.$emit('distance', this.distance_nodes)
    },
  }
}
</script>

<style scoped>
.filter_section {
  background-color: rgba(255, 255, 255, 0.5);

}

.advanced_group {
  max-width: 300px;
}

.png_icon {
  height: 2.4em;
  width: 2.4em;
  transition: color ease-in-out .2s;
  border-radius: 1000px;
  cursor: normal;
  transition: all ease-in-out .2s;
}

.png_icon:hover {
  cursor: pointer;
}

.svg_icon {
  height: 2em;
  width: 2em;
  padding: 0.5em;
  border: 1px solid var(--main-color);
  border-radius: 100px;
  transition: color ease-in-out .2s;
  cursor: normal;
}

.svg_icon:hover {
  background-color: var(--main-color);
  color: white;
  transition: color ease-in-out .2s;
}

.custom-btn {
  height: 100%;
  padding: 0;
  width: 100%;
  vertical-align: middle;
}

.sliders {
  opacity: 0;
  width: 0;
  padding-left: 30px;
  padding-right: 30px;
  max-height: 0;
  overflow: hidden;
  transition: all ease-in-out .2s;
}

.sliders:hover {
  /* background-color: white; */
  opacity: 1;
  width: 260px;
  transition: all ease-in-out .2s;
}

.new_nodes_notif {
  position: fixed;
  right: 5em;

  font-size: 80%;
  text-align: center;
  font-weight: bold;
  color: white;

  border: 1px solid var(--green-color);
  border-radius: 100px;

  margin-top: -1em;
  padding: 3px;
  width: 2em;
  height: 2em;

  background-color: var(--green-color);
}

.sliders:hover .svg_icon {
  /* background-color: white; */
  opacity: 1;
  transition: all ease-in-out .2s;
}

.green_text {
  color: var(--green-color);
}

.sliders.infos:hover{
  max-height: 8em;
}

.sliders.display:hover {
  max-height: 27em;
}

.sliders.filters:hover {
  max-height: 27em;
}

.custom-btn:hover+.sliders {
  opacity: 1;
  width: 260px;
  max-height: 27em;
  transition: all ease-in-out .2s;
}

.inputs_group {
  margin-bottom: 2em;
}

.imp_text {
  color: var(--green-color);
}
</style>
