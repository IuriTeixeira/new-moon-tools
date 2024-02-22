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
                    :draggable="true" @dragstart="onDragStart($event, 'demon', demon)">{{ demon.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="container" @drop="onDrop" style="width:100%; height:600px; background-color: #07273C;">
              <VueFlow v-model="elements"  @dragover="onDragOver" @dragleave="onDragLeave">
                <template #node-demon="props">
                  <DemonNode v-bind="props"/>
                </template>
                
                <MiniMap />
                <Controls />
                <Background variant="dots" :gap="10" :size="1" patternColor="#225765" />
              </VueFlow>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
//---
import DemonNode from '@/components/demon/DemonNode.vue'
import useDragAndDrop from '@/services/demonPlanner/useDnD'
const { onDragStart, onDragOver, onDrop, onDragLeave, isDragging } = useDragAndDrop()
//---
import debounce from "@/services/demonPlanner/debounce"
import demonService from "@/services/demonService";

const search = ref("");
const results = ref([]);

const onInput = debounce(() => {
    findDemon()
  }, 500)

function findDemon(){
  let demons = demonService.searchByName(search.value)
  results.value = demons;
}

const jackFrost = demonService.get(569);
const caitSith = demonService.get(549);
const virtue = demonService.get(183);
const x = {
  type: "contract",
  level: "83",
  skills: [
    5012,
    67
  ]
}

const y = {
  type: "contract",
  level: "8",
  skills: [
  ]
}

const z = {
  type: "fusion",
  level: "51",
  skills: [
    5012,
    67
  ]
}

const elements = ref([
  // nodes

  { 
    id: '1', 
    type: 'demon', 
    data: {
      demon: jackFrost, 
      options: x, 
    },
    position:{ x: 50, y: 350 }
  },
  { 
    id: '2', 
    type: 'demon', 
    data: {
      demon: caitSith, 
      options: y, 
    },
    position:{ x: 350, y: 350 }
  },
  { 
    id: '3', 
    type: 'demon', 
    data: {
      demon: virtue, 
      options: z, 
    },
    position:{ x: 200, y: 50 }
  },


  // edges

  // an animated edge, specified by using `animated: true`
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },

])



</script>

<style lang="scss">
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';
/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
// import default minimap styles
@import '@vue-flow/minimap/dist/style.css';
// import default controls styles
@import '@vue-flow/controls/dist/style.css';
</style>