<script setup>
import { ref, computed, watch, markRaw } from 'vue';
import { useOruga } from "@oruga-ui/oruga-next"
import skillService from "@/services/skillService";
import Skill from "@/components/expertise/Skill.vue";
import SkillTooltip from "@/components/expertise/SkillTooltip.vue";
import featureService from "@/services/featureService"
import FeatureList from '../features/FeatureList.vue';

const oruga = useOruga()
const activeSkillId = ref(null)

const baseSkills = ref([])
const enemyOnlySkills = ref([])
const acquiredSkills = ref([])
const features = ref([])

function handleHover(skillId) {
    activeSkillId.value = skillId
}

function handleLeave() {
    activeSkillId.value = null
}

const props = defineProps({
    demon: {
        type: Object,
        required: true,
    }
})

// Watch for demon changes and asynchronously resolve all skills & traits
watch(() => props.demon, async (newDemon) => {
    if (!newDemon) {
        baseSkills.value = []
        enemyOnlySkills.value = []
        acquiredSkills.value = []
        features.value = []
        return
    }

    // 1. Resolve base skills asynchronously
    if (newDemon.skills && Array.isArray(newDemon.skills)) {
        const resolved = await Promise.all(newDemon.skills.map(id => skillService.get(id)))
        baseSkills.value = markRaw(resolved.filter(Boolean))
    } else {
        baseSkills.value = []
    }

    // 2. Resolve enemy-only skills (fallback to featureService if not found)
    if (newDemon.enemyOnlySkills && Array.isArray(newDemon.enemyOnlySkills)) {
        const resolved = await Promise.all(
            newDemon.enemyOnlySkills.map(async id => (await skillService.get(id)) || (await featureService.get(id)))
        )
        enemyOnlySkills.value = markRaw(resolved.filter(Boolean))
    } else {
        enemyOnlySkills.value = []
    }

    // 3. Resolve acquired skills
    if (newDemon.acquiredSkills && Array.isArray(newDemon.acquiredSkills)) {
        const resolved = await Promise.all(
            newDemon.acquiredSkills.map(skill => skillService.get(skill.id))
        )
        acquiredSkills.value = markRaw(resolved.filter(Boolean))
    } else {
        acquiredSkills.value = []
    }

    // 4. Resolve features/traits asynchronously
    if (newDemon.traits && Array.isArray(newDemon.traits)) {
        const validTraits = newDemon.traits.filter(feat => feat !== 0)
        const resolved = await Promise.all(validTraits.map(feat => featureService.get(feat)))
        features.value = markRaw(resolved.filter(Boolean))
    } else {
        features.value = []
    }
}, { immediate: true })

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

async function handleSkillClick(skill) {
    if (!skill?.description) return
    try {
        skill.nameNO !== ""
            ?
            await navigator.clipboard.writeText(skill.name + "\n\n" + skill.nameNO + "\n\n" + skill.description)
            :
            await navigator.clipboard.writeText(skill.name + "\n\n" + skill.description)

        oruga.notification.open({
            message: `Copied name and description for <b>${skill.name}</b>!`,
            position: "bottom",
            variant: "success",
            duration: 2000,
            closable: false
        })
    } catch (err) {
        console.error("Clipboard copy failed: ", err)
    }
}

function inheritIcon(inherit) {
    let icon = ""
    inherit ? icon = "check" : icon = "close"
    return icon
}

function alignmentColor(alignment) {
    switch (alignment) {
        case "Law": return "blue"
        case "Neutral": return "green"
        case "Chaos": return "red"
    }
}

function handleImageError(event) {
    event.target.src = './img/Default.png';
}
</script>

