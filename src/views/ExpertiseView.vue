<script setup>
import { computed, onMounted, ref } from 'vue'
import dataService from "@/services/dataService";

import Progressbar from "@/components/Progressbar.vue";

import ExpertiseInput from "@/components/expertise/ExpertiseInput.vue";
import Options from "@/components/expertise/Options.vue";
import ExpertiseSummary from "@/components/expertise/ExpertiseSummary.vue";
import ChainExpertiseSummary from "@/components/expertise/ChainExpertiseSummary.vue";
import ExpertiseLinkModal from "@/components/expertise/LinkModal.vue";

import { useOruga } from "@oruga-ui/oruga-next";
const oruga = useOruga();

//-- Data
const activeTab = ref("0");
const expertiseFloor = ref(17000);
const expertise = ref({});
const options = ref({});


//-- OnCreate
let uri = window.location.search.substring(0);
let params = new URLSearchParams(uri);
reset();
if (uri != "") {
  let hydratedValues = dataService.fromExpertiseQueryParams(params);
  expertise = hydratedValues.expertise;
  options = hydratedValues.options;
  oruga.notification.open({
    message: "Build Loaded!",
    rootClass: "toast-notification",
    position: "top",
    duration: 2000,
  });
}


const currentExpertise = computed(() => {
  const values = Object.values(expertise.value);
  let e = 0;
  values.forEach(function (v) {
    e += v.value;
  });
  return e;
});

const bonusExpertise = computed(() => {
  const values = Object.values(options.value);
  let e = 0;
  values.forEach(function (v) {
    e += v.value;
  });
  e -= options.value.level.value;
  if (options.value.level.value !== 1) {
    e += Math.floor(options.value.level.value / 10) * 1000;
  }
  if (options.value.level.value === 99) {
    e += 1000;
  }
  return e;
})

const progressType = computed(() => {
  if (currentExpertise.value <= expertiseFloor.value + bonusExpertise.value)
    return "is-warning";
  else return "is-danger";
})


function reset() {
  expertise.value = dataService.getExpertise();
  options.value = dataService.getExpertiseDefaults();
}

function expertiseLinkModal() {
  this.$oruga.modal.open({
    parent: this,
    component: ExpertiseLinkModal,
    custom: true,
    trapFocus: true,
    props: {
      options: this.options,
      expertise: this.expertise,
    },
    width: 400,
  });
}
</script>

<template>
  <div id="expertise">
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-2 has-text-centered">
              <figure class="image is-128x128 is-inline-block">
                <img alt="New Moon logo" src="@/assets/logo.png" />
              </figure>
            </div>
            <div class="column is-10">
              <!-- Left side -->
              <h1 class="title">Expertise Calculator</h1>
              <p class="subtitle">For Project New Moon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-one-third">
            <div class="container">
              <div class="content">
                <h1>Input</h1>
              </div>
              <o-tabs v-model="activeTab" class="is-fullwidth" type="boxed">
                <o-tab-item value="0" label="Expertise">
                  <ExpertiseInput
                    v-for="item in expertise"
                    :key="item.queryParam"
                    :expertise="item"
                  />
                </o-tab-item>
                <o-tab-item value="1" label="Options">
                  <options
                    :options="options"
                    @reset-expertise="reset"
                    @open-link-modal="expertiseLinkModal"
                  />
                </o-tab-item>
              </o-tabs>
            </div>
          </div>
          <div class="column">
            <div class="container">
              <div class="content">
                <h1>Summary</h1>
                <h4 class="title is-4">Expertise Limit</h4>
                <progressbar
                  :type="progressType"
                  size="is-large"
                  :value="currentExpertise"
                  :max="expertiseFloor + bonusExpertise"
                  show-value
                >
                  {{ currentExpertise }}/{{ expertiseFloor + bonusExpertise }}
                </progressbar>
              </div>
              <div class="columns">
                <div class="column is-one-third">
                  <expertise-summary
                    :expertise="Object.values(expertise)"
                  />
                </div>
                <div class="column">
                  <chain-expertise-summary
                    :expertise="expertise"
                    :options="options"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<style lang="scss">
.o-tabs__content {
  padding: 0px;
}

.toast-notification {
  margin: 0.5em 0;
  text-align: center;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%), 0 0 6px rgb(0 0 0 / 4%);
  border-radius: 2em;
  padding: 0.75em 1.5em;
  pointer-events: auto;
  color: #e6d6e6;
  background: #485fc7;
}
</style>