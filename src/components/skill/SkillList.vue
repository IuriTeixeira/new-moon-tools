<script setup>
import Skill from "@/components/expertise/Skill.vue"
import { defineProps } from "vue"

const props = defineProps({
  skills: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="skill-summary">
    <Skill v-for="skill in props.skills" :key="skill.id" :skill="skill" />
  </div>
</template>


<style lang="scss">
.toggle-header {
    cursor: pointer;
}

#chain-expertise {
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
