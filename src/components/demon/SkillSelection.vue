<script setup>

import { ref, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
})
onMounted(() => {
	console.log(props.data);
})

</script>

<template>
	<div class="columns is-mobile is-centered is-vcentered">
		<div class="column is-narrow">
			<o-switch v-model="data.inherit"></o-switch>
		</div>
		<div class="column is-narrow">
			<figure class="image is-32x32">
				<img :src="'./img/skill/' + data.skill.icon +'.png'" :alt="data.skill.name">
			</figure>
		</div>
		<div class="column">
			<span>{{ data.skill.name }}</span>
		</div>
	</div>
</template>

<style scoped>
figure {
	margin-left: 5px;
	margin-right: -10px;
}
</style>

