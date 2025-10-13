<template>
	<div class="card">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-48x48">
						<img :src="'./img/items/' + df.icon + '.png'" :alt="df.name" @error="handleImageError">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{ df.name }}</p>
				</div>
			</div>
			<div class="description-text">
				<o-tabs v-model="toggle">
					<o-tab-item v-for="(body, index) in info.body" :key="'tab-' + index" :value="index"
						:label="String(index + 1)">
						<div v-for="(line, i) in body" :key="i">
							{{ line }}
						</div>
					</o-tab-item>
				</o-tabs>
			</div>
		</div>
	</div>
</template>

<script>
import { info } from 'sass';

export default {
	name: 'DFTooltip',
	components: {
	},
	data() {
		return {
			toggle: 0
		}
	},
	props: {
		df: {
			type: Object,
			required: true,
		},
	},
	methods: {
		handleImageError(event) {
			event.target.src = './img/Default.png';
		},
	},
	computed: {
		info() {
			let body = []

			if (!this.df || Object.keys(this.df).length === 0) {
				return { body: [["No data"]] }
			}

			if (this.df.tokusei_description.length > 0) {
				let tab = []
				tab.push(`Effect:\n• The Benefit Gauge is increased by 1\n\nUses one Demon Force slot to set this ability:`)
				for (let i = 0; i < this.df.tokusei_description.length; i++) {
					tab.push(`• ${this.df.tokusei_description[i]}`)
				}
				tab.push(`\n* Note that an item's ability cannot be set to multiple Demon Force slots`)
				body.push(tab)
				return { body }
			}

			for (let i = 0; i < this.df.boost_data.length; i++) {
				let tab = []
				let checkTypeReq = false
				for (let j = 0; j <= 2; j++) {
					if (this.df.boost_data[i].requirements[j].type !== "NONE") {
						checkTypeReq = true
					}
				}

				tab.push(`The summoned demon must meet the following criteria:\n`)
				if (
					this.df.boost_data[i].minLevel > -1 || this.df.boost_data[i].maxLevel > -1 ||
					this.df.boost_data[i].benefitGauge > -1 || checkTypeReq) {
					if (this.df.boost_data[i].minLevel > -1) tab.push(`• Level ${this.df.boost_data[i].minLevel} or higher`)
					if (this.df.boost_data[i].maxLevel > -1) tab.push(`• Level ${this.df.boost_data[i].maxLevel} or lower`)
					if (checkTypeReq) {
						for (let j = 0; j < 3; j++) {
							if (this.df.boost_data[i].requirements[j].type !== "NONE") {
								switch (this.df.boost_data[i].requirements[j].type) {
									case 'LNC':
										let lnc = this.df.boost_data[i].requirements[j].value1 === 0 ? 'LAW' : this.df.boost_data[i].requirements[j].value1 === 1 ? 'NEUTRAL' : 'CHAOS'
										tab.push(`• Demon alignment is ${lnc}`)
										break
									case 'FAMILIARITY':
										let loyalty = this.df.boost_data[i].requirements[j].value1 === "1" ? 'Linked by Fate' : 'Wishes Death'
										tab.push(`• Loyalty is "${loyalty}"`)
										break
								}
							}
						}
					}
				}
				tab.push(`\nIf all criteria above are met, the following conditional changes occur:\n\nEffect:`)
				if (this.df.tokusei_description.length === 0) {
					tab.push(`• The Benefit Gauge is increased by 1`)
					for (let j = 0; j < 8; j++) {
						if (this.df.boost_data[i].results[j].type > -1) {
							let parameter = ''
							switch (this.df.boost_data[i].results[j].type) {
								case 0: parameter = 'HP'; break
								case 1: parameter = 'MP'; break
								case 2: parameter = 'Strength'; break
								case 3: parameter = 'Magic'; break
								case 4: parameter = 'Vitality'; break
								case 5: parameter = 'Intelligence'; break
								case 6: parameter = 'Speed'; break
								case 7: parameter = 'Luck'; break
								case 8: parameter = 'HP Regeneration'; break
								case 9: parameter = 'MP Regeneration'; break
								case 10: parameter = 'Close-range'; break
								case 11: parameter = 'Long-range'; break
								case 12: parameter = 'Spell'; break
								case 13: parameter = 'Support'; break
								case 14: parameter = 'Critical'; break
								case 15: parameter = 'Physical Defense'; break
								case 16: parameter = 'Magical Defense'; break
								case 17: parameter = 'Critical Defense'; break
								case 18: parameter = 'Experience'; break
								case 19: parameter = 'Ailment Resistance'; break
							}
							tab.push(`• Force Parameter [${parameter}]`)
							let minPoints = this.df.boost_data[i].results[j].minPoints / 100
							let maxPoints = this.df.boost_data[i].results[j].maxPoints / 100
							let points = this.df.boost_data[i].results[j].points / 100
							tab.push(`If this parameter is ${minPoints > 0 ? minPoints + ' or higher and ' : ''}${maxPoints > 0 ? maxPoints + ' or lower' : ''}, it is increased by ${points}`)
						}
					}
				}
				body.push(tab)
			}
			return { body }
		}
	}

}
</script>

<style lang="scss" scoped>
.description-text {
	white-space: pre-wrap;
	word-break: break-word;
	margin-top: 0;
}

.title.is-6 {
	margin-left: 0.25rem;
}

.subtitle.is-7 {
	font-style: italic;
	margin-bottom: 0.1rem;
	margin-left: 0.25rem;
}

.card {
	text-align: left;

	.media:not(:last-child) {
		margin-bottom: 0rem;
	}

	.media-left {
		margin-right: 0;
	}
}
</style>