<template>
  <chain-expertise
    :expertise="this.expertise"
    :options="this.options"
    :visible="isVisible"
    :classRank="classRank"
    @setValues="setValues"
    name="Ashes and Dust"
  >
    <template v-slot:content>
      <table class="table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>Expertise</th>
            <th>Minimum</th>
            <th>Percent</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Rapid</th>
            <td>Class 3 Rank 0</td>
            <td>40%</td>
            <td>{{ parseExpertise(expertise.rapid.value * 0.4) }}</td>
          </tr>
          <tr>
            <th>Gun Knowledge</th>
            <td>Class 2 Rank 0</td>
            <td>30%</td>
            <td>{{ parseExpertise(expertise.gunKnowledge.value * 0.3) }}</td>
          </tr>
          <tr>
            <th>Pursuit</th>
            <td>Class 2 Rank 0</td>
            <td>30%</td>
            <td>{{ parseExpertise(expertise.pursuit.value * 0.3) }}</td>
          </tr>
        </tbody>
      </table>
      <h5 class="title is-6">Skills Acquired</h5>
      <div class="skill-summary">
        <skill
          v-for="skill in this.skills.filter(function (e) {
            return e.rank <= total && requirements;
          })"
          :key="skill.slug"
          :skill="skill"
        >
        </skill>
      </div>
    </template>
  </chain-expertise>
</template>

<script>
import Skill from "@/components/expertise/Skill.vue";
import ChainExpertise from "@/components/expertise/ChainExpertise.vue";
export default {
  name: "AshesAndDust",
  components: {
    Skill,
    ChainExpertise,
  },
  props: {
    expertise: {
      type: Object,
      required: true,
    },
    skills: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
    hideLocked: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    parseExpertise(amount) {
      var a = Number.parseInt(amount) / 100;
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
    setValues(to) {
      if (to === "zero") {
        this.expertise.rapid.value = 0;
        this.expertise.gunKnowledge.value = 0;
        this.expertise.pursuit.value = 0;
      } else if (to === "required") {
        this.expertise.rapid.value = 3000;
        this.expertise.gunKnowledge.value = 2000;
        this.expertise.pursuit.value = 2000;
      } else if (to === "max") {
        this.expertise.rapid.value = this.expertise.rapid.max;
        this.expertise.gunKnowledge.value = this.expertise.gunKnowledge.max;
        this.expertise.pursuit.value = this.expertise.pursuit.max;
      }
    },
  },
  computed: {
    isVisible() {
      if (!this.hideLocked) return true;
      else if (this.requirements) return true;
      else return false;
    },
    requirements() {
      if (
        this.expertise.rapid.value >= 3000 &&
        this.expertise.gunKnowledge.value >= 2000 &&
        this.expertise.pursuit.value >= 2000
      )
        return true;
      else return false;
    },
    total() {
      
      let rapid = this.expertise.rapid.value * 0.4;
      let gunKnowledge = this.expertise.gunKnowledge.value * 0.3;
      let pursuit = this.expertise.pursuit.value * 0.3;

      return Number.parseInt(rapid + gunKnowledge + pursuit);
    },
    classRank() {
      let rapid = this.expertise.rapid.value * 0.4;
      let gunKnowledge = this.expertise.gunKnowledge.value * 0.3;
      let pursuit = this.expertise.pursuit.value * 0.3;

      var a = Number.parseInt(rapid + gunKnowledge + pursuit) / 100;
      var b = a.toString();
      if (
        a === 0 ||
        this.expertise.rapid.value < 3000 ||
        this.expertise.gunKnowledge.value < 2000 ||
        this.expertise.pursuit.value < 2000
      ) {
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
};
</script>
