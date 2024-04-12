<template>
  <div>
    <slot v-if="$slots.title" name="title" />
    <template v-else>{{ title }}</template>
    <o-field>
      <p class="control" @click="stepLeft(step2)">
        <o-button variant="primary" :disabled="disabledMin">
          <o-icon icon="chevron-double-left"></o-icon>
        </o-button>
      </p>
      <p class="control" @click="stepLeft(step1)">
        <o-button variant="primary" :disabled="disabledMin">
          <o-icon icon="chevron-left"></o-icon>
        </o-button>
      </p>
      <o-input
        type="text"
        expanded
        :disabled="disabled"
        v-model="classRank"
      ></o-input>
      <p class="control" @click="stepRight(step1)">
        <o-button variant="primary" :disabled="disabledMax">
          <o-icon icon="chevron-right"></o-icon>
        </o-button>
      </p>
      <p class="control" @click="stepRight(step2)">
        <o-button variant="primary" :disabled="disabledMax">
          <o-icon icon="chevron-double-right"></o-icon>
        </o-button>
      </p>
    </o-field>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newValue: !isNaN(this.value) ? this.value : parseFloat(this.min) || 0,
    };
  },
  props: {
    title: {
      type: String,
    },
    step1: {
      type: Number,
      required: true,
    },
    step2: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
    },
    modelValue: {
      type: Number,
      required: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    stepLeft(amount) {
      let oldValue = this.computedValue;
      var _value = 0;
      if (oldValue - amount < this.min) {
        _value = this.min;
      } else {
        _value = this.computedValue - amount;
      }
      this.computedValue = _value;
    },
    stepRight(amount) {
      let oldValue = this.computedValue;
      var _value = 0;
      if (oldValue + amount > this.max) {
        _value = this.max;
      } else {
        _value = this.computedValue + amount;
      }
      this.computedValue = _value;
    },
  },
  computed: {
    disabledMin() {
      return this.computedValue <= this.min;
    },
    disabledMax() {
      return this.computedValue >= this.max;
    },
    computedValue: {
      get() {
        return this.newValue;
      },
      set(value) {
        let newValue = value;
        if (value === "") {
          newValue = parseFloat(this.min) || null;
        }
        this.newValue = newValue;
        this.$emit("update:modelValue", newValue);
      },
    },
    classRank() {
      var a = this.computedValue;
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
    },
  },
  watch: {
    /**
     * When v-model is changed:
     *   1. Set internal value.
     */
    modelValue: {
      immediate: true,
      handler(value) {
        this.newValue = value
      }
    }
  },
};
</script>

<style lang="scss">
.option-title {
  font-weight: bold;
  font-size: 1.1em;
}
.option-subtitle {
  font-weight: normal;
  font-size: 1em;
}

[disabled].input {
  color: #CCC !important;
  cursor: auto !important;
  text-align: center !important;
  border-top: 1px solid hsl(275, 20%, 50%) !important;
  border-bottom: 1px solid hsl(275, 20%, 50%) !important;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>