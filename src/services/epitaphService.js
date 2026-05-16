import epitaphs from "@/data/epitaph.json"
import _ from 'lodash'

const storage = epitaphs;

export default {
    all() {
        return storage;
    }
}
