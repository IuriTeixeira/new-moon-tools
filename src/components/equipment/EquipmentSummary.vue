<script setup>
import { ref } from 'vue';
import S1 from './S1.vue';
import S2 from './S2.vue';
import S3 from './S3.vue';
const props = defineProps({
	equipment: {
		type: Object,
		required: true,
	},
})

const isExpanded = ref(false)

function handleImageError(event) {
	event.target.src = './img/Default.png';
}

/*
const wikiLink = computed(() => {
	const nameNO = props.equipment.nameNO
	const formattedName = nameNO.replaceAll(" ", "_");
	return 'https://smtwiki.ru/' + encodeURIComponent(formattedName);
})
*/
</script>

<template>
	<table class="table is-fullwidth">
		<tbody>
			<tr class="card">
				<th class="card-header toggle-header" @click="isExpanded = !isExpanded">
					<a aria-label="expand">
						<span class="icon">
							<o-icon pack="mdi" class="icon has-text-white"
								:icon="isExpanded ? 'chevron-up' : 'chevron-down'" />
						</span>
					</a>
					<div class="media">
						<!-- <div class="media-left">
							<figure class="image is-36x36">
								<img :src="'./img/items/' + equipment.icon + '.png'" :alt="equipment.name + ' icon'"
									@error="handleImageError">
							</figure>
						</div> -->
						<div class="media-content">
							<div class="media-content">
								<div class="title is-5">
									<!-- <a :href="wikiLink"> -->
									{{ equipment.name }}
									<!-- </a> -->
								</div>
								<div v-if="equipment.nameNO !== ''"
									class="subtitle is-7 is-italic is-flex is-align-items-center" style="gap: 0.5rem;">
									<figure class="image is-36x36 m-0">
										<img :src="'./img/NO_icon.png'" alt="New Order" class="is-square">
									</figure>
									<span>{{ equipment.nameNO }}</span>
								</div>
							</div>
						</div>
						<div class="right-meta-container">
							<div class="is-5 category"><strong>Category:</strong> {{ equipment.equipType }} <span
									v-if="equipment.name.includes('Crystallized Spirit') || equipment.name.includes('物霊結晶')">(Crystal
									Spirit)</span> <span v-if="equipment.weaponType !== 'NONE'">- {{
										equipment.subCategory }}</span>
							</div>
							<div class="is-5 category"><strong>ID:</strong> {{ equipment.id }}</div>
						</div>
					</div>
				</th>
			</tr>
			<!-- FIXED: Wrapped the inner table in a td spanning all columns -->
			<tr class="content" v-if="isExpanded">
				<td colspan="100%" style="padding: 0;">
					<table class="table inner-bordered-table is-striped is-fullwidth">
						<tbody>
							<tr>
								<th align="center" class="table-header">Image</th>
								<th align="center" class="table-header">Description</th>
								<th align="center" class="table-header">S1</th>
								<th align="center" class="table-header">S2</th>
								<th align="center" class="table-header">S3</th>
							</tr>
							<tr>
								<td width="10%" align="center">
									<!-- <figure class="image is-128x128">
										<img :src="'./img/items/shop/' + equipment.icon + '.png'"
											:alt="equipment.name + ' icon'" @error="handleImageError">
									</figure> -->
								</td>
								<td width="25em">
									{{ equipment.description }}
								</td>
								<td width="25em">
									<S1 :s1=equipment.S1 />
								</td>
								<td width="25em">
									<S2 :s2="equipment.S2" :equipType="equipment.equipType" />
								</td>
								<td width="25em">
									<S3 v-if="typeof (equipment.S3) === 'object'" :s3="equipment.S3" />
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped>
/* Force collapse behavior to prevent ugly double borders */
.inner-bordered-table {
	border-collapse: collapse !important;
}

/* Target all header and body cells except the last column */
.inner-bordered-table th:not(:last-child),
.inner-bordered-table td:not(:last-child) {
	border-right: 1px solid rgba(255, 255, 255, 0.15) !important; /* Semi-transparent white line for dark themes */
}

.media {
	display: flex;
	align-items: center;
	width: 100%;
}

.right-meta-container {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	margin-left: auto; 
	text-align: left;
}

.column {
	padding: 0.5rem;
}

figure {
	margin-left: 5px;
	margin-right: -10px;
}

.red {
	color: red;
}

.green {
	color: green
}

.default {
	color: default
}

.table-header {
	background-color: #7d6191;
}

.category {
	font-weight: normal;
	padding-left: 1em;
	line-height: 1.4;
}
</style>