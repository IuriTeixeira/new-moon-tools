<template>
  <div class="skill-wrapper">
    <o-tooltip :active="isPinned || isHovered" :triggers="[]" :always="isPinned" multiline size="large" :teleport="true"
      :auto-close="['outside']" @close="isPinned = false">
      <template v-slot:content>
        <!-- Keep tooltip open if mouse moves into the tooltip itself -->
        <div @mouseenter="isHovered = true" @mouseleave="isHovered = false">
          <skill-tooltip :skill="skill" />
        </div>
      </template>

      <figure class="image is-32x32 is-skill" :class="{ 'is-unavailable': skill.isLocked }"
        @mouseenter="isHovered = true" @mouseleave="isHovered = false" @click.stop="togglePin">
        <img :src="'./img/skill/' + skill.icon + '.png'" @error="handleImageError">
      </figure>
    </o-tooltip>
  </div>
</template>

<script>
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";

export default {
  name: 'Skill',
  components: { SkillTooltip },
  data() {
    return {
      isPinned: false,
      isHovered: false
    }
  },
  props: {
    skill: { type: Object, required: true }
  },
  methods: {
    togglePin() {
      this.isPinned = !this.isPinned;
    },
    handleImageError(event) {
      event.target.src = './img/Default.png';
    }
  }
}
</script>

<style lang="scss" scoped>
.skill-wrapper {
  margin: 0px 0.2em;
  display: inline-block;
}

.is-skill {
  margin: 0px;
  padding: 0px;
}

.is-unavailable {
  filter: grayscale(1)
}

.o-tip__content {
  padding: 5px;

  .subtitle {
    color: #e6e6e6;
    vertical-align: center;
    text-align: left;
  }

  img {
    vertical-align: middle;
  }
}
</style>