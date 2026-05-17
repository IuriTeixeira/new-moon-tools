<script setup>
import { computed, onMounted, ref } from 'vue'
import { useOruga } from "@oruga-ui/oruga-next"
import skillService from "@/services/skillService";
import expertiseService from "@/services/expertiseService";

import Skill from "@/components/expertise/Skill.vue";
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";

//-- Data
const isExpanded = ref(false);
const activeSkillId = ref(null);
const oruga = useOruga();
const emit = defineEmits(['max', 'required', 'zero']);

const props = defineProps({
  expertise: Object,
  selection: Array,
  options: Object,
  hideLocked: Boolean,
  hideUnlearned: Boolean
});

// Computed properties for logic
const isVisible = computed(() => props.hideLocked ? unlocked.value : true);
const singles = computed(() => props.expertise.singularExpertise.map(e => e.expertiseID));
const lookup = computed(() => {
  const response = [];
  props.selection.forEach(s => {
    if (singles.value.includes(s.id)) {
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === s.id);
      if (single) {
        const expertise = expertiseService.get(single.expertiseID);
        response.push({
          id: single.expertiseID,
          name: expertise.name,
          raw: s.value,
          required: Number.parseInt(single.classRequired.toString() + single.rankRequired.toString()),
          percentage: single.percentage,
          calculated: s.value * single.percentage
        });
      }
    }
  });
  return response;
});
const unlocked = computed(() => {
  if (props.expertise.id === 45) return props.options.actxx.value == 2000;
  return lookup.value.every(e => e.raw >= e.required);
});
const total = computed(() => unlocked.value ? lookup.value.reduce((sum, e) => sum + e.calculated, 0) : 0);
const skills = computed(() => {
  const response = [];
  props.expertise.breakpoints.forEach(b => {
    const breakpoint = Number.parseInt(b.class.toString() + b.rank.toString());
    const isAvailable = unlocked.value && (breakpoint <= total.value);
    b.skills.forEach(skillId => {
      const skillData = skillService.get(skillId);
      if (skillData) response.push({ ...skillData, isLocked: !isAvailable });
    });
  });
  return response;
});
const visibleSkills = computed(() => skills.value.filter(skill => !props.hideUnlearned || !skill.isLocked));

// Helper Functions
function toggle() { isExpanded.value = !isExpanded.value; }
function handleHover(skillId) { activeSkillId.value = skillId; }
function handleLeave() { activeSkillId.value = null; }
async function handleSkillClick(skill) {
  if (!skill?.description) return;
  try {
    await navigator.clipboard.writeText(skill.description);
    oruga.notification.open({ message: `Copied: ${skill.name}`, position: "bottom-right", variant: "success", duration: 2000 });
  } catch (err) { console.error(err); }
}
function toPercent(amount) { return amount.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 0 }); }
function classRank(amount) {
  var a = amount;
  var b = a.toString();
  return a === 0 ? "Class 0 Rank 0" : a >= 100 ? "Class " + b.charAt(0) + b.charAt(1) + " Rank " + b.charAt(2) : a >= 10 ? "Class " + b.charAt(0) + " Rank " + b.charAt(1) : "Class 0 Rank " + b.charAt(0)
}
function updateSingles(valFn) {
  props.selection.forEach(sel => {
    if (singles.value.includes(sel.id)) {
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === sel.id);
      if (single) sel.value = valFn(single);
    }
  });
}
function zeroSingles() { updateSingles(() => 0); }
function reqSingles() { updateSingles(s => Number.parseInt(s.classRequired.toString() + s.rankRequired.toString())); }
function maxSingles() {
  props.selection.forEach(sel => {
    if (singles.value.includes(sel.id)) {
      const exp = expertiseService.get(sel.id);
      if (exp) sel.value = Number.parseInt(exp.maxClass.toString() + exp.maxRank.toString());
    }
  });
}
</script>

<template>
  <div id="chain-expertise">
    <div class="card" v-if="isVisible">
      <div class="card-header toggle-header" @click.prevent="toggle">
        <p class="card-header-title">
          <span class="option-title">{{ expertise.name }} - {{ classRank(total) }}</span>
        </p>
        <a class="card-header-icon">
          <o-icon pack="mdi" :icon="isExpanded ? 'chevron-up' : 'chevron-down'" />
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
          <tr v-for="expertise in lookup" :key="expertise.id">
            <th>{{ expertise.name }}</th>
            <td>{{ classRank(expertise.required) }}</td>
            <td>{{ toPercent(expertise.percentage) }}</td>
            <td>{{ classRank(expertise.calculated) }}</td>
          </tr>
        </table>
        <span class="subtitle">Unlocked Skills</span>
        <div class="skill-summary">
          <template v-for="skill in visibleSkills" :key="skill.id">
            <o-tooltip v-if="activeSkillId === skill.id" :active="true" :triggers="[]" multiline size="large"
              @mouseleave.native="handleLeave">
              <template v-slot:content>
                <div @mouseenter="handleHover(skill.id)" @mouseleave="handleLeave">
                  <SkillTooltip :skill="skill" />
                </div>
              </template>
              <Skill :skill="skill" @click.native.stop="handleSkillClick(skill)" />
            </o-tooltip>
            <Skill v-else :skill="skill" @mouseenter.native="handleHover(skill.id)" @mouseleave.native="handleLeave"
              @click.native.stop="handleSkillClick(skill)" />
          </template>
        </div>
      </div>
      <footer class="card-footer" v-if="isExpanded">
        <a href="#" class="card-footer-item" @click.prevent="zeroSingles()">Set to Zero</a>
        <a href="#" class="card-footer-item" @click.prevent="reqSingles()">Set to Required</a>
        <a href="#" class="card-footer-item" @click.prevent="maxSingles()">Set to Max</a>
      </footer>
    </div>
  </div>
</template>

<style lang="scss">
.toggle-header {
  cursor: pointer;
}

#chain-expertise {
  margin: 0.25em auto;
}

.option-title {
  font-weight: bold;
  font-size: 1.1em;
}

.skill-summary {
  overflow: visible !important;
}

.o-tip {
  display: inline-block;
}
</style>
