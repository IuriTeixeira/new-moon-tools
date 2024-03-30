<script setup>
import { computed, onMounted, ref } from 'vue'
import { Handle, Position, useVueFlow, useNodesData, useHandleConnections } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'

import SkillSummary from '@/components/demon/SkillSummary.vue'
import skillService from "@/services/skillService";

import EditNotesModal from "@/components/demon/EditNotesModal.vue"
import { useOruga } from "@oruga-ui/oruga-next";

const props = defineProps({
  data: {
    type: Object,
  }
})

const emit = defineEmits(['removeNode'])
//-----

onMounted(() => {
  console.log(`NotesNode ${props.data.id} created`)
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

// EditDemon Modal
const oruga = useOruga();

function editNode() {
  oruga.modal.open({
    parent: this,
    component: EditNotesModal,
    custom: true,
    trapFocus: true,
    props: {
      options: props.data.options,
    },
    width: 960,
  });
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
    <o-tooltip label="Edit Note" variant="primary" position="top" :teleport="true">
      <o-button variant="primary" size="small" icon-left="pencil" class="is-circular" @click="editNode"/>
    </o-tooltip>
    <o-tooltip label="Remove Note" variant="primary" position="top" :teleport="true">
      <o-button variant="primary" size="small" icon-left="close-thick" class="is-circular" @click="removeNode"/>
    </o-tooltip>
  </NodeToolbar>

  <div class="card note">
		<div class="card-content">
			<div class="media">
				<div class="media-content">
					<p class="title is-6">Notes</p>
				</div>
			</div>

			<div class="content notes">
        {{ data.options.notes }}
      </div>
      <div class="content"  v-if="selectedSkills.length > 0">
        <h5>Important Skills</h5>
        <skill-summary
          v-for="skill in selectedSkills"
          :key="skill.id"
          :skill="skill"
        />
      </div>
		</div>
	</div>

  <Handle type="source" :position="Position.Top" />
</template>

<style>

div.card.level{
  margin-bottom: 0 !important;
}

.o-modal__content{
	background-color: rgba(0,0,0,0) !important;
}

.vue-flow__node-toolbar button {
  margin: 0 0.1em;
}

.notes {
  white-space: pre-line;
}
</style>