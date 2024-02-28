
<script setup>
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
//---
import DemonNode from '@/components/demon/DemonNode.vue'
import EdgeWithButton from '@/components/demon/EdgeWithButton.vue'
import useDragAndDrop from '@/services/demonPlanner/useDnD'
const { onDragStart, onDragOver, onDrop, onDragLeave, isDragging } = useDragAndDrop()
//---
import debounce from "@/services/demonPlanner/debounce"
import demonService from "@/services/demonService";
import _ from 'lodash'
//---
import ImportExportModal from '@/components/demon/ImportExportModal.vue'
import { useOruga } from "@oruga-ui/oruga-next";
const oruga = useOruga();

const search = ref("");
const results = ref([]);

const elements = ref([])

const onInput = debounce(() => {
    findDemon()
  }, 500)

function findDemon(){
  let demons = demonService.searchByName(search.value)
  results.value = demons;
}

function nextId() {
  const n = elements.value.filter(function(i) {
    return Object.hasOwn(i, 'position')
  })
  if (n.length > 0){
    const z = [];
    n.forEach((el) => {
      var x = parseInt(el.id.replace('demonnode_', ''))
      z.push(x);
    })
    const max = Math.max(...z);
    return `demonnode_${max + 1}`;
  }
  return "demonnode_1";
}

function openImportExportModal() {
  oruga.modal.open({
    parent: this,
    component: ImportExportModal,
    custom: true,
    trapFocus: true,
    props: {
      data: elements
    },
    events: {
      ingest: onIngest
    },
    width: 960,
  });
}

const { addEdges, removeEdges, addNodes, removeNodes } = useVueFlow()

const onConnect = (params) => {
  var edge = {
    id: `e_${params.source}-${params.target}`,
    source: params.source,
    target: params.target,
    type: 'button',
    animated: true,
    data: { text: 'custom edge' },
    markerEnd: 'arrowClosed',
  }
  addEdges(edge)
}

function onCloneNode(data){
  const oldNode = elements.value.find(n => n.id == data.id);
  let newData = _.cloneDeep(data);
  const id = nextId();
  newData.id = id;
  const newNode = {
    id: id,
    type: 'demon',
    label: `[${id}]`,
    data: newData,
    position: {x: oldNode.position.x + 200, y: oldNode.position.y}
  }
  
  addNodes(newNode);
}

function onRemoveNode(id){
  console.log(`Node ${id} removed.`);
  removeNodes(id);
}

function onIngest(json){
  const data = JSON.parse(json)
  elements.value = data;
}

</script>

<template>
  <div id="flowchart">
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-one-quarter">
            <div class="container">
              <div class="content">
                <h1>Demons</h1>
                <o-input v-model="search" @input="onInput"></o-input>
                <div class="nodes">
                  <div class="vue-flow__node-demon" 
                    v-for="demon in results"
                    :key="demon.ID" 
                    :draggable="true" @dragstart="onDragStart($event, 'demon', demon, nextId())">{{ demon.name }} Lv. {{ demon.baseLevel }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="container" @drop="onDrop" style="width:100%; height:900px; background-color: rgb(7, 39, 60);">
              <VueFlow v-model="elements" @dragover="onDragOver" @dragleave="onDragLeave" @connect="onConnect" :connection-radius="30" connection-mode="strict" :delete-key-code="null">
                <template #node-demon="nodeDemonProps">
                  <DemonNode v-bind="nodeDemonProps" @clone-node="onCloneNode" @remove-node="onRemoveNode"/>
                </template>

                <template #edge-button="edgeButtonProps">
                  <EdgeWithButton v-bind="edgeButtonProps"/>
                </template>
                
                <MiniMap node-color="rgb(39, 36, 40)" node-stroke-color="rgb(34, 87, 101)" mask-color="rgb(4, 22, 34, 0.4)" style="background-color: rgb(34, 87, 101, 0.4);" />
                <Controls />
                <Background variant="dots" :gap="10" :size="1" patternColor="#225765" />
              </VueFlow>
            </div>
            <o-button type="button" @click="openImportExportModal">Import/Export</o-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>


<style lang="scss">
div.nodes {
  overflow-y:auto;
  overflow-x:hidden;
  max-height:840px;
}

/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';
/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
// import default minimap styles
@import '@vue-flow/minimap/dist/style.css';
// import default controls styles
@import '@vue-flow/controls/dist/style.css';

.vue-flow__handle {
  width: 12px;
  height: 12px;
}
</style>