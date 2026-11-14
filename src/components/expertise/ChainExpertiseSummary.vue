<script setup>
import { computed, onMounted, ref, markRaw } from 'vue'
import expertiseService from "@/services/expertiseService";

import ChainExpertise from "@/components/expertise/ChainExpertise.vue";

//-- Data
const hideLocked = ref(false);
const hideUnlearned = ref(false);
const chains = ref([]);

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
    if (e.singularExpertise.length > 0 && e.name !== "--Unused--") {
      s.push(e);
    }
  });
  chains.value = markRaw(s);
});
</script>

<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h4 class="title is-4">Chain Expertise</h4>
      </div>
      <div class="level-right">
        <o-switch size="small" v-model="hideUnlearned">Hide unlearned skills</o-switch>
      </div>
      <div class="level-right">
        <o-switch size="small" v-model="hideLocked">Hide Locked</o-switch>
      </div>
    </div>
    <div class="content">
      <ChainExpertise v-for="expertise in chains" :key="expertise.id" :hideUnlearned="hideUnlearned" :hideLocked="hideLocked" :expertise="expertise"
        :selection="selection" :options="options" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>