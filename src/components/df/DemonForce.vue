<template>
  <div class="df-wrapper">
    <v-popper contentClass="v-popper__popper">
      <template #reference>
        <figure class="image is-32x32 is-df">
          <img :src="'./img/items/' + df.icon + '.png'" @error="handleImageError" />
        </figure>
      </template>
      <template #default>
        <DFTooltip :df="df" />
      </template>
    </v-popper>
  </div>
</template>

<script>
import { Popper } from "vue-popper-lite";
import "vue-popper-lite/style.css";
import DFTooltip from "@/components/df/DFTooltip.vue";

export default {
  name: "Demon Force Item",
  components: {
    DFTooltip,
    VPopper: Popper,
  },
  methods: {
    handleImageError(event) {
      event.target.src = "./img/Default.png";
    },
  },
  props: {
    df: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
.v-popper__popper {
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 999999 !important;
}
</style>