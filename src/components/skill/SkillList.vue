<script setup>
import { ref } from "vue"
import { useOruga } from "@oruga-ui/oruga-next"
import Skill from "@/components/expertise/Skill.vue"
import SkillTooltip from "@/components/expertise/SkillTooltip.vue"

const props = defineProps({
  skills: {
    type: Array,
    required: true
  }
})

// Initialize Oruga programmatic helper
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
</script>

<template>
  <div class="skill-summary">
    <template v-for="skill in props.skills" :key="skill.id">

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
