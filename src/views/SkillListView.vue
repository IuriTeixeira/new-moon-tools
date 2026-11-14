<script setup>
import { ref, computed, onMounted, markRaw } from "vue"
import SkillList from "@/components/skill/SkillList.vue"
import skillService from "@/services/skillService"
import demonService from "@/services/demonService"
import expertiseService from "@/services/expertiseService";
import exchangeSkills from "@/data/exchange_skills.json";
import gearSkills from "@/data/gear_skills.json";
import { debounce } from "lodash";

// State
const selectedAttribute = ref("")
const selectedValue = ref("")
const selectedSource = ref("")
const filterBySkillName = ref("");
const results = ref([]);

// Raw reactive storage for async services
const rawSkills = ref([]);
const rawDemons = ref([]);
const rawExpertises = ref([]);

const ALLOWED_FAMILIES = new Set(["Arcane Art", "Technique", "Special Skill"]);

// Fetch data on mount
onMounted(async () => {
    const [skillsData, demonsData, expertisesData] = await Promise.all([
        skillService.all(),
        demonService.all(),
        expertiseService.all()
    ]);

    rawSkills.value = markRaw(skillsData || []);
    rawDemons.value = markRaw(demonsData || []);
    rawExpertises.value = markRaw(expertisesData || []);
});

function isValidSkill(skill) {
    if (!ALLOWED_FAMILIES.has(skill.family)) return false;
    if (skill.activationType === "Special") return false;

    const name = skill.name;
    if (name) {
        if (name.includes("【ＧＭ】")) return false;
        if (name.toLowerCase().includes("debug")) return false;
        if (skill.nameNO?.toLowerCase().includes("debug")) return false;
    }

    if (skill.description?.toLowerCase().includes("fusion skill")) return false;

    return true;
}

const allSkills = computed(() => {
    return rawSkills.value.filter(isValidSkill);
});

// Get all demons that have skills
const allDemons = computed(() =>
    rawDemons.value.filter(
        demon => demon.skills && demon.skills.length > 0
    )
)

// Extract all skill IDs from breakpoints across all expertises
const expertiseSkillIDs = computed(() => new Set(
    rawExpertises.value.flatMap(expertise =>
        (expertise.breakpoints ?? []).flatMap(bp => bp.skills ?? [])
    )
));

const expertiseSkills = computed(() =>
    allSkills.value.filter(skill => expertiseSkillIDs.value.has(Number(skill.id)))
);

const allGearSkills = computed(() =>
    allSkills.value.filter(skill => gearSkills.flatMap(sk => sk.id).includes(Number(skill.id))).filter(skill => skill.affinity !== "Special" && skill.affinity !== "Unknown")
)

// Helper: safely read nested property values
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj)
}

// Search field stuff
const onInput = debounce(() => {
    findSkills()
}, 500)

async function findSkills() {
    const query = filterBySkillName.value?.toLowerCase().trim();

    if (!query || query.length < 3) {
        results.value = [];
        return;
    }

    // Search locally against the pre-filtered computed list
    results.value = allSkills.value.filter(skill =>
        skill.name?.toLowerCase().includes(query) || skill.nameNO?.toLowerCase().includes(query)
    );
}

