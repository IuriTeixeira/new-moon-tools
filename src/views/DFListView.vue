<script setup>
import { ref, computed } from "vue"
import DFList from "@/components/df/DFList.vue"
import dfService from "@/services/dfService"
import { debounce } from "lodash";

// State
const selectedAttribute = ref("")
const selectedValue = ref("")
const filterByDFName = ref("");
const results = ref([]);

// Get all skills
const allDFItems = computed(() =>
  (dfService.all() ?? [])
)

// Helper: safely read nested property values
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Search field stuff
const onInput = debounce(() => {
  findDFItem()
}, 500
)

async function findDFItem() {
  if (!filterByDFName.value || filterByDFName.value.length < 3) {
    results.value = []
    return
  }

  const found = await Promise.resolve(
    dfService.searchByName(filterByDFName.value)
  )

  results.value = (found ?? [])
}

// Dynamically compute possible values based on selected attribute
const availableValues = computed(() => {
  if (!selectedAttribute.value) return []

  const values = allDFItems.value.map(skill =>
    getNestedValue(skill, selectedAttribute.value)
  )
  return [...new Set(values.filter(Boolean))].sort()
})

// Filtered skills
const filteredDFItems = computed(() => {
  if (filterByDFName.value.length >= 3) {
    return results.value
  }

  let dfsToFilter = results.value.length > 0 ? results.value : allDFItems.value

  if (!selectedAttribute.value || !selectedValue.value) {
    return dfsToFilter
  }

  return dfsToFilter.filter(
    df => getNestedValue(df, selectedAttribute.value) === selectedValue.value
  )
})

const filterOptions = [
  { path: "affinity", label: "Affinity" },
  { path: "categoryType", label: "Category" },
  { path: "actionType", label: "Action Type" },
  { path: "activationType", label: "Activation Type" },
  { path: "areaOfEffect.areaType", label: "Area of Effect Type" }
]

</script>

<template>
  <div id="df-list">
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
              <h1 class="title">Demon Force Items List</h1>
              <p class="subtitle">For Project New Moon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <!-- Filter Row -->
        <div class="columns is-variable is-3">
          <!--Search Field-->
          <!-- <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Search:</label>
              <o-field>
                <o-input v-model="filterByDFName" @input="onInput" placeholder="Search by Item Name..."></o-input>
              </o-field>
            </div>
          </div> -->
          <!-- Attribute Dropdown -->
          <!-- <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Filter by:</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="selectedAttribute" @change="selectedValue = ''"
                    :disabled="filterByDFName.length > 0">
                    <option value="">All Skills</option>
                    <option v-for="option in filterOptions" :key="option.path" :value="option.path">
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div> -->

          <!-- Value Dropdown -->
          <!-- <div class="column is-one-quarter">
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
                      :disabled="filterByDFName.length > 0">
                      {{ value }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div> -->
        </div>
        <br />
        <!-- Skill List -->
        <DFList :df="allDFItems" />
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