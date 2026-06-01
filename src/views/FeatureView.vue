<script setup>
import { ref, computed } from "vue"
import featureList from "@/components/features/FeatureList.vue"
import featureService from "@/services/featureService"
import demonService from "@/services/demonService"
import itemService from "@/services/itemService"
import epitaphService from "@/services/epitaphService"
import { debounce } from "lodash";

// State
const selectedAttribute = ref("")
const filterByFeatureName = ref("");
const results = ref([]);

// Get all features
const allFeatures = computed(() =>
    featureService.all()
)

const allDemons = computed(() =>
    (demonService.all() ?? []).filter(
        demon => demon.traits.some((trait) => trait !== 0)
    )
)

const allEpitaphs = computed(() => {
    return epitaphService.all() ?? [];
});

// Helper: safely read nested property values
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Search field stuff
const onInput = debounce(() => {
    findFeatures()
}, 500
)

async function findFeatures() {
    if (!filterByFeatureName.value || filterByFeatureName.value.length < 3) {
        results.value = []
        return
    }

    let found = await Promise.resolve(
        featureService.searchByName(filterByFeatureName.value)
    )

    // Apply the same filters used for allSkills
    results.value = (found ?? []).filter(
        feat => feat.family === "Demonic Feature"
    )
}

// Filtered skills
const filteredFeatures = computed(() => {
    if (filterByFeatureName.value.length >= 3) {
        return results.value;
    }

    let featuresToFilter = results.value.length > 0 ? results.value : allFeatures.value;

    if (!selectedAttribute.value) {
        return featuresToFilter;
    }

    // Handle the explicit "No Exclusions" filter selection
    if (selectedAttribute.value === 'feat_exclusion.empty') {
        return featuresToFilter.filter(feat =>
            !feat.feat_exclusion || feat.feat_exclusion.length === 0
        );
    }

    // Handle regular exclusion name filters
    const targetName = selectedAttribute.value.replace('feat_exclusion.', '');

    return featuresToFilter.filter(feat => {
        if (!feat.feat_exclusion) return false;

        return feat.feat_exclusion.some(exclusion =>
            exclusion.name === targetName
        );
    });
});


const filterOptions = computed(() => {
    // 1. Flatten all exclusion arrays and extract the names
    const names = allFeatures.value
        .flatMap(feat => feat.feat_exclusion || [])
        .map(exclusion => exclusion.name)
        .filter(Boolean);

    // 2. Remove duplicate names
    const uniqueNames = [...new Set(names)];

    // 3. Map to the object structure
    const dynamicOptions = uniqueNames.map(name => ({
        path: `feat_exclusion.${name}`,
        label: name
    }));

    // 4. Prepend a custom option for empty exclusions
    return [
        { path: "feat_exclusion.empty", label: "No Category" },
        ...dynamicOptions
    ];
});


const epitaphs = computed(() => {
    // 1. Guard check to handle uninitialized state safely
    if (!filteredFeatures.value || !allEpitaphs.value) return [];

    // 2. Map active feature IDs into a Set for rapid O(1) matching
    const featureIds = new Set(filteredFeatures.value.map(feat => Number(feat.id)));

    // 3. Filter epitaphs down to only those matching our current active features
    const activeEpitaphs = allEpitaphs.value.filter(epi => featureIds.has(Number(epi.skillID)));

    // 4. Map the matching item objects directly out of itemService
    // Use .flatMap() to skip items that might be missing from itemService
    const rawItems = itemService.all() ?? [];

    return activeEpitaphs.flatMap(epi => {
        const matchingItem = rawItems.find(item => Number(item.id) === Number(epi.itemID));

        // If an item is found, append the skillID onto it so the parent list can track it
        return matchingItem ? [{ ...matchingItem, skillID: epi.skillID }] : [];
    });
});


const featureDemons = computed(() => {
    let demons = []
    filteredFeatures.value.forEach(feat => {
        demons.push(allDemons.value.filter((demon) => demon.traits.includes(feat.id)))
    });
    return demons
})
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
                            <h1 class="title">Feature List</h1>
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
                                <o-input v-model="filterByFeatureName" @input="onInput"
                                    placeholder="Search by Feature Name..."></o-input>
                            </o-field>
                        </div>
                    </div>
                    <!-- Attribute Dropdown -->
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">Filter by Category:</label>
                            <div class="control">
                                <div class="select is-fullwidth">
                                    <select v-model="selectedAttribute" :disabled="filterByFeatureName.length > 0">
                                        <option value="">All Features</option>
                                        <option v-for="option in filterOptions" :key="option.path" :value="option.path">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Legend -->
                <em>
                    Note: Demon names are color coded:
                    <br />
                    <ul>
                        <li>• No color - Regular obtainable demon</li>
                        <li>• <span style="color:orange">Orange</span> - Mitama'd demon</li>
                        <li>• <span style="color:red">Red</span> - Unobtainable demon</li>
                    </ul>
                </em>
                <br />
                <!-- Features List -->
                <featureList :features="filteredFeatures" :demons="featureDemons" :epitaphs="epitaphs" />
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