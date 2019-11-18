<template>
<div>
  <div class="inputs_group">
    <b-col class="custom-btn text-right" cols="12">
      <font-awesome-icon class="svg_icon" icon="cog" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
    </b-col>
    <b-col class="sliders display" cols="auto">
      Charge : {{node_charge}}
      <vue-slider class="slider" v-model="node_charge"
                  tooltipPlacement="bottom" direction="rtl"
                  :min="-100000" :max="0" :contained="true" />
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
      Cdp Score mini : {{cdpScore_threshold}}
      <vue-slider class="slider" v-model="cdpScore_threshold"
                  tooltipPlacement="bottom" :min="0" :max="200" :contained="true"
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
      Favoris seulement :
      <br />
      <toggle-button v-model="favorites"
                     :color="mainColor"
                     @change="$emit('favorites', favorites)" />
      <br />
      <!-- <b-button @click="addCircle">
        Add Node
      </b-button> -->
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
      hovered: false,
      node_charge: -6000,
      cdpScore_threshold: 5,
      distance_nodes: 150,
      dates_buffer: [],
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
      // this.width = '20vw'
      // this.height = "20vh";
      this.hovered = true;
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
    }
  },
  watch: {
    node_charge() {
      this.$emit('charge', this.node_charge)
    },
    distance_nodes() {
      this.$emit('distance', this.distance_nodes)
    },
    dates_filter() {}
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


.sliders.display:hover {
  max-height: 12em;
}

.sliders.filters:hover {
  max-height: 15em;
}

.custom-btn:hover+.sliders {
  opacity: 1;
  width: 260px;
  max-height: 15em;
  transition: all ease-in-out .2s;
}

.inputs_group {
  margin-bottom: 2em;
}
</style>
