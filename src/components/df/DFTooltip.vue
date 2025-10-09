<template>
	<div class="card">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-48x48">
						<img :src="'./img/df/' + df.icon + '.png'" :alt="df.name" @error="handleImageError">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{ df.name }}</p>
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
			<!-- <div class="description-text">
				{{ df.effects }}
			</div> -->
		</div>
	</div>
</template>

<script>
import { info } from 'sass';

export default {
	name: 'DFTooltip',
	components: {
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
				return { body: ["No data"] }
			}

			body.push(`• ID: ${this.df.id}`)
			body.push(`• Name: ${this.df.name}`)
			if (this.df.effects?.length) {
				body.push("• Effects:")
				this.df.effects.forEach(e => body.push(`  - ${e}`))
			}

			return { body }
		}
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