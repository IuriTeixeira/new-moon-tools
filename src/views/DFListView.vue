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

// Filter options
const filterOptions = [
    { path: "nra", label: "Resist, Null, Reflect, Drain" },
    { path: "lnc", label: "Alignment" },
    { path: "affinity", label: "Affinity" },
    { path: "affinityCap", label: "Affinity Cap" },
    { path: "action", label: "Action" },
    { path: "stat", label: "Stat" },
    { path: "skill", label: "Skill" },
    { path: "summoner", label: "Summoner" },
    { path: "reduction", label: "Reduction" }, //hp, mp, incant, cooldown
    { path: "parameter", label: "Force Parameter" }
]

const FILTER_OPTION_NRA = [
    "Resist",
    "Null",
    "Reflect",
    "Drain"
]

const FILTER_OPTION_LNC = [
    "Law", "Neutral", "Chaos"
]

const FILTER_OPTION_AFFINITY = [
    "Slash Affinity +", "Thrust Affinity +", "Blunt Affinity +",
    "Handgun Affinity +", "Penetrate Affinity +", "Spread Affinity +",
    "Fire Affinity +", "Ice Affinity +", "Electric Affinity +", "Force Affinity +",
    "Expel Affinity +", "Death Affinity +",
    "Mystic Affinity +", "Nerve Affinity +", "Mind Affinity +",
    "Almighty Affinity +", "Curative Affinity +", "Support Affinity +", "Suicide Affinity +"
]

const FILTER_OPTION_AFFINITY_CAP = [
    "Slash Affinity Cap", "Thrust Affinity Cap", "Blunt Affinity Cap",
    "Handgun Affinity Cap", "Penetrate Affinity Cap", "Spread Affinity Cap",
    "Fire Affinity Cap", "Ice Affinity Cap", "Electric Affinity Cap", "Force Affinity Cap",
    "Expel Affinity Cap", "Death Affinity Cap",
    "Mystic Affinity Cap", "Nerve Affinity Cap", "Mind Affinity Cap",
    "Almighty Affinity Cap", "Curative Affinity Cap", "Support Affinity Cap", "Suicide Affinity Cap"
]

const FILTER_OPTION_ACTION = [
    "Attack", "Spin", "Rush", "Shot", "Rapid", "Counter", "Dodge", "Guard"
]

const FILTER_OPTION_STAT = [
    "HP", "MP", "HP Regeneration", "MP Regeneration",
    "Close-range", "Long-range", "Spell", "Support",
    "Strength", "Magic", "Vitality", "Intelligence", "Speed", "Luck",
    "Physical Defense", "Magical Defense",
    "Critical", "Critical Defense",
    "Experience", "Ailment Resistance",
    "Macca", "Magnetite"
]

const FILTER_OPTION_PARAMETER = [
    "HP", "MP", "HP Regeneration", "MP Regeneration",
    "Close-range", "Long-range", "Spell", "Support",
    "Strength", "Magic", "Vitality", "Intelligence", "Speed", "Luck",
    "Physical Defense", "Magical Defense",
    "Critical", "Critical Defense",
    "Experience", "Ailment Resistance"
]

const FILTER_OPTION_REDUCTION = [
    "HP Cost",
    "MP Cost",
    "Incantation",
    "Cooldown"
]

// Get all DF items
const allDFItems = computed(() =>
    (dfService.all() ?? []).filter(item => !item.name.toLowerCase().includes("debug"))
)

// Search field stuff
const onInput = debounce(() => {
    findDFItem()
}, 500
)

async function findDFItem() {
    if (!filterByDFName.value || filterByDFName.value.length < 2) {
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

    switch (selectedAttribute.value) {
        case "nra": return [...FILTER_OPTION_NRA].sort()
        case "lnc": return [...FILTER_OPTION_LNC].sort()
        case "affinity":
            return [...FILTER_OPTION_AFFINITY].sort()
        case "affinityCap":
            return [...FILTER_OPTION_AFFINITY_CAP].sort()
        case "action": return [...FILTER_OPTION_ACTION].sort()
        case "reduction": return [...FILTER_OPTION_REDUCTION].sort()
        case "stat":
            return [...FILTER_OPTION_STAT].sort()
        case "parameter":
            return [...FILTER_OPTION_PARAMETER].sort()
        case "skill":
        case "summoner":
            return []
        default:
            return []
    }
})


// Filtered items
const filteredDFItems = computed(() => {
    const byName = filterByDFName.value.trim().toLowerCase();
    const attribute = selectedAttribute.value;
    const selected = selectedValue.value.trim().toLowerCase();

    if (byName.length >= 1) {
        return results.value;
    }

    const dfsToFilter = results.value.length > 0 ? results.value : allDFItems.value;

    if (!attribute || (!selected && attribute !== "skill" && attribute !== "summoner")) {
        return dfsToFilter;
    }

    return dfsToFilter.filter((df) => {
        const description = Array.isArray(df.tokusei_description)
            ? df.tokusei_description.map(str => String(str).toLowerCase())
            : [String(df.tokusei_description || "").toLowerCase()];

        const name = String(df.name || "").toLowerCase();

        switch (attribute) {
            case "nra":
            case "lnc":
            case "affinity":
            case "affinityCap":
            case "action":
            case "stat":
            case "reduction":
                return description.some(desc => desc.includes(selected));

            case "parameter":
                // Match selected value against boost_data[].results[].type
                return Array.isArray(df.boost_data) &&
                    df.boost_data.some(boost =>
                        Array.isArray(boost.results) &&
                        boost.results.some(result =>
                            typeof result.type === "string" &&
                            result.type.toLowerCase().includes(selected)
                        )
                    );

            case "summoner":
                return description.some(desc => desc.includes("summoner"));

            case "skill":
                return name.includes("mark of skill");

            default:
                return true;
        }

    });
});

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
                    <div class="column is-one-quarter">
                        <div class="field">
                            <label class="label">Search:</label>
                            <o-field>
                                <o-input v-model="filterByDFName" @input="onInput"
                                    placeholder="Search by Item Name..."></o-input>
                            </o-field>
                        </div>
                    </div>
                    <!-- Attribute Dropdown -->
                    <div class="column is-one-quarter">
                        <div class="field">
                            <label class="label">Filter by:</label>
                            <div class="control">
                                <div class="select is-fullwidth">
                                    <select v-model="selectedAttribute" @change="selectedValue = ''"
                                        :disabled="filterByDFName.length > 0">
                                        <option value="">All Items</option>
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
                                    <select v-model="selectedValue"
                                        :disabled="!selectedAttribute || filterByDFName.length > 0 || selectedAttribute === 'summoner' || selectedAttribute === 'skill'">
                                        <option value="">All</option>
                                        <option v-for="value in availableValues" :key="value" :value="value"
                                            :disabled="filterByDFName.length > 0">
                                            {{ value.replace(' +', '').replace('Affinity', '').replace(' Cap', '') }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br />
                <!-- Skill List -->
                <DFList :df="filteredDFItems" />
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