<template>
  <div class="df-wrapper">
    <o-tooltip multiline size="large" :teleport="true">
      <template v-slot:content>
        <DFTooltip :df="df" />
      </template>
      <figure class="image is-32x32 is-df">
        <img :src="'./img/items/' + df.icon + '.png'" @error="handleImageError">
      </figure>
    </o-tooltip>
  </div>
</template>

<script>
import DFTooltip from "@/components/df/DFTooltip.vue";

export default {
  name: 'Demon Force Items',
  components: {
    DFTooltip
  },
  methods: {
    handleImageError(event) {
      event.target.src = './img/Default.png';
    }
  },
  props: {
    df: {
      type: Object,
      required: true,
    },
  }
}
</script>

<style lang="scss" scoped>
.df-wrapper {
  margin: 0px 0.2em;
  display: inline-block;
}

.is-df {
  margin: 0px;
  padding: 0px;
}

.o-tip__content {
  padding: 5px;

  .subtitle {
    color: #e6e6e6;
    vertical-align: center;
    text-align: left;
  }

  img {
    vertical-align: middle;
  }
}
</style>