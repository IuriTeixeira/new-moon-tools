<script setup>
import { computed, ref, onMounted, watch, markRaw } from 'vue'
import { useOruga } from "@oruga-ui/oruga-next"
import skillService from "@/services/skillService";
import Skill from "@/components/expertise/Skill.vue";
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";

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
  hideZeroes: {
    type: Boolean
  },
  hideUnlearned: {
    type: Boolean
  }
})

// Initialize Oruga programmatic helper for notifications
const oruga = useOruga()

// Single tracker for the current active item
const activeSkillId = ref(null)
const resolvedSkills = ref([])

function handleHover(skillId) {
  activeSkillId.value = skillId
}

function handleLeave() {
  activeSkillId.value = null
}

// Asynchronously resolve all skills referenced in the expertise breakpoints when props change
watch(() => props.expertise, async (newExpertise) => {
  if (!newExpertise || !newExpertise.breakpoints) {
    resolvedSkills.value = []
    return
  }

  const allSkillIds = newExpertise.breakpoints.flatMap(b => b.skills || [])
  const uniqueIds = [...new Set(allSkillIds)]

  // Fetch all required skills in parallel via async skillService
  const skillPromises = uniqueIds.map(id => skillService.get(id))
  const fetchedSkills = await Promise.all(skillPromises)

  // Map into a lookup dictionary for fast association
  const skillMap = new Map()
  fetchedSkills.filter(Boolean).forEach(skill => {
    skillMap.set(Number(skill.id), skill)
  })

  // Build structured skill items with availability status matching breakpoints
  const mappedSkills = []
  newExpertise.breakpoints.forEach(b => {
    const breakpoint = Number.parseInt(b.class.toString() + b.rank.toString());
    const matchedSelection = props.selection?.find(s => s.id === newExpertise.id);
    const selectionValue = typeof matchedSelection === 'object' ? matchedSelection.value : (matchedSelection || 0);
    const isAvailable = breakpoint <= selectionValue;

    (b.skills || []).forEach(skillId => {
      const skillData = skillMap.get(Number(skillId))
      if (skillData) {
        mappedSkills.push({
          ...skillData,
          isLocked: !isAvailable,
          // Sort helper: available skills first, then locked
          _sortOrder: isAvailable ? 0 : 1
        })
      }
    });
  });

  // Sort available skills before unavailable skills
  mappedSkills.sort((a, b) => a._sortOrder - b._sortOrder)

  resolvedSkills.value = markRaw(mappedSkills)
}, { immediate: true, deep: true })

// Copies description and fires an Oruga notification toast
async function handleSkillClick(skill) {
  if (!skill?.description) return
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
  } catch (err) {
    console.error("Clipboard copy failed: ", err)
  }
}

const match = computed(() => {
  let response = {};
  (props.selection || []).forEach(s => {
    if (props.expertise?.id === s.id) {
      response = s
    }
  })
  return response;
})

const visibleSkills = computed(() => {
  return resolvedSkills.value.filter(skill => !props.hideUnlearned || (props.hideUnlearned && !skill.isLocked));
});

const isVisible = computed(() => {
  const matchVal = typeof match.value === 'object' ? (match.value.value ?? 0) : match.value;
  if (props.hideZeroes) {
    return matchVal !== 0;
  }
  return visibleSkills.value.length > 0;
})

function classRank(amount) {
  const val = typeof amount === 'object' ? (amount.value ?? 0) : amount;
  var a = val;
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
</script>

<template>
  <div v-if="isVisible">
    <span class="option-title">{{ expertise.name }}</span> -
    {{ classRank(match.value) }}
    <div class="skill-summary">
      <template v-for="skill in visibleSkills" :key="'learned' + skill.id">

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
</template>

<style lang="scss">
.toggle-header {
  cursor: pointer;
}

#chain-expertise {
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

.skill-summary {
  overflow: visible !important;
}

.o-tip {
  display: inline-block;
}
</style>
