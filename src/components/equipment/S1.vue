<template>
    <div>
        <div>
            <strong>Durability:</strong> {{ s1.durability }}
        </div>
        <div v-if="s1.equipType === 'EQUIP_TYPE_COMP'">
            <strong>Stocks:</strong> {{ s1.stock }}
        </div>
        <div v-for="(bonus, bIndex) in s1.appearanceBonus" :key="'bonus-' + bIndex">
            <!-- Render the pre-calculated header for this specific bonus index -->
            <div v-if="bonus.setBonus && setHeaders[bIndex]" class="setBonus">
                <br>
                {{ setHeaders[bIndex] }}
            </div>

            <!-- Loop through the bonus effects -->
            <div v-for="val in bonus.effects" :key="'effect' + bonus.effects.id + bIndex">
                • <span v-if="val.target_type=='PARTNER'">Partner's </span>{{ val.display }}
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import itemService from "@/services/itemService";

const props = defineProps({
    s1: {
        type: Object,
        required: true,
    }
})

// Stores the formatted headers for each set bonus index
const setHeaders = ref([])

// Watch the prop and fetch names whenever s1 updates
watch(() => props.s1, async (newS1) => {
    if (!newS1?.appearanceBonus) return

    // Loop through each bonus index
    const headersArray = await Promise.all(
        newS1.appearanceBonus.map(async (bonus) => {
            // Skip processing if it's not a set bonus or has no IDs
            if (!bonus.setBonus || !bonus.setItemIDs) return ''

            try {
                // Fetch all item names in parallel for better performance
                const itemPromises = bonus.setItemIDs.map(id => itemService.get(id))
                const items = await Promise.all(itemPromises)
                const names = items.map(item => item?.name2 || `Item ${item?.id}`)

                // Format the string exactly like your Python logic
                if (names.length > 1) {
                    const allButLast = names.slice(0, -1).join(', ')
                    const last = names[names.length - 1]
                    return `If ${allButLast} and ${last} are equipped:\n`
                } else if (names.length === 1) {
                    return `If ${names[0]} is equipped:\n`
                }
            } catch (error) {
                console.error("Failed to fetch set item names:", error)
            }
            return ''
        })
    )

    setHeaders.value = headersArray
}, { immediate: true, deep: true })
</script>

<style scoped>
.setBonus {
    white-space: pre-line;
    font-weight: bold;
    font-style: italic;
    /* color: #7d6191; */
}
</style>