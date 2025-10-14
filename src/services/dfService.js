import DFItems from "@/data/df_items.json"
import _ from 'lodash'

const storage = DFItems;

export default {

    get(id = 0) {
        if (id != 0) {
            let df = storage.find(d => d.id == id);
            return df;
        }
        return null
    },

    getByName(name = '') {
        const df = storage.find((item) => {
            return item.name.toLowerCase() == name.toLowerCase()
        })

        return df;
    },

    all() {
        return storage;
    },

    searchByName(name = '') {
        if (name !== '') {
            let dfs = storage.filter(
                (item) =>
                    item.name !== null &&
                    item.name.length > 0 &&
                    item.name.toLowerCase().includes(name.toLowerCase())
            )
            return dfs;
        }
        return [];
    }
}
