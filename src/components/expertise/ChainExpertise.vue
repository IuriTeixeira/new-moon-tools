<script setup>
import { computed, onMounted, ref } from 'vue'
import skillService from "@/services/skillService";
import expertiseService from "@/services/expertiseService";

import Skill from "@/components/expertise/Skill.vue";

//-- Data

const isExpanded = ref(false);

function toggle(){
  isExpanded.value = !isExpanded.value
}

const isVisible = computed(() => {
  if (props.hideLocked){
    return unlocked.value;
  }

  return true;
})

const emit = defineEmits(['max', 'required', 'zero'])

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
  hideLocked: {
    type: Boolean
  }
})

const singles = [];
props.expertise.singularExpertise.forEach(e => {
  singles.push(e.expertiseID);
});

const lookup = computed(() => {
  const response = []
  props.selection.forEach(s => {
    if (singles.some(x => x === s.id)){
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === s.id);
      if (single){
        const expertise = expertiseService.get(single.expertiseID);
        const obj = {};
        obj.id = single.expertiseID;
        obj.name = expertise.name;
        obj.raw = s.value;
        obj.required = Number.parseInt( single.classRequired.toString() + single.rankRequired.toString());
        obj.percentage = single.percentage;
        obj.calculated = s.value * single.percentage;
        response.push(obj)
      }
    }
  })

  return response;
})

const unlocked = computed(() => {
  let response = true;

  if (props.expertise.id === 45){
    return props.options.actxx.value == 2000
  }

  lookup.value.forEach(e => {
    if (e.raw < e.required){
      response = false;
    }
  })
  return response;
})

const total = computed(() => {
  let response = 0;
  if (unlocked.value){
    lookup.value.forEach(e => {
    response += e.calculated;
  })
  }
  return response;
})

const skills = computed(() => {
  const response = [];
  const s = [];
  if (unlocked.value){
    props.expertise.breakpoints.forEach(b =>{
      const breakpoint = Number.parseInt( b.class.toString() + b.rank.toString()) 
      if (breakpoint <= total.value){
        s.push(...b.skills)
      }
    })
  }
  s.forEach(x => {
    let skill = skillService.get(x)
    response.push(skill);
  })
  return response;
})

function toPercent(amount){
  return amount.toLocaleString(undefined,{style: 'percent', minimumFractionDigits:0})
}

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

function zeroSingles() {
  props.selection.forEach(sel => {
    if (singles.some(x => x === sel.id)){
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === sel.id);
      if (single){
        sel.value = 0
      }
    }
  })
}

function reqSingles() {
  props.selection.forEach(sel => {
    if (singles.some(x => x === sel.id)){
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === sel.id);
      if (single){
        sel.value = Number.parseInt(single.classRequired.toString() + single.rankRequired.toString());
      }
    }
  })
}

function maxSingles() {
  props.selection.forEach(sel => {
    if (singles.some(x => x === sel.id)){
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === sel.id);
      const exp = expertiseService.get(sel.id)
      if (single && exp){
        sel.value = Number.parseInt(exp.maxClass.toString() + exp.maxRank.toString());
      }
    }
  })
}

</script>

<template>
  <div id="chain-expertise">
    <div class="card" v-if="isVisible">
      <div class="card-header toggle-header" @click.prevent="toggle">
        <p class="card-header-title">
          <span class="option-title">{{ expertise.name }} - {{ classRank(total) }}</span>
        </p>
				<a class="card-header-icon" aria-label="expand">
					<span class="icon">
						<o-icon pack="mdi" class="icon has-text-white" :icon="isExpanded ? 'chevron-down' : 'chevron-up'"/>
					</span>
				</a>
      </div>
      <div class="card-content" v-if="isExpanded">
        <p>{{ expertise.description }}</p>
        <table>
          <tr>
            <th>Expertise</th>
            <th>Minimum</th>
            <th>Percentage</th>
            <th>Computed</th>
          </tr>
          <tr 
            v-for="expertise in lookup"
            :key="expertise.id">
            <th>{{ expertise.name }}</th>
            <td>{{ classRank(expertise.required) }}</td>
            <td>{{ toPercent(expertise.percentage) }}</td>
            <td>{{ classRank(expertise.calculated) }}</td>
          </tr>
        </table>
        <span class="subtitle">Unlocked Skills</span>
        <div>
          <Skill v-for="skill in skills"
            :key="skill.id"
            :skill="skill"/>
        </div>
      </div>
      <footer class="card-footer"  v-if="isExpanded">
        <a href="#" class="card-footer-item" @click.prevent="zeroSingles()"
          >Set to Zero</a
        >
        <a
          href="#"
          class="card-footer-item"
          @click.prevent="reqSingles()"
          >Set to Required</a
        >
        <a href="#" class="card-footer-item" @click.prevent="maxSingles()"
          >Set to Max</a
        >
      </footer>
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
