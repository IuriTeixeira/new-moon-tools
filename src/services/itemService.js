import items from "@/data/items.json"
import _ from 'lodash'

const storage = items;

export default {

    get(id = 0) {
        if (id != 0) {
            let item = storage.find(i => i.id == id);
            return item;
        }
        return null
    },

    getByName(name = '') {
        const item = storage.find((i) => {
            return i.name.toLowerCase() == name.toLowerCase()
        })

        return item;
    },

    all() {
        return storage;
    },

    searchByName(name = '') {
        if (name !== '') {
            let item = storage.filter(
                (i) =>
                    i.name !== null &&
                    i.name.length > 0 &&
                    i.name.toLowerCase().includes(name.toLowerCase())
            )
            return item;
        }
        return [];
    }
}
