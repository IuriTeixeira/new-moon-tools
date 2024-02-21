<script setup>
import { ref, onMounted } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'

import SkillSummary from '@/components/demon/SkillSummary.vue'

import skillService from "@/services/skillService";

const props = defineProps({
  data: {
    type: Object,
  }
})

const skills = ref([])

onMounted(() => {
  console.log (`DemonNode created`)
  props.data.options.skills.forEach((element) => {
    var skill = skillService.get(element);
    skills.value.push({id: skill.ID, name: skill.Name})
  })
})

const { updateNodeData } = useVueFlow()

</script>

<template>
  <NodeToolbar :is-visible="data.toolbarVisible" position="right">
    <button>Edit</button>
    <button>Copy</button>
    <button>Delete</button>
  </NodeToolbar>

  <div class="card" :class="data.options.type">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-36x36">
						<img :src="'./img/demon/' + data.demon.BaseDemonID +'.png'" :alt="data.demon.name">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{data.demon.Name}}</p>
					<p class="subtitle is-7">Lv {{ data.options.level }}</p>
				</div>
			</div>

			<div class="content"  v-if="data.options.skills.length > 0">
        <skill-summary
          v-for="skill in skills"
          :key="skill.ID"
          :skill="skill"
        />
			</div>
		</div>
	</div>

  <Handle id="a" type="source" :position="Position.Top" />
  <Handle id="b" type="target" :position="Position.Bottom" />
</template>

<style>
.contract {
  border: 1px solid greenyellow;
}

.fusion {
  border: 1px solid orangered;
}
</style>