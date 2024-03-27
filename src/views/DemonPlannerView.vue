
<script setup>
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls, ControlButton} from '@vue-flow/controls'
//---
import DemonNode from '@/components/demon/DemonNode.vue'
import NoteNode from '@/components/demon/NoteNode.vue'
import EdgeWithButton from '@/components/demon/EdgeWithButton.vue'
import useDragAndDrop from '@/services/demonPlanner/useDnD'
const { onDragStart, onDragOver, onDrop, onDragLeave, isDragging } = useDragAndDrop()
//---
import debounce from "@/services/demonPlanner/debounce"
import demonService from "@/services/demonService";
import DemonDrag from '@/components/demon/DemonDrag.vue'
import _ from 'lodash'
//---
import ImportExportModal from '@/components/demon/ImportExportModal.vue'
import { useOruga } from "@oruga-ui/oruga-next";
import skillService from '../services/skillService'
const oruga = useOruga();

const filterByDemonName = ref("");
const filterBySkillName = ref("");
const selectedSkill = ref(null);

const results = ref([]);
const elements = ref([])

const skills = ref([]);
const isFetchingSkills = ref(false);

async function onSelect (select){
  selectedSkill.value = select;
  let demons = []
  demons = await demonService.searchBySkill(select.id);
  results.value = demons;
}


const onInput = debounce(() => {
    findDemon()
  }, 500
)

async function findSkills(_name){
  isFetchingSkills.value = true;
  if (_name.length > 2){
    skills.value = await skillService.searchByName(_name)
  }
  else {
    skills.value = []
    results.value = []
  }
  isFetchingSkills.value = false;
}

async function findDemon(){
  let demons = [];
  if (filterByDemonName.value.length > 0){
    demons = await demonService.searchByName(filterByDemonName.value)
  }

  results.value = demons;
}

function nextId(type) {
  const n = elements.value.filter(function(i) {
    return Object.hasOwn(i, 'position') && i.type === type
  })
  if (n.length > 0){
    const z = [];
    n.forEach((el) => {
      var x = parseInt(el.id.replace(`${type}node_`, ''))
      z.push(x);
    })
    const max = Math.max(...z);
    return `${type}node_${max + 1}`;
  }
  return `${type}node_1`;
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
      copy: onCopy,
      download: onDownload,
      ingest: onIngest,
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

function addNoteNode(){
  const id = nextId('note');

  const dto = {
    id: id,
    options: {
      notes: "",
      selectedSkills: [
      ],
    }
  }

  const newNode = {
    id: id,
    type: 'note',
    label: `[${id}]`,
    data: dto,
    position: { x: 200, y: 200 },
  }
  
  elements.value.push(newNode)
}

function onCloneNode(data){
  const oldNode = elements.value.find(n => n.id == data.id);
  let newData = _.cloneDeep(data);
  const id = nextId('demon');
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

function onCopy() {
  oruga.notification.open({
    message: 'Demon planner data has been copied to the clipboard!',
    rootClass: 'toast-notification',
    position: 'top',
    duration: 5000,
    closable: true,
    variant: 'success'
  })
}

function onDownload(filename) {
  oruga.notification.open({
    message: `Demon planner data has been saved to ${filename}!`,
    rootClass: 'toast-notification',
    position: 'top',
    duration: 5000,
    closable: true,
    variant: 'success'
  })
}

function onIngest(json){
  const data = JSON.parse(json)
  elements.value = data;
  oruga.notification.open({
    message: 'Demon planner data has been imported!',
    rootClass: 'toast-notification',
    position: 'top',
    duration: 5000,
    closable: true,
    variant: 'success'
  })
}

</script>

<template>
  <div id="flowchart">
    <section class="hero is-warning is-bold">
      <div class="hero-body">
        <div class="container">
          <div class="columns is-vcentered">
            <div class="column is-2 has-text-centered">
              <figure class="image is-128x128 is-inline-block">
                <img alt="New Moon logo" src="@/assets/logo.png" />
              </figure>
            </div>
            <div class="column is-10">
              <!-- Left side -->
              <h1 class="title">Demon Planner</h1>
              <p class="subtitle">In Beta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-one-quarter">
            <div class="container">
              <div class="content">
                <div class="card">
                  <header class="card-header">
                    <p class="card-header-title">
                      Filters
                    </p>
                  </header>
                  <div class="card-content">
                    <o-field>
                      <o-input v-model="filterByDemonName" @input="onInput" placeholder="Search by Demon Name..." :disabled="filterBySkillName.length > 0"></o-input>
                    </o-field>
                    <o-field>
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
                  </div>
                </div>
                <div class="card mt-2 pb-4" v-if="results.length > 0">
                  <header class="card-header">
                    <p class="card-header-title">
                      Results
                    </p>
                  </header>
                  <div class="nodes">
                    <DemonDrag
                      v-for="demon in results"
                      :key="demon.ID" 
                      :demon="demon"
                      :draggable="true" 
                      @dragstart="onDragStart($event, 'demon', demon, nextId('demon'))">
                    </DemonDrag>
                  </div>
                </div> 
                <o-button variant="primary" type="button" class="is-fullwidth mt-2" @click="openImportExportModal">Import/Export</o-button> 
              </div>
            </div>
          </div>
          <div class="column">
            <div class="container" @drop="onDrop" style="width:100%; height:900px; background-color: rgb(7, 39, 60);">
              <VueFlow v-model="elements" @dragover="onDragOver" @dragleave="onDragLeave" @connect="onConnect" :connection-radius="30" connection-mode="strict" :delete-key-code="null">
                <template #node-demon="nodeDemonProps">
                  <DemonNode v-bind="nodeDemonProps" @clone-node="onCloneNode" @remove-node="onRemoveNode"/>
                </template>

                <template #node-note="nodeNoteProps">
                  <NoteNode v-bind="nodeNoteProps" @remove-node="onRemoveNode"/>
                </template>

                <template #edge-button="edgeButtonProps">
                  <EdgeWithButton v-bind="edgeButtonProps"/>
                </template>
                
                <MiniMap node-color="rgb(39, 36, 40)" node-stroke-color="rgb(34, 87, 101)" mask-color="rgb(4, 22, 34, 0.4)" style="background-color: rgb(34, 87, 101, 0.4);" />
                <Controls>
                  <ControlButton @click="addNoteNode">
                    <o-icon icon="note-plus" style="color:#FFF"></o-icon>
                  </ControlButton>
                </Controls>
                <Background variant="dots" :gap="10" :size="1" patternColor="#225765" />
              </VueFlow>
            </div>
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
  max-height:592px;
}

@import '@/assets/styles/main.scss';

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

.vue-flow__controls-button {
  background-color: $lavender;
  border-bottom-color: $lavender-dark;
}

.vue-flow__controls-button svg path{
  fill:$text;
}

.vue-flow__controls-button:hover {
  background-color: $lavender-dark;
}
</style>