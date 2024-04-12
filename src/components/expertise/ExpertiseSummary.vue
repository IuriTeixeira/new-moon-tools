<script setup>
import { computed, onMounted, ref } from 'vue'
import expertiseService from "@/services/expertiseService";

import Expertise from "@/components/expertise/Expertise.vue";

//-- Data
const hideZeroes = ref(false);

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
  if (e.singularExpertise.length === 0 && e.name !== "--Unused--"){
    s.push(obj);
  }
});
const singles = s;

</script>

<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h4 class="title is-4">Expertise</h4>
      </div>
      <div class="level-right">
        <o-switch size="small" v-model="hideZeroes">Hide Class 0 Rank 0</o-switch>
      </div>
    </div>
    <div class="content">
      <Expertise
        v-for="expertise in singles"
        :key="expertise.id"
        :hideZeroes="hideZeroes"
        :expertise="expertise"
        :selection="selection"
        :options="options"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>