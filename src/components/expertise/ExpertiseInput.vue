<template>
  <multistep-number-input
    v-model="expertise.value"
    :step1="1"
    :step2="10"
    :min="0"
    :max="expertise.max"
    :disabled="true"
    class="expertise-input"
  >
    <template v-slot:title>
      <span class="option-title">{{ expertise.name }}</span>
    </template>
  </multistep-number-input>
</template>

<script>
import MultistepNumberInput from "@/components/MultistepNumberInput.vue";
export default {
  name: "ExpertiseInput",
  data() {
    return {};
  },
  props: {
    expertise: {
      type: Object,
      required: true,
    },
  },
  components: {
    MultistepNumberInput,
  }
};
</script>

<style lang="scss" scoped>
.expertise-input {
  margin-bottom: 1em;
}

.force-newline.o-tooltip.is-multiline:after {
  white-space: pre;
}

.option-title {
  font-weight: bold;
  color: #e6e6e6;
}

.option-subtitle {
	float:right;
}
</style>