<template>
<div>
  <div class="inputs_group">
    <b-col class="custom-btn text-right" cols="12">
      <font-awesome-icon class="svg_icon" icon="cog" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
    </b-col>
    <b-col class="sliders display" cols="auto">
      Charge : {{node_charge}}<input type="range" min="-100000" max="0" v-model="node_charge" class="slider" id="myRange" />
      <br />
      Distance : {{distance_nodes}}<input @change="$emit('distance', distance_nodes)" type="range" min="0" max="1000" v-model="distance_nodes" class="slider" />
      <br />
      Afficher les titres :
      <input @change="$emit('disp_titles', disp_titles)" type="checkbox" v-model="disp_titles" />
      <br />
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
      Cdp Score mini : {{cdpScore_threshold}}<input @change="$emit('cdp', cdpScore_threshold)" type="range" min="0" max="200" v-model="cdpScore_threshold" class="slider" />
      <br />
      Favoris seulement :
      <input @change="$emit('favorites', favorites)" type="checkbox" v-model="favorites" />
      <br />
      Mots clés :
      <input @change="sendKeyWords" type="text" value="" />
      Dates limites :
        <vue-slider @change="sendDates" v-if="dates_extrem.start < dates_extrem.end" :min="dates_extrem.start" :max="dates_extrem.end" :value="dates_filter">
        </vue-slider>
      <!-- <b-button @click="addCircle">
        Add Node
      </b-button> -->
    </b-col>
  </div>

  <div class="inputs_group">
    <b-col class="custom-btn text-right" cols="12">
      <font-awesome-icon class="svg_icon" icon="briefcase" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
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
      <!-- <b-button @click="addCircle">
        Add Node
      </b-button> -->
    </b-col>
  </div>

</div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'
export default {
  name: 'display-settings',
  props: {
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
      hovered: false,
      node_charge: -6000,
      cdpScore_threshold: 5,
      dates_filter: [],
      distance_nodes: 150,
      dates_filter:[],
      favorites: false,
      disp_titles: true,
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
    reduceSettings() {
      // this.width = "2em";
      // this.height = "2em";
      this.hovered = false;
    },
    displaySettings() {
      console.log("Ho");
      // this.width = '20vw'
      // this.height = "20vh";
      this.hovered = true;
    },
    updateNodes() {
      console.log("Hn")
    },
    hover() {
      console.log("HOVER")
      this.hovered = !this.hovered
    },
    sendKeyWords(e) {
      console.log(e.target.value)
      this.$emit('key_words', e.target.value)
    },
    sendDates(e){
      console.log(e)
      this.$emit('dates', e)
    }
  },
  mounted(){
    this.dates_filter = [this.dates_extrem.start, this.dates_extrem.end]
  },
  watch: {
    node_charge() {
      this.$emit('charge', this.node_charge)
    },
    distance_nodes() {
      this.$emit('distance', this.distance_nodes)
    },
    dates_extrem(){
      console.log(this.dates_extrem)
    }
  }
}
</script>

<style scoped>
.svg_icon {
  height: 2em;
  width: 2em;
  padding: 0.5em;
  border: 1px solid var(--main-color);
  border-radius: 100px;
}

.custom-btn {
  height: 100%;
  padding: 0;
  width: 100%;
  vertical-align: middle;
}

.sliders {
  /* background-color: white; */
  opacity: 0;
  width: 0;
  max-height: 0;
  overflow: hidden;
  transition: all ease-in-out .2s;
}

.sliders.display:hover {
  opacity: 1;
  width: 230px;
  max-height: 10em;
  transition: all ease-in-out .2s;
}

.sliders.filters:hover {
  opacity: 1;
  width: 230px;
  max-height: 13em;
  transition: all ease-in-out .2s;
}

.inputs_group {
  margin-bottom: 2em;
}


.custom-btn:hover+.sliders {
  opacity: 1;
  width: 230px;
  max-height: 13em;
  transition: all ease-in-out .2s;
}
</style>
