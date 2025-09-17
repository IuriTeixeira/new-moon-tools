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
					<p class="subtitle is-7">{{ info }}</p>
				</div>
			</div>

			<div class="content">
				{{ skill.description }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SkillTooltip',
	components: {
	},
	props: {
		skill: {
			type: Object,
			required: true,
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
			let r = `${this.skill.family}`;
			r += ` • ${this.skill.categoryType}`
			r += ` • ${this.skill.activationType}`
			r += ` • ${this.skill.actionType}`
			r += ` • ${this.skill.affinity}`

			if (this.skill.stack > 1) {
				r += ` • ${this.skill.stack} stacks`
			}

			if (this.skill.damage > 0) {
				r += ` • ${this.skill.damage} modifier`
			}

			if (this.skill.stiffness > 0) {
				r += ` • ${this.skill.stiffness} stiffness`
			}

			if (this.skill.range > 0) {
				r += ` • ${this.skill.range} range`
			}

			if (this.skill.incantation > 0) {
				r += ` • ${this.skill.incantation}ms incantation`
			}

			if (this.skill.cooldown > 0) {
				r += ` • ${this.skill.cooldown}ms cooldown`
			}

			if (this.skill.statDependency !== "None") {
				r += ` • ${this.skill.statDependency} scaling`
			}

			return r;
		},

	}
}
</script>

<style lang="scss" scoped>
.o-tip__content--multiline {
	width: 300px;
}

.o-tip__content {
	max-width: 300px;
}

.subtitle.is-7 {
	font-style: italic;
}

.card {
	text-align: left;

	.media:not(:last-child) {
		margin-bottom: 0.5rem;
	}

	.media-left {
		margin-right: 0.5rem;
	}
}
</style>