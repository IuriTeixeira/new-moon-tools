<script setup>
import DemonForce from "@/components/df/DemonForce.vue"

const props = defineProps({
  df: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="df-summary">
    <DemonForce v-for="df in props.df" :key="df.id" :df="df" />
  </div>
</template>


<style lang="scss">
.toggle-header {
  cursor: pointer;
}

.df-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
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
