<script setup>
import { computed } from 'vue'
import dataService from "@/services/dataService.js";
import { useRoute } from 'vue-router'
const route = useRoute();

const props = defineProps({
  expertise: {
    type: Object,
  },
  options: {
    type: Object,
  }
})

const emit = defineEmits(['copy'])

const link = computed(() => {
  let baseUrl = window.location.origin + route.path;
  let params = dataService.toExpertiseQueryParams(props.expertise, props.options);
  if (params !== "") {
    return baseUrl + "?" + params.toString();
  } else {
    return baseUrl;
  }
})

function copy() {
  navigator.clipboard.writeText(link.value);
  emit('close')
  emit('copy')
}

</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Share Your Build</p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field label="Click to Copy to Clipboard">
        <o-input @click="copy" maxlength="200" type="textarea" class="is-fullwidth" style="resize:none; cursor:crosshair !important;" v-model="link"></o-input>
      </o-field>
    </section>
    <footer class="modal-card-foot">
      <o-button type="button" variant="primary" class="is-fullwidth" @click="$emit('close')">Close</o-button>
    </footer>
  </div>
</template>


<style lang="scss" scoped>
  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
    overflow: hidden;
  }
  @media screen and (min-width: 769px) {
    .modal-card {
      margin: 0 auto;
      max-height: calc(100vh - 40px);
      width: 50%
    }
  }
  .modal-card {
    margin: 0 20px;
    max-height: calc(100vh - 160px);
    overflow: auto;
    position: relative;
    width: 400px !important;
  }
</style>