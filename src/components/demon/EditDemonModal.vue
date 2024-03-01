<script setup>
import { ref, onMounted } from 'vue'

import SkillSelection from '@/components/demon/SkillSelection.vue'
import skillService from "@/services/skillService";

const props = defineProps({
  demon: {
    type: Object,
  },
	options: {
    type: Object,
  }
})

const emit = defineEmits(['close'])

const level = ref(props.options.level)
const type = ref(props.options.type)
const defaultSkills = ref([])
const acquiredSkills = ref([])

onMounted(() => {
	//Default Skills
  props.demon.skills.forEach((element) => {
    var skill = skillService.get(element);
		var selected = props.options.selectedSkills.some(function(i){
			return element == i;
		});

    defaultSkills.value.push({id: skill.id, name: skill.name, inherit: selected})
  })

	props.demon.acquiredSkills.forEach((element) => {
    var skill = skillService.get(element.id);
		var selected = props.options.selectedSkills.some(function(i){
			return element.id == i;
		});
    acquiredSkills.value.push({id: skill.id, name: skill.name, inherit: selected})
  })
})

function onSave(){
	props.options.level = level.value;
	props.options.type = type.value;
	const newSkills = [];
	defaultSkills.value.forEach((element) => {
    if (element.inherit){
			newSkills.push(element.id)
		}
  })

	acquiredSkills.value.forEach((element) => {
    if (element.inherit){
			newSkills.push(element.id)
		}
  })


	props.options.selectedSkills = [... new Set(newSkills)];
	emit('close')
}

</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Editing <span class="has-text-weight-bold">{{demon.name}}</span></p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field grouped>
				<o-field label="Level">
					<o-input type="number" min=1 max=98 v-model="level"></o-input>
				</o-field>
				<o-field label="How is this Demon Obtained?">
					<o-select v-model="type" class="is-fullwidth">
						<option value="contract">Contract</option>
						<option value="double">Double Fusion</option>
						<option value="triple">Triple Fusion</option>
						<option value="rebirth">Rebirth</option>
						<option value="level">Level</option>
					</o-select>
				</o-field>
			</o-field>
			<div class="content">
				<h3 style="text-align:center;">Mark Skills to Inherit</h3>
				<hr/>
				<div class="columns is-mobile is-centered" style="overflow-y:auto; overflow-x:hidden; height:650px;">
					<div class="column">
						<h4>Default Skills</h4>
						<skill-selection
							v-for="skill in defaultSkills"
							:key="skill.id"
							:skill="skill"
						/>
					</div>
					<div class="column">
						<h4>Acquired Skills</h4>
						<skill-selection
							v-for="skill in acquiredSkills"
							:key="skill.id"
							:skill="skill"
						/>
					</div>
				</div>
			</div>
    </section>
    <footer class="modal-card-foot">
      <o-button variant="primary" type="button" size="large" class="is-fullwidth" @click="onSave">Save Changes</o-button>
    </footer>
  </div>
</template>


<style lang="scss" scoped>

@import '@/assets/styles/main.scss';

  @media screen and (min-width: 769px) {
    .modal-card {
      margin: 0 auto;
      max-height: calc(100vh - 40px);
    }
  }
  .modal-card {
    margin: 0 20px;
    max-height: calc(100vh - 160px);
    overflow: auto;
    position: relative;
  }

</style>