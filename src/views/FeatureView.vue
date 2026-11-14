<script setup>
import { ref, computed, onMounted, markRaw } from "vue"
import featureList from "@/components/features/FeatureList.vue"
import featureService from "@/services/featureService"
import demonService from "@/services/demonService"
import itemService from "@/services/itemService"
import epitaphService from "@/services/epitaphService"
import { debounce } from "lodash";

// Store raw data without reactive proxies
const rawFeatures = ref([])
const rawDemons = ref([])
const rawEpitaphs = ref([])
const rawItems = ref([])

const selectedAttribute = ref("")
const filterByFeatureName = ref("");
const results = ref([]);

// Fetch data on mount
onMounted(async () => {
    // markRaw prevents Vue from recursively tracking thousands of objects
    const features = await featureService.all() || []
    rawFeatures.value = markRaw(features)

    const demonsData = await demonService.all() || []
    const filteredDemons = demonsData.filter(demon => demon.traits?.some(trait => trait !== 0))
    rawDemons.value = markRaw(filteredDemons)

    const epitaphs = await epitaphService.all() || []
    rawEpitaphs.value = markRaw(epitaphs)

    const items = await itemService.all() || []
    rawItems.value = markRaw(items)
})

// Computed properties using reactive refs
const allFeatures = computed(() => rawFeatures.value)
const allDemons = computed(() => rawDemons.value)
const allEpitaphs = computed(() => rawEpitaphs.value)

// Helper: safely read nested property values
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Search field stuff
const onInput = debounce(() => {
    findFeatures()
}, 500)

async function findFeatures() {
    if (!filterByFeatureName.value || filterByFeatureName.value.length < 3) {
        results.value = []
        return
    }

    let found = await Promise.resolve(
        featureService.searchByName(filterByFeatureName.value)
    )

    const query = filterByFeatureName.value.toLowerCase()

    results.value = (found ?? []).filter(feat => {
        const foundName = feat.name?.toLowerCase().includes(query)
        const foundNameNO = feat.nameNO?.toLowerCase().includes(query)
        return foundName || foundNameNO
    })
}

// Filtered features
const filteredFeatures = computed(() => {
    if (filterByFeatureName.value.length >= 3) {
        return results.value;
    }

    let featuresToFilter = results.value.length > 0 ? results.value : allFeatures.value;

    if (!selectedAttribute.value) {
        return featuresToFilter;
    }

    if (selectedAttribute.value === 'feat_exclusion.empty') {
        return featuresToFilter.filter(feat =>
            !feat.feat_exclusion || feat.feat_exclusion.length === 0
        );
    }

    const targetName = selectedAttribute.value.replace('feat_exclusion.', '');

    return featuresToFilter.filter(feat => {
        if (!feat.feat_exclusion) return false;
        return feat.feat_exclusion.some(exclusion =>
            exclusion.name === targetName
        );
    });
});

const filterOptions = computed(() => {
    // Only process if features are loaded
    if (!allFeatures.value.length) return [];

    const names = allFeatures.value
        .flatMap(feat => feat.feat_exclusion || [])
        .map(exclusion => exclusion.name)
        .filter(Boolean);

    const uniqueNames = [...new Set(names)];

    return [
        { path: "feat_exclusion.empty", label: "No Category" },
        ...uniqueNames.map(name => ({
            path: `feat_exclusion.${name}`,
            label: name
        }))
    ];
});

const epitaphs = computed(() => {
    if (!filteredFeatures.value || !allEpitaphs.value) return [];

    const featureIds = new Set(filteredFeatures.value.map(feat => Number(feat.id)));
    const activeEpitaphs = allEpitaphs.value.filter(epi => featureIds.has(Number(epi.skillID)));

    return activeEpitaphs.flatMap(epi => {
        const matchingItem = rawItems.value.find(item => Number(item.id) === Number(epi.itemID));
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
                <featureList :features="filteredFeatures" :demons="featureDemons" :epitaphs="epitaphs"
                    :allDemons="allDemons" />
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