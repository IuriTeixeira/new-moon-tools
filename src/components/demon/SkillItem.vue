<script setup>

const emit = defineEmits(['removeSkill'])

const props = defineProps({
  skill: {
    type: Object,
    required: true,
  }
})


function removeSkill() {
  emit('removeSkill', props.skill)
}

</script>

<template>
	<div class="columns is-mobile is-centered is-vcentered">
		<div class="column is-narrow">
			<o-button variant="primary" size="small" icon-left="close-thick" class="is-circular" @click="removeSkill"/>
		</div>
		<div class="column is-narrow">
			<figure class="image is-32x32">
				<img :src="'./img/skill/' + skill.icon +'.png'" :alt="skill.name">
			</figure>
		</div>
		<div class="column">
			<span>{{ skill.name }}</span>
		</div>
	</div>
</template>

<style scoped>
figure {
	margin-left: 5px;
	margin-right: -10px;
}
</style>

