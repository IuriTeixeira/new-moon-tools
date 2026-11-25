<script setup>
import { computed, ref, watch, markRaw } from 'vue'
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
const rawSkillEntries = ref([])

function handleHover(skillId) {
  activeSkillId.value = skillId
}

function handleLeave() {
  activeSkillId.value = null
}

// 1. Only fetch skills when the expertise definition itself changes
watch(() => props.expertise, async (newExpertise) => {
  if (!newExpertise?.breakpoints) {
    rawSkillEntries.value = []
    return
  }

  const allSkillIds = newExpertise.breakpoints.flatMap(b => b.skills || [])
  const uniqueIds = [...new Set(allSkillIds)]

  const fetchedSkills = await Promise.all(
    uniqueIds.map(id => skillService.get(id))
  )

  const skillMap = new Map()
  fetchedSkills.filter(Boolean).forEach(skill => {
    skillMap.set(Number(skill.id), skill)
  })

  const entries = []
  newExpertise.breakpoints.forEach(b => {
    const breakpoint = Number.parseInt(b.class.toString() + b.rank.toString(), 10);
    (b.skills || []).forEach(skillId => {
      const skillData = skillMap.get(Number(skillId))
      if (skillData) {
        entries.push({ skillData, breakpoint })
      }
    })
  })

  rawSkillEntries.value = markRaw(entries)
}, { immediate: true })

// 2. Match the current selection item for this expertise
const match = computed(() => {
  return (props.selection || []).find(s => String(s.id) === String(props.expertise?.id)) || {}
})

// 3. Re-evaluate availability reactively whenever selection changes
const resolvedSkills = computed(() => {
  const selectionValue = Number(
    typeof match.value === 'object' ? (match.value.value ?? 0) : (match.value ?? 0)
  )

  return rawSkillEntries.value
    .map(({ skillData, breakpoint }) => {
      const isAvailable = breakpoint <= selectionValue
      return {
        ...skillData,
        isLocked: !isAvailable,
        _sortOrder: isAvailable ? 0 : 1
      }
    })
    .sort((a, b) => a._sortOrder - b._sortOrder)
})

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
