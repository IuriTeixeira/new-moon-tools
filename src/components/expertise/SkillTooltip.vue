<template>
    <div class="card">
        <div class="card-content">
            <div class="media">
                <div class="media-left">
                    <figure class="image is-64x64 image-margin">
                        <img :src="'./img/skill/' + skill.icon + '.png'" :alt="skill.name" @error="handleImageError">
                    </figure>
                </div>
                <div class="media-content">
                    <p class="title is-5">{{ skill.name }}</p>
                    <div v-if="skill.nameNO !== ''"
                        class="subtitle is-7 expertise-requirement is-flex is-align-items-center">
                        <figure class="image is-36x36 m-0">
                            <img :src="'./img/NO_icon.png'" alt="New Order" class="is-square">
                        </figure>
                        <strong>{{ skill.nameNO }}</strong>
                    </div>
                    <div class="subtitle is-7">
                        {{ info.family }}
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
            <br />
            <div v-if="info.expertise" class="expertise-requirement subtitle is-7">
                <strong>Required Expertise:</strong> {{ info.expertise }}
            </div>
            <div class="expertise-requirement subtitle is-7">
                <strong>Expertise Category:</strong> {{ info.expertCategory }}
            </div>
            <div class="expertise-requirement subtitle is-7">
                <strong>Digitalization Requirement:</strong> {{ info.digi_restrict ? "Impossible" : info.digi_weapon_requirement }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, markRaw } from 'vue';
import expertiseService from "@/services/expertiseService";

const props = defineProps({
    skill: {
        type: Object,
        required: true,
    },
    expertise: {
        type: Object,
        required: false,
    },
});

const cachedExpertises = ref([]);

onMounted(async () => {
    const data = await expertiseService.all() || [];
    cachedExpertises.value = markRaw(data);
});

function handleImageError(event) {
    event.target.src = './img/Default.png';
}

function classRank(amount) {
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
}

const info = computed(() => {
    let family = `${props.skill.family}\n${props.skill.activationType}\n${props.skill.categoryType}ID: \n${props.skill.id}`;
    let expertiseStr = '';

    let foundBreakpoint = null;
    let parentExpertise = null;

    for (const exp of cachedExpertises.value) {
        if (exp.breakpoints && Array.isArray(exp.breakpoints)) {
            const bp = exp.breakpoints.find(b => b.skills && b.skills.includes(props.skill.id));
            if (bp) {
                parentExpertise = exp;
                foundBreakpoint = bp;
                break;
            }
        }
    }

    if (foundBreakpoint && parentExpertise) {
        const reqValue = (foundBreakpoint.class * 1000) + (foundBreakpoint.rank * 100);
        expertiseStr = `${parentExpertise.name} ${classRank(reqValue)}`;
    }

    let body = [];
    if (props.skill.costs && props.skill.costs.length > 0) {
        let cost = [];
        props.skill.costs.forEach((element, index) => {
            let text = index === 0 ? '' : ' ';
            if (element.costType !== 'ITEM') {
                if (element.costType !== 'BULLET') {
                    const percent = element.numberOrPercent === 'PERCENT' ? '% ' : ' ';
                    text += element.amount + percent + element.costType;
                } else {
                    text += element.amount + ' Bullet';
                    if (element.amount > 1) text += 's';
                }
            } else {
                switch (element.itemID) {
                    case 13: text += element.amount + ' Magic Stone'; break;
                    case 14: text += element.amount + ' Jewel'; break;
                    case 133: text += element.amount + ' Bead of Heaven (North)'; break;
                    case 134: text += element.amount + ' Bead of Heaven (South)'; break;
                    case 715: text += element.amount + ' Philosopher\'s Stone'; break;
                    case 799: text += element.amount + ' Macca'; break;
                    case 800: text += element.amount + ' Magnetite'; break;
                    case 12485: text += element.amount + ' Dragon\'s Pearl'; break;
                    case 5512: text += element.amount + ' Gift Melon (Link)'; break;
                    case 2746: text += element.amount + ' 図南鵬翼の玉 (Vermilion Wing-Borne Orb)'; break;
                }
            }
            cost.push(text);
        });
        body.push(`• Cost: ${cost}\n`);
    }

    body.push(`• Action: ${props.skill.actionType}\n`);
    body.push(`• Affinity: ${props.skill.affinity}\n`);

    if (props.skill.statDependency !== "None") {
        body.push(` • Stat: ${props.skill.statDependency}`);
    }

    if (props.skill.stack) {
        props.skill.skillFlags?.fixedStack ? body.push(` • Stacks: ${props.skill.stack} (fixed)\n`) : body.push(` • Stacks: ${props.skill.stack}\n`);
    }

    if (props.skill.damage > 0) {
        body.push(` • Modifier: ${props.skill.damage}\n`);
    }

    if (props.skill.mpdamage > 0) {
        body.push(` • Modifier (MP): ${props.skill.mpdamage}\n`);
    }

    if (props.skill.stiffness > 0) {
        body.push(` • Stiffness: ${props.skill.stiffness}\n`);
    }

    if (props.skill.range > 0) {
        body.push(` • Range: ${props.skill.range}\n`);
    }

    if (props.skill.areaOfEffect?.areaType && props.skill.areaOfEffect.areaType !== "None") {
        body.push(` • AoE: ${props.skill.areaOfEffect.distance} (${props.skill.areaOfEffect.areaType})\n`);
    }

    if (props.skill.incantation > 0) {
        props.skill.skillFlags?.fixedCharge ? body.push(` • Incantation: ${props.skill.incantation / 1000}s (fixed)\n`) : body.push(` • Incantation: ${props.skill.incantation / 1000}s\n`);
    }

    if (props.skill.cooldown > 0) {
        props.skill.skillFlags?.fixedCooldown ? body.push(` • Cooldown: ${props.skill.cooldown / 1000}s (fixed)\n`) : body.push(` • Cooldown: ${props.skill.cooldown / 1000}s\n`);
    }

    const expertCategory = props.skill.expertCategory;
    const digi_restrict = props.skill.restrictions?.restriction_digi === "true" ? true : false;
    const digi_weapon_restrict = props.skill.restrictions?.restriction_weapon;
    let digi_weapon_requirement = "None";
    switch (digi_weapon_restrict) {
        case "CLOSE_RANGE": digi_weapon_requirement = "Melee Weapon"; break;
        case "LONG_RANGE": digi_weapon_requirement = "Ranged Weapon"; break;
    }

    return { family, expertise: expertiseStr, expertCategory, body, digi_restrict, digi_weapon_requirement };
});
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

.image-margin {
    margin-right: 10px;
}
</style>