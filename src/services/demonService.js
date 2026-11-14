const DATA_URL = '/data/demons.json';

let demonsPromise = null;

async function getDemons() {
    if (!demonsPromise) {
        demonsPromise = (async () => {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Failed to load demons data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        })().catch((err) => {
            demonsPromise = null;
            throw err;
        });
    }

    return demonsPromise;
}

function isObtainable(demon) {
    const acq = demon?.acquisition;
    if (!acq) return false;
    return Boolean(
        acq.contract ||
        acq.fusion ||
        acq.specialFusion ||
        acq.itemReward ||
        acq.eventReward
    );
}

export default {
    async get(id = 0) {
        if (!id) return null;
        const demons = await getDemons();
        return demons.find((d) => d.id == id) ?? null;
    },

    async all() {
        const demons = await getDemons();
        return demons.filter((demon) => Boolean(demon?.name));
    },

    async searchByName(name = '', obtainableOnly = true) {
        if (!name) return [];
        const demons = await getDemons();
        const query = name.toLowerCase();

        let matches = demons.filter(
            (item) => typeof item?.name === 'string' && item.name.toLowerCase().includes(query)
        );

        if (obtainableOnly) {
            matches = matches.filter(isObtainable);
        }

        return matches;
    },

    async searchBySkill(skillId = '', obtainableOnly = true) {
        if (!skillId) return [];
        const demons = await getDemons();

        let matches = demons.filter((demon) => {
            const hasBaseSkill = Array.isArray(demon?.skills) && demon.skills.includes(skillId);
            const hasAcquiredSkill =
                Array.isArray(demon?.acquiredSkills) &&
                demon.acquiredSkills.some((item) => item?.id === skillId);
            return hasBaseSkill || hasAcquiredSkill;
        });

        if (obtainableOnly) {
            matches = matches.filter(isObtainable);
        }

        return matches;
    },
};