<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  demon: {
    type: Object,
  }
})

</script>

<script>

</script>

<template>
	<div class="vue-flow__node-demon card demon-drag">
		<div class="card-content">
			<div class="columns  is-vcentered">
				<div class="column is-narrow" style="height:100%">
					<figure class="image is-32x32">
						<img :src="'./img/demon/' + demon.icon +'.png'">
					</figure>
				</div>
				<div class="column">
					<div class="media-content demon-summary">
						<p class="subtitle is-7" v-if="demon.title != ''">{{ demon.title }}</p>
						<p class="title is-6">{{demon.name}}</p>
						<p class="subtitle is-7">Lv {{ demon.baseLevel }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.o-modal__content{
	background-color: rgba(0,0,0,0) !important;
}


.card {
	border-bottom: 1px solid #111;
}

.card-content {
	padding: 5px 10px;
}

.demon-summary .title {
	margin-bottom: 0px;
	padding: 5px 0 0 0;
}

.demon-summary .subtitle.is-7 {
	margin-top: 3px;
}

.demon-drag figure {
	margin-left: 0.2em;
  margin-right: 0.2em;

}
</style>