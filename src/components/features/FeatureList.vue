<script setup>
import { computed } from 'vue'
import Feature from "@/components/features/Feature.vue"

const props = defineProps({
    features: {
        type: Array,
        required: true
    },
    demons: {
        type: Array,
        required: true
    },
    epitaphs: {
        type: Object,
        required: true
    }
})

// Map demon arrays by their structural matching feature reference
const demonsMap = computed(() => {
    const map = {}
    props.features.forEach((feature, index) => {
        // Fallback to index if your parent view sent them array-aligned originally
        map[feature.id] = props.demons[index] || []
    })
    return map
})

// Build a dictionary map matching epitaph objects directly to feature IDs
const epitaphsMap = computed(() => {
    const map = {}
    if (!props.features || !props.epitaphs) return map;

    props.features.forEach((feature) => {
        // Enforce a strict matching lookup rules only
        const match = props.epitaphs.find(epi => epi && Number(epi.skillID) === Number(feature.id))

        // FIX: Remove '|| props.epitaphs[index]'. Return match or undefined only.
        map[feature.id] = match || undefined
    })
    return map
})
</script>

<template>
    <div class="skill-summary">
        <!-- Loop features natively and extract lookup properties safely using feature.id -->
        <Feature v-for="feature in props.features" :key="feature.id" :feature="feature" :demons="demonsMap[feature.id]"
            :epitaphs="epitaphsMap[feature.id]" />
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
