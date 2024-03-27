<script setup>
import { computed, onMounted, ref } from 'vue'
import { Handle, Position, useVueFlow, useNodesData, useHandleConnections } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'

import EditNotesModal from "@/components/demon/EditNotesModal.vue"
import { useOruga } from "@oruga-ui/oruga-next";

const props = defineProps({
  data: {
    type: Object,
  }
})

const selectedSkill = ref(null);
const skills = ref([]);
const isFetchingSkills = ref(false);

const emit = defineEmits(['removeNode'])
//-----

onMounted(() => {
  console.log(`NotesNode ${props.data.id} created`)
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

			<div class="content">
        {{ data.options.note }}
      </div>
      <div class="content">
        <h5>Important Skills</h5>
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
</style>