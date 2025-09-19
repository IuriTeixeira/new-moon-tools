<script setup>
import { ref, computed } from "vue"
import SkillList from "@/components/skill/SkillList.vue"
import skillService from "@/services/skillService"
import expertiseService from "@/services/expertiseService";

// State
const selectedAttribute = ref("")
const selectedValue = ref("")

// Get all skills
const allSkills = computed(() =>
  skillService.all().filter(
    skill =>
      (skill.family === "Arcane Art" ||
        skill.family === "Technique" ||
        skill.family === "Special Skill") &&
      skill.activationType !== "Special" &&
      !skill.description.toLowerCase().includes("fusion skill") &&
      !skill.name.toLowerCase().includes("debug") &&
      !skill.name.toLowerCase().includes("ＧＭ")
  )
)

// Extract all skill IDs from breakpoints across all expertises
const expertiseSkillIDs = new Set(
  expertiseService.all().flatMap(expertise =>
    expertise.breakpoints.flatMap(bp => bp.skills)
  )
);

const expertiseSkills = computed(() =>
  allSkills.value.filter(skill => expertiseSkillIDs.has(Number(skill.id)))
);

// Helper: safely read nested property values
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Dynamically compute possible values based on selected attribute
const availableValues = computed(() => {
  if (!selectedAttribute.value) return []

  if (selectedAttribute.value === "expertise"){
    return expertiseService.all()
    .filter(
      exp => exp.name &&
      exp.name !== "--Unused--" &&
      Array.isArray(exp.breakpoints) &&
      exp.breakpoints.some(bp => Array.isArray(bp.skills) && bp.skills.length > 0) 
    )
    .map(exp => exp.name)
  }

  const values = allSkills.value.map(skill =>
    getNestedValue(skill, selectedAttribute.value)
  )
  return [...new Set(values.filter(Boolean))].sort()
})

// Filtered skills
const filteredSkills = computed(() => {
  if (!selectedAttribute.value || !selectedValue.value) {
    return selectedAttribute.value === "expertise"
      ? expertiseSkills.value
      : allSkills.value
  }

  if (selectedAttribute.value === "expertise") {
    // Find the selected expertise
    const selectedExpertise = expertiseService.all().find(
      exp => exp.name === selectedValue.value
    )
    if (!selectedExpertise) return []
    const selectedSkillIDs = new Set(
      selectedExpertise.breakpoints.flatMap(bp => bp.skills)
    )
    return allSkills.value.filter(skill => selectedSkillIDs.has(Number(skill.id)))
  }
  
  return allSkills.value.filter(
    skill => getNestedValue(skill, selectedAttribute.value) === selectedValue.value
  )
})

const filterOptions = [
  { path: "expertise", label: "Expertise" },
  { path: "statDependency", label: "Stat" },
  { path: "affinity", label: "Affinity" },
  { path: "categoryType", label: "Category" },
  { path: "actionType", label: "Action Type" },
  { path: "activationType", label: "Activation Type" },
  { path: "areaOfEffect.areaType", label: "Area of Effect Type" }
]

</script>

<template>
  <div id="skill-list">
    <section class="hero is-primary is-bold">
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
              <h1 class="title">Skill List</h1>
              <p class="subtitle">For Project New Moon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <!-- Filter Row -->
        <div class="columns is-variable is-2">
          <!-- Attribute Dropdown -->
          <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Filter by:</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedAttribute" @change="selectedValue = ''">
                    <option value="">All Skills</option>
                    <option v-for="option in filterOptions" :key="option.path" :value="option.path">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Value Dropdown -->
          <div class="column is-one-quarter">
            <div class="field">
              <label class="label">
                Select
                {{
                  filterOptions.find(option => option.path === selectedAttribute)?.label || "Value"
                }}:
              </label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedValue" :disabled="!selectedAttribute">
                    <option value="">All</option>
                    <option v-for="value in availableValues" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Skill List -->
        <skill-list :skills="filteredSkills" />
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.o-tabs__content {
  padding: 0px;
}

.field-container {
  display: flex;
  align-items: center;
  vertical-align: center;
}

.toast-notification {
  margin: 0.5em 0;
  text-align: center;
  box-shadow: 0 1px 4px rgb(0 0 0 / 12%), 0 0 6px rgb(0 0 0 / 4%);
  border-radius: 2em;
  padding: 0.75em 1.5em;
  pointer-events: auto;
  color: #e6d6e6;
  background: #485fc7;
}
</style>