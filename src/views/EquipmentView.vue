<script setup>
import { computed, ref } from 'vue'
import EquipmentList from "@/components/equipment/EquipmentList.vue"
import itemService from "@/services/itemService";
import { debounce } from "lodash";

const filterByEquipName = ref("");
const results = ref([]);
//const selectedAttribute = ref("")
const selectedAttribute = ref("equipType") //test value
//const selectedValue = ref("")
const selectedValue = ref("Weapon") //test value
const equipmentID = ref(2383)// allEquipment.value.find((equip) => equip.id === 2383)

// Helper: safely read nested property values
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

function isValidEquipment(item) {
    if (item.mainCategory !== "Equipment") return false;
    if (item.description.includes('システム処理用')) return false;

    const name = item.name;
    if (name) {
        if (name.includes("【ＧＭ】")) return false;
        if (name.toLowerCase().includes("debug")) return false;
    }

    if (item.description?.toLowerCase().includes("debug")) return false;

    return true;
}

const allEquipment = computed(() => {
    return (itemService.all() ?? []).filter(isValidEquipment);
});

// Search field stuff
const onInput = debounce(() => {
    findEquipment()
}, 500
)

async function findEquipment() {
    const query = filterByEquipName.value?.toLowerCase().trim();

    if (!query || query.length < 3) {
        results.value = [];
        return;
    }

    // Search locally against the pre-filtered computed list
    results.value = allEquipment.value.filter(equip =>
        equip.name?.toLowerCase().includes(query)
        ||
        equip.id === Number(query)
        ||
        equip.nameNO?.toLowerCase().includes(query)
    );
}

const availableValues = computed(() => {
    if (!selectedAttribute.value) return []

    const values = allEquipment.value.map(equip =>
        getNestedValue(equip, selectedAttribute.value)
    )
    return [...new Set(values.filter(Boolean))].sort()
})

const filteredEquipment = computed(() => {
    // 1. Determine our base data pool first
    // If user typed 3+ characters, use search results. Otherwise, use all equipment.
    const isSearching = filterByEquipName.value && filterByEquipName.value.length >= 3;
    const baseEquipmentPool = isSearching ? results.value : allEquipment.value;

    // Guard against undefined/null base lists
    if (!baseEquipmentPool || baseEquipmentPool.length === 0) {
        return [];
    }

    const attr = selectedAttribute.value;
    const val = selectedValue.value;

    // 2. If no dropdown attributes are selected, return the base pool directly
    if (!attr || !val) {
        return baseEquipmentPool;
    }

    // 3. Otherwise, filter the base pool by the selected dropdown attributes
    return baseEquipmentPool.filter(
        equip => equip && getNestedValue(equip, attr) === val
    );
});


// Optimized availableEquipment that eliminates array cloning overhead
const availableEquipment = computed(() => {
    const list = filteredEquipment.value;
    if (!list || list.length === 0) return [];

    const seenIds = new Set();
    const uniqueList = [];

    // Single-pass optimization: Filter falsy values and deduplicate simultaneously
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        // Ensure item exists, has an ID, and hasn't been added yet
        if (item && item.id !== undefined && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueList.push(item);
        }
    }

    // Run the sort engine exactly once on the final, minimal dataset
    return uniqueList.sort((a, b) => {
        // Fallback to empty string if name is missing to prevent crashes
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
    });
});


const filterOptions = [
    { path: "equipType", label: "Equipment Type" },
    { path: "subCategory", label: "Weapon Type" },
    { path: "weaponType", label: "Weapon Stat" },
]

const equipment = computed(() => {
    return availableEquipment.value.find(item => item.id === equipmentID.value)
})
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
                            <h1 class="title">Equipment Viewer</h1>
                            <p class="subtitle">In Beta</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="section">
            <div class="body columns is-variable is-4 is-centered">
                <!--Search Field-->
                <div class="column is-one-fifth">
                    <div class="field">
                        <label class="label">Search:</label>
                        <o-field>
                            <o-input v-model="filterByEquipName" @input="onInput"
                                placeholder="Search by Equipment Name..."></o-input>
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
                                    :disabled="filterByEquipName.length > 0">
                                    <option value="">All Equipment</option>
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
                                <select v-model="selectedValue"
                                    :disabled="!selectedAttribute || filterByEquipName.length > 0"
                                    @change="equipmentID = availableEquipment[0].id">
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
            <br />
            <div class="container">
                <EquipmentList :equipmentList="filteredEquipment" />
            </div>
        </section>
    </div>
</template>

<style lang="scss"></style>