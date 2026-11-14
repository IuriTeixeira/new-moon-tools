import _ from 'lodash'

let cachedSkills = null;
let cachedMap = null;
let loadPromise = null;

async function loadSkills() {
    if (cachedSkills) return cachedSkills;
    
    // Deduplicate concurrent requests so fetch only happens ONCE
    if (!loadPromise) {
        loadPromise = fetch('/data/skills.json')
            .then(res => res.json())
            .then(data => {
                cachedSkills = data;
                cachedMap = new Map(data.map(d => [Number(d.id), d]));
                return data;
            });
    }
    return loadPromise;
}

export default {
    async get(id = 0) {
        if (id != 0) {
            await loadSkills();
            return cachedMap.get(Number(id)) || null;
        }
        return null;
    },

    async getByName(name = '') {
        const skills = await loadSkills();
        return skills.find((item) => {
            return (
                (
                    item.name?.toLowerCase() == name.toLowerCase() ||
                    item.nameNO?.toLowerCase() == name.toLowerCase()
                )
                &&
                (
                    item.family === "Technique" ||
                    item.family === "Arcane Art" ||
                    item.family === "Special Skill"
                )
            )
        }) || null;
    },

    async all() {
        return await loadSkills();
    },

    async searchByName(name = '') {
        if (name != '') {
            const skills = await loadSkills();
            return skills.filter(function (item) {
                return item.name != null
                    && item.name.length > 0
                    &&
                    (
                        item.name.toLowerCase().includes(name.toLowerCase())
                        ||
                        item.nameNO?.toLowerCase().includes(name.toLowerCase())
                    )
                    &&
                    (
                        item.family === "Technique" ||
                        item.family === "Arcane Art" ||
                        item.family === "Special Skill"
                    )
            });
        }
        return [];
    }
}