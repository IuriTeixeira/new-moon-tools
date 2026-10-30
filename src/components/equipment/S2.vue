<template>
    <div>
        <div v-if="equipType === 'Weapon'">
            <div><strong>Affinity:</strong> {{ s2.affinity }}</div>
            <div><strong>Slots:</strong> {{ s2.modSlots }}</div>
        </div>
        <!-- Render the pre-calculated header for this specific bonus index -->
        <!-- Loop through the bonus tags -->
        <div v-for="(val, key) in s2.stats" :key="key">
            <strong>{{ key }}: </strong>

            <!-- Add % if key includes certain words -->
            <span v-if="key.toLowerCase().includes('chance') || key.toLowerCase().includes('power') ||
                key.toLowerCase().includes('cooldown') || key.toLowerCase().includes('incantation') ||
                key.toLowerCase().includes('damage') || key.toLowerCase().includes('affinity') ||
                key.toLowerCase().includes('final crit')">
                {{ val > 0 ? '+' + val : val }}%
            </span>

            <!-- Otherwise, print the flat number -->
            <span v-else>
                {{ val > 0 ? '+' + val : val }}
            </span>
        </div>
        <br />
    </div>
</template>


<script setup>
const props = defineProps({
    s2: {
        type: Object,
        required: true,
    },
    equipType: {
        type: String,
        required: true,
    }
})
</script>
