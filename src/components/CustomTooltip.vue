<template>
<div v-if="node !== null" :style="positionStyleCursor">
  <!-- <div class="arrow-tooltip" :style="arrowStyle">
    </div> -->
  <div id="infoBox" :style="sizingStyle">
    <h5>
      <font-awesome-icon @click="setFavorite" class="svg_icon star" :style="star_style" icon="star" />
      {{node.title}}
    </h5>
    <font-awesome-icon @click="trashNode" class="svg_icon star" :color="redColor" icon="trash" />
    supprimer ce noeud du graph
    <br />
    <font-awesome-icon @click="newSearch" class="svg_icon star" :color="greenColor" icon="play-circle" />
    relancer une recherche à partir de ce noeud
    <br />
    <b>
      DOI :
    </b>
    {{node.doi}}
    <br />
    <span class="full_text">
      <b>
        Abstract :
      </b>
      {{node.abstract}}
    </span>
    <br />
    <b>
      Authors :
    </b>
      <ul>
        <li v-for="author in node.authors">
          {{author.name}}
        </li>
      </ul>
    <b>
      Year :
    </b>
    {{node.year}}
    <br />
    <b>
      Cited by :
    </b>
    <template v-if="'citations' in node">
      {{node.citations.length}}
    </template>
    <br />
    <b>
      CdP Score :
    </b>
    {{node.cdpScore}}
    <br />
    <b>
      Appeared in :
    </b>
    <template v-if="node.venue !== ''">
      {{node.venue}}
    </template>
    <template v-else>
      N/A
    </template>
    <br />
    <p class="url">
      <b>
        URL :
      </b>
      <a :href="node.url">{{node.url}}</a>
    </p>
    {{Object.keys(node)}}
  </div>
</div>
</template>

<script>
export default {
  name: "custom-tooltip",
  props: {
    position: {
      type: Object,
      default: {
        F: -25,
        G: 75
      },
    },
    node_settings: Object,
    tooltipWidth: {
      type: String,
      default: '25vw',
    },
    node: {
      type: Object,
      default: {
        title: "",
        abstract: ""
      }
    },
  },
  data() {
    return {
      total_width: 0,
    }
  },
  computed: {
    star_style() {
      let style = {}
      this.node.favorite ? style = {
        color: this.greenColor
      } : style = {
        opacity: 0.2
      }
      return style
    },
    arrowStyle() {
      if (this.position.F + this.node_settings.diameter / 2 > this.total_width / 2) {
        return {
          boxShadow: '5px -5px 10px 0.1px rgba(10,10,10,0.1)',
          left: 0.2 * this.total_width - 10 + 'px'
        }
      } else {
        return {
          boxShadow: '-5px 5px 10px 0.1px rgba(10,10,10,0.1)',
          left: '-10px'
        }
      }

    },
    sizingStyle() {
      return {
        width: this.tooltipWidth
      }
    },
    positionStyleCursor() {
      if (this.position.F + this.node_settings.diameter / 2 > this.total_width / 2) {
        return {
          left: this.position.F - 0.2 * this.total_width - 50 + "px",
          top: this.position.G - 65 + "px"
        }
      } else {
        return {
          left: this.position.F + 50 + "px",
          top: this.position.G - 65 + "px"
        }
      }
    },
    positionStyleNode() {
      if (this.position.F + this.node_settings.diameter / 2 > this.total_width / 2) {
        return {
          left: this.position.F - 0.2 * this.total_width - 30 + "px",
          top: this.position.G + "px"
        }
      } else {
        return {
          left: this.position.F + this.node_settings.diameter + 30 + "px",
          top: this.position.G + "px"
        }
      }
    }
  },
  methods: {
    trashNode() {
      this.$emit('trash')
    },
    newSearch() {
      console.log("node : ", this.node)
      this.$emit('new_search',this.node.id)
    },
    setFavorite() {
      this.$emit('favorite', !this.node.favorite)
    }
  },
  mounted() {
    var self = this;
    this.total_width = window.innerWidth
    window.addEventListener('resize', () => {
      this.total_width = window.innerWidth
    });
  },
  watch: {
    node() {
      console.log("node refreshed");
    }
  }
}
</script>

<style scoped>
.arrow-tooltip {
  z-index: 350;
  transform: rotate(45deg);
  background-color: white;
  position: relative;
  top: 50px;
  height: 20px;
  width: 20px;
}

#infoBox {
  z-index: 300;
  padding: 15px;
  border-radius: 5px;
  background-color: white;
  text-align: justify;
  position: fixed;
  max-height: 90vh;

  /* white-space: nowrap; */
  color: gray;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 90%;
  /* box-shadow: 0 0 10px 1px rgba(10,10,10,0.1); */
  overflow-y: scroll;
}

/* this is known as the "clearfix" hack to allow
floated objects to add to the height of a div */
#infoBox:after {
  visibility: hidden;
  display: block;
  font-size: 0;
  content: " ";
  clear: both;
  height: 0;
}

.url {
  text-align: left;
}

.svg_icon.star {
  cursor: pointer;
}

.full_text {
  white-space: normal;
  height: 2em;
  overflow: hidden;
}
</style>
