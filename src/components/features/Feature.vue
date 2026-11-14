<template>
    <!-- Add v-if="feature" so it doesn't render until data is ready -->
    <div class="feat-wrapper" v-if="feature">
        <table class="table is-striped is-fullwidth">
            <tbody>
                <!-- 1. Headers Row: Name and Category side-by-side -->
                <tr>
                    <th class="all-caps table-header" style="width: 50%;">Name</th>
                    <th class="all-caps table-header" style="width: 50%;">Category</th>
                </tr>

                <!-- 2. Content Row: Name value and Category value side-by-side -->
                <tr class="table-content-row">
                    <td class="feature-name">
                        <div class="title is-6">
                            {{ feature.name }}
                        </div>
                        <div v-if="feature.nameNO && feature.nameNO !== ''"
                            class="subtitle is-7 expertise-requirement is-flex is-align-items-center"
                            style="gap: 0.5rem;">
                            <figure class="image m-0">
                                <img :src="'./img/NO_icon.png'" alt="New Order" class="is-square">
                            </figure>
                            {{ feature.nameNO }}
                        </div>
                    </td>
                    <td>
                        <span v-if="feature.feat_exclusion && feature.feat_exclusion.length > 0">
                            <div v-for="category, index in feature.feat_exclusion" :key="feature.id + index"
                                class="category-item">
                                • {{ category.name }}
                            </div>
                        </span>
                        <span v-else class="has-text-grey-light"><em>No category restrictions.</em></span>
                    </td>
                </tr>

                <!-- 3. Description Header -->
                <tr>
                    <th class="all-caps table-header" colspan="2">
                        Description
                    </th>
                </tr>
                <!-- Description Content -->
                <tr class="table-content-row">
                    <td colspan="2">
                        <em>
                            <span v-if="feature.description" class="description-text">{{ feature.description }}</span>
                            <span v-else class="description-text has-text-grey-light">No description.</span>
                        </em>
                    </td>
                </tr>

                <!-- 4. Demons/Epitaphs Header -->
                <tr v-if="!hideSource">
                    <th class="all-caps table-header toggle-header" colspan="2" @click="toggleExpand">
                        <a aria-label="expand">
                            <span class="icon">
                                <o-icon pack="mdi" class="icon has-text-white"
                                    :icon="isExpanded ? 'chevron-up' : 'chevron-down'" />
                            </span>
                        </a>
                        Demons/Epitaphs
                    </th>
                </tr>
                <!-- Demons/Epitaphs Content -->
                <tr class="table-content-row" v-if="isExpanded && !hideSource">
                    <td colspan="2">
                        <div class="demon-container">
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

                            <template v-if="!(demons && demons.length > 0) && !epitaphs">
                                <em class="has-text-grey-light">
                                    No Demons or Epitaphs have this Feature.
                                </em>
                            </template>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <br />
    </div>
</template>

<script>
export default {
    name: 'Feature',
    data() {
        return {
            isExpanded: false
        }
    },
    computed: {
        // Convert array to a Set once for O(1) lightning-fast lookups
        demonIdSet() {
            return new Set((this.allDemons || []).map(d => d.id));
        },
        enemyDemon() {
            const map = {};
            if (!this.demons || !Array.isArray(this.demons)) return map;
            
            const demonSet = this.demonIdSet;
            this.demons.forEach((demon) => {
                if (demon && demon.acquisition) {
                    const hasBaseDemon = demonSet.has(demon.id - 10000);
                    map[demon.id] = Object.values(demon.acquisition).every(
                        (acq) => acq === false && !hasBaseDemon
                    );
                }
            });
            return map;
        },
        mitamaDemon() {
            const map = {};
            if (!this.demons || !Array.isArray(this.demons)) return map;

            const demonSet = this.demonIdSet;
            this.demons.forEach((demon) => {
                if (demon) {
                    map[demon.id] = demonSet.has(demon.id - 10000) || demon.id == 10616;
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
        hideSource: { type: Boolean },
        allDemons: { type: Array, default: () => [] } // Received from parent
    }
}
</script>

<style lang="scss" scoped>
.demon-container {
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;
    width: 100%;
    /* Ensures it spans the full width of the colspan cell */
    box-sizing: border-box;
}

.demon-item {
    display: flex;
    align-items: center;
    width: 33%;
    padding: 0.4rem 0;
    gap: 0.75rem;
}

.image.is-36x36 img {
    width: 36px;
    height: 36px;
    object-fit: contain;
}

.all-caps {
    text-transform: uppercase;
}

.toggle-header {
    cursor: pointer;
}

.mitama-color {
    color: orange;
}

.enemy-color {
    color: red;
}

.description-text {
    white-space: pre-wrap;
    word-break: break-word;
}

tr.table-content-row,
tr.table-content-row td {
    border-bottom: none !important;
}

.subtitle.is-7 {
    font-style: italic;
    margin-bottom: 0.1rem;
    margin-left: 0.25rem;
}

.table {
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 4px;
    border-collapse: separate;
    border-spacing: 0;
}

.table th,
.table td {
    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.table tr th:last-child,
.table tr td:last-child {
    border-right: none !important;
}

.feature-name {
    vertical-align: middle !important;
}
</style>