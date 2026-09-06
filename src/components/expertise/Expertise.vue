<script setup>
import { computed, ref } from 'vue'
import { useOruga } from "@oruga-ui/oruga-next"
import skillService from "@/services/skillService";
import Skill from "@/components/expertise/Skill.vue";
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";

//-- Data

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

function handleHover(skillId) {
  activeSkillId.value = skillId
}

function handleLeave() {
  activeSkillId.value = null
}

// Copies description and fires an Oruga notification toast
async function handleSkillClick(skill) {
  if (!skill?.description) return
  try {
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
  props.selection.forEach(s => {
    if (props.expertise.id === s.id) {
      response = s
    }
  })
  return response;
})

const skills = computed(() => {
  const availableSkills = [];
  const unavailableSkills = [];

  props.expertise.breakpoints.forEach(b => {
    const breakpoint = Number.parseInt(b.class.toString() + b.rank.toString());
    // check for availability
    const isAvailable = breakpoint <= match.value.value;

    b.skills.forEach(skillId => {
      const skillData = skillService.get(skillId);
      // Push an object containing the data and the status
      if (isAvailable) {
        availableSkills.push({ ...skillData, isLocked: false });
      } else {
        unavailableSkills.push({ ...skillData, isLocked: true });
      }
    });
  });

  return [...availableSkills, ...unavailableSkills];
});

const visibleSkills = computed(() => {
  return skills.value.filter(skill => !props.hideUnlearned || (props.hideUnlearned && !skill.isLocked));
});

const isVisible = computed(() => {
  if (props.hideZeroes) {
    return match.value.value !== 0;
  }
  return visibleSkills.value.length > 0;
})

function classRank(amount) {
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
