<script setup>
import { computed, onMounted, ref } from 'vue'
import { Handle, Position, useVueFlow, useNodesData, useHandleConnections } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'

import SkillSummary from '@/components/demon/SkillSummary.vue'
import demonService from "@/services/demonService";
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

const demon = computed(() => {
  if(props.data.demonId != 0){
    return demonService.get(props.data.demonId)
  }
})

const connections = useHandleConnections({
  type: 'target'
})
const sourceData = useNodesData(() => connections.value.map((connection) => connection.source))

const inheritanceIssues = computed(() => {
  const response = []
  const demonInheritanceRestrictions = demon.value.inheritanceRestrictions;
  inheritedSkills.value.forEach((skill) => {
    const skillInheritance = skill.inheritanceRestriction;
    if (!demonInheritanceRestrictions[skillInheritance.toLowerCase()]){
      response.push(`${demon.value.name} cannot inherit ${skill.name}: Missing inheritance feature '${skillInheritance}'`)
    }
  })
  return response;
});

const inheritedSkills = computed(() => {
  const inhskills = []
  const a = [];
  sourceData.value.forEach(node => {
    node.data.options.selectedSkills.forEach(id =>{
      const skill = skillService.get(id);
      if (skill){
        a.push(skill);
        inhskills.push(id);
      }
    })
  });

  const b = [];
  sourceData.value.forEach(node => {
    node.data.options.inheritedSkills.forEach(id =>{
      const skill = skillService.get(id);
      if (skill){
        b.push(skill);
        inhskills.push(id);
      }
    })
  });

  const res = [...new Set([...a, ...b])];
  const distinct = [...new Set(inhskills)];
  props.data.options.inheritedSkills = distinct;
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

// EditDemon Modal
const oruga = useOruga();

function editNode() {
  oruga.modal.open({
    parent: this,
    component: EditDemonModal,
    custom: true,
    trapFocus: true,
    props: {
      demon: demon.value,
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
    <o-tooltip label="Edit Demon Properties" variant="primary" position="top" :teleport="true">
      <o-button variant="primary" size="small" icon-left="pencil" class="is-circular" @click="editNode"/>
    </o-tooltip>
    <o-tooltip label="Clone this Demon" variant="primary" position="top" :teleport="true">
      <o-button variant="primary" size="small" icon-left="content-copy" class="is-circular" @click="cloneNode"/>
    </o-tooltip>
    <o-tooltip label="Remove this Demon" variant="primary" position="top" :teleport="true">
      <o-button variant="primary" size="small" icon-left="close-thick" class="is-circular" @click="removeNode"/>
    </o-tooltip>
  </NodeToolbar>

  <div class="card" :class="data.options.type">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-36x36">
						<img :src="'./img/demon/' + demon.icon +'.png'" :alt="demon.name">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{demon.name}}</p>
					<p class="subtitle is-7">Lv {{ data.options.level }} - {{ data.options.type }}</p>
				</div>
        <o-tooltip position="bottom" multiline v-if="inheritanceIssues.length > 0">
          <o-icon pack="mdi" class="icon has-text-warning node-alert" icon="alert" />
          <template #content>
              <div v-for="msg in inheritanceIssues">
                <p class="inheritance-issue-message">{{ msg }}</p>
              </div>
          </template>
    </o-tooltip>
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

.vue-flow__node .level {
  border: 1px solid #9354c0;
}

.inheritance-issue-message {
  padding-bottom: 5px;
  border-bottom: 1px solid #232323;
}

.o-modal__content{
	background-color: rgba(0,0,0,0) !important;
}

.vue-flow__node-toolbar button {
  margin: 0 0.1em;
}
</style>