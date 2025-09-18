<script setup>
import { ref, computed } from "vue"
import SkillList from "@/components/skill/SkillList.vue"
import skillService from "@/services/skillService"

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
      !skill.name.toLowerCase().includes("debug")
  )
)

// Helper: safely read nested property values
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Dynamically compute possible values based on selected attribute
const availableValues = computed(() => {
  if (!selectedAttribute.value) return []
  const values = allSkills.value.map(skill =>
    getNestedValue(skill, selectedAttribute.value)
  )
  return [...new Set(values.filter(Boolean))].sort()
})

// Filtered skills
const filteredSkills = computed(() => {
  if (!selectedAttribute.value || !selectedValue.value) return allSkills.value
  return allSkills.value.filter(
    skill => getNestedValue(skill, selectedAttribute.value) === selectedValue.value
  )
})

const filterOptions = [
  { path: "statDependency", label: "Stat" },
  { path: "affinity", label: "Affinity" },
  { path: "categoryType", label: "Category" },
  { path: "actionType", label: "Action Type" },
  { path: "activationType", label: "Activation Type" },
  { path: "areaOfEffect.areaType", label: "Area of Effect Type" }
]

</script>

<template>
  <div id="expertise">
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