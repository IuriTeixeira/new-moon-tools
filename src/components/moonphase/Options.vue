<template>
  <div id="options" class="container">
    <o-field>
      <o-switch v-model.number="options.allMoonPhases" :leftLabel="true">
        Show All Phases
        <o-tooltip label="Show All Moon Phases" position="right" :teleport="true">
          <o-icon size="small" icon="help-circle-outline" />
        </o-tooltip>
      </o-switch>
    </o-field>
  </div>
</template>

<script>
export default {
  name: "Options",
  components: {
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
input:invalid {
  border: 2px dashed red;
}
</style>
