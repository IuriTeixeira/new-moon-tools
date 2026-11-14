<script setup>
import { ref, computed, onMounted, markRaw, watch } from 'vue'
import { debounce } from "lodash";
import DemonSummary from "@/components/fusion/DemonSummary.vue"
import demonService from "@/services/demonService";

//-- Data
const activeTab = ref("0");
const filterByDemonName = ref("");
const selectedFilter = ref("")
const selectedSource = ref("")
const results = ref([]);
const rawDemons = ref([]);

const filterOptions = [
    { path: "alliedDemons", label: "Allied Demons" },
    { path: "enemyDemons", label: "Enemy Demons" },
]

const props = defineProps({
    selectedDemon: {
        type: Object,
        required: false,
        default: null
    }
})

// Local reactive state
const currentDemon = ref(props.selectedDemon)

// Fetch all demons asynchronously on mount and apply markRaw to prevent browser lag
onMounted(async () => {
    const demons = await demonService.all() || []
    rawDemons.value = markRaw(demons)

    // If no parent prop was passed, default to demon ID 569
    if (!currentDemon.value && rawDemons.value.length > 0) {
        currentDemon.value = rawDemons.value.find(d => d.id === 569) || rawDemons.value[0];
    }
})

// Keep currentDemon in sync if parent prop updates
watch(() => props.selectedDemon, (newVal) => {
    if (newVal) {
        currentDemon.value = newVal;
    }
})

const allDemons = computed(() => rawDemons.value)

// Search field debounced input
const onInput = debounce(() => {
    findDemons()
}, 500)

async function findDemons() {
    const query = filterByDemonName.value?.toLowerCase().trim();

    if (!query || query.length < 3) {
        results.value = [];
        return;
    }

    // Search locally against the pre-loaded raw list
    results.value = allDemons.value.filter(demon =>
        demon.name?.toLowerCase().includes(query) ||
        demon.nameNO?.toLowerCase().includes(query) ||
        demon.title?.toLowerCase().includes(query) ||
        demon.titleNO?.toLowerCase().includes(query)
    );
}

// Helper: safely read nested property values
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Dynamically compute possible values based on selected filter
const availableValues = computed(() => {
    if (!selectedFilter.value || selectedFilter.value === "gearSkill") return []

    const values = allDemons.value.map(demon =>
        getNestedValue(demon, selectedFilter.value)
    )
    return [...new Set(values.filter(Boolean))].sort()
})

const changeDemon = (id) => {
    // Instant synchronous lookup from our local cached array
    const found = rawDemons.value.find(d => d.id === id);
    if (found) {
        currentDemon.value = found;
    }
    results.value = []; // Clears the search results list on click
}

function alignmentColor(alignment) {
    switch (alignment) {
        case "Law": return "blue"
        case "Neutral": return "green"
        case "Chaos": return "red"
    }
}

function handleImageError(event) {
    event.target.src = './img/Default.png';
}
</script>

<template>
    <div id="expertise">
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
                            <h1 class="title">Demon Fusion Simulator</h1>
                            <p class="subtitle">In Beta</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="section">
            <div class="container">
                <o-tabs v-model="activeTab" class="is-fullwidth" type="boxed">
                    <o-tab-item value="0" label="Demon Summary">
                        <!-- Filter Row -->
                        <div class="columns is-variable is-4">
                            <!--Search Field-->
                            <div class="column is-one-fifth">
                                <div class="field">
                                    <label class="label">Search:</label>
                                    <o-field>
                                        <o-input v-model="filterByDemonName" @input="onInput"
                                            placeholder="Search by Demon Name..."></o-input>
                                    </o-field>
                                </div>
                            </div>
                            <div class="column is-one-third">
                                <div class="field">
                                    <label class="label">Availability:</label>
                                    <div class="control">
                                        <div class="radio is-fullwidth">
                                            <o-field>
                                                <o-radio v-model="selectedSource" native-value=""
                                                    name="Source">All</o-radio>
                                                <o-radio v-model="selectedSource" v-for="radio in filterOptions"
                                                    :key="radio.path" :native-value="radio.path" name="Source">
                                                    {{ radio.label }}
                                                </o-radio>
                                            </o-field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Search Results -->
                        <div v-if="results.length">
                            <div v-for="demon in results" :key="demon.id" class="media">
                                <div class="media-left">
                                    <figure class="image is-48x48">
                                        <img :src="'./img/demon/' + demon.icon + '.png'" :alt="demon.name"
                                            @error="handleImageError">
                                    </figure>
                                </div>
                                <div class="media-content">
                                    <p class="title is-6"><a href="#" @click.prevent="changeDemon(demon.id)">{{
                                        demon.title }} {{ demon.name }}</a>
                                        <span
                                            v-if="
                                                (demon.nameNO !== '' && demon.name !== demon.nameNO) || (demon.titleNO !== '' && demon.title !== demon.titleNO)"
                                            class="subtitle is-7 expertise-requirement is-flex is-align-items-center"
                                            style="gap: 0.5rem;">
                                            <figure class="image m-0">
                                                <img :src="'./img/NO_icon.png'" alt="New Order" class="is-square">
                                            </figure>
                                            {{ demon.titleNO }} {{ demon.nameNO }}
                                        </span>
                                    </p>
                                    <p class="subtitle is-7">
                                        Lv {{ demon.baseLevel }} • ID: {{ demon.id }}
                                        <br />{{ demon.family }} • {{ demon.race }} • <span
                                            :class="alignmentColor(demon.alignment)">{{
                                                demon.alignment }}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DemonSummary v-if="currentDemon" :demon="currentDemon" />
                    </o-tab-item>
                    <o-tab-item value="1" label="Double Fusion">
                    </o-tab-item>
                    <o-tab-item value="2" label="Triple Fusion">
                    </o-tab-item>
                </o-tabs>
            </div>
        </section>
    </div>
</template>

<style lang="scss" scoped>
.red {
    color: #f14668 !important
}

.green {
    color: #48c774 !important
}

.blue {
    color: #3273dc;
}
</style>