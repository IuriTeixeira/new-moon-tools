<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  demon: {
    type: Object,
  }
})

</script>

<script>
export default {
  inheritAttrs: false
}
</script>

<template>
  <div class="card">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-36x36">
						<img :src="'./img/demon/' + demon.baseDemonID +'.png'">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{demon.name}}</p>
					<p class="subtitle is-7">Lv {{ demon.baseLevel }}</p>
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
</style>