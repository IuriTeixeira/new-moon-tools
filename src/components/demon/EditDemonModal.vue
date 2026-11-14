<script setup>
import { ref, onMounted, markRaw } from 'vue'

import SkillSelection from '@/components/demon/SkillSelection.vue'
import skillService from "@/services/skillService";

const props = defineProps({
  demon: {
    type: Object,
  },
  options: {
    type: Object,
  }
})

const emit = defineEmits(['close'])

const level = ref(props.options.level)
const type = ref(props.options.type)
const defaultSkills = ref([])
const acquiredSkills = ref([])

onMounted(async () => {
  // 1. Resolve Default Skills asynchronously in parallel
  if (props.demon?.skills) {
    const defaultPromises = props.demon.skills.map(async (element) => {
      const skill = await skillService.get(element);
      if (!skill) return null;
      const selected = (props.options.selectedSkills || []).some(i => element == i);
      return { id: skill.id, skill: markRaw(skill), inherit: selected };
    });
    const resolvedDefaults = await Promise.all(defaultPromises);
    defaultSkills.value = markRaw(resolvedDefaults.filter(Boolean));
  }

  // 2. Resolve Acquired Skills asynchronously in parallel
  if (props.demon?.acquiredSkills) {
    const acquiredPromises = props.demon.acquiredSkills.map(async (element) => {
      const skill = await skillService.get(element.id);
      if (!skill) return null;
      const selected = (props.options.selectedSkills || []).some(i => element.id == i);
      return { id: skill.id, skill: markRaw(skill), inherit: selected };
    });
    const resolvedAcquired = await Promise.all(acquiredPromises);
    acquiredSkills.value = markRaw(resolvedAcquired.filter(Boolean));
  }
})

function onSave(){
  props.options.level = level.value;
  props.options.type = type.value;
  const newSkills = [];
  
  defaultSkills.value.forEach((element) => {
    if (element.inherit){
      newSkills.push(element.id)
    }
  })

  acquiredSkills.value.forEach((element) => {
    if (element.inherit){
      newSkills.push(element.id)
    }
  })

  props.options.selectedSkills = [...new Set(newSkills)];
  emit('close')
}
</script>

<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Editing <span class="has-text-weight-bold">{{demon.name}}</span></p>
      <o-icon
        clickable
        native-type="button"
        icon="close"
        @click.="$emit('close')"/>
    </header>
    <section class="modal-card-body">
      <o-field grouped>
                <o-field label="Level">
                    <o-input type="number" min=1 max=98 v-model="level"></o-input>
                </o-field>
                <o-field label="How is this Demon Obtained?">
                    <o-select v-model="type" class="is-fullwidth">
                        <option value="contract">Contract</option>
                        <option value="double">Double Fusion</option>
                        <option value="triple">Triple Fusion</option>
                        <option value="rebirth">Rebirth</option>
                        <option value="level">Level</option>
                    </o-select>
                </o-field>
            </o-field>
            <div class="content">
                <h3 style="text-align:center;">Mark Skills to Inherit</h3>
                <hr/>
                <div class="columns is-mobile is-centered" style="overflow-y:auto; overflow-x:hidden; height:650px;">
                    <div class="column">
                        <h4>Default Skills</h4>
                        <skill-selection
                            v-for="data in defaultSkills"
                            :key="data.id"
                            :data="data"
                        />
                    </div>
                    <div class="column">
                        <h4>Acquired Skills</h4>
                        <skill-selection
                            v-for="data in acquiredSkills"
                            :key="data.id"
                            :data="data"
                        />
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