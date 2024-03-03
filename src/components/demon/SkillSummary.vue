<script setup>

const props = defineProps({
  skill: {
    type: Object,
    required: true,
  }
})
</script>

<template>

	<div class="columns is-mobile is-centered is-vcentered">
		<div class="column is-narrow">
			<figure class="image is-24x24">
				<img :src="'./img/skill/' + skill.icon +'.png'" :alt="skill.name">
			</figure>
		</div>
		<div class="column">
			<span>{{ skill.name }}</span>
		</div>
	</div>
</template>

<style>
.content figure {
	margin-left: 5px;
	margin-right: -10px;
}
</style>

