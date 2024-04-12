<script setup>
import { computed, onMounted, ref } from 'vue'
import expertiseService from "@/services/expertiseService";

import ChainExpertise from "@/components/expertise/ChainExpertise.vue";

//-- Data
const hideLocked = ref(false);

const props = defineProps({
  selection: {
    type: Array,
  },
  options: {
    type: Object
  }
})

//-- OnCreate
const expertise = expertiseService.all();
let s = [];
expertise.forEach(e => {
  const obj = e;
  if (e.singularExpertise.length > 0 && e.name !== "--Unused--"){
    s.push(obj);
  }
});
const chains = s;

</script>

<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h4 class="title is-4">Chain Expertise</h4>
      </div>
      <div class="level-right">
        <o-switch size="small" v-model="hideLocked">Hide Locked</o-switch>
      </div>
    </div>
    <div class="content">
      <ChainExpertise
        v-for="expertise in chains"
        :key="expertise.id"
        :hideLocked="hideLocked"
        :expertise="expertise"
        :selection="selection"
        :options="options"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>