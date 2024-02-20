<template>
  <div id="apples">
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
              <h1 class="title">Golden Apple Calculator</h1>
              <p class="subtitle">For Project New Moon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-one-quarter">
            <div class="container">
              <div class="content">
                <h1>Input</h1>
              </div>
              <Options :options="this.options"></Options>
            </div>
          </div>
          <div class="column">
            <div class="container" v-if="validation">
              <div class="content">
                <h1>Summary</h1>
                <h3 v-if="this.options.times < 1">
                  <span style="color: red">Times must be a positive number.</span>
                </h3>
                <h3 v-if="this.options.times > 0">
                  <span style="color: gold"
                    >{{ Number(apples).toLocaleString() }}
                    <o-icon pack="mdi" icon="food-apple"> </o-icon
                  ></span>
                  {{ pluralize }} required to level from {{ options.start }} to
                  {{ options.end }} <span style="font-weight:700">{{ numTimesMessage }}</span>
                </h3>
                <h4 v-if="this.options.times > 0">
                  <span style="color: gold">{{
                    Number(experience).toLocaleString()
                  }}</span>
                  experience in total
                </h4>
                <h5 v-if="this.options.times > 1">
                  (<span style="color: gold"
                    >{{ Number(this.applesPer).toLocaleString() }}
                    <o-icon pack="mdi" icon="food-apple"> </o-icon
                  ></span> Apples and <span style="color: gold"
                    >{{ Number(this.experiencePer).toLocaleString() }}
                  </span> Experience per reset)
                </h5>
              </div>
              <table class="table is-hoverable is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>Dungeon</th>
                    <th>Apples</th>
                    <th>Runs</th>
                    <th v-if="displayCell">Reports</th>
                    <th v-if="displayCell">Moon Fragments</th>
                  </tr>
                </thead>
                <tbody>
                  <Dungeon
                    v-for="item in tablesort"
                    :key="item.name"
                    :dungeon="item"
                    :apples="this.apples"
                    :options="this.options"
                  />
                </tbody>
              </table>
            </div>
            <div class="container" v-else>
              <div class="content">
                <h1>Summary</h1>
                <h3>
                  <span style="color: red"
                    >{{ Number(1 / 0).toLocaleString() }}
                    <o-icon pack="mdi" icon="food-apple"> </o-icon
                  ></span>
                  {{ pluralize }}. You broke it.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import dataService from "@/services/dataService";

import Options from "@/components/apple/Options.vue";
import Dungeon from "@/components/apple/Dungeon.vue";

export default {
  name: "Apple",
  components: {
    Options,
    Dungeon,
  },
  data() {
    return {
      options: {},
      levels: {},
      dungeons: [],
      experience: 0,
      experiencePer: 0,
      applesPer: 0,
    };
  },
  created() {
    this.options =  dataService.getAppleDefaults();
    this.levels = dataService.getLevels();
    this.dungeons = dataService.getDungeons();
  },
  computed: {
    apples() {
      const values = Object.values(this.levels);
      let i = 0;
      let expRequired = 0;
      let appleExp = 10000;
      let modifier = this.modifier;
      const min = this.options.start - 1;
      const max = this.options.end - 1;
      const times = this.options.times;

      if (max < min) {
        this.experience = 0;
        return 0;
      }

      for (i = min; i < max; i++) {
        expRequired += values[i];
      }
      this.experiencePer = expRequired;
      this.experience = expRequired * times;

      this.applesPer = Math.ceil(expRequired / (appleExp * modifier));
      let applesRequired = this.applesPer * times

      return applesRequired;
    },
    modifier() {
      let modifier = 1;
      var r =
        modifier +
        parseInt(this.options.incense) +
        this.options.gearXpBoost / 100;
      return r;
    },
    pluralize() {
      if (this.apples == 1) return "Apple";
      return "Apples";
    },
    tablesort() {
      let dungeons = dataService.getDungeons();
      if (!this.options.sort) {
        return dungeons;
      }
      return this.dungeons.sort((a, b) => b.apples - a.apples);
    },
    numTimesMessage(){
      if (this.options.times == 1){
        return "";
      }
      return this.options.times + " times"
    },
    validation() {
      if (isNaN(this.apples)) {
        return false;
      }
      if (this.options.gearXpBoost < 0) {
        return false;
      }
      return this.options.start < this.options.end;
    },
    displayCell: function(){
      if(this.options.reports){
        return true;
      }
      return false;
    }
    
  },
  methods: {
    reset() {
      this.options = dataService.getAppleDefaults();
    },
  },
};
</script>