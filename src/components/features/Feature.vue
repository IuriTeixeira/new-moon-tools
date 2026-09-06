<template>
    <div class="feat-wrapper">
        <table class="table is-striped is-fullwidth">
            <tbody class="two-column-grid">
                <tr class="card">
                    <th class="all-caps card-header">
                        Name
                    </th>
                </tr>
                <tr class="card-content">
                    <td class="feature-name">{{ feature.name }}</td>
                </tr>
                <tr class="card">
                    <th class="all-caps card-header">
                        Description
                    </th>
                </tr>
                <tr class="card-content">
                    <td>
                        <em>
                            <span v-if="feature.description" class="description-text">{{ feature.description }}</span>
                            <span v-else class="description-text has-text-grey-light">No description.</span>
                        </em>
                    </td>
                </tr>
                <tr class="card">
                    <th class="all-caps card-header">
                        Category
                    </th>
                </tr>
                <tr class="card-content">
                    <td>
                        <span v-if="feature.feat_exclusion.length > 0">
                            <div v-for="category, index in feature.feat_exclusion" :key="feature.id + index"
                                class="category-item">
                                • {{ category.name }}
                            </div>
                        </span>
                        <span v-else class="has-text-grey-light"><em>No category restrictions.</em></span>
                    </td>
                </tr>
                <tr v-if="!hideSource" class="card">
                    <th class="all-caps card-header toggle-header" @click="toggleExpand">
                        <a aria-label="expand">
                            <span class="icon">
                                <o-icon pack="mdi" class="icon has-text-white"
                                    :icon="isExpanded ? 'chevron-up' : 'chevron-down'" />
                            </span>
                        </a>
                        Demons/Epitaphs
                    </th>
                </tr>
                <tr class="card-content" v-if="isExpanded && !hideSource">
                    <td class="demon-container">
                        <!-- Check if the demons array has items -->
                        <template v-if="demons && demons.length > 0">
                            <div v-for="demon in demons" :key="demon.id" class="demon-item">
                                <figure class="image is-36x36">
                                    <img :src="'./img/demon/' + demon.icon + '.png'" :alt="demon.name"
                                        @error="handleImageError">
                                </figure>
                                <span
                                    :class="mitamaDemon[demon.id] ? 'mitama-color' : (enemyDemon[demon.id] ? 'enemy-color' : '')">
                                    {{ demon.title }} {{ demon.name }}
                                </span>
                            </div>
                        </template>

                        <template v-if="epitaphs">
                            <div class="demon-item">
                                <figure class="image is-36x36">
                                    <img :src="'./img/items/' + epitaphs.icon + '.png'" :alt="epitaphs.name"
                                        @error="handleImageError">
                                </figure> {{ epitaphs.name }}
                            </div>
                        </template>


                        <!-- Fallback when there are no demons -->
                        <template v-if="!(demons && demons.length > 0) && !epitaphs">
                            <em class="has-text-grey-light">
                                No Demons or Epitaphs have this Feature.
                            </em>
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <br />
</template>

<script>
import demonService from "@/services/demonService"

const allDemons = demonService.all()

export default {
    name: 'Feature',
    data() {
        return {
            isExpanded: false
        }
    },
    computed: {
        enemyDemon() {
            const map = {};
            this.demons.forEach((demon) => {
                if (demon && demon.acquisition) {
                    map[demon.id] = Object.values(demon.acquisition).every(
                        (acq) =>
                            acq === false
                            &&
                            !allDemons.some(d => d.id === demon.id - 10000)
                    );
                }
            });
            return map;
        },
        mitamaDemon() {
            const map = {};
            this.demons.forEach((demon) => {
                if (demon) {
                    map[demon.id] = allDemons.some(d => d.id === demon.id - 10000) || demon.id == 10616;
                }
            });
            return map;
        }
    },
    methods: {
        toggleExpand() {
            this.isExpanded = !this.isExpanded;
        },
        handleImageError(event) {
            event.target.src = './img/Default.png';
        }
    },
    props: {
        feature: { type: Object, required: true },
        demons: { type: Array, required: true },
        epitaphs: { type: Object },
        hideSource: {type: Boolean}
    }
}

</script>

<style lang="scss" scoped>
/* Container for the demons */
.demon-container {
    display: flex;
    flex-wrap: wrap;
    /* Allows items to wrap to the next line */
    padding: 0.5rem;
}

/* Each individual demon takes up roughly 50% width */
.demon-item {
    display: flex;
    align-items: center;
    width: 33%;
    /* Creates 2-column effect */
    padding: 0.4rem 0;
    gap: 0.75rem;
}

/* Removes the zebra striping background for this specific row */
.table.is-striped tbody tr.no-stripe {
    background-color: transparent !important;
}

/* Ensure the image stays 36x36 */
.image.is-36x36 img {
    width: 36px;
    height: 36px;
    object-fit: contain;
}

.all-caps {
    text-transform: uppercase
}

.toggle-header {
    cursor: pointer;
}

.collapse.card {
    margin: 1em auto;
}

.mitama-color {
    color: orange
}

.enemy-color {
    color: red
}

.description-text {
    white-space: pre-wrap;
    word-break: break-word;
}

/* Remove borders from the content rows and table cells */
tr.card-content, 
tr.card-content td {
    border-bottom: none !important;
}

/* Ensure the border only applies to the bottom of the header row */
tr.card {
    border-bottom: 0.1px /* Adjust thickness/color as needed */
}

</style>