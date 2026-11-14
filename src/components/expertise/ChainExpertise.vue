<script setup>
import { computed, ref, watch, markRaw } from 'vue'
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

// Local reactive lookup and skill stores populated asynchronously
const resolvedLookup = ref([]);
const resolvedSkills = ref([]);
const unlockedStatus = ref(false);

// Watch props to asynchronously resolve all nested expertise and skill relations
watch(() => [props.expertise, props.selection], async ([newExp]) => {
  if (!newExp || !newExp.singularExpertise || !newExp.breakpoints) {
    resolvedLookup.value = [];
    resolvedSkills.value = [];
    unlockedStatus.value = false;
    return;
  }

  // 1. Resolve singular expertises for lookup
  const singles = newExp.singularExpertise.map(e => e.expertiseID);
  const matchedSelections = (props.selection || []).filter(s => singles.includes(s.id));

  const lookupPromises = matchedSelections.map(async s => {
    const single = newExp.singularExpertise.find(x => x.expertiseID === s.id);
    if (!single) return null;
    const expertiseObj = await expertiseService.get(single.expertiseID);
    return {
      id: single.expertiseID,
      name: expertiseObj?.name || '',
      raw: s.value,
      required: Number.parseInt(single.classRequired.toString() + single.rankRequired.toString()),
      percentage: single.percentage,
      calculated: s.value * single.percentage
    };
  });

  const rawLookup = await Promise.all(lookupPromises);
  const validLookup = rawLookup.filter(Boolean);
  resolvedLookup.value = markRaw(validLookup);

  // 2. Check unlock status
  let unlocked = false;
  if (newExp.id === 45) {
    unlocked = props.options?.actxx?.value == 2000;
  } else {
    unlocked = validLookup.every(e => e.raw >= e.required);
  }
  unlockedStatus.value = unlocked;

  const totalVal = unlocked ? validLookup.reduce((sum, e) => sum + e.calculated, 0) : 0;

  // 3. Resolve breakpoint skills asynchronously
  const allSkillIds = newExp.breakpoints.flatMap(b => b.skills || []);
  const uniqueSkillIds = [...new Set(allSkillIds)];
  const fetchedSkills = await Promise.all(uniqueSkillIds.map(id => skillService.get(id)));
  
  const skillMap = new Map();
  fetchedSkills.filter(Boolean).forEach(skill => {
    skillMap.set(Number(skill.id), skill);
  });

  const response = [];
  newExp.breakpoints.forEach(b => {
    const breakpoint = Number.parseInt(b.class.toString() + b.rank.toString());
    const isAvailable = unlocked && (breakpoint <= totalVal);
    (b.skills || []).forEach(skillId => {
      const skillData = skillMap.get(Number(skillId));
      if (skillData) {
        response.push({ ...skillData, isLocked: !isAvailable });
      }
    });
  });

  resolvedSkills.value = markRaw(response);
}, { immediate: true, deep: true });

// Computed properties for template presentation
const lookup = computed(() => resolvedLookup.value);

const unlocked = computed(() => unlockedStatus.value);

const total = computed(() => {
  if (!unlocked.value) return 0;
  return resolvedLookup.value.reduce((sum, e) => sum + e.calculated, 0);
});

const isVisible = computed(() => {
  if (props.hideLocked) {
    if (props.expertise?.id === 45) return props.options?.actxx?.value == 2000;
    return resolvedLookup.value.every(e => e.raw >= e.required);
  }
  return true;
});

const visibleSkills = computed(() => resolvedSkills.value.filter(skill => !props.hideUnlearned || !skill.isLocked));

// Helper Functions
function toggle() { isExpanded.value = !isExpanded.value; }
function handleHover(skillId) { activeSkillId.value = skillId; }
function handleLeave() { activeSkillId.value = null; }

async function handleSkillClick(skill) {
  if (!skill?.description) return;
  try {
    skill.nameNO !== ""
      ?
      await navigator.clipboard.writeText(skill.name + "\n\n" + skill.nameNO + "\n\n" + skill.description)
      :
      await navigator.clipboard.writeText(skill.name + "\n\n" + skill.description)

    oruga.notification.open({
      message: `Copied name and description for <b>${skill.name}</b>!`,
      position: "bottom",
      variant: "success",
      duration: 2000,
      closable: false
    })
  } catch (err) { console.error(err); }
}

function toPercent(amount) { return amount.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 0 }); }

function classRank(amount) {
  var a = amount;
  var b = a.toString();
  return a === 0 ? "Class 0 Rank 0" : a >= 100 ? "Class " + b.charAt(0) + b.charAt(1) + " Rank " + b.charAt(2) : a >= 10 ? "Class " + b.charAt(0) + " Rank " + b.charAt(1) : "Class 0 Rank " + b.charAt(0)
}

function updateSingles(valFn) {
  const singles = (props.expertise?.singularExpertise || []).map(e => e.expertiseID);
  (props.selection || []).forEach(sel => {
    if (singles.includes(sel.id)) {
      const single = props.expertise.singularExpertise.find(x => x.expertiseID === sel.id);
      if (single) sel.value = valFn(single);
    }
  });
}

function zeroSingles() { updateSingles(() => 0); }
function reqSingles() { updateSingles(s => Number.parseInt(s.classRequired.toString() + s.rankRequired.toString())); }

async function maxSingles() {
  const singles = (props.expertise?.singularExpertise || []).map(e => e.expertiseID);
  for (const sel of (props.selection || [])) {
    if (singles.includes(sel.id)) {
      const exp = await expertiseService.get(sel.id);
      if (exp) sel.value = Number.parseInt(exp.maxClass.toString() + exp.maxRank.toString());
    }
  }
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
          <tr v-for="expItem in lookup" :key="expItem.id">
            <th>{{ expItem.name }}</th>
            <td>{{ classRank(expItem.required) }}</td>
            <td>{{ toPercent(expItem.percentage) }}</td>
            <td>{{ classRank(expItem.calculated) }}</td>
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