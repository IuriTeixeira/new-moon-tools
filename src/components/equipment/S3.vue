<template>
    <div>
        <div v-for="(bonus, bIndex) in s3" :key="'bonus-' + bIndex">
            <!-- Loop through the bonus effects -->
            <div v-for="val in bonus.effects" :key="'effect' + bonus.effects.id + bIndex">
                <span v-if="val.target_type == 'PARTNER'">Partner's </span>{{ val.display }}
            </div>
        </div>
    </div>
</template>


<script setup>
const props = defineProps({
    s3: {
        type: Object,
        required: true,
    }
})
</script>
