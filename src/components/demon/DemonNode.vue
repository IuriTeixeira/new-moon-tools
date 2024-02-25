<script setup>
import { computed, ref } from 'vue'
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

const skills = ref([]);

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

			<div class="content"  v-if="skills.length > 0">
        <skill-summary
          v-for="skill in skills"
          :key="skill.id"
          v-bind="skill"
        />
			</div>
		</div>
	</div>

  <Handle type="source" :position="Position.Top" />
  <Handle type="target" :position="Position.Bottom" />
</template>

<style>
.contract {
  border: 1px solid greenyellow;
}

.fusion {
  border: 1px solid orangered;
}

.o-modal__content{
	background-color: rgba(0,0,0,0) !important;
}
</style>