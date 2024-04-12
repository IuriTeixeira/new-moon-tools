<script setup>
import { computed, onMounted, ref } from 'vue'
import skillService from "@/services/skillService";

import Skill from "@/components/expertise/Skill.vue";

//-- Data

const props = defineProps({
  expertise: {
    type: Object
  },
  selection: {
    type: Array,
  },
  options: {
    type: Object
  },
  hideZeroes: {
    type: Boolean
  }
})

const match = computed(() => {
  let response = {};
  props.selection.forEach(s => {
    if (props.expertise.id === s.id){
      response = s
    }
  })
  return response;
})

const skills = computed(() => {
  const response = [];
  const s = [];

  props.expertise.breakpoints.forEach(b =>{
    const breakpoint = Number.parseInt( b.class.toString() + b.rank.toString()) 
    if (breakpoint <= match.value.value){
      s.push(...b.skills)
    }
  })

  s.forEach(x => {
    let skill = skillService.get(x)
    response.push(skill);
  })
  return response;
});

const isVisible = computed(() => {
  if (props.hideZeroes){
    return match.value.value !== 0;
  }
  return skills.value.length > 0;
})

function classRank (amount) {
  var a = amount;
  var b = a.toString();
  if (a === 0) {
    return "Class 0 Rank 0";
  } else if (a >= 100) {
    return "Class " + b.charAt(0) + b.charAt(1) + " Rank " + b.charAt(2);
  } else if (a >= 10) {
    return "Class " + b.charAt(0) + " Rank " + b.charAt(1);
  } else {
    return "Class 0 Rank " + b.charAt(0);
  }
}

</script>

<template>
  <div v-if="isVisible">
      <span class="option-title">{{ expertise.name }}</span> -
      {{ classRank(match.value) }}
      <div class="skill-summary">
        <Skill v-for="skill in skills"
            :key="skill.id"
            :skill="skill"/>
      </div>
    </div>
</template>
<script>
</script>

<style lang="scss">

.toggle-header{
	cursor: pointer;
}

#chain-expertise{
  margin: 0.25em auto;
}

.is-label {
  margin-right: 1rem;
}

.option-title {
  font-weight: bold;
  font-size: 1.1em;
}

.collapse.card {
  margin: 1em auto;
}
</style>
