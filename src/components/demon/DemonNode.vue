<script setup>
import { computed, onMounted, ref } from 'vue'
import { Handle, Position, useVueFlow, useNodesData, useHandleConnections } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'

import SkillSummary from '@/components/demon/SkillSummary.vue'
import skillService from "@/services/skillService";
//---
import EditDemonModal from "@/components/demon/EditDemonModal.vue"
import { useOruga } from "@oruga-ui/oruga-next";

const props = defineProps({
  data: {
    type: Object,
  }
})

const emit = defineEmits(['cloneNode', 'removeNode'])
//-----

const connections = useHandleConnections({
  type: 'target'
})
const sourceData = useNodesData(() => connections.value.map((connection) => connection.source))

const inheritedSkills = computed(() => {
  const a = [];
  sourceData.value.forEach(node => {
    node.data.options.selectedSkills.forEach(id =>{
      const skill = skillService.get(id);
      if (skill){
        a.push(skill);
        props.data.options.inheritedSkills.push(id);
      }
    })
  });

  const b = [];
  sourceData.value.forEach(node => {
    node.data.options.inheritedSkills.forEach(id =>{
      const skill = skillService.get(id);
      if (skill){
        b.push(skill);
      }
    })
  });

  const res = [...new Set([...a, ...b])];
  return res;
})


const selectedSkills = computed(() => {
  const res = [];
  props.data.options.selectedSkills.forEach(id =>{
    const skill = skillService.get(id);
    if (skill){
      res.push(skill);
    }
  })


  return res;
})


onMounted(() => {
  console.log(`DemonNode ${props.data.id} created`)
})

// Link Modal
const oruga = useOruga();

function editNode() {
  oruga.modal.open({
    parent: this,
    component: EditDemonModal,
    custom: true,
    trapFocus: true,
    props: {
      demon: props.data.demon,
      options: props.data.options,
    },
    width: 960,
  });
}

function cloneNode() {
  emit('cloneNode', props.data)
}

function removeNode() {
  emit('removeNode', props.data.id)
}

</script>

<script>
export default {
  inheritAttrs: false
}
</script>

<template>
  <NodeToolbar :is-visible="data.toolbarVisible" position="right">
    <button @click="editNode">Edit</button>
    <button @click="cloneNode">Clone</button>
    <button @click="removeNode">Delete</button>
  </NodeToolbar>

  <div class="card" :class="data.options.type">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-36x36">
						<img :src="'./img/demon/' + data.demon.baseDemonID +'.png'" :alt="data.demon.name">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{data.demon.name}}</p>
					<p class="subtitle is-7">Lv {{ data.options.level }}</p>
				</div>
			</div>

			<div class="content"  v-if="selectedSkills.length > 0">
        <h5>Selected Skills</h5>
        <skill-summary
          v-for="skill in selectedSkills"
          :key="skill.id"
          :skill="skill"
        />
      </div>
      <div class="content"  v-if="inheritedSkills.length > 0">
        <h5>Inhehrited Skills</h5>
        <skill-summary
          v-for="skill in inheritedSkills"
          :key="skill.id"
          :skill="skill"
        />
			</div>
		</div>
	</div>

  <Handle type="source" :position="Position.Top" />
  <Handle type="target" :position="Position.Bottom" />
</template>

<style>

div.card.level{
  margin-bottom: 0 !important;
}

.contract {
  border: 1px solid greenyellow;
}

.double {
  border: 1px solid lightskyblue;
}

.triple {
  border: 1px solid lightpink;
}

.rebirth {
  border: 1px solid palegoldenrod;
}

.level {
  border: 1px solid #9354c0;
}

.o-modal__content{
	background-color: rgba(0,0,0,0) !important;
}
</style>