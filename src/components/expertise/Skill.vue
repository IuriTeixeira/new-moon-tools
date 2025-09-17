<template>
  <div class="skill-wrapper">
    <o-tooltip multiline size="large" :teleport="true">
      <template v-slot:content>
        <skill-tooltip :skill="skill" />
      </template>
      <figure class="image is-32x32 is-skill">
        <img :src="'./img/skill/' + skill.icon + '.png'" @error="handleImageError">
      </figure>
    </o-tooltip>
  </div>
</template>

<script>
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";

export default {
  name: 'Skill',
  components: {
    SkillTooltip
  },
  methods: {
    handleImageError(event) {
      event.target.src = './img/Default.png';
    }
  },
  props: {
    skill: {
      type: Object,
      required: true,
    },
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