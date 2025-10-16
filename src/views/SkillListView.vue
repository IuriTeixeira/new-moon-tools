<script setup>
import { ref, computed } from "vue"
import SkillList from "@/components/skill/SkillList.vue"
import skillService from "@/services/skillService"
import demonService from "@/services/demonService"
import expertiseService from "@/services/expertiseService";
import { debounce } from "lodash";

// State
const selectedAttribute = ref("")
const selectedValue = ref("")
const selectedSource = ref("")
const filterBySkillName = ref("");
const results = ref([]);

// Get all skills
const allSkills = computed(() =>
  (skillService.all() ?? []).filter(
    skill =>
      (skill.family === "Arcane Art" ||
        skill.family === "Technique" ||
        skill.family === "Special Skill") &&
      skill.activationType !== "Special" &&
      !skill.description?.toLowerCase().includes("fusion skill") &&
      !skill.name?.toLowerCase().includes("debug") &&
      !skill.name?.includes("【ＧＭ】")
  )
)

const allDemons = computed(() =>
  (demonService.all() ?? []).filter(
    demon => demon.skills.length > 0
  )
)
// Extract all skill IDs from breakpoints across all expertises
const expertiseSkillIDs = new Set(
  (expertiseService.all() ?? []).flatMap(expertise =>
    (expertise.breakpoints ?? []).flatMap(bp => bp.skills ?? [])
  )
);

const expertiseSkills = computed(() =>
  allSkills.value.filter(skill => expertiseSkillIDs.has(Number(skill.id)))
);

// Helper: safely read nested property values
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Search field stuff
const onInput = debounce(() => {
  findSkills()
}, 500
)

async function findSkills() {
  if (!filterBySkillName.value || filterBySkillName.value.length < 3) {
    results.value = []
    return
  }

  let found = await Promise.resolve(
    skillService.searchByName(filterBySkillName.value)
  )

  // Apply the same filters used for allSkills
  results.value = (found ?? []).filter(
    skill =>
      (skill.family === "Arcane Art" ||
        skill.family === "Technique" ||
        skill.family === "Special Skill") &&
      skill.activationType !== "Special" &&
      !skill.description?.toLowerCase().includes("fusion skill") &&
      !skill.name?.toLowerCase().includes("debug") &&
      !skill.name?.includes("【ＧＭ】")
  )
}

// Dynamically compute possible values based on selected attribute
const availableValues = computed(() => {
  if (!selectedAttribute.value) return []

  if (selectedAttribute.value === "expertise") {
    return expertiseService.all()
      .filter(
        exp => exp.name &&
          exp.name !== "--Unused--" &&
          Array.isArray(exp.breakpoints) &&
          exp.breakpoints.some(bp => Array.isArray(bp.skills) && bp.skills.length > 0)
      )
      .map(exp => exp.name).sort()
  }

  const values = allSkills.value.map(skill =>
    getNestedValue(skill, selectedAttribute.value)
  )
  return [...new Set(values.filter(Boolean))].sort()
})

// Filtered skills
const filteredSkills = computed(() => {
  if (filterBySkillName.value.length >= 3) {
    return results.value
  }

  let skillsToFilter = results.value.length > 0 ? results.value : allSkills.value

  if (!selectedAttribute.value || !selectedValue.value) {
    return selectedAttribute.value === "expertise"
      ? expertiseSkills.value
      : skillsToFilter
  }

  if (selectedSource !== "") {
    switch (selectedSource) {
      case "player":
      case "alliedDemons":
        skillsToFilter = (skillsToFilter ?? []).filter(
          (skill) => allDemons.value.some((demon) => (
            demon.skills.includes(skill.id) ||
            demon.acquiredSkills.includes(skill.id)
          ))
        )
        break
      case "enemyDemons":
        skillsToFilter = (skillsToFilter ?? []).filter(
          (skill) => allDemons.value.some((demon) => (
            demon.enemyOnlySkills.includes(skill.id)
          ))
        )
        break
    }
  }

  if (selectedAttribute.value === "expertise") {
    const selectedExpertise = expertiseService.all().find(
      exp => exp.name === selectedValue.value
    )
    if (!selectedExpertise) return []
    const selectedSkillIDs = new Set(
      selectedExpertise.breakpoints.flatMap(bp => bp.skills)
    )
    return skillsToFilter.filter(skill => selectedSkillIDs.has(Number(skill.id)))
  }

  return skillsToFilter.filter(
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
  { path: "areaOfEffect.areaType", label: "Area of Effect Type" },
]

const filterSource = [
  //{ path: "player", label: "Player" },
  { path: "allDemons", label: "All Demons" },
  { path: "alliedDemons", label: "Allied Demons" },
  { path: "enemyDemons", label: "Enemy Demons" }
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
        <div class="columns is-variable is-4">
          <!--Search Field-->
          <div class="column is-one-fifth">
            <div class="field">
              <label class="label">Search:</label>
              <o-field>
                <o-input v-model="filterBySkillName" @input="onInput" placeholder="Search by Skill Name..."></o-input>
              </o-field>
            </div>
          </div>
          <!-- Attribute Dropdown -->
          <div class="column is-one-fifth">
            <div class="field">
              <label class="label">Filter by:</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedAttribute" @change="selectedValue = ''"
                    :disabled="filterBySkillName.length > 0">
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
          <div class="column is-one-fifth">
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
                    <option v-for="value in availableValues" :key="value" :value="value"
                      :disabled="filterBySkillName.length > 0">
                      {{ value }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <!-- Source of Skill Radio Buttons -->
          <div class="column is-one-third">
            <div class="field">
              <label class="label">Skill is available for:</label>
              <div class="control">
                <div class="radio is-fullwidth">
                  <o-field :disabled="filterBySkillName.length > 0">
                    <o-radio v-model="selectedSource" value="" name="Source">All</o-radio>
                    <o-radio v-model="selectedSource" v-for="radio in filterSource" :key="radio.path" :native-value="radio.path" name="Source">
                      {{ radio.label }}
                    </o-radio>
                  </o-field>
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />
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