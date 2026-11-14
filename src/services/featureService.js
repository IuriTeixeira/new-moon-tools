import _ from 'lodash'

let cachedFeatures = null;
let cachedMap = null;
let loadPromise = null;

async function loadFeatures() {
    if (cachedFeatures) return cachedFeatures;

    if (!loadPromise) {
        loadPromise = fetch('/data/features.json')
            .then(res => res.json())
            .then(data => {
                cachedFeatures = data;
                cachedMap = new Map(data.map(f => [Number(f.id), f]));
                return data;
            });
    }
    return loadPromise;
}

export default {
    async get(id = 0) {
        if (id != 0) {
            await loadFeatures();
            return cachedMap.get(Number(id)) || null;
        }
        return null;
    },

    async getByName(name = '') {
        const storage = await loadFeatures();
        return storage.find((item) => {
            return (
                (item.name && item.name.toLowerCase() == name.toLowerCase()) ||
                (item.nameNO && item.nameNO.toLowerCase() == name.toLowerCase())
            )
        }) || null;
    },

    async all() {
        const storage = await loadFeatures();
        return storage.filter(function (item) {
            return item.family === "Demonic Feature" && item.name && !item.name.includes("Debug");
        });
    },

    async searchByName(name = '') {
        if (name != '') {
            const storage = await loadFeatures();
            return storage.filter(function (feat) {
                return feat.name != null
                    && feat.name.length > 0
                    &&
                    (
                        feat.name.toLowerCase().includes(name.toLowerCase())
                        ||
                        (feat.nameNO && feat.nameNO.toLowerCase().includes(name.toLowerCase()))
                    )
            });
        }
        return [];
    },
}