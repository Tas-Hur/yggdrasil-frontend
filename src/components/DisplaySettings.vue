<template>
<div>

  <font-awesome-icon class="custom-btn" icon="cog" @mouseleave="reduceSettings" @mouseenter="displaySettings" />
  <transition name="inflate">
    <div id="display-settings" @mouseleave="reduceSettings">
      <b-row v-if="hovered" align-h="center">
        <b-col cols="auto" class="sliders">
          Charge : <input type="range" min="-100000" max="0" v-model="node_charge" class="slider" id="myRange" />{{node_charge}}
          <br />
          Distance : <input type="range" min="0" max="1000" v-model="distance_nodes" class="slider" />{{distance_nodes}}
          <br />
          CdP score : <input @change="updateNodes" type="range" min="0" max="200" v-model="cdpScore_threshold" class="slider" />{{cdpScore_threshold}}
          <br />
          <!-- <b-button @click="addCircle">
            Add Node
          </b-button> -->
        </b-col>
      </b-row>
    </div>
  </transition>
</div>
</template>

<script>
export default {
  name: 'display-settings',
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
  data() {
    return {
      width: '2em',
      height: '2em',
      hovered: false,
      node_charge: -6000,
      cdpScore_threshold: 5,
      distance_nodes: 150,
    }
  }
}
</script>

<style scoped>
.custom-btn {
  height: 100%;
  vertical-align: middle;
}

/* .sliders {
  opacity: 0;
  width: 0;
  height: 0;
} */


.inflate-enter {
  opacity: 0;
}

.inflate-leave-active {
  opacity: 0;
}

.inflate-enter .sliders,
.inflate-leave-active .sliders {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

#display-settings {
  padding: 0;
  height:20px;
  width:20px;
  margin-right: 20px;
  border: 1px solid var(--main-color);
  margin-top: 20px;
}

#display-settings:hover {
  width:200px;
  /* -webkit-transform: scale(2);
  transform: scale(2); */
  transition:width ease-in-out .5s;
}
</style>
