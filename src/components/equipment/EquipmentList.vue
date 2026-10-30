<script setup>
import Equipment from "@/components/equipment/EquipmentSummary.vue"

const props = defineProps({
    equipmentList: {
        type: Array,
        required: true
    }
})
</script>

<template>
    <div class="skill-summary">
        <!-- Loop features natively and extract lookup properties safely using feature.id -->
        <Equipment v-for="equipment in props.equipmentList"
            :key="equipment.subCategory + '-' + equipment.id + equipment.icon !== '' ? equipment.icon : ''"
            :equipment="equipment" />
    </div>
</template>

<style lang="scss">
.toggle-header {
    cursor: pointer;
}

#chain-expertise {
    margin: 0.25em auto;
}

.is-label {
    margin-right: 1rem;
}

.option-title {
    font-weight: bold;
    font-size: 1.1em;
}

.collapse.card {
    margin: 1em auto;
}
</style>
