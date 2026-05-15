<script setup>
import { computed } from 'vue';


const props = defineProps({
  demon: {
    type: Object,
    required: true,
  }
})

const affinityColors = computed(() => {
  let affinityColorList = {};
  
  const affinityData = props.demon?.affinity;
  
  if (affinityData) {
    Object.entries(affinityData).forEach(([name, values]) => {
      affinityColorList[name] = {
        resistColor: values.resist > 0 ? 'green' : (values.resist < 0 ? 'red' : 'default'),
        nullColor: values.null > 0 ? 'green' : 'default',
        reflectColor: values.reflect > 0 ? 'green' : 'default',
        absorbColor: values.absorb > 0 ? 'green' : 'default'
      };
    });
  }

  return affinityColorList;
});

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
				<div class="content">
					<h3>Affinities</h3>
					<table class="table is-striped is-fullwidth">
						<tbody>
							<tr>
								<th colspan="3">Physical</th>
								<th colspan="3">Magical</th>
							</tr>
							<tr>
								<td :class="affinityColors['Physical'].resistColor" colspan="3">{{ 100 - demon.affinity.Physical.resist }}%</td>
								<td :class="affinityColors['Magical'].resistColor" colspan="3">{{ 100 - demon.affinity.Magical.resist }}%</td>
							</tr>
							<tr>
								<th>Slash</th>
								<th>Thrust</th>
								<th>Blunt</th>
								<th>Handgun</th>
								<th>Penetrate</th>
								<th>Spread</th>
							</tr>
							<tr>
								<td :class="affinityColors['Slash'].resistColor">{{ 100 - demon.affinity.Slash.resist }}%</td>
								<td :class="affinityColors['Thrust'].resistColor">{{ 100 - demon.affinity.Thrust.resist }}%</td>
								<td :class="affinityColors['Blunt'].resistColor">{{ 100 - demon.affinity.Blunt.resist }}%</td>
								<td :class="affinityColors['Projectile'].resistColor">{{ 100 - demon.affinity.Projectile.resist }}%</td>
								<td :class="affinityColors['Penetrate'].resistColor">{{ 100 - demon.affinity.Penetrate.resist }}%</td>
								<td :class="affinityColors['Spread'].resistColor">{{ 100 - demon.affinity.Spread.resist }}%</td>
							</tr>
							<tr>
								<th>Fire</th>
								<th>Ice</th>
								<th>Electric</th>
								<th>Force</th>
								<th>Expel</th>
								<th>Death</th>
							</tr>
							<tr>
								<td :class="affinityColors['Fire'].resistColor">{{ 100 - demon.affinity.Fire.resist }}%</td>
								<td :class="affinityColors['Ice'].resistColor">{{ 100 - demon.affinity.Ice.resist }}%</td>
								<td :class="affinityColors['Electric'].resistColor">{{ 100 - demon.affinity.Electric.resist }}%</td>
								<td :class="affinityColors['Force'].resistColor">{{ 100 - demon.affinity.Force.resist }}%</td>
								<td :class="affinityColors['Expel'].resistColor">{{ 100 - demon.affinity.Expel.resist }}%</td>
								<td :class="affinityColors['Death'].resistColor">{{ 100 - demon.affinity.Death.resist }}%</td>
							</tr>
							<tr>
								<th>Mystic</th>
								<th>Nerve</th>
								<th>Mind</th>
								<th>Almighty</th>
								<th>Curative</th>
								<th>Support</th>
							</tr>
							<tr>
								<td :class="affinityColors['Mystic'].resistColor">{{ 100 - demon.affinity.Mystic.resist }}%</td>
								<td :class="affinityColors['Nerve'].resistColor">{{ 100 - demon.affinity.Nerve.resist }}%</td>
								<td :class="affinityColors['Mind'].resistColor">{{ 100 - demon.affinity.Mind.resist }}%</td>
								<td :class="affinityColors['Almighty'].resistColor">{{ 100 - demon.affinity.Almighty.resist }}%</td>
								<td :class="affinityColors['Curative'].resistColor">{{ 100 - demon.affinity.Curative.resist }}%</td>
								<td :class="affinityColors['Support'].resistColor">{{ 100 - demon.affinity.Support.resist }}%</td>
							</tr>
							<tr>
								<th colspan="2">WSP</th>
								<th colspan="2">Special</th>
								<th colspan="2">Suicide</th>
							</tr>
							<tr>
								<td colspan="2" :class="affinityColors['WSP'].resistColor">{{ 100 - demon.affinity.WSP.resist }}%</td>
								<td colspan="2" :class="affinityColors['Special'].resistColor">{{ 100 - demon.affinity.Special.resist }}%</td>
								<td colspan="2" :class="affinityColors['Suicide'].resistColor">{{ 100 - demon.affinity.Suicide.resist }}%</td>
							</tr>
						</tbody>
					</table>
				</div>
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

.red {
	color: red;
}

.green {
	color: green
}

.default {
	color: default
}
</style>