<script setup>

const props = defineProps({
  demon: {
    type: Object,
    required: true,
  }
})
</script>

<template>

<div class="card">
	<div class="card-content">
		<div class="media">
			<div class="media-left">
				<figure class="image is-36x36">
					<img :src="'./img/demon/' + demon.icon +'.png'" :alt="demon.name">
				</figure>
			</div>
			<div class="media-content">
				<p class="title is-6">{{demon.name}}</p>
				<p class="subtitle is-7">Lv {{ demon.baseLevel }}</p>
			</div>
		</div>
		<div class="columns">
			<div class="column">
				<div class="content">
					<h3>Stats</h3>
					<table class="table is-striped is-fullwidth">
						<tbody>
							<tr>
								<th>HP</th>
								<th>MP</th>
								<th>Strength</th>
								<th>Magic</th>
								<th>Agility</th>
								<th>Vitality</th>
								<th>Intelligence</th>
								<th>Luck</th>
							</tr>
							<tr>
								<td>{{ demon.stats.maxHP }}</td>
								<td>{{ demon.stats.maxMP }}</td>
								<td>{{ demon.stats.strength }}</td>
								<td>{{ demon.stats.magic }}</td>
								<td>{{ demon.stats.speed }}</td>
								<td>{{ demon.stats.vitality }}</td>
								<td>{{ demon.stats.intelligence }}</td>
								<td>{{ demon.stats.luck }}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="content">
					<h3>Offensive</h3>
					<table class="table is-striped is-fullwidth">
						<tbody>
							<tr>
								<th>CLS-R</th>
								<th>LNG-R</th>
								<th>Spell</th>
								<th>Support</th>
								<th>Critical</th>
							</tr>
							<tr>
								<td>{{ demon.stats.clsr }}</td>
								<td>{{ demon.stats.lngr }}</td>
								<td>{{ demon.stats.spell }}</td>
								<td>{{ demon.stats.support }}</td>
								<td>{{ demon.stats.critical }}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="content">
					<h3>Defensive</h3>
					<table class="table is-striped is-fullwidth">
						<tbody>
							<tr>
								<th>Physical</th>
								<th>Magical</th>
								<th>Critical</th>
							</tr>
							<tr>
								<td>{{ demon.stats.physicalDefense }}</td>
								<td>{{ demon.stats.magicalDefense }}</td>
								<td>{{ demon.stats.criticalDefense }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="column">
				idk lol
			</div>
		</div>
	</div>
</div>

</template>

<style scoped>

.column {
	padding: 0.5rem;
}

figure {
	margin-left: 5px;
	margin-right: -10px;
}
</style>