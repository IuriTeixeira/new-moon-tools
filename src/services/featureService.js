import Features from "@/data/skills.json"
import _ from 'lodash'

const storage = Features;

export default {

    get(id = 0) {
        if (id != 0) {
            let feat = storage.find(f => f.id == id);
            return feat;
        }
        return null
    },

    getByName(name = '') {
        const feature = storage.find((item) => {
            return item.name.toLowerCase() == name.toLowerCase() && item.family === "Demonic Feature"
        })

        return feature;
    },

    all() {
        return storage.filter(function (item) {
            return item.family === "Demonic Feature" && !item.name.includes("Debug")
        });
    },

    searchByName(name = '') {
        if (name != '') {
            let features = storage.filter(function (item) {
                return item.name != null && item.name.length > 0 && item.name.toLowerCase().includes(name.toLowerCase()) && item.family === "Demonic Feature"
            })
            return features;
        }
        return [];
    },
}