// Dynamically compute possible values based on selected attribute
const availableValues = computed(() => {
    if (!selectedAttribute.value || selectedAttribute.value === "gearSkill") return []

    if (selectedAttribute.value === "expertise") {
        return rawExpertises.value
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
        return results.value;
    }

    let skillsToFilter = results.value.length > 0 ? results.value : allSkills.value;
    const source = selectedSource.value;

    if (source !== "") {
        if (source === "player") {
            const expSkillsSet = new Set(
                rawExpertises.value.flatMap(exp => exp.breakpoints.flatMap(bp => bp.skills))
            );
            const playerExchangeSet = new Set(
                exchangeSkills.filter(sk => sk.type === "SKILL_CHARACTER").map(sk => sk.id)
            );
            const gearSkillsSet = new Set(gearSkills.map(sk => sk.id));

            skillsToFilter = skillsToFilter.filter(skill =>
                expSkillsSet.has(skill.id) ||
                playerExchangeSet.has(skill.id) ||
                gearSkillsSet.has(skill.id)
            );
        }
        else {
            const demonExchangeSet = new Set(
                exchangeSkills.filter(sk => sk.type === "SKILL_DEMON").map(sk => sk.id)
            );

            const aggregateDemonSkills = new Set();

            for (const demon of allDemons.value) {
                const hasAcquisition = demon.acquisition ? Object.values(demon.acquisition).includes(true) : false;

                if (source === "allDemons") {
                    demon.skills?.forEach(id => aggregateDemonSkills.add(id));
                    demon.acquiredSkills?.forEach(id => aggregateDemonSkills.add(id));
                    demon.enemyOnlySkills?.forEach(id => aggregateDemonSkills.add(id));
                }
                else if (source === "alliedDemons" && hasAcquisition) {
                    demon.skills?.forEach(id => aggregateDemonSkills.add(id));
                    demon.acquiredSkills?.forEach(id => aggregateDemonSkills.add(id));
                }
                else if (source === "enemyDemons" && !hasAcquisition) {
                    demon.enemyOnlySkills?.forEach(id => aggregateDemonSkills.add(id));
                }
            }

            skillsToFilter = skillsToFilter.filter(skill =>
                aggregateDemonSkills.has(skill.id) ||
                (source !== "enemyDemons" && demonExchangeSet.has(skill.id))
            );
        }
    }

    const attr = selectedAttribute.value;
    const val = selectedValue.value;

    if (!attr || !val) {
        return attr === "expertise"
            ? expertiseSkills.value
            : attr === "gearSkill"
                ? allGearSkills.value
                : skillsToFilter;
    }

    if (attr === "expertise") {
        const selectedExpertise = rawExpertises.value.find(exp => exp.name === val);
        if (!selectedExpertise) return [];

        const selectedSkillIDs = new Set(
            selectedExpertise.breakpoints.flatMap(bp => bp.skills).map(Number)
        );
        return skillsToFilter.filter(skill => selectedSkillIDs.has(Number(skill.id)));
    }

    return skillsToFilter.filter(
        skill => getNestedValue(skill, attr) === val
    );
});

const filterOptions = [
    { path: "expertise", label: "Expertise" },
    { path: "statDependency", label: "Stat" },
    { path: "affinity", label: "Affinity" },
    { path: "categoryType", label: "Category" },
    { path: "family", label: "Family" },
    { path: "actionType", label: "Action Type" },
    { path: "activationType", label: "Activation Type" },
    { path: "areaOfEffect.areaType", label: "Area of Effect Type" },
    { path: "gearSkill", label: "Gear Skills" },
]

const filterSource = [
    { path: "player", label: "Player" },
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
                                <o-input v-model="filterBySkillName" @input="onInput"
                                    placeholder="Search by Skill Name..."></o-input>
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
                                    <select v-model="selectedValue"
                                        :disabled="!selectedAttribute || selectedAttribute === 'gearSkill' || filterBySkillName.length > 0">
                                        <option value="">All</option>
                                        <option v-for="value in availableValues" :key="value" :value="value">
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
                                    <o-field>
                                        <o-radio v-model="selectedSource" native-value="" name="Source"
                                            :disabled="filterBySkillName.length > 0 || selectedAttribute === 'gearSkill'">All</o-radio>
                                        <o-radio v-model="selectedSource" v-for="radio in filterSource"
                                            :key="radio.path" :native-value="radio.path" name="Source"
                                            :disabled="filterBySkillName.length > 0 || selectedAttribute === 'gearSkill' || selectedAttribute === 'expertise'">
                                            {{ radio.label }}
                                        </o-radio>
                                    </o-field>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p><em>Note: Click a skill to copy its description to clipboard.</em></p>
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