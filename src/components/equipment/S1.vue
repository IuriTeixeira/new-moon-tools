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
            <div v-if="bonus.setBonus && bonus.set_text" class="setBonus">
                <br>
                {{ bonus.set_text }}
            </div>

            <!-- Loop through the bonus effects -->
            <div v-for="val in bonus.effects" :key="'effect' + bonus.effects.id + bIndex">
                • {{ val.display }}
            </div>
        </div>
    </div>
</template>


<script setup>
const props = defineProps({
    s1: {
        type: Object,
        required: true,
    }
})
</script>

<style scoped>
.setBonus {
    white-space: pre-line;
    font-weight: bold;
    font-style: italic;
    /* color: #7d6191; */
}
</style>