<template>
	<div class="card">
		<div class="card-content">
			<div class="media">
				<div class="media-left">
					<figure class="image is-48x48 image-margin">
						<img :src="'./img/demon/' + demon.icon + '.png'" :alt="demon.name" @error="handleImageError">
					</figure>
				</div>
				<div class="media-content">
					<p class="title is-6">{{ demon.title }} {{ demon.name }}
						<span v-if="
							(demon.nameNO !== '' && demon.name !== demon.nameNO) || (demon.titleNO !== '' && demon.title !== demon.titleNO)"
							class="subtitle is-7 expertise-requirement is-flex is-align-items-center"
							style="gap: 0.5rem;">
							<figure class="image m-0">
								<img :src="'./img/NO_icon.png'" alt="New Order" class="is-square">
							</figure>
							{{ demon.titleNO }} {{ demon.nameNO }}
						</span>
					</p>
					<p class="subtitle is-7">
						Lv {{ demon.baseLevel }} • ID: {{ demon.id }}
						<br />{{ demon.family }} • {{ demon.race }} • <span :class="alignmentColor(demon.alignment)">{{
							demon.alignment }}</span>
					</p>
				</div>
			</div>
			<div class="columns">
				<div class="column is-7">
					<div class="content">
						<h3>Affinities</h3>
						<table class="table is-striped is-fullwidth centered-cell">
							<tbody>
								<tr>
									<th colspan="3">Physical</th>
									<th colspan="3">Magical</th>
								</tr>
								<tr>
									<!-- Physical -->
									<td :class="affinityColors['Physical'].resistColor" colspan="3">{{ 100 -
										demon.affinity.Physical.resist }}%
										<span v-if="demon.affinity.Physical.null"
											:class="affinityColors['Physical'].nullColor"><br />Null {{
												demon.affinity.Physical.null }}%</span>
										<span v-if="demon.affinity.Physical.reflect"
											:class="affinityColors['Physical'].reflectColor"><br />Reflect
											{{ demon.affinity.Physical.reflect }}%</span>
										<span v-if="demon.affinity.Physical.absorb"
											:class="affinityColors['Physical'].absorbColor"><br />Absorb
											{{ demon.affinity.Physical.absorb }}%</span>
									</td>
									<!-- Magical -->
									<td :class="affinityColors['Magical'].resistColor" colspan="3">{{ 100 -
										demon.affinity.Magical.resist }}%
										<span v-if="demon.affinity.Magical.null"
											:class="affinityColors['Magical'].nullColor"><br />Null {{
												demon.affinity.Magical.null }}%</span>
										<span v-if="demon.affinity.Magical.reflect"
											:class="affinityColors['Magical'].reflectColor"><br />Reflect
											{{ demon.affinity.Magical.reflect }}%</span>
										<span v-if="demon.affinity.Magical.absorb"
											:class="affinityColors['Magical'].absorbColor"><br />Absorb
											{{ demon.affinity.Magical.absorb }}%</span>
									</td>
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
									<!-- Slash -->
									<td :class="affinityColors['Slash'].resistColor">{{ 100 -
										demon.affinity.Slash.resist }}%
										<span v-if="demon.affinity.Slash.null"
											:class="affinityColors['Slash'].nullColor"><br />Null {{
												demon.affinity.Slash.null }}%</span>
										<span v-if="demon.affinity.Slash.reflect"
											:class="affinityColors['Slash'].reflectColor"><br />Reflect {{
												demon.affinity.Slash.reflect }}%</span>
										<span v-if="demon.affinity.Slash.absorb"
											:class="affinityColors['Slash'].absorbColor"><br />Absorb {{
												demon.affinity.Slash.absorb }}%</span>
									</td>

									<!-- Thrust -->
									<td :class="affinityColors['Thrust'].resistColor">{{ 100 -
										demon.affinity.Thrust.resist }}%
										<span v-if="demon.affinity.Thrust.null"
											:class="affinityColors['Thrust'].nullColor"><br />Null {{
												demon.affinity.Thrust.null }}%</span>
										<span v-if="demon.affinity.Thrust.reflect"
											:class="affinityColors['Thrust'].reflectColor"><br />Reflect {{
												demon.affinity.Thrust.reflect }}%</span>
										<span v-if="demon.affinity.Thrust.absorb"
											:class="affinityColors['Thrust'].absorbColor"><br />Absorb {{
												demon.affinity.Thrust.absorb }}%</span>
									</td>

									<!-- Blunt -->
									<td :class="affinityColors['Blunt'].resistColor">{{ 100 -
										demon.affinity.Blunt.resist }}%
										<span v-if="demon.affinity.Blunt.null"
											:class="affinityColors['Blunt'].nullColor"><br />Null {{
												demon.affinity.Blunt.null }}%</span>
										<span v-if="demon.affinity.Blunt.reflect"
											:class="affinityColors['Blunt'].reflectColor"><br />Reflect {{
												demon.affinity.Blunt.reflect }}%</span>
										<span v-if="demon.affinity.Blunt.absorb"
											:class="affinityColors['Blunt'].absorbColor"><br />Absorb {{
												demon.affinity.Blunt.absorb }}%</span>
									</td>

									<!-- Handgun -->
									<td :class="affinityColors['Handgun'].resistColor">{{ 100 -
										demon.affinity.Handgun.resist }}%
										<span v-if="demon.affinity.Handgun.null"
											:class="affinityColors['Handgun'].nullColor"><br />Null {{
												demon.affinity.Handgun.null }}%</span>
										<span v-if="demon.affinity.Handgun.reflect"
											:class="affinityColors['Handgun'].reflectColor"><br />Reflect
											{{ demon.affinity.Handgun.reflect }}%</span>
										<span v-if="demon.affinity.Handgun.absorb"
											:class="affinityColors['Handgun'].absorbColor"><br />Absorb {{
												demon.affinity.Handgun.absorb }}%</span>
									</td>

									<!-- Penetrate -->
									<td :class="affinityColors['Penetrate'].resistColor">{{ 100 -
										demon.affinity.Penetrate.resist }}%
										<span v-if="demon.affinity.Penetrate.null"
											:class="affinityColors['Penetrate'].nullColor"><br />Null {{
												demon.affinity.Penetrate.null }}%</span>
										<span v-if="demon.affinity.Penetrate.reflect"
											:class="affinityColors['Penetrate'].reflectColor"><br />Reflect
											{{ demon.affinity.Penetrate.reflect }}%</span>
										<span v-if="demon.affinity.Penetrate.absorb"
											:class="affinityColors['Penetrate'].absorbColor"><br />Absorb
											{{ demon.affinity.Penetrate.absorb }}%</span>
									</td>

									<!-- Spread -->
									<td :class="affinityColors['Spread'].resistColor">{{ 100 -
										demon.affinity.Spread.resist }}%
										<span v-if="demon.affinity.Spread.null"
											:class="affinityColors['Spread'].nullColor"><br />Null {{
												demon.affinity.Spread.null }}%</span>
										<span v-if="demon.affinity.Spread.reflect"
											:class="affinityColors['Spread'].reflectColor"><br />Reflect {{
												demon.affinity.Spread.reflect }}%</span>
										<span v-if="demon.affinity.Spread.absorb"
											:class="affinityColors['Spread'].absorbColor"><br />Absorb {{
												demon.affinity.Spread.absorb }}%</span>
									</td>
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
									<!-- Fire -->
									<td :class="affinityColors['Fire'].resistColor">{{ 100 - demon.affinity.Fire.resist
									}}%
										<span v-if="demon.affinity.Fire.null"
											:class="affinityColors['Fire'].nullColor"><br />Null {{
												demon.affinity.Fire.null }}%</span>
										<span v-if="demon.affinity.Fire.reflect"
											:class="affinityColors['Fire'].reflectColor"><br />Reflect {{
												demon.affinity.Fire.reflect }}%</span>
										<span v-if="demon.affinity.Fire.absorb"
											:class="affinityColors['Fire'].absorbColor"><br />Absorb {{
												demon.affinity.Fire.absorb }}%</span>
									</td>

									<!-- Ice -->
									<td :class="affinityColors['Ice'].resistColor">{{ 100 - demon.affinity.Ice.resist
									}}%
										<span v-if="demon.affinity.Ice.null"
											:class="affinityColors['Ice'].nullColor"><br />Null {{
												demon.affinity.Ice.null }}%</span>
										<span v-if="demon.affinity.Ice.reflect"
											:class="affinityColors['Ice'].reflectColor"><br />Reflect {{
												demon.affinity.Ice.reflect }}%</span>
										<span v-if="demon.affinity.Ice.absorb"
											:class="affinityColors['Ice'].absorbColor"><br />Absorb {{
												demon.affinity.Ice.absorb }}%</span>
									</td>

									<!-- Electric -->
									<td :class="affinityColors['Electric'].resistColor">{{ 100 -
										demon.affinity.Electric.resist }}%
										<span v-if="demon.affinity.Electric.null"
											:class="affinityColors['Electric'].nullColor"><br />Null {{
												demon.affinity.Electric.null }}%</span>
										<span v-if="demon.affinity.Electric.reflect"
											:class="affinityColors['Electric'].reflectColor"><br />Reflect
											{{ demon.affinity.Electric.reflect }}%</span>
										<span v-if="demon.affinity.Electric.absorb"
											:class="affinityColors['Electric'].absorbColor"><br />Absorb
											{{ demon.affinity.Electric.absorb }}%</span>
									</td>

									<!-- Force -->
									<td :class="affinityColors['Force'].resistColor">{{ 100 -
										demon.affinity.Force.resist }}%
										<span v-if="demon.affinity.Force.null"
											:class="affinityColors['Force'].nullColor"><br />Null {{
												demon.affinity.Force.null }}%</span>
										<span v-if="demon.affinity.Force.reflect"
											:class="affinityColors['Force'].reflectColor"><br />Reflect {{
												demon.affinity.Force.reflect }}%</span>
										<span v-if="demon.affinity.Force.absorb"
											:class="affinityColors['Force'].absorbColor"><br />Absorb {{
												demon.affinity.Force.absorb }}%</span>
									</td>

									<!-- Expel -->
									<td :class="affinityColors['Expel'].resistColor">{{ 100 -
										demon.affinity.Expel.resist }}%
										<span v-if="demon.affinity.Expel.null"
											:class="affinityColors['Expel'].nullColor"><br />Null {{
												demon.affinity.Expel.null }}%</span>
										<span v-if="demon.affinity.Expel.reflect"
											:class="affinityColors['Expel'].reflectColor"><br />Reflect {{
												demon.affinity.Expel.reflect }}%</span>
										<span v-if="demon.affinity.Expel.absorb"
											:class="affinityColors['Expel'].absorbColor"><br />Absorb {{
												demon.affinity.Expel.absorb }}%</span>
									</td>

									<!-- Death -->
									<td :class="affinityColors['Death'].resistColor">{{ 100 -
										demon.affinity.Death.resist }}%
										<span v-if="demon.affinity.Death.null"
											:class="affinityColors['Death'].nullColor"><br />Null {{
												demon.affinity.Death.null }}%</span>
										<span v-if="demon.affinity.Death.reflect"
											:class="affinityColors['Death'].reflectColor"><br />Reflect {{
												demon.affinity.Death.reflect }}%</span>
										<span v-if="demon.affinity.Death.absorb"
											:class="affinityColors['Death'].absorbColor"><br />Absorb {{
												demon.affinity.Death.absorb }}%</span>
									</td>
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
									<!-- Mystic -->
									<td :class="affinityColors['Mystic'].resistColor">{{ 100 -
										demon.affinity.Mystic.resist }}%
										<span v-if="demon.affinity.Mystic.null"
											:class="affinityColors['Mystic'].nullColor"><br />Null {{
												demon.affinity.Mystic.null }}%</span>
										<span v-if="demon.affinity.Mystic.reflect"
											:class="affinityColors['Mystic'].reflectColor"><br />Reflect {{
												demon.affinity.Mystic.reflect }}%</span>
										<span v-if="demon.affinity.Mystic.absorb"
											:class="affinityColors['Mystic'].absorbColor"><br />Absorb {{
												demon.affinity.Mystic.absorb }}%</span>
									</td>

									<!-- Nerve -->
									<td :class="affinityColors['Nerve'].resistColor">{{ 100 -
										demon.affinity.Nerve.resist }}%
										<span v-if="demon.affinity.Nerve.null"
											:class="affinityColors['Nerve'].nullColor"><br />Null {{
												demon.affinity.Nerve.null }}%</span>
										<span v-if="demon.affinity.Nerve.reflect"
											:class="affinityColors['Nerve'].reflectColor"><br />Reflect {{
												demon.affinity.Nerve.reflect }}%</span>
										<span v-if="demon.affinity.Nerve.absorb"
											:class="affinityColors['Nerve'].absorbColor"><br />Absorb {{
												demon.affinity.Nerve.absorb }}%</span>
									</td>

									<!-- Mind -->
									<td :class="affinityColors['Mind'].resistColor">{{ 100 - demon.affinity.Mind.resist
									}}%
										<span v-if="demon.affinity.Mind.null"
											:class="affinityColors['Mind'].nullColor"><br />Null {{
												demon.affinity.Mind.null }}%</span>
										<span v-if="demon.affinity.Mind.reflect"
											:class="affinityColors['Mind'].reflectColor"><br />Reflect {{
												demon.affinity.Mind.reflect }}%</span>
										<span v-if="demon.affinity.Mind.absorb"
											:class="affinityColors['Mind'].absorbColor"><br />Absorb {{
												demon.affinity.Mind.absorb }}%</span>
									</td>

									<!-- Almighty -->
									<td :class="affinityColors['Almighty'].resistColor">{{ 100 -
										demon.affinity.Almighty.resist }}%
										<span v-if="demon.affinity.Almighty.null"
											:class="affinityColors['Almighty'].nullColor"><br />Null {{
												demon.affinity.Almighty.null }}%</span>
										<span v-if="demon.affinity.Almighty.reflect"
											:class="affinityColors['Almighty'].reflectColor"><br />Reflect
											{{ demon.affinity.Almighty.reflect }}%</span>
										<span v-if="demon.affinity.Almighty.absorb"
											:class="affinityColors['Almighty'].absorbColor"><br />Absorb
											{{ demon.affinity.Almighty.absorb }}%</span>
									</td>

									<!-- Curative -->
									<td :class="affinityColors['Curative'].resistColor">{{ 100 -
										demon.affinity.Curative.resist }}%
										<span v-if="demon.affinity.Curative.null"
											:class="affinityColors['Curative'].nullColor"><br />Null {{
												demon.affinity.Curative.null }}%</span>
										<span v-if="demon.affinity.Curative.reflect"
											:class="affinityColors['Curative'].reflectColor"><br />Reflect
											{{ demon.affinity.Curative.reflect }}%</span>
										<span v-if="demon.affinity.Curative.absorb"
											:class="affinityColors['Curative'].absorbColor"><br />Absorb
											{{ demon.affinity.Curative.absorb }}%</span>
									</td>

									<!-- Support -->
									<td :class="affinityColors['Support'].resistColor">{{ 100 -
										demon.affinity.Support.resist }}%
										<span v-if="demon.affinity.Support.null"
											:class="affinityColors['Support'].nullColor"><br />Null {{
												demon.affinity.Support.null }}%</span>
										<span v-if="demon.affinity.Support.reflect"
											:class="affinityColors['Support'].reflectColor"><br />Reflect
											{{ demon.affinity.Support.reflect }}%</span>
										<span v-if="demon.affinity.Support.absorb"
											:class="affinityColors['Support'].absorbColor"><br />Absorb
											{{ demon.affinity.Support.absorb }}%</span>
									</td>
								</tr>
								<tr>
									<th colspan="2">WSP</th>
									<th colspan="2">Special</th>
									<th colspan="2">Suicide</th>
								</tr>
								<tr>
									<!-- WSP -->
									<td colspan="2" :class="affinityColors['WSP'].resistColor">{{ 100 -
										demon.affinity.WSP.resist }}%
										<span v-if="demon.affinity.WSP.null"
											:class="affinityColors['WSP'].nullColor"><br />Null {{
												demon.affinity.WSP.null }}%</span>
										<span v-if="demon.affinity.WSP.reflect"
											:class="affinityColors['WSP'].reflectColor"><br />Reflect {{
												demon.affinity.WSP.reflect }}%</span>
										<span v-if="demon.affinity.WSP.absorb"
											:class="affinityColors['WSP'].absorbColor"><br />Absorb {{
												demon.affinity.WSP.absorb }}%</span>
									</td>

									<!-- Special -->
									<td colspan="2" :class="affinityColors['Special'].resistColor">{{ 100 -
										demon.affinity.Special.resist }}%
										<span v-if="demon.affinity.Special.null"
											:class="affinityColors['Special'].nullColor"><br />Null {{
												demon.affinity.Special.null }}%</span>
										<span v-if="demon.affinity.Special.reflect"
											:class="affinityColors['Special'].reflectColor"><br />Reflect
											{{ demon.affinity.Special.reflect }}%</span>
										<span v-if="demon.affinity.Special.absorb"
											:class="affinityColors['Special'].absorbColor"><br />Absorb
											{{ demon.affinity.Special.absorb }}%</span>
									</td>

									<!-- Suicide -->
									<td colspan="2" :class="affinityColors['Suicide'].resistColor">{{ 100 -
										demon.affinity.Suicide.resist }}%
										<span v-if="demon.affinity.Suicide.null"
											:class="affinityColors['Suicide'].nullColor"><br />Null {{
												demon.affinity.Suicide.null }}%</span>
										<span v-if="demon.affinity.Suicide.reflect"
											:class="affinityColors['Suicide'].reflectColor"><br />Reflect
											{{ demon.affinity.Suicide.reflect }}%</span>
										<span v-if="demon.affinity.Suicide.absorb"
											:class="affinityColors['Suicide'].absorbColor"><br />Absorb
											{{ demon.affinity.Suicide.absorb }}%</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

				</div>
				<div class="column is-5">
					<div class="content">
						<h3>Stats</h3>
						<table class="table is-striped is-fullwidth centered-cell">
							<tbody>
								<tr>
									<th>HP</th>
									<th>MP</th>
									<th>CLS-R</th>
									<th>LNG-R</th>
									<th>Spell</th>
									<th>Support</th>
								</tr>
								<tr>
									<td>{{ demon.stats.maxHP }}</td>
									<td>{{ demon.stats.maxMP }}</td>
									<td>{{ demon.stats.clsr }}</td>
									<td>{{ demon.stats.lngr }}</td>
									<td>{{ demon.stats.spell }}</td>
									<td>{{ demon.stats.support }}</td>
								</tr>
								<tr>
									<th>Strength</th>
									<th>Magic</th>
									<th>Agility</th>
									<th>Vitality</th>
									<th>Intelligence</th>
									<th>Luck</th>
								</tr>
								<tr>
									<td>{{ demon.stats.strength }}</td>
									<td>{{ demon.stats.magic }}</td>
									<td>{{ demon.stats.speed }}</td>
									<td>{{ demon.stats.vitality }}</td>
									<td>{{ demon.stats.intelligence }}</td>
									<td>{{ demon.stats.luck }}</td>
								</tr>
								<tr>
									<th>Growth Type</th>
									<th>Force Slots</th>
									<th>P.DEF</th>
									<th>M.DEF</th>
									<th>Critical</th>
									<th>Crit Def</th>
								</tr>
								<tr>
									<td>{{ demon.growthType }}</td>
									<td>{{ demon.forceStack }}</td>
									<td>{{ demon.stats.physicalDefense }}</td>
									<td>{{ demon.stats.magicalDefense }}</td>
									<td>{{ demon.stats.critical }}</td>
									<td>{{ demon.stats.criticalDefense }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="content">
				<h3>Inheritance</h3>
				<table class="table is-striped is-fullwidth centered-cell">
					<tbody>
						<tr>
							<th>Inherit Type</th>
							<!-- <th>All</th> -->
							<th>Breath</th>
							<th>Wings</th>
							<th>Slam</th>
							<th>Teeth</th>
							<th>Claw</th>
							<th>Needle</th>
							<th>Weapon</th>
							<!-- <th>Impossible</th> -->
							<th>Maiden</th>
							<!-- <th>Unknown</th> -->
							<th>Eyes</th>
						</tr>
						<tr>
							<td>{{ demon.inheritanceType }}</td>
							<!-- <td><o-icon pack="mdi" class="icon has-text-info"
											:icon="inheritIcon(demon.inheritanceRestrictions.All)"
											:class="demon.inheritanceRestrictions.All ? 'green' : 'red'" />
									</td> -->
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Breath)"
									:class="demon.inheritanceRestrictions.Breath ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Wings)"
									:class="demon.inheritanceRestrictions.Wings ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Slam)"
									:class="demon.inheritanceRestrictions.Slam ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Teeth)"
									:class="demon.inheritanceRestrictions.Teeth ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Claw)"
									:class="demon.inheritanceRestrictions.Claw ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Needle)"
									:class="demon.inheritanceRestrictions.Needle ? 'green' : 'red'" />
							</td>
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Weapon)"
									:class="demon.inheritanceRestrictions.Weapon ? 'green' : 'red'" />
							</td>
							<!-- <td><o-icon pack="mdi" class="icon has-text-info"
											:icon="inheritIcon(demon.inheritanceRestrictions.Impossible)" 
											:class="demon.inheritanceRestrictions.Impossible ? 'green' : 'red'" />
									</td> -->
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Maiden)"
									:class="demon.inheritanceRestrictions.Maiden ? 'green' : 'red'" />
							</td>
							<!-- <td><o-icon pack="mdi" class="icon has-text-info"
											:icon="inheritIcon(demon.inheritanceRestrictions.Unknown)"  
											:class="demon.inheritanceRestrictions.Unknown ? 'green' : 'red'" />
									</td> -->
							<td><o-icon pack="mdi" class="icon has-text-info"
									:icon="inheritIcon(demon.inheritanceRestrictions.Eyes)"
									:class="demon.inheritanceRestrictions.Eyes ? 'green' : 'red'" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="content">
				<div class="columns">
					<div class="column is-7">
						<h3>Features</h3>
						<FeatureList :features="features" :demons="[demon]" :hideSource="true" />
					</div>
					<div class="column is-5">
						<h3>Skills</h3>
						<table class="table is-striped is-fullwidth exempt-table">
							<tbody>
								<tr>
									<th class="centered-cell">Level</th>
									<th>Skill</th>
								</tr>
								<tr>
									<td class="centered-cell">Base</td>
									<td>
										<template v-for="skill in baseSkills" :key="'learned' + skill.id">
											<o-tooltip v-if="activeSkillId === skill.id" :active="true" :triggers="[]"
												multiline size="large" @mouseleave.native="handleLeave">
												<template v-slot:content>
													<div @mouseenter="handleHover(skill.id)" @mouseleave="handleLeave">
														<SkillTooltip :skill="skill" />
													</div>
												</template>

												<Skill :skill="skill" @click.native.stop="handleSkillClick(skill)" />
											</o-tooltip>

											<Skill class="centered-cell" v-else :skill="skill"
												@mouseenter.native="handleHover(skill.id)"
												@mouseleave.native="handleLeave"
												@click.native.stop="handleSkillClick(skill)" /> {{ skill.name }} <br />

										</template>
									</td>
								</tr>
								<tr v-for="(skill, index) in acquiredSkills" :key="skill.id + index + 'header'">
									<td class="centered-cell">{{ demon.acquiredSkills[index].level }}</td>
									<td class="left-cell">
										<o-tooltip v-if="activeSkillId === skill.id" :active="true" :triggers="[]"
											multiline size="large" @mouseleave.native="handleLeave">
											<template v-slot:content>
												<div @mouseenter="handleHover(skill.id)" @mouseleave="handleLeave">
													<SkillTooltip :skill="skill" />
												</div>
											</template>

											<Skill :skill="skill" @click.native.stop="handleSkillClick(skill)" />
										</o-tooltip>

										<Skill class="centered-cell" v-else :skill="skill"
											@mouseenter.native="handleHover(skill.id)" @mouseleave.native="handleLeave"
											@click.native.stop="handleSkillClick(skill)" /> {{ skill.name }}
									</td>
								</tr>
							</tbody>
						</table>
						<div v-if="enemyOnlySkills && enemyOnlySkills.length">
							<h3>Enemy Only Skills</h3>
							<table class="table is-striped is-fullwidth exempt-table">
								<tbody>
									<tr>
										<td>
											<template v-for="skill in enemyOnlySkills" :key="'enemy' + skill.id">
												<o-tooltip v-if="activeSkillId === skill.id" :active="true"
													:triggers="[]" multiline size="large"
													@mouseleave.native="handleLeave">
													<template v-slot:content>
														<div @mouseenter="handleHover(skill.id)"
															@mouseleave="handleLeave">
															<SkillTooltip :skill="skill" />
														</div>
													</template>

													<Skill :skill="skill"
														@click.native.stop="handleSkillClick(skill)" />
												</o-tooltip>

												<Skill class="centered-cell" v-else :skill="skill"
													@mouseenter.native="handleHover(skill.id)"
													@mouseleave.native="handleLeave"
													@click.native.stop="handleSkillClick(skill)" /> {{ skill.name
												}} <br />

											</template>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
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
	color: #f14668 !important
}

.green {
	color: #48c774 !important
}

.blue {
	color: #3273dc;
	/* or #3e8ed0 */
}

.default {
	color: default;
}

.centered-cell {
	text-align: center !important;
	vertical-align: middle !important;
}

.table th {
	vertical-align: middle !important;
	text-align: center !important;
}

.table:not(.exempt-table) td {
	vertical-align: middle !important;
	text-align: center !important;
}

/* 1. Outer border around the entire table */
.table {
	border: 1px solid rgba(255, 255, 255, 0.2) !important;
	border-radius: 4px;
	/* Optional: rounds the outer corners slightly */
	border-collapse: separate;
	/* Required if using border-radius */
	border-spacing: 0;
}

/* 2. Interior vertical borders between cells */
.table th,
.table td {
	border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Remove the right border from the last cell in each row so it doesn't double up on the outer edge */
.table tr th:last-child,
.table tr td:last-child {
	border-right: none !important;
}

.image-margin {
	margin-right: 2px;
}
</style>