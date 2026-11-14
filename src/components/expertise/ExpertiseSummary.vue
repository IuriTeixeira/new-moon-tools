<script setup>
import { computed, onMounted, ref, markRaw } from 'vue'
import expertiseService from "@/services/expertiseService";

import Expertise from "@/components/expertise/Expertise.vue";

//-- Data
const hideZeroes = ref(false);
const hideUnlearned = ref(false);
const singles = ref([]);

const props = defineProps({
  selection: {
    type: Array,
  },
  options: {
    type: Object
  }
})

//-- OnMounted Initialization
onMounted(async () => {
  const expertise = await expertiseService.all() || [];
  let s = [];
  expertise.forEach(e => {
    if (e.singularExpertise.length === 0 && e.name !== "--Unused--") {
      s.push(e);
    }
  });
  singles.value = markRaw(s);
});
</script>

<template>
  <div>
    <div>
      <h4 class="title is-4">Expertise</h4>
    </div>
    <div>
      <o-switch size="small" v-model="hideZeroes">Hide Class 0 Rank 0</o-switch>
    </div>
    <div>
      <o-switch size="small" v-model="hideUnlearned">Hide unlearned skills</o-switch>
    </div>
    <div class="content">
      <Expertise v-for="expertise in singles" :key="expertise.id" :hideUnlearned="hideUnlearned"
        :hideZeroes="hideZeroes" :expertise="expertise" :selection="selection" :options="options" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>