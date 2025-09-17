<script setup>
import { computed } from 'vue'
import skillService from "@/services/skillService";

import Skill from "@/components/expertise/Skill.vue";

//-- Data

const skills = computed(() => {
    return skillService.all().filter(skill =>
        (skill.family === "Arcane Art" || skill.family === "Technique" || skill.family === "Special Skill")
        && !skill.name.toLowerCase().includes("debug")
    );
});


</script>

<template>
    <div>
        <div class="skill-summary">
            <Skill v-for="skill in skills" :key="skill.id" :skill="skill" />
        </div>
    </div>
</template>
<script>
</script>

<style lang="scss">
.toggle-header {
    cursor: pointer;
}

#chain-expertise {
    margin: 0.25em auto;
}

.is-label {
    margin-right: 1rem;
}

.option-title {
    font-weight: bold;
    font-size: 1.1em;
}

.collapse.card {
    margin: 1em auto;
}
</style>
