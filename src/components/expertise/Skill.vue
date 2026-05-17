<template>
  <div class="skill-wrapper">
    <figure class="image is-32x32 is-skill" :class="{ 'is-unavailable': skill.isLocked }">
      <img :src="'./img/skill/' + skill.icon + '.png'" @error="handleImageError">
    </figure>
  </div>
</template>

<script>
export default {
  name: 'Skill',
  props: {
    skill: { type: Object, required: true }
  },
  methods: {
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