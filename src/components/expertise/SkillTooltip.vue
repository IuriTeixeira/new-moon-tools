<template>
	<div class="card">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-48x48">
						<img :src="'./img/skill/' + skill.icon + '.png'" :alt="skill.name" @error="handleImageError">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{ skill.name }}</p>
					<div class="subtitle is-7">
						{{ info.family }}
					</div>
					<div v-if="info.expertise" class="expertise-requirement subtitle is-7">
						<strong>Required Expertise:</strong> {{ info.expertise }}
					</div>
					<div class="info-columns subtitle is-7">
						<div class="column">
							<div v-for="(body, index) in info.body.slice(0, Math.ceil(info.body.length / 2))"
								:key="'left-' + index">
								{{ body }}
							</div>
						</div>
						<div class="column">
							<div v-for="(body, index) in info.body.slice(Math.ceil(info.body.length / 2))"
								:key="'right-' + index">
								{{ body }}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="description-text">
				{{ skill.description }}
			</div>
		</div>
	</div>
</template>

<script>
import { info } from 'sass';
import expertiseService from "@/services/expertiseService";

export default {
	name: 'SkillTooltip',
	components: {
	},
	props: {
		skill: {
			type: Object,
			required: true,
		},
		expertise: {
			type: Object,
			required: false,
		},
	},
	methods: {
		handleImageError(event) {
			event.target.src = './img/Default.png';
		},
		classRank(amount) {
			var a = Number.parseInt(amount) / 100;
			var b = a.toString();
			if (a === 0) {
				return "Default";
			} else if (a >= 100) {
				return "Class " + b.charAt(0) + b.charAt(1) + " Rank " + b.charAt(2);
			} else if (a >= 10) {
				return "Class " + b.charAt(0) + " Rank " + b.charAt(1);
			} else {
				return "Class 0 Rank " + b.charAt(0);
			}
		},
	},
	computed: {
		info() {
			let family = `${this.skill.family} • ${this.skill.activationType} • ${this.skill.categoryType} • ID: ${this.skill.id}`
			let expertise = ``
			
			// Get all expertise records
            const allExpertise = expertiseService.all();

			// Find which expertise and breakpoint contains this skill ID
            let foundBreakpoint = null;
            let parentExpertise = null;

			allExpertise.forEach(exp => {
				if (foundBreakpoint) return; // Stop if already found
				
				const bp = exp.breakpoints.find(b => b.skills.includes(this.skill.id));
				if (bp) {
					parentExpertise = exp;
					foundBreakpoint = bp;
				}
			});

			// Format the expertise string if found
			if (foundBreakpoint && parentExpertise) {
				const classVal = foundBreakpoint.class.toString();
				const rankVal = foundBreakpoint.rank.toString().padStart(3, '0');
				
				const reqValue = classVal + rankVal; 
				expertise = `${parentExpertise.name} ${this.classRank(reqValue)}`
			}

			let body = []
			if(this.skill.costs.length > 0){
				let cost = []
				this.skill.costs.forEach((element, index) => {
					let text = index === 0 ? '' : ' '
					if (element.costType !== 'ITEM') {
						if (element.costType !== 'BULLET') {
							const percent = element.numberOrPercent === 'PERCENT' ? '% ' : ' '
							text += element.amount + percent + element.costType
						}else{
							text += element.amount + ' Bullet'
							element.amount > 1 ? text += 's' : ''
						}
					} else {
						switch (element.itemID) {
							case 13:
								text += element.amount + ' Magic Stone'
								break
							case 14:
								text += element.amount + ' Jewel'
								break
							case 133:
								text += element.amount + ' Bead of Heaven (North)'
								break
							case 134:
								text += element.amount + ' Bead of Heaven (South)'
								break
							case 715:
								text += element.amount + ' Philosopher\'s Stone'
								break
							case 799:
								text += element.amount + ' Macca'
								break
							case 800:
								text += element.amount + ' Magnetite'
								break
							case 12485:
								text += element.amount + ' Dragon\'s Pearl'
								break
							case 5512:
								text += element.amount + ' Gift Melon (Link)'
								break
							case 2746:
								text += element.amount + ' 図南鵬翼の玉 (Vermilion Wing-Borne Orb)'
								break
						}
					}
					cost.push(text)
				});
				body.push(`• Cost: ${cost}\n`)
			}

			body.push(`• Action: ${this.skill.actionType}\n`)
			body.push(`• Affinity: ${this.skill.affinity}\n`)

			if (this.skill.statDependency !== "None") {
				body.push(` • Stat: ${this.skill.statDependency}`)
			}

			if (this.skill.stack) {
				this.skill.skillFlags.fixedStack ? body.push(` • Stacks: ${this.skill.stack} (fixed)\n`) : body.push(` • Stacks: ${this.skill.stack}\n`)
			}

			if (this.skill.damage > 0) {
				body.push(` • Modifier: ${this.skill.damage}\n`)
			}

			if (this.skill.stiffness > 0) {
				body.push(` • Stiffness: ${this.skill.stiffness}\n`)
			}

			if (this.skill.range > 0) {
				body.push(` • Range: ${this.skill.range}\n`)
			}

			if (this.skill.areaOfEffect.areaType !== "None") {
				body.push(` • AoE: ${this.skill.areaOfEffect.distance} (${this.skill.areaOfEffect.areaType})\n`)
			}

			if (this.skill.incantation > 0) {
				this.skill.skillFlags.fixedCharge ? body.push(` • Incantation: ${this.skill.incantation / 1000}s (fixed)\n`) : body.push(` • Incantation: ${this.skill.incantation / 1000}s\n`)
			}

			if (this.skill.cooldown > 0) {
				this.skill.skillFlags.fixedCooldown ? body.push(` • Cooldown: ${this.skill.cooldown / 1000}s (fixed)\n`) : body.push(` • Cooldown: ${this.skill.cooldown / 1000}s\n`)
			}

			return { family, expertise, body };
		},

	}
}
</script>

<style lang="scss" scoped>
.info-columns {
	display: flex;
	flex-direction: row;
}

.column {
	flex: 1;
	display: flex;
	flex-direction: column;
}

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