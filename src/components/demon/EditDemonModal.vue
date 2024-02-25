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
const defaultSkills = ref([])
const acquiredSkills = ref([])
const inheritedSkills = ref([])

onMounted(() => {
	//Default Skills
  props.demon.skills.forEach((element) => {
    var skill = skillService.get(element);
		var selected = props.options.skills.some(function(i){
			return element == i;
		});

    defaultSkills.value.push({id: skill.id, name: skill.name, inherit: selected})
  })

	props.demon.acquiredSkills.forEach((element) => {
    var skill = skillService.get(element.id);
		var selected = props.options.skills.some(function(i){
			return element == i;
		});
    acquiredSkills.value.push({id: skill.id, name: skill.name, inherit: selected})
  })
})

function onSave(){
	props.options.level = level.value;

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

	inheritedSkills.value.forEach((element) => {
		newSkills.push(element.id)
  })

	props.options.skills = [... new Set(newSkills)];
	emit('close')
}

</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Editing {{demon.name}}</p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field label="Set Level">
				<o-input type="number" min=1 max=99 v-model="level"></o-input>
			</o-field>
			<div class="content">
				<h3>Mark Skills to Inherit</h3>
				<div class="columns is-mobile is-centered">
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
					<div class="column">
						<h4>Inherited Skills</h4>
						<skill-selection
							v-for="skill in skills"
							:key="skill.id"
							:skill="skill"
						/>
					</div>
				</div>
			</div>
    </section>
    <footer class="modal-card-foot">
      <o-button type="button" @click="onSave">Save Changes</o-button>
    </footer>
  </div>
</template>


<style lang="scss" scoped>
  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
    overflow: hidden;
  }

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