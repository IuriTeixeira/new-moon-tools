<script setup>
import { ref, onMounted } from 'vue'

import skillService from "@/services/skillService";

const props = defineProps({
	options: {
    type: Object,
  }
})

const emit = defineEmits(['close'])

const notes = ref(props.options.notes)


onMounted(() => {

})

function onSave(){
	props.options.notes = notes.value;
	const newSkills = [];
	props.options.selectedSkills = newSkills;
	emit('close')
}

</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Editing Notes</p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field grouped>
			</o-field>
			<div class="content">
				<o-field label="Add skills to forcefully inherit">
					<o-autocomplete 
						expanded
						clearable
						open-on-focus
						:data="skills"
						placeholder="e.g. Bufu"
						:keep-first="true"
						field="name"
						:loading="isFetchingSkills"
						:debounce="500"
						:disabled="filterByDemonName.length > 0"
						@input="findSkills"
						@select="onSelect"
						class="is-fullwidth"
					>
						<template #default="props">
							<div class="media">
									<div class="media-left">
											<img
													width="32"
													:src="`./img/skill/${props.option.icon}.png`" />
									</div>
									<div class="media-content">
											{{ props.option.name }}
									</div>
							</div>
						</template>
						<template #empty>No results found</template>
					</o-autocomplete>
				</o-field>
				<hr/>
				<div class="columns is-mobile is-centered"">
					<div class="column">
						<h4>Skills go here</h4>
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