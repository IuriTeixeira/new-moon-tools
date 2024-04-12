<script setup>
import { ref, onMounted } from 'vue'

import SkillItem from '@/components/demon/SkillItem.vue'
import skillService from "@/services/skillService";

const props = defineProps({
	options: {
		type: Object,
	}
})

const emit = defineEmits(['close'])

const notes = ref(props.options.notes);

const skills = ref([]);
const selectedSkills = ref([]);
const isFetchingSkills = ref(false);


onMounted(() => {
	props.options.selectedSkills.forEach((element) => {
		var skill = skillService.get(element);
		selectedSkills.value.push(skill)
	})

})

function onSave() {
	props.options.notes = notes.value;
	var skillIds = selectedSkills.value.map(function (item) {
	return item.id;
});
	props.options.selectedSkills = skillIds;
	emit('close')
}

async function findSkills(_name) {
	isFetchingSkills.value = true;
	if (_name.length > 2) {
		skills.value = await skillService.searchByName(_name)
	}
	else {
		skills.value = []
	}
	isFetchingSkills.value = false;
}

async function onSelect(select) {
	if (select == null){
		return;
	}

	var match = selectedSkills.value.some(function (item) {
		return item.id === select.id;
	});

	if (!match){
		selectedSkills.value.push(select);
	}

	skills.value = []

}

function onRemoveSkill(skill){
	for (var i = selectedSkills.value.length - 1; i >= 0; --i) {
		if (selectedSkills.value[i].id == skill.id) {
			selectedSkills.value.splice(i,1);
		}
	}
  console.log(`skill ${skill.id} removed.`);
}


</script>

<template>
	<div class="modal-card" style="width: auto">
		<header class="modal-card-head">
			<p class="modal-card-title">Editing Notes</p>
			<o-icon clickable native-type="button" icon="close" @click.="$emit('close')" />
		</header>
		<section class="modal-card-body">
			<div class="columns">
				<div class="column">
					<o-field label="Message">
						<o-input :maxlength="200" type="textarea" v-model="notes" />
					</o-field>
				</div>
				<div class="column">
					<o-field label="Add skills to forcefully inherit">
						<o-autocomplete expanded clearable open-on-focus :data="skills" placeholder="e.g. Bufu" :keep-first="true"
							field="name" :loading="isFetchingSkills" :debounce="500" @input="findSkills" @select="onSelect"
							class="is-fullwidth">
							<template #default="props">
								<div class="media">
									<div class="media-left">
										<img width="32" :src="`./img/skill/${props.option.icon}.png`" />
									</div>
									<div class="media-content">
										{{ props.option.name }}
									</div>
								</div>
							</template>
							<template #empty>No results found</template>
						</o-autocomplete>
					</o-field>
					<hr />
					<div v-if="selectedSkills.length > 0">
						<skill-item
							v-for="data in selectedSkills"
							:key="data.id"
							:skill="data"
							@remove-skill="onRemoveSkill"
						/>
					</div>
				</div>
			</div>
		</section>
		<footer class="modal-card-foot">
			<o-button variant="primary" type="button" size="large" class="is-fullwidth" @click="onSave">Save
				Changes</o-button>
		</footer>
	</div>
</template>


<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

@media screen and (min-width: 769px) {
	.modal-card {
		margin: 0 auto;
		max-height: calc(100vh - 40px);
		min-height: calc(50vh);
	}
}

.modal-card {
	margin: 0 20px;
	max-height: calc(100vh - 160px);
	min-height: calc(50vh);
	overflow: auto;
	position: relative;
}
</style